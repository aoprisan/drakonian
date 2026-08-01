// Forcing a fresh copy of the grimoire.
//
// The service worker is what makes Drakonian work in a dark room with no
// signal, but it is also what can pin a reader to an old revision — a stale
// worker will keep serving its cached leaves even after a new build is live.
// This module is the escape hatch: ask the worker to look for a new revision,
// or tear the whole cache down and fetch the book again from the source.
//
// It deliberately does NOT import `virtual:pwa-register` (that lives in
// ./update.ts) so it stays usable from ordinary views and under the smoke
// harness, where the virtual module does not exist.

export interface PurgeReport {
  /** Service-worker registrations unregistered. */
  workers: number;
  /** Cache Storage buckets deleted. */
  caches: number;
}

export type UpdateCheck = 'unsupported' | 'none' | 'waiting' | 'checked';

function swContainer(): ServiceWorkerContainer | null {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
    ? navigator.serviceWorker
    : null;
}

function cacheStorage(): CacheStorage | null {
  return typeof caches !== 'undefined' ? caches : null;
}

/** True when this page is actually being served by a service worker. */
export function isOfflineCapable(): boolean {
  return Boolean(swContainer()?.controller);
}

/**
 * Ask every registration to poll for a new revision. Resolves to `waiting`
 * when a fresh worker has already been fetched and is queued behind this page.
 */
export async function checkForUpdate(): Promise<UpdateCheck> {
  const container = swContainer();
  if (!container) return 'unsupported';
  const regs = await container.getRegistrations();
  if (regs.length === 0) return 'none';
  await Promise.all(
    regs.map(async (reg) => {
      try {
        await reg.update();
      } catch {
        /* offline or blocked; nothing to report */
      }
    }),
  );
  return regs.some((reg) => reg.waiting || reg.installing) ? 'waiting' : 'checked';
}

/**
 * Unregister every worker and delete every cache bucket. The reader's journal
 * lives in IndexedDB and localStorage and is *not* touched — only the copy of
 * the application itself is discarded.
 */
export async function purgeCaches(): Promise<PurgeReport> {
  const report: PurgeReport = { workers: 0, caches: 0 };

  const container = swContainer();
  if (container) {
    try {
      const regs = await container.getRegistrations();
      const results = await Promise.all(regs.map((reg) => reg.unregister().catch(() => false)));
      report.workers = results.filter(Boolean).length;
    } catch {
      /* registrations unavailable */
    }
  }

  const store = cacheStorage();
  if (store) {
    try {
      const keys = await store.keys();
      const results = await Promise.all(keys.map((key) => store.delete(key).catch(() => false)));
      report.caches = results.filter(Boolean).length;
    } catch {
      /* cache storage unavailable */
    }
  }

  return report;
}

/** Purge, then reload from the network. Never rejects — it always reloads. */
export async function forceUpdate(): Promise<PurgeReport> {
  let report: PurgeReport = { workers: 0, caches: 0 };
  try {
    report = await purgeCaches();
  } finally {
    reload();
  }
  return report;
}

function reload(): void {
  try {
    location.reload();
  } catch {
    /* jsdom and friends: nothing to reload */
  }
}
