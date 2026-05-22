// Keeps the screen awake during a rite so the device doesn't sleep mid-working.
// Uses the Screen Wake Lock API where available and degrades silently where it
// isn't. Sentinels are released by the system when the tab is hidden, so we
// track intent and re-acquire on return to visibility.

let sentinel: WakeLockSentinel | null = null;
let wanted = false;
let listening = false;

function supported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

async function request(): Promise<void> {
  if (!supported() || sentinel) return;
  try {
    sentinel = await navigator.wakeLock.request('screen');
    sentinel.addEventListener('release', () => {
      sentinel = null;
    });
  } catch {
    /* user agent declined (e.g. low battery) or not permitted; ignore */
  }
}

function onVisibility(): void {
  if (wanted && document.visibilityState === 'visible') void request();
}

/** Ask to keep the screen awake. Idempotent; safe to call without feature support. */
export async function acquireWakeLock(): Promise<void> {
  wanted = true;
  if (!listening) {
    document.addEventListener('visibilitychange', onVisibility);
    listening = true;
  }
  await request();
}

/** Release the lock and stop re-acquiring. */
export function releaseWakeLock(): void {
  wanted = false;
  if (listening) {
    document.removeEventListener('visibilitychange', onVisibility);
    listening = false;
  }
  const s = sentinel;
  sentinel = null;
  s?.release().catch(() => {
    /* already released */
  });
}
