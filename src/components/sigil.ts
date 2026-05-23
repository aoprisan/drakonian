// Deterministic SVG sigil generator. Each shell gets a distinct but cohesive
// glyph derived from its id, drawn inside a warded circle. The result is an
// SVG string; CSS animates the stroke draw-on and breathing glow.

function seedFrom(key: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Mulberry32 PRNG
  return function () {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CX = 50;
const CY = 50;

function pointOnCircle(angle: number, radius: number): [number, number] {
  return [CX + Math.cos(angle) * radius, CY + Math.sin(angle) * radius];
}

export interface SigilGeometry {
  /** Ordered vertices of the star the eye (and finger) follows, closing on the first. */
  linePts: [number, number][];
  /** SVG path data for the closed star polygon. */
  sigilPath: string;
  /** Inner ward polygon vertices. */
  innerPts: [number, number][];
  /** Radial spokes as [x1, y1, x2, y2]. */
  spokes: [number, number, number, number][];
}

// Single-stroke star polygons {n/k}: connect every k-th of n points evenly
// spaced on a circle. With gcd(n, k) === 1 the stroke visits every vertex once
// and closes on itself — a balanced, deliberate figure rather than a random
// scribble. Restricted to 2 <= k <= n/2 (k and n−k draw the same star).
const STARS: ReadonlyArray<readonly [number, number]> = [
  [5, 2], // pentagram
  [7, 2], // heptagram, wide
  [7, 3], // heptagram, sharp
  [8, 3], // octagram
  [9, 2], // enneagram, wide
  [9, 4], // enneagram, sharp
  [11, 3],
  [11, 4],
  [12, 5],
];

/**
 * The raw geometry behind a sigil, deterministic in `key`. Exposed so the
 * tracer can follow the line and the seal exporter can re-skin it. The order of
 * PRNG draws is load-bearing: it must stay fixed so a given key always raises
 * the same seal. Orientation and the inner ward are drawn before the star so
 * that the small fixed set of shells spreads across distinct star families.
 */
export function sigilGeometry(key: string): SigilGeometry {
  const rand = seedFrom(key);
  const outerR = 34;
  const startAngle = rand() * Math.PI * 2;
  const innerR = 11 + rand() * 6;
  const innerSides = 3 + Math.floor(rand() * 3); // 3..5
  const [nodes, step] = STARS[Math.floor(rand() * STARS.length)];

  const outerPts: [number, number][] = [];
  for (let i = 0; i < nodes; i++) {
    const a = startAngle + (i / nodes) * Math.PI * 2;
    outerPts.push(pointOnCircle(a, outerR));
  }

  // Walk the star: every k-th vertex, looping back to the first.
  const linePts: [number, number][] = [];
  for (let i = 0; i < nodes; i++) {
    linePts.push(outerPts[(i * step) % nodes]);
  }
  const sigilPath =
    'M ' + linePts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ') + ' Z';

  // Inner ward: a small regular polygon, nested point-between-points.
  const innerStart = startAngle + Math.PI / innerSides;
  const innerPts: [number, number][] = [];
  for (let i = 0; i < innerSides; i++) {
    const a = innerStart + (i / innerSides) * Math.PI * 2;
    innerPts.push(pointOnCircle(a, innerR));
  }

  // Radial spokes from each inner-ward vertex out to the warded circle.
  const spokes: [number, number, number, number][] = [];
  for (let i = 0; i < innerSides; i++) {
    const a = innerStart + (i / innerSides) * Math.PI * 2;
    const [x1, y1] = pointOnCircle(a, innerR);
    const [x2, y2] = pointOnCircle(a, outerR);
    spokes.push([x1, y1, x2, y2]);
  }

  return { linePts, sigilPath, innerPts, spokes };
}

export function sigilSvg(key: string, opts: { size?: number; className?: string } = {}): string {
  const { sigilPath, innerPts, spokes } = sigilGeometry(key);
  const size = opts.size ?? 120;
  const cls = ['sigil', opts.className].filter(Boolean).join(' ');
  const innerPoly = innerPts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const spokeLines = spokes
    .map(([x1, y1, x2, y2]) =>
      `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" />`,
    )
    .join('');

  return `
<svg class="${cls}" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Sigil of ${key}">
  <g class="sigil-ward">
    <circle cx="${CX}" cy="${CY}" r="44" class="sigil-ring-outer" />
    <circle cx="${CX}" cy="${CY}" r="40" class="sigil-ring-inner" />
  </g>
  <g class="sigil-spokes">${spokeLines}</g>
  <polygon points="${innerPoly}" class="sigil-core" />
  <path d="${sigilPath}" class="sigil-line" />
  <circle cx="${CX}" cy="${CY}" r="2.4" class="sigil-eye" />
</svg>`.trim();
}

/**
 * A fully self-contained sigil for export: all colours inlined and a vellum
 * ground baked in, so it renders correctly when rasterised to PNG through a
 * canvas (where the page's CSS variables and the #ink-rough filter are absent).
 * Optionally inscribes a caption beneath the warded circle.
 */
export function sigilSvgStandalone(
  key: string,
  opts: { size?: number; caption?: string } = {},
): string {
  const { sigilPath, innerPts, spokes } = sigilGeometry(key);
  const size = opts.size ?? 1024;
  const caption = (opts.caption ?? '').trim();
  const hasCaption = caption.length > 0;
  const vbH = hasCaption ? 116 : 100;
  const height = Math.round(size * (vbH / 100));

  const innerPoly = innerPts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const spokeLines = spokes
    .map(
      ([x1, y1, x2, y2]) =>
        `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(
          2,
        )}" stroke="rgba(193,154,69,0.32)" stroke-width="0.8" />`,
    )
    .join('');

  const captionEl = hasCaption
    ? `<text x="50" y="110" text-anchor="middle" fill="#c19a45" font-family="Georgia, 'Times New Roman', serif" font-size="6.4" letter-spacing="0.6" font-style="italic">${escapeXml(
        caption,
      )}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${vbH}" width="${size}" height="${height}" role="img" aria-label="Personal seal">
  <rect x="0" y="0" width="100" height="${vbH}" fill="#15100a" />
  <circle cx="50" cy="50" r="44" fill="none" stroke="#8c1c12" stroke-width="1.3" />
  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(193,154,69,0.5)" stroke-width="0.8" />
  <g>${spokeLines}</g>
  <polygon points="${innerPoly}" fill="none" stroke="#b6371f" stroke-width="0.8" opacity="0.78" />
  <path d="${sigilPath}" fill="none" stroke="#ecc868" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="50" cy="50" r="2.4" fill="#ecc868" />
  ${captionEl}
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
