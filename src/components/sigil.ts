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
  /** Ordered points of the wandering line — the path the eye (and finger) follows. */
  linePts: [number, number][];
  /** SVG path data for the wandering line. */
  sigilPath: string;
  /** Inner ward polygon vertices. */
  innerPts: [number, number][];
  /** Radial spokes as [x1, y1, x2, y2]. */
  spokes: [number, number, number, number][];
}

/**
 * The raw geometry behind a sigil, deterministic in `key`. Exposed so the
 * tracer can follow the line and the seal exporter can re-skin it. The order
 * of PRNG draws here is load-bearing: it must match the historical sequence so
 * every shell's sigil stays visually identical across releases.
 */
export function sigilGeometry(key: string): SigilGeometry {
  const rand = seedFrom(key);
  const nodes = 5 + Math.floor(rand() * 4); // 5..8 outer points
  const outerR = 34;
  const innerR = 14 + rand() * 8;
  const startAngle = rand() * Math.PI * 2;

  const outerPts: [number, number][] = [];
  for (let i = 0; i < nodes; i++) {
    const a = startAngle + (i / nodes) * Math.PI * 2;
    outerPts.push(pointOnCircle(a, outerR));
  }

  // A wandering line connecting points in a pseudo-random order: the sigil path.
  const order = [...outerPts.keys()];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const linePts = order.map((i) => outerPts[i]);
  const sigilPath =
    'M ' + linePts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ');

  // Inner polygon for an inner ward.
  const innerSides = 3 + Math.floor(rand() * 3); // 3..5
  const innerStart = rand() * Math.PI * 2;
  const innerPts: [number, number][] = [];
  for (let i = 0; i < innerSides; i++) {
    const a = innerStart + (i / innerSides) * Math.PI * 2;
    innerPts.push(pointOnCircle(a, innerR));
  }

  // A few radial spokes.
  const spokes: [number, number, number, number][] = [];
  const spokeCount = 2 + Math.floor(rand() * 3);
  for (let i = 0; i < spokeCount; i++) {
    const a = rand() * Math.PI * 2;
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
