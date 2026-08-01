// A tiny bridge between the service-worker registration (./update.ts, which
// imports Vite's `virtual:pwa-register`) and ordinary views that want to know
// whether a new revision is waiting. Views subscribe here instead of importing
// the virtual module, which keeps them buildable outside Vite.

import { Observable } from '../state/store';

/** True once a freshly built revision has been fetched and is queued. */
export const updateReady = new Observable<boolean>(false);

let applier: (() => void) | null = null;

/** Called once by ./update.ts with the registration's activate-and-reload fn. */
export function setUpdateApplier(fn: () => void): void {
  applier = fn;
}

/** Activate the waiting revision. Returns false when nothing is waiting. */
export function applyUpdate(): boolean {
  if (!applier) return false;
  applier();
  return true;
}
