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

// The sigil is one stroke between sharp points that crosses itself, so we light
// it one chord at a time rather than matching against the whole path: only the
// chord between the last reached point and the next is ever active. This makes
// it impossible to fill the wrong line, and sharp corners can't stall it because
// the next point is the target you aim for.
const START_TOL = 16; // how near the bright mark you must begin (viewBox units)
const PERP_TOL = 14; // how far off the current chord still counts as "on the line"
const VERTEX_TOL = 18; // reaching this near the next point completes the chord
const ADVANCE_AT = 0.88; // …or dragging this far along the chord does
// Lighting the sigil is a focusing aid, never a gate, so most of the way round
// is enough — the last sliver back to the start need not be exact.
const COMPLETE_AT = 0.92;

interface TraceSvg {
  svg: SVGSVGElement;
  progress: SVGPathElement;
  startDot: SVGCircleElement;
  cursor: SVGCircleElement;
  targetDot: SVGCircleElement;
  linePts: [number, number][];
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
  svg.appendChild(target);
  svg.appendChild(progress);

  const startDot = circle(startX, startY, 3.2, 'trace-start');
  svg.appendChild(startDot);
  // The next point to drag toward; shown by the engine to guide the stroke.
  const [nx, ny] = linePts[1 % linePts.length];
  const targetDot = circle(nx, ny, 3, 'trace-next');
  svg.appendChild(targetDot);
  // The cursor that rides the line; hidden until a trace is under way.
  const cursor = circle(startX, startY, 3.4, 'trace-cursor');
  svg.appendChild(cursor);

  return { svg, progress, startDot, cursor, targetDot, linePts, startX, startY };
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

// Wires point-to-point tracing onto a TraceSvg: only the chord between the last
// reached point and the next is ever active, so the fill cannot jump to another
// line and sharp corners cannot stall it (the next point is the target).
function createTraceEngine(ts: TraceSvg, onComplete: () => void): TraceEngine {
  const { svg, progress, cursor, targetDot, linePts, startX, startY } = ts;
  const n = linePts.length;

  // Per-chord lengths and the running total of the closed figure.
  const segLen: number[] = [];
  let totalLen = 0;
  for (let i = 0; i < n; i++) {
    const [ax, ay] = linePts[i];
    const [bx, by] = linePts[(i + 1) % n];
    const len = Math.hypot(bx - ax, by - ay);
    segLen.push(len);
    totalLen += len;
  }

  let seg = 0; // index of the chord currently being drawn
  let segFrac = 0; // how far along that chord, 0..1
  let lenDone = 0; // total length of fully-completed chords
  let tracing = false;
  let done = false;

  function svgPoint(ev: PointerEvent): { x: number; y: number } | null {
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  function render() {
    const frac = totalLen > 0 ? (lenDone + segFrac * (segLen[seg] ?? 0)) / totalLen : 0;
    // vector-effect: non-scaling-stroke resolves the dash in screen pixels, so
    // scale the viewBox-unit length by the SVG's on-screen scale — otherwise the
    // fill stops part-way and the line never lights all the way round.
    const ctm = svg.getScreenCTM();
    const scale = ctm && ctm.a ? ctm.a : 1;
    progress.style.strokeDasharray = String(totalLen * scale);
    progress.style.strokeDashoffset = String(Math.max(0, totalLen * (1 - frac) * scale));
    if (seg < n) {
      const [ax, ay] = linePts[seg];
      const [bx, by] = linePts[(seg + 1) % n];
      cursor.setAttribute('cx', String(ax + (bx - ax) * segFrac));
      cursor.setAttribute('cy', String(ay + (by - ay) * segFrac));
      targetDot.setAttribute('cx', String(bx));
      targetDot.setAttribute('cy', String(by));
    }
  }

  function complete() {
    if (done) return;
    done = true;
    tracing = false;
    // Drop the dash entirely so the whole line shows solid, no matter the scale.
    progress.style.strokeDasharray = 'none';
    progress.style.strokeDashoffset = '0';
    cursor.classList.remove('ready');
    targetDot.classList.remove('ready');
    svg.classList.add('traced');
    onComplete();
  }

  // Project the finger onto the active chord and fill it as the finger advances
  // toward the next point. Reaching that point (or dragging most of the way to
  // it) completes the chord and makes the next one active, so a continuous drag
  // can round a point in a single move.
  function advance(px: number, py: number) {
    let guard = 0;
    while (seg < n && guard++ <= n) {
      const [ax, ay] = linePts[seg];
      const [bx, by] = linePts[(seg + 1) % n];
      const dx = bx - ax;
      const dy = by - ay;
      const l2 = dx * dx + dy * dy;
      const t = l2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 1;
      const perp = Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
      const toNext = Math.hypot(px - bx, py - by);

      const onLine = perp <= PERP_TOL;
      if (onLine && t > segFrac) segFrac = t;
      if (toNext <= VERTEX_TOL) segFrac = 1;

      if (segFrac >= ADVANCE_AT && (onLine || toNext <= VERTEX_TOL)) {
        // Chord done — bank its length and make the next one active, then
        // re-project the same finger point onto it.
        lenDone += segLen[seg];
        seg += 1;
        segFrac = 0;
        continue;
      }
      break;
    }
    render();
    const frac = totalLen > 0 ? (lenDone + segFrac * (segLen[seg] ?? 0)) / totalLen : 0;
    if (seg >= n || frac >= COMPLETE_AT) complete();
  }

  function nearStart(px: number, py: number): boolean {
    return Math.hypot(px - startX, py - startY) <= START_TOL;
  }

  function onDown(ev: PointerEvent) {
    if (done) return;
    const p = svgPoint(ev);
    if (!p) return;
    // Tracing must begin at the start mark (until some progress is made).
    if (seg === 0 && segFrac === 0 && !nearStart(p.x, p.y)) return;
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

  // Park the cursor on the start mark and light the first target point.
  render();
  cursor.classList.add('ready');
  targetDot.classList.add('ready');

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
  hint.textContent = 'Drag from the bright mark to each glowing point.';

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
    // Show the whole glyph solid (dash removed so it can't stop part-way).
    ts.progress.style.strokeDasharray = 'none';
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
