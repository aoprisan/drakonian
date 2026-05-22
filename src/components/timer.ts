import type { RitualStep } from '../types';
import { prefersReducedMotion } from '../state/store';

export interface Pacer {
  el: HTMLElement;
  start(): void;
  stop(): void;
  destroy(): void;
}

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
const PHASE_LABEL: Record<Phase, string> = {
  inhale: 'Breathe in',
  'hold-in': 'Hold',
  exhale: 'Breathe out',
  'hold-out': 'Rest',
};

export type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

/**
 * Breath pacer: an expanding/contracting ring driven by the step cadence.
 * Falls back to a static guide under reduced-motion. `onPhase` fires once each
 * time the cadence crosses into a new phase, so callers can cue tone/haptics.
 */
export function createBreathPacer(
  step: RitualStep,
  onComplete: () => void,
  onPhase?: (phase: BreathPhase) => void,
): Pacer {
  const cadence = step.cadence ?? [4, 4, 4, 4];
  const total = (step.durationSec ?? 60) * 1000;
  const reduce = prefersReducedMotion();

  const el = document.createElement('div');
  el.className = 'pacer';
  el.innerHTML = `
    <div class="pacer-ring" aria-hidden="true"><span class="pacer-orb"></span></div>
    <div class="pacer-phase" aria-live="polite">Ready</div>`;
  const ring = el.querySelector<HTMLElement>('.pacer-orb')!;
  const phaseEl = el.querySelector<HTMLElement>('.pacer-phase')!;

  const allPhases: [Phase, number][] = [
    ['inhale', cadence[0]],
    ['hold-in', cadence[1]],
    ['exhale', cadence[2]],
    ['hold-out', cadence[3]],
  ];
  const phases: [Phase, number][] = allPhases.filter(([, s]) => s > 0);

  let raf = 0;
  let startTs = 0;
  let stopped = false;
  let lastPhase: Phase | null = null;

  function frame(ts: number) {
    if (stopped) return;
    if (!startTs) startTs = ts;
    const elapsed = ts - startTs;
    if (elapsed >= total) {
      onComplete();
      return;
    }

    const cycleLen = phases.reduce((s, [, sec]) => s + sec, 0) * 1000;
    const tInCycle = elapsed % cycleLen;
    let acc = 0;
    let phase: Phase = phases[0][0];
    let phaseProgress = 0;
    for (const [name, sec] of phases) {
      const len = sec * 1000;
      if (tInCycle < acc + len) {
        phase = name;
        phaseProgress = (tInCycle - acc) / len;
        break;
      }
      acc += len;
    }

    let scale = 1;
    if (phase === 'inhale') scale = 0.45 + phaseProgress * 0.55;
    else if (phase === 'hold-in') scale = 1;
    else if (phase === 'exhale') scale = 1 - phaseProgress * 0.55;
    else scale = 0.45;

    if (!reduce) ring.style.transform = `scale(${scale.toFixed(3)})`;
    phaseEl.textContent = PHASE_LABEL[phase];

    if (phase !== lastPhase) {
      lastPhase = phase;
      onPhase?.(phase);
    }

    raf = requestAnimationFrame(frame);
  }

  return {
    el,
    start() {
      if (reduce) {
        phaseEl.textContent = 'Breathe slowly with the cadence, then continue.';
        ring.style.transform = 'scale(0.8)';
        return;
      }
      stopped = false;
      startTs = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
    },
    destroy() {
      stopped = true;
      cancelAnimationFrame(raf);
      el.remove();
    },
  };
}

/** Simple countdown ring for meditation / timed steps. */
export function createCountdown(durationSec: number, onComplete: () => void): Pacer {
  const total = durationSec * 1000;
  const el = document.createElement('div');
  el.className = 'pacer pacer-countdown';
  el.innerHTML = `
    <svg viewBox="0 0 100 100" class="countdown-ring" aria-hidden="true">
      <circle cx="50" cy="50" r="45" class="countdown-track" />
      <circle cx="50" cy="50" r="45" class="countdown-progress" />
    </svg>
    <div class="countdown-time" aria-live="polite"></div>`;
  const progress = el.querySelector<SVGCircleElement>('.countdown-progress')!;
  const timeEl = el.querySelector<HTMLElement>('.countdown-time')!;
  const circ = 2 * Math.PI * 45;
  progress.style.strokeDasharray = String(circ);

  let raf = 0;
  let startTs = 0;
  let stopped = false;

  function frame(ts: number) {
    if (stopped) return;
    if (!startTs) startTs = ts;
    const elapsed = ts - startTs;
    const remaining = Math.max(0, total - elapsed);
    const frac = remaining / total;
    progress.style.strokeDashoffset = String(circ * (1 - frac));
    const secs = Math.ceil(remaining / 1000);
    timeEl.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    if (remaining <= 0) {
      onComplete();
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  return {
    el,
    start() {
      stopped = false;
      startTs = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
    },
    destroy() {
      stopped = true;
      cancelAnimationFrame(raf);
      el.remove();
    },
  };
}
