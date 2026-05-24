import { sigilGeometry } from './sigil';
import { prefersReducedMotion } from '../state/store';

// A "trace the sigil" focusing exercise: the practitioner draws the shell's
// glyph with finger or pointer before a rite. The shell shows a small sigil;
// tapping it opens a large, dark overlay where the glyph is easy to draw. A
// glowing cursor rides the line as it is traced, lighting it from the start
// mark to the end. Purely a focusing aid — never a gate — and it degrades to a
// single tap where pointer tracing or SVG geometry is unavailable
// (reduced-motion, jsdom).

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

// The bright start mark and a generous catch radius are forgiving on purpose.
const TOL = 12; // spatial catch radius in viewBox units
const START_TOL = 15; // a touch more forgiving to first grab the start mark
// The cursor only ever crawls forward along the line within a small arc-length
// window. Keeping the look-ahead under one star segment (the shortest is ~44
// viewBox units) is what stops a held finger from snapping onto a *different*
// segment that crosses nearby — the self-intersection teleport that made
// "another line" light up. A small backward window forgives jitter.
const LOOK_AHEAD = 38;
const LOOK_BACK = 6;
// Among points equally near the finger (e.g. at a crossing), prefer the one
// closest in arc length to where we already are, so progress never jumps the
// gap to a downstream pass through the same spot.
const ARC_WEIGHT = 0.18;
// Lighting the sigil is a focusing aid, never a gate, so most of the way round
// is enough — the last sliver back to the start need not be exact.
const COMPLETE_AT = 0.9;

interface TraceSvg {
  svg: SVGSVGElement;
  progress: SVGPathElement;
  startDot: SVGCircleElement;
  cursor: SVGCircleElement;
  startX: number;
  startY: number;
}

function buildTraceSvg(key: string): TraceSvg {
  const { sigilPath, linePts } = sigilGeometry(key);
  const [startX, startY] = linePts[0];

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
  // Normalise the path to 100 length-units so the bright fill can be hidden by
  // CSS from the very first frame (dasharray/offset = 100) and revealed in
  // density-independent fractions as it is traced — no dependence on layout or
  // getTotalLength() for the resting state.
  progress.setAttribute('pathLength', '100');
  svg.appendChild(target);
  svg.appendChild(progress);

  const startDot = circle(startX, startY, 3.2, 'trace-start');
  svg.appendChild(startDot);
  // The cursor that rides the line; hidden until a trace is under way.
  const cursor = circle(startX, startY, 3.4, 'trace-cursor');
  svg.appendChild(cursor);

  return { svg, progress, startDot, cursor, startX, startY };
}

function geometryOk(ts: TraceSvg): boolean {
  const geo = ts.progress as SVGGeometryElement;
  return (
    typeof geo.getTotalLength === 'function' &&
    typeof geo.getPointAtLength === 'function' &&
    typeof ts.svg.getScreenCTM === 'function'
  );
}

interface TraceEngine {
  detach(): void;
}

// Wires pointer tracing onto a TraceSvg using a forward-only, locally-windowed
// snap so the cursor rides the line and cannot leap across self-intersections.
function createTraceEngine(ts: TraceSvg, onComplete: () => void): TraceEngine {
  const { svg, progress, cursor, startX, startY } = ts;
  const geo = progress as SVGGeometryElement;

  let samples: Sample[] | null = null;
  let totalLen = 0;
  let sampleStep = 1.6;
  let progressLen = 0;
  let tracing = false;
  let done = false;

  function ensureSamples(): Sample[] {
    if (samples) return samples;
    totalLen = geo.getTotalLength();
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

  function moveCursor(len: number) {
    const pt = geo.getPointAtLength(len);
    cursor.setAttribute('cx', String(pt.x));
    cursor.setAttribute('cy', String(pt.y));
  }

  function setProgress(len: number) {
    progressLen = len;
    const frac = totalLen > 0 ? len / totalLen : 0;
    // Path is normalised to 100 units (see pathLength): offset 100 hides the
    // fill, 0 draws it whole.
    progress.style.strokeDashoffset = String(Math.max(0, 100 * (1 - frac)));
    moveCursor(len);
  }

  function complete() {
    if (done) return;
    done = true;
    tracing = false;
    setProgress(totalLen);
    svg.classList.add('traced');
    onComplete();
  }

  // Snap the finger to the nearest point on the line within a small forward
  // window, then advance the cursor to it (never backward, never beyond the
  // window — that is what keeps it on the segment under the finger).
  function advance(px: number, py: number) {
    const s = ensureSamples();
    const loLen = Math.max(0, progressLen - LOOK_BACK);
    const hiLen = Math.min(totalLen, progressLen + LOOK_AHEAD);
    const from = Math.max(0, Math.floor(loLen / sampleStep));
    const to = Math.min(s.length - 1, Math.ceil(hiLen / sampleStep));
    let best = -1;
    let bestCost = Infinity;
    for (let i = from; i <= to; i++) {
      const d = Math.hypot(s[i].x - px, s[i].y - py);
      if (d > TOL) continue;
      const cost = d + ARC_WEIGHT * Math.max(0, s[i].len - progressLen);
      if (cost < bestCost) {
        bestCost = cost;
        best = i;
      }
    }
    if (best >= 0) {
      if (s[best].len > progressLen) setProgress(s[best].len);
      if (progressLen >= totalLen * COMPLETE_AT) complete();
    }
  }

  function nearStart(px: number, py: number): boolean {
    return Math.hypot(px - startX, py - startY) <= START_TOL;
  }

  function onDown(ev: PointerEvent) {
    if (done) return;
    const p = svgPoint(ev);
    if (!p) return;
    // Tracing must begin at the start mark (until some progress is made).
    if (progressLen === 0 && !nearStart(p.x, p.y)) return;
    tracing = true;
    svg.classList.add('tracing');
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
    svg.classList.remove('tracing');
    try {
      svg.releasePointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
  }

  // Show the cursor parked on the start mark, ready to be picked up.
  ensureSamples();
  moveCursor(0);
  cursor.classList.add('ready');

  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', onUp);

  return {
    detach() {
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
    },
  };
}

interface TraceOverlay {
  close(): void;
}

// A dark, full-screen view with the glyph drawn large and easy to trace.
function openTraceOverlay(
  key: string,
  opts: { onComplete: () => void; onClose: () => void },
): TraceOverlay {
  const prevFocus = document.activeElement as HTMLElement | null;

  const root = document.createElement('div');
  root.className = 'trace-overlay';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Trace the sigil');

  const panel = document.createElement('div');
  panel.className = 'trace-overlay-panel';

  const ts = buildTraceSvg(key);
  ts.svg.classList.add('trace-svg-large');

  const hint = document.createElement('p');
  hint.className = 'trace-hint';
  hint.setAttribute('aria-live', 'polite');
  hint.textContent = 'Trace the sigil from the bright mark.';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'ghost-btn trace-overlay-close';
  closeBtn.textContent = 'Done';

  panel.appendChild(ts.svg);
  panel.appendChild(hint);
  panel.appendChild(closeBtn);
  root.appendChild(panel);
  document.body.appendChild(root);
  document.body.classList.add('trace-overlay-open');

  let closed = false;
  let completeTimer: ReturnType<typeof setTimeout> | null = null;

  const engine = createTraceEngine(ts, () => {
    hint.textContent = 'The sigil is lit.';
    opts.onComplete();
    completeTimer = setTimeout(close, 900);
  });

  function close() {
    if (closed) return;
    closed = true;
    if (completeTimer) clearTimeout(completeTimer);
    engine.detach();
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('trace-overlay-open');
    root.remove();
    prevFocus?.focus?.();
    opts.onClose();
  }

  function onKey(ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      close();
    }
  }

  closeBtn.addEventListener('click', close);
  // Tapping the dim ground outside the panel dismisses the view.
  root.addEventListener('pointerdown', (ev) => {
    if (ev.target === root) close();
  });
  document.addEventListener('keydown', onKey);
  closeBtn.focus();

  return { close };
}

export function createSigilTracer(
  key: string,
  opts: { size?: number; onComplete?: () => void } = {},
): SigilTracer {
  const size = opts.size ?? 200;

  const el = document.createElement('div');
  el.className = 'sigil-tracer';
  el.style.setProperty('--trace-size', `${size}px`);

  const ts = buildTraceSvg(key);
  el.appendChild(ts.svg);

  const hint = document.createElement('p');
  hint.className = 'trace-hint';
  hint.setAttribute('aria-live', 'polite');
  el.appendChild(hint);

  let done = false;

  function markLit() {
    if (done) return;
    done = true;
    el.classList.add('traced');
    ts.progress.style.strokeDashoffset = '0';
    hint.textContent = 'The sigil is lit. Begin when you are ready.';
  }

  // jsdom and reduced-motion users can't trace; offer a single tap instead.
  if (!geometryOk(ts) || prefersReducedMotion()) {
    el.classList.add('trace-tap');
    hint.textContent = 'Touch the sigil to focus, then begin.';
    const onTap = () => {
      markLit();
      opts.onComplete?.();
    };
    ts.svg.addEventListener('click', onTap);
    return {
      el,
      destroy() {
        ts.svg.removeEventListener('click', onTap);
        el.remove();
      },
    };
  }

  // Normal path: the inline sigil is a preview; tapping it opens the large
  // overlay where the actual tracing happens.
  el.classList.add('trace-preview');
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  el.setAttribute('aria-label', 'Open the sigil to trace it');
  hint.textContent = 'Tap the sigil to trace it.';

  let overlay: TraceOverlay | null = null;

  function open() {
    if (done || overlay) return;
    overlay = openTraceOverlay(key, {
      onComplete: () => {
        markLit();
        opts.onComplete?.();
      },
      onClose: () => {
        overlay = null;
      },
    });
  }

  function onClick() {
    open();
  }
  function onKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      open();
    }
  }
  el.addEventListener('click', onClick);
  el.addEventListener('keydown', onKey);

  return {
    el,
    destroy() {
      overlay?.close();
      el.removeEventListener('click', onClick);
      el.removeEventListener('keydown', onKey);
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
