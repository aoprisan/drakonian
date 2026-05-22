// Per-shell theming. When the practitioner enters a gate (or a tunnel between
// two gates) the whole UI takes on that shell's hue: the accent rule, the
// header glow, the smoke and vignette wash. Values are set as CSS custom
// properties on <body>, transitioned in CSS, and cleared on leaving.

const VARS = ['--accent', '--shell-deep', '--shell-mid', '--shell-glow'] as const;

/**
 * Apply a shell palette ([deep, mid, glow]) as the active theme, or pass null
 * to restore the default rubric/gilt scheme.
 */
export function applyShellTheme(colors: readonly string[] | null): void {
  const body = document.body;
  if (!colors || colors.length === 0) {
    body.removeAttribute('data-shell');
    for (const v of VARS) body.style.removeProperty(v);
    return;
  }
  const deep = colors[0];
  const mid = colors[1] ?? colors[0];
  const glow = colors[2] ?? colors[colors.length - 1];
  body.setAttribute('data-shell', '');
  body.style.setProperty('--accent', mid);
  body.style.setProperty('--shell-deep', deep);
  body.style.setProperty('--shell-mid', mid);
  body.style.setProperty('--shell-glow', glow);
}

function clamp8(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Blend two hex colours; t=0 returns a, t=1 returns b. */
export function mixHex(a: string, b: string, t = 0.5): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const r = clamp8(ar + (br - ar) * t);
  const g = clamp8(ag + (bg - ag) * t);
  const bl = clamp8(ab + (bb - ab) * t);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

/** Blend two shell palettes stop-for-stop, for a tunnel that bridges them. */
export function blendPalettes(a: readonly string[], b: readonly string[]): string[] {
  const len = Math.max(a.length, b.length);
  const out: string[] = [];
  for (let i = 0; i < len; i++) {
    out.push(mixHex(a[i] ?? a[a.length - 1], b[i] ?? b[b.length - 1]));
  }
  return out;
}
