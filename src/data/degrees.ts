import type { Degree } from '../types';

// ---------------------------------------------------------------------------
// The Draconian initiatory ladder, aligned to the ascent of the Nightside
// Tree. In the Dragon Rouge tradition the magician climbs the Qliphoth from
// the gate of Lilith toward the crown of Thaumiel; each degree marks the
// gnosis of one shell. Notation follows the order's X.0 scheme; the precise
// curriculum of any order is its own, this ladder is the structural ascent.
// ---------------------------------------------------------------------------

export const DEGREES: Degree[] = [
  {
    id: 'deg-1',
    label: '1.0',
    title: 'The Gate of Lilith',
    qliphaId: 'lilith',
    theme: 'Awakening of the nightside; descent into the body and the dark earth.',
  },
  {
    id: 'deg-2',
    label: '2.0',
    title: 'The Lunar Serpent',
    qliphaId: 'gamaliel',
    theme: 'Dream, the astral serpent, and the lunar tides of the unconscious.',
  },
  {
    id: 'deg-3',
    label: '3.0',
    title: 'The Venom of Mind',
    qliphaId: 'samael',
    theme: 'The deceiving intellect transmuted; poison taken as medicine.',
  },
  {
    id: 'deg-4',
    label: '4.0',
    title: 'The Black Flame of Desire',
    qliphaId: 'aarab-zaraq',
    theme: 'Scattered longing gathered and forged into a single will.',
  },
  {
    id: 'deg-5',
    label: '5.0',
    title: 'The Black Sun',
    qliphaId: 'thagirion',
    theme: 'Confrontation with the self; the dark radiance of sovereignty.',
  },
  {
    id: 'deg-6',
    label: '6.0',
    title: 'The War-Fire',
    qliphaId: 'golachab',
    theme: 'The flame of will, directed and exact; mastery of severity.',
  },
  {
    id: 'deg-7',
    label: '7.0',
    title: 'The Measured Abyss',
    qliphaId: 'ghaagsheblah',
    theme: 'Expansion without devouring; the right measure of power.',
  },
  {
    id: 'deg-8',
    label: '8.0',
    title: 'Crossing the Veil',
    qliphaId: 'satariel',
    theme: 'The abyss and the hidden gnosis behind concealment.',
  },
  {
    id: 'deg-9',
    label: '9.0',
    title: 'The Still Axis',
    qliphaId: 'ghagiel',
    theme: 'The centre within the turning wheel of obstruction.',
  },
  {
    id: 'deg-10',
    label: '10.0',
    title: 'The Divided Crown',
    qliphaId: 'thaumiel',
    theme: 'The summit of the Draconian ascent; the god in revolt.',
  },
];

const BY_ID = new Map<string, Degree>(DEGREES.map((d) => [d.id, d]));

export function getDegree(id: string): Degree | undefined {
  return BY_ID.get(id);
}
