// Thelemic dating — pure, offline, no network.
//
// Thelemites date documents by the New Aeon, whose first year began at the
// vernal equinox of 1904 (the Cairo working followed that spring). Years are
// counted in *docosades* of twenty-two: the docosade in capital Roman
// numerals, the year within it in lower case — "Anno V:xii". The full formula
// also records the Sun's and Moon's places, e.g.
//
//   Sol in 9° Leo · Luna in 21° Scorpio · dies Saturni · Anno V:xii
//
// The positions are low-precision almanac maths, good to about a degree — far
// closer than the eye, and enough to name the sign correctly.

import { moonPhase } from './lunar';

const DAY_MS = 86_400_000;
const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
/** The Aeon is reckoned from the March equinox; 20 March is within a day. */
const EQUINOX_MONTH = 2;
const EQUINOX_DAY = 20;

export interface ZodiacPlace {
  /** Ecliptic longitude, 0..360. */
  longitude: number;
  sign: string;
  glyph: string;
  /** Whole degrees within the sign, 0..29. */
  degree: number;
  /** "9° Leo" */
  label: string;
}

const SIGNS: [string, string][] = [
  ['Aries', '♈'],
  ['Taurus', '♉'],
  ['Gemini', '♊'],
  ['Cancer', '♋'],
  ['Leo', '♌'],
  ['Virgo', '♍'],
  ['Libra', '♎'],
  ['Scorpio', '♏'],
  ['Sagittarius', '♐'],
  ['Capricorn', '♑'],
  ['Aquarius', '♒'],
  ['Pisces', '♓'],
];

function norm360(deg: number): number {
  const d = deg % 360;
  return d < 0 ? d + 360 : d;
}

const RAD = Math.PI / 180;

/** Apparent ecliptic longitude of the Sun, in degrees. */
export function sunLongitude(date: Date = new Date()): number {
  const n = (date.getTime() - J2000) / DAY_MS;
  const meanLong = 280.46 + 0.9856474 * n;
  const meanAnom = (357.528 + 0.9856003 * n) * RAD;
  return norm360(meanLong + 1.915 * Math.sin(meanAnom) + 0.02 * Math.sin(2 * meanAnom));
}

/**
 * Ecliptic longitude of the Moon, in degrees. Derived from the Sun's place and
 * the phase angle: the elongation of the Moon from the Sun *is* the phase.
 */
export function moonLongitude(date: Date = new Date()): number {
  return norm360(sunLongitude(date) + 360 * moonPhase(date).fraction);
}

export function zodiac(longitude: number): ZodiacPlace {
  const lon = norm360(longitude);
  const index = Math.floor(lon / 30) % 12;
  const [sign, glyph] = SIGNS[index];
  const degree = Math.floor(lon % 30);
  return { longitude: lon, sign, glyph, degree, label: `${degree}° ${sign}` };
}

export interface AeonYear {
  /** Whole years elapsed since the equinox of 1904 (1904–05 is year 0). */
  aeonYear: number;
  /** Completed cycles of twenty-two years. */
  docosade: number;
  /** Year within the current docosade, 0..21. */
  yearInDocosade: number;
  /** "V:xii" */
  roman: string;
}

const ROMAN: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

/** Roman numeral for 1..3999; 0 is written "0", as Thelemic practice does. */
export function roman(n: number): string {
  if (n <= 0) return '0';
  let rest = Math.floor(n);
  let out = '';
  for (const [value, sym] of ROMAN) {
    while (rest >= value) {
      out += sym;
      rest -= value;
    }
  }
  return out;
}

export function aeonYear(date: Date = new Date()): AeonYear {
  const year = date.getUTCFullYear();
  const equinox = Date.UTC(year, EQUINOX_MONTH, EQUINOX_DAY);
  const elapsed = (date.getTime() < equinox ? year - 1 : year) - 1904;
  const n = Math.max(0, elapsed);
  const docosade = Math.floor(n / 22);
  const yearInDocosade = n % 22;
  return {
    aeonYear: n,
    docosade,
    yearInDocosade,
    roman: `${roman(docosade)}:${roman(yearInDocosade).toLowerCase()}`,
  };
}

const DIES = [
  'dies Solis',
  'dies Lunae',
  'dies Martis',
  'dies Mercurii',
  'dies Jovis',
  'dies Veneris',
  'dies Saturni',
];

export interface ThelemicDate {
  sol: ZodiacPlace;
  luna: ZodiacPlace;
  /** Latin name of the weekday, e.g. "dies Saturni". */
  dies: string;
  year: AeonYear;
  /** "Anno V:xii" */
  anno: string;
  /** The whole formula on one line. */
  label: string;
}

export function thelemicDate(date: Date = new Date()): ThelemicDate {
  const sol = zodiac(sunLongitude(date));
  const luna = zodiac(moonLongitude(date));
  const dies = DIES[date.getDay()];
  const year = aeonYear(date);
  const anno = `Anno ${year.roman}`;
  return {
    sol,
    luna,
    dies,
    year,
    anno,
    label: `Sol in ${sol.label} · Luna in ${luna.label} · ${dies} · ${anno}`,
  };
}

// --- Liber Resh: the four adorations --------------------------------------

export type ReshStationId = 'ra' | 'ahathoor' | 'tum' | 'khephra';

export interface ReshStation {
  id: ReshStationId;
  /** Godform adored at this station. */
  godform: string;
  /** Time of day it belongs to. */
  hour: string;
  /** Quarter faced. */
  quarter: string;
  /** The Sun's condition in that quarter. */
  aspect: string;
  /** A line of adoration, in the spirit of Liber Resh. */
  adoration: string;
}

export const RESH_STATIONS: ReshStation[] = [
  {
    id: 'ra',
    godform: 'Ra',
    hour: 'Dawn',
    quarter: 'East',
    aspect: 'the Sun rising in strength',
    adoration:
      'Hail to thee, Ra, in thy rising — lord of the first light, who puts the bark upon the water of the sky. I greet the morning as my own beginning, and take up my will with the day.',
  },
  {
    id: 'ahathoor',
    godform: 'Ahathoor',
    hour: 'Noon',
    quarter: 'South',
    aspect: 'the Sun in her beauty at the height',
    adoration:
      'Hail to thee, Ahathoor, in thy triumph — lady of the height, who holds the bark at the crown of the day. I stand at the noon of my work and neither hurry it nor hide from it.',
  },
  {
    id: 'tum',
    godform: 'Tum',
    hour: 'Sunset',
    quarter: 'West',
    aspect: 'the Sun going down in joy',
    adoration:
      'Hail to thee, Tum, in thy setting — lord of the closing, who turns the bark toward the west. I let the day go down in gladness, keeping nothing back that was meant to be spent.',
  },
  {
    id: 'khephra',
    godform: 'Khephra',
    hour: 'Midnight',
    quarter: 'North',
    aspect: 'the Sun hidden, labouring beneath the earth',
    adoration:
      'Hail to thee, Khephra, in thy hiding — beetle of the midnight, who rolls the unseen sun beneath the world. I keep faith with the light I cannot see, and labour while it is dark.',
  },
];

/**
 * The station whose hour the given moment falls nearest — dawn, noon, sunset
 * or midnight, by local clock time. The traditional practice keeps to the true
 * solar hours; this is the offline approximation the app adores by.
 */
export function reshStation(date: Date = new Date()): ReshStation {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 4 && h < 10) return RESH_STATIONS[0];
  if (h >= 10 && h < 16) return RESH_STATIONS[1];
  if (h >= 16 && h < 22) return RESH_STATIONS[2];
  return RESH_STATIONS[3];
}
