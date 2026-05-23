// Minimal reactive store: get / set / subscribe. No dependencies.

type Listener<T> = (value: T) => void;

export class Observable<T> {
  private value: T;
  private listeners = new Set<Listener<T>>();

  constructor(initial: T) {
    this.value = initial;
  }

  get(): T {
    return this.value;
  }

  set(next: T): void {
    if (Object.is(next, this.value)) return;
    this.value = next;
    for (const fn of this.listeners) fn(next);
  }

  update(fn: (prev: T) => T): void {
    this.set(fn(this.value));
  }

  /** Subscribe; returns an unsubscribe function. Fires immediately with current value. */
  subscribe(fn: Listener<T>): () => void {
    this.listeners.add(fn);
    fn(this.value);
    return () => this.listeners.delete(fn);
  }
}

export interface Ambience {
  /** Whether the ambient drone should sound while in a rite. */
  droneEnabled: boolean;
  /** Candle / blackout mode dims all but the focused text. */
  candleMode: boolean;
  /** Struck-bell tones and haptic pulses that mark rite transitions and breath. */
  cues: boolean;
  /** Read each ritual step aloud via the Web Speech API (hands-free working). */
  tts: boolean;
}

const AMBIENCE_KEY = 'drakonian:ambience';

const AMBIENCE_DEFAULTS: Ambience = {
  droneEnabled: true,
  candleMode: false,
  cues: true,
  tts: false,
};

function loadAmbience(): Ambience {
  try {
    const raw = localStorage.getItem(AMBIENCE_KEY);
    if (raw) return { ...AMBIENCE_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...AMBIENCE_DEFAULTS };
}

export const ambience = new Observable<Ambience>(loadAmbience());

ambience.subscribe((a) => {
  try {
    localStorage.setItem(AMBIENCE_KEY, JSON.stringify(a));
  } catch {
    /* storage may be unavailable; ambience is non-critical */
  }
});

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
