// The colophon of a printed book records where and when it was set. This is
// ours: the version, revision and moment this bundle was inscribed, stamped in
// at build time by Vite's `define`. Outside a Vite build (the smoke harness,
// or a source checkout run through esbuild) the constants are simply absent,
// so every read is guarded.

function stamped(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export const APP_VERSION = stamped(
  typeof __APP_VERSION__ === 'undefined' ? undefined : __APP_VERSION__,
  '0.0.0',
);

export const BUILD_COMMIT = stamped(
  typeof __BUILD_COMMIT__ === 'undefined' ? undefined : __BUILD_COMMIT__,
  'unbuilt',
);

/** ISO-8601 instant this bundle was built, or the session start in dev. */
export const BUILD_TIME = stamped(
  typeof __BUILD_TIME__ === 'undefined' ? undefined : __BUILD_TIME__,
  new Date().toISOString(),
);

/** True when the constants were never stamped — i.e. a dev/test run. */
export const IS_STAMPED_BUILD = BUILD_COMMIT !== 'unbuilt';

export function buildDate(): Date {
  const d = new Date(BUILD_TIME);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

/** "1 August 2026, 14:32" in the reader's own zone. */
export function formatBuildTime(date: Date = buildDate()): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString().replace('T', ' ').slice(0, 16);
  }
}

/** Coarse, human age of the build: "moments ago", "3 days ago". */
export function buildAge(now: Date = new Date(), date: Date = buildDate()): string {
  const secs = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000));
  if (secs < 90) return 'moments ago';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/** One-line summary for the colophon: "v1.0.0 · 4f1a2bc". */
export function buildLabel(): string {
  return `v${APP_VERSION} · ${BUILD_COMMIT}`;
}
