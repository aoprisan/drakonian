import { sigilGeometry } from './sigil';
import { prefersReducedMotion } from '../state/store';

// A "trace the sigil" focusing exercise: the practitioner draws the shell's
// glyph with finger or pointer before a rite. Progress is revealed along the
// path as they trace it from the start mark to the end. Purely a focusing aid —
// never a gate — and it degrades to a single tap where pointer tracing or SVG
// geometry is unavailable (reduced-motion, jsdom).

const SVGNS = 'http://www.w3.org/2000/svg';

export interface SigilTracer {
  el: HTMLElement;
  destroy(): void;
}

interface Sample {
  len: number;
  x: number;
  y: number;
}

export function createSigilTracer(
  key: string,
  opts: { size?: number; onComplete?: () => void } = {},
): SigilTracer {
  const size = opts.size ?? 200;
  const { sigilPath, linePts } = sigilGeometry(key);
  const [startX, startY] = linePts[0];

  const el = document.createElement('div');
  el.className = 'sigil-tracer';
  el.style.setProperty('--trace-size', `${size}px`);

  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', 'sigil-trace');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Trace the sigil');

  // Faint warded ground to orient the eye.
  svg.appendChild(circle(50, 50, 44, 'trace-ring-outer'));
  svg.appendChild(circle(50, 50, 40, 'trace-ring-inner'));

  // The dim guide line and the bright progress line that fills in as we trace.
  const target = path(sigilPath, 'trace-target');
  const progress = path(sigilPath, 'trace-progress');
  svg.appendChild(target);
  svg.appendChild(progress);

  const startDot = circle(startX, startY, 3.2, 'trace-start');
  svg.appendChild(startDot);
  el.appendChild(svg);

  const hint = document.createElement('p');
  hint.className = 'trace-hint';
  hint.setAttribute('aria-live', 'polite');
  el.appendChild(hint);

  let done = false;
  let samples: Sample[] | null = null;
  let totalLen = 0;
  let progressLen = 0;
  let tracing = false;
  let lastIdx = 0;
  let sampleStep = 1.6; // viewBox units between samples; set when sampling

  const TOL = 16; // forgiveness radius in viewBox units — generous on purpose
  // A fast flick can leap a whole segment (sigil lines jump clear across the
  // circle) between two pointermove events, so the forward search must reach
  // at least one segment ahead — otherwise the pointer outruns the window and
  // progress stalls for good. Expressed in viewBox units, density-independent.
  const NEAR_LEN = 72;
  // If the pointer still outran the near window, scan the rest of the path with
  // a tighter tolerance so progress rejoins the line instead of freezing.
  const CATCHUP_TOL = 10;
  // Lighting the sigil is a focusing aid, never a gate, so most of the way
  // round is enough — the last sliver back to the start need not be exact.
  const COMPLETE_AT = 0.85;

  // jsdom and reduced-motion users can't trace; offer a single tap instead.
  const geometryOk =
    typeof (progress as SVGGeometryElement).getTotalLength === 'function' &&
    typeof (progress as SVGGeometryElement).getPointAtLength === 'function' &&
    typeof (svg as SVGSVGElement).getScreenCTM === 'function';

  function complete() {
    if (done) return;
    done = true;
    tracing = false;
    el.classList.add('traced');
    if (geometryOk && samples) progress.style.strokeDashoffset = '0';
    hint.textContent = 'The sigil is lit. Begin when you are ready.';
    opts.onComplete?.();
  }

  if (!geometryOk || prefersReducedMotion()) {
    el.classList.add('trace-tap');
    hint.textContent = 'Touch the sigil to focus, then begin.';
    const onTap = () => complete();
    svg.addEventListener('click', onTap);
    return {
      el,
      destroy() {
        svg.removeEventListener('click', onTap);
        el.remove();
      },
    };
  }

  function ensureSamples(): Sample[] {
    if (samples) return samples;
    const geo = progress as SVGGeometryElement;
    totalLen = geo.getTotalLength();
    progress.style.strokeDasharray = String(totalLen);
    progress.style.strokeDashoffset = String(totalLen);
    const count = Math.max(48, Math.round(totalLen / 1.6));
    sampleStep = totalLen / count;
    const out: Sample[] = [];
    for (let i = 0; i <= count; i++) {
      const len = (i / count) * totalLen;
      const pt = geo.getPointAtLength(len);
      out.push({ len, x: pt.x, y: pt.y });
    }
    samples = out;
    return out;
  }

  function svgPoint(ev: PointerEvent): { x: number; y: number } | null {
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  function setProgress(len: number) {
    progressLen = len;
    progress.style.strokeDashoffset = String(Math.max(0, totalLen - len));
  }

  function nearest(s: Sample[], px: number, py: number, from: number, to: number, tol: number) {
    let bestIdx = -1;
    let bestDist = tol;
    for (let i = from; i <= to; i++) {
      const d = Math.hypot(s[i].x - px, s[i].y - py);
      if (d <= bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  function advance(px: number, py: number) {
    const s = ensureSamples();
    const near = Math.min(s.length - 1, lastIdx + Math.ceil(NEAR_LEN / sampleStep));
    let bestIdx = nearest(s, px, py, lastIdx, near, TOL);
    // Pointer outran the near window (a fast flick): scan the rest of the path
    // with a tighter tolerance so progress catches up rather than stalling.
    if (bestIdx < 0 && near < s.length - 1) {
      bestIdx = nearest(s, px, py, near + 1, s.length - 1, CATCHUP_TOL);
    }
    if (bestIdx >= 0) {
      lastIdx = bestIdx;
      setProgress(s[bestIdx].len);
      if (progressLen >= totalLen * COMPLETE_AT) complete();
    }
  }

  function near(px: number, py: number, x: number, y: number): boolean {
    return Math.hypot(px - x, py - y) <= TOL;
  }

  function onDown(ev: PointerEvent) {
    if (done) return;
    const p = svgPoint(ev);
    if (!p) return;
    // Tracing must begin at the start mark.
    if (lastIdx === 0 && !near(p.x, p.y, startX, startY)) return;
    tracing = true;
    el.classList.add('tracing');
    try {
      svg.setPointerCapture(ev.pointerId);
    } catch {
      /* capture is best-effort */
    }
    advance(p.x, p.y);
    ev.preventDefault();
  }

  function onMove(ev: PointerEvent) {
    if (!tracing || done) return;
    const p = svgPoint(ev);
    if (!p) return;
    advance(p.x, p.y);
    ev.preventDefault();
  }

  function onUp(ev: PointerEvent) {
    tracing = false;
    el.classList.remove('tracing');
    try {
      svg.releasePointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
    // Lifting keeps the progress drawn so far: the trace resumes from where it
    // left off on the next contact rather than snapping back to the start, so a
    // long sigil can be lit over several relaxed strokes.
    if (!done && progressLen > 0) hint.textContent = 'Keep tracing — lift and continue as you like.';
  }

  hint.textContent = 'Trace the sigil from the bright mark to focus.';
  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', onUp);

  return {
    el,
    destroy() {
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
      el.remove();
    },
  };
}

function circle(cx: number, cy: number, r: number, cls: string): SVGCircleElement {
  const c = document.createElementNS(SVGNS, 'circle');
  c.setAttribute('cx', String(cx));
  c.setAttribute('cy', String(cy));
  c.setAttribute('r', String(r));
  c.setAttribute('class', cls);
  return c;
}

function path(d: string, cls: string): SVGPathElement {
  const p = document.createElementNS(SVGNS, 'path');
  p.setAttribute('d', d);
  p.setAttribute('class', cls);
  return p;
}
