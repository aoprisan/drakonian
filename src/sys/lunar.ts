// Local moon-phase maths — pure, offline, no network. The Nightside is lunar:
// the Qliphoth are traditionally worked toward the dark of the moon, so the
// tree surfaces the current phase and leans toward Gamaliel (the lunar shell)
// as the light fails.

export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export interface MoonPhase {
  /** Age in days since the last new moon (0..~29.53). */
  age: number;
  /** Position through the synodic cycle, 0..1 (0 = new, 0.5 = full). */
  fraction: number;
  /** Illuminated fraction of the disc, 0..1. */
  illumination: number;
  /** True while the light is growing (new → full). */
  waxing: boolean;
  name: MoonPhaseName;
}

const SYNODIC = 29.530588853; // mean synodic month, in days
const DAY_MS = 86_400_000;
// Reference new moon: 2000-01-06 18:14 UTC (a well-known lunation epoch).
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

const NAMES: MoonPhaseName[] = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

function phaseName(fraction: number): MoonPhaseName {
  // Eight bins centred on each principal phase (each spans ~3.7 days).
  return NAMES[Math.floor((fraction + 1 / 16) * 8) % 8];
}

export function moonPhase(date: Date = new Date()): MoonPhase {
  const daysSince = (date.getTime() - KNOWN_NEW_MOON) / DAY_MS;
  let age = daysSince % SYNODIC;
  if (age < 0) age += SYNODIC;
  const fraction = age / SYNODIC;
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  return { age, fraction, illumination, waxing: fraction < 0.5, name: phaseName(fraction) };
}

export interface LunarOmen {
  text: string;
  /** A shell the current phase favours, linked from the tree. */
  qliphaId?: string;
}

/** A short, phase-keyed line of atmosphere for the tree. */
export function lunarOmen(phase: MoonPhase): LunarOmen {
  switch (phase.name) {
    case 'New Moon':
      return {
        text: 'The dark moon stands open. The Nightside is nearest now — the gate of Gamaliel favours the work.',
        qliphaId: 'gamaliel',
      };
    case 'Waning Crescent':
      return {
        text: 'Only a paring of light remains; the dark moon approaches and Gamaliel’s gate widens.',
        qliphaId: 'gamaliel',
      };
    case 'Waxing Crescent':
      return { text: 'A thread of light returns. The serpent stirs in the dark water.' };
    case 'First Quarter':
      return { text: 'The moon is half-drawn — a threshold poised between dark and light.' };
    case 'Waxing Gibbous':
      return { text: 'The light swells toward fullness; the veils thin only slowly.' };
    case 'Full Moon':
      return {
        text: 'The full moon floods the Tree. The shells lie bright and quiet — a night for vision, not descent.',
      };
    case 'Waning Gibbous':
      return { text: 'The light begins to fail. The descent grows easier with every night.' };
    case 'Last Quarter':
      return { text: 'The moon is half-unmade — the tide turns back toward the dark.' };
  }
}

/**
 * A self-contained SVG of the moon at the given phase: a dark disc with the
 * illuminated limb drawn in gilt. The terminator is an elliptical arc whose
 * radius and bulge follow the phase, so it reads correctly through the cycle.
 */
export function moonGlyphSvg(phase: MoonPhase, opts: { size?: number } = {}): string {
  const size = opts.size ?? 64;
  const cx = 50;
  const cy = 50;
  const r = 42;
  const cosT = Math.cos(2 * Math.PI * phase.fraction);
  const rx = Math.abs(r * cosT).toFixed(3);
  const limbSweep = phase.waxing ? 1 : 0;
  const termSweep = phase.waxing ? (cosT >= 0 ? 0 : 1) : cosT < 0 ? 0 : 1;
  const top = `${cx} ${cy - r}`;
  const bottom = `${cx} ${cy + r}`;
  const litPath = `M ${top} A ${r} ${r} 0 0 ${limbSweep} ${bottom} A ${rx} ${r} 0 0 ${termSweep} ${top} Z`;

  return `<svg class="moon-glyph" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${phase.name}">
  <circle cx="${cx}" cy="${cy}" r="${r}" class="moon-disc" />
  <path d="${litPath}" class="moon-lit" />
  <circle cx="${cx}" cy="${cy}" r="${r}" class="moon-rim" />
</svg>`;
}
