// The unicursal hexagram — the figure of the Aeon, drawn as the Draconian
// sigils are: by hand, in one stroke, with no graphics library. Six points of a
// hexagram traversed 1 → 3 → 6 → 4 → 2 → 5 → 1, which closes the whole star
// without lifting the pen. Crowley set a five-petalled rose at the centre; so
// do we, five petals in the six-pointed star, sulphur upon salt.

const R = 100;

/** The six points of a regular hexagram, y down, starting at the top. */
function points(): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (-90 + i * 60) * (Math.PI / 180);
    out.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  return out;
}

/** The unicursal traversal order of those points. */
const ORDER = [0, 2, 5, 3, 1, 4];

export function hexagramPath(): string {
  const p = points();
  const d = ORDER.map((i, n) => `${n === 0 ? 'M' : 'L'} ${fmt(p[i][0])} ${fmt(p[i][1])}`).join(' ');
  return `${d} Z`;
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

function rose(): string {
  const petals: string[] = [];
  for (let i = 0; i < 5; i++) {
    petals.push(
      `<ellipse class="hexagram-petal" cx="0" cy="-20" rx="11" ry="20" transform="rotate(${i * 72})" />`,
    );
  }
  return petals.join('');
}

export interface HexagramOptions {
  size?: number;
  className?: string;
  /** Draw the enclosing circle. Defaults to true. */
  ring?: boolean;
  /** Draw the central rose. Defaults to true. */
  showRose?: boolean;
  label?: string;
}

export function unicursalHexagramSvg(opts: HexagramOptions = {}): string {
  const size = opts.size ?? 200;
  const cls = ['hexagram', opts.className].filter(Boolean).join(' ');
  const label = opts.label ?? 'Unicursal hexagram';
  const ring = opts.ring === false ? '' : `<circle class="hexagram-ring" cx="0" cy="0" r="${R + 12}" />`;
  const centre = opts.showRose === false ? '' : rose();

  return `<svg class="${cls}" viewBox="-120 -120 240 240" width="${size}" height="${size}" role="img" aria-label="${label}">
  ${ring}
  <path class="hexagram-line" d="${hexagramPath()}" />
  ${centre}
</svg>`;
}
