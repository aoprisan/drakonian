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

export function sigilSvg(key: string, opts: { size?: number; className?: string } = {}): string {
  const rand = seedFrom(key);
  const size = opts.size ?? 120;
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
  const innerPts: string[] = [];
  for (let i = 0; i < innerSides; i++) {
    const a = innerStart + (i / innerSides) * Math.PI * 2;
    const [x, y] = pointOnCircle(a, innerR);
    innerPts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  // A few radial spokes.
  const spokes: string[] = [];
  const spokeCount = 2 + Math.floor(rand() * 3);
  for (let i = 0; i < spokeCount; i++) {
    const a = rand() * Math.PI * 2;
    const [x1, y1] = pointOnCircle(a, innerR);
    const [x2, y2] = pointOnCircle(a, outerR);
    spokes.push(`<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" />`);
  }

  const cls = ['sigil', opts.className].filter(Boolean).join(' ');

  return `
<svg class="${cls}" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Sigil of ${key}">
  <g class="sigil-ward">
    <circle cx="${CX}" cy="${CY}" r="44" class="sigil-ring-outer" />
    <circle cx="${CX}" cy="${CY}" r="40" class="sigil-ring-inner" />
  </g>
  <g class="sigil-spokes">${spokes.join('')}</g>
  <polygon points="${innerPts.join(' ')}" class="sigil-core" />
  <path d="${sigilPath}" class="sigil-line" />
  <circle cx="${CX}" cy="${CY}" r="2.4" class="sigil-eye" />
</svg>`.trim();
}
