// A single shared AudioContext for the whole app. Both the ambient drone and
// the short transition cues route through it, so they layer cleanly and we
// never spin up more than one context. Like all Web Audio here, it must be
// resumed from a user gesture (browser autoplay policy).

let ctx: AudioContext | null = null;

export function audioContext(): AudioContext {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}

/** Resume the context if a gesture suspended-state is blocking it. Safe to call repeatedly. */
export async function resumeAudio(): Promise<void> {
  const c = audioContext();
  if (c.state === 'suspended') {
    try {
      await c.resume();
    } catch {
      /* gesture required or unavailable; callers degrade silently */
    }
  }
}

/** True once the context is actually producing sound (i.e. unlocked by a gesture). */
export function audioReady(): boolean {
  return ctx?.state === 'running';
}
