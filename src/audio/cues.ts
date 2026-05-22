// Short ritual cues that mark transitions: a struck singing-bowl tone and a
// paired haptic pulse on devices that support it. Both are generated live
// through the shared AudioContext (no sample files) and are gated by the
// single `cues` ambience setting. They no-op until audio is unlocked by a
// gesture, and degrade silently where vibration is unavailable.

import { audioContext, audioReady } from './context';
import { ambience } from '../state/store';

interface StrikeOpts {
  /** Fundamental in Hz. */
  freq: number;
  /** Peak gain of the struck tone. */
  gain: number;
  /** Decay time in seconds. */
  decay: number;
}

/**
 * A struck metallic tone: a small stack of slightly inharmonic partials with a
 * fast attack and exponential decay, lightly reverberant via the master path.
 */
function strike({ freq, gain, decay }: StrikeOpts): void {
  if (!audioReady()) return;
  const ctx = audioContext();
  const now = ctx.currentTime;

  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, now);
  out.gain.exponentialRampToValueAtTime(gain, now + 0.012);
  out.gain.exponentialRampToValueAtTime(0.0001, now + decay);
  out.connect(ctx.destination);

  // Inharmonic partials give the tone a bowl/bell character rather than a pure sine.
  const partials = [1, 2.01, 2.76, 3.83];
  const weights = [1, 0.5, 0.32, 0.18];
  partials.forEach((mult, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    const g = ctx.createGain();
    g.gain.value = weights[i];
    osc.connect(g).connect(out);
    osc.start(now);
    osc.stop(now + decay + 0.1);
  });
}

function buzz(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* some platforms throw on background calls; ignore */
    }
  }
}

/** Transition cues, keyed by ritual moment. Each plays a tone and a matching pulse. */
export const cue = {
  /** Crossing the threshold into the rite — a deep, slow bell. */
  begin(): void {
    if (!ambience.get().cues) return;
    strike({ freq: 110, gain: 0.5, decay: 5.5 });
    buzz([40, 60, 40]);
  },
  /** Advancing between steps — a clear mid bell. */
  step(): void {
    if (!ambience.get().cues) return;
    strike({ freq: 196, gain: 0.34, decay: 3.6 });
    buzz(45);
  },
  /** Sealing the working — the lowest, longest bell. */
  seal(): void {
    if (!ambience.get().cues) return;
    strike({ freq: 82.4, gain: 0.55, decay: 8 });
    buzz([60, 80, 120]);
  },
  /** A breath turns — a faint high tick plus a soft pulse to pace eyes-closed. */
  breathIn(): void {
    if (!ambience.get().cues) return;
    strike({ freq: 523.25, gain: 0.07, decay: 0.9 });
    buzz(30);
  },
  breathOut(): void {
    if (!ambience.get().cues) return;
    strike({ freq: 392, gain: 0.07, decay: 1.1 });
    buzz([20, 40, 20]);
  },
};
