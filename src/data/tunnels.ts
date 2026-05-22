import type { Tunnel, QliphaId } from '../types';

// ---------------------------------------------------------------------------
// The Twenty-Two Tunnels of Set — the dark paths between the shells, after
// Kenneth Grant's "Nightside of Eden". Each tunnel is the nightside of one of
// the 22 paths of the Tree, ruled by its own intelligence and answering to a
// Hebrew letter and a Tarot Atu. The pairs below correspond exactly to the
// edges drawn in TREE_PATHS. Ruler names, letters, and Atu attributions follow
// the tradition; the descriptions are original prose.
// ---------------------------------------------------------------------------

export const TUNNELS: Tunnel[] = [
  {
    id: 'amprodias',
    pair: ['thaumiel', 'ghagiel'],
    name: 'Amprodias',
    letter: 'א',
    letterName: 'Aleph',
    atu: '0 · The Fool',
    epithet: 'The void-spark before the first thought',
    description:
      'The breath before the first thought, the spark that leaps from the divided crown toward the wheel of stars. To walk it is to fall upward into the abyss with empty hands, trusting nothing and therefore wholly free.',
  },
  {
    id: 'baratchial',
    pair: ['thaumiel', 'satariel'],
    name: 'Baratchial',
    letter: 'ב',
    letterName: 'Beth',
    atu: 'I · The Magus',
    epithet: 'The crooked word that creates by deceiving',
    description:
      "The magician's mirror turned to the dark, the crooked word that makes worlds by deceiving. Here the power to name is also the power to bind oneself; the tunnel teaches the price of every spoken creation.",
  },
  {
    id: 'gargophias',
    pair: ['thaumiel', 'thagirion'],
    name: 'Gargophias',
    letter: 'ג',
    letterName: 'Gimel',
    atu: 'II · The High Priestess',
    epithet: 'The veiled descent from crown to Black Sun',
    description:
      'The veiled passage running straight from the crown to the Black Sun, guarded by the dark virgin of the gulf. She offers no light to cross by, only the memory of light and the courage to descend without it.',
  },
  {
    id: 'dagdagiel',
    pair: ['ghagiel', 'satariel'],
    name: 'Dagdagiel',
    letter: 'ד',
    letterName: 'Daleth',
    atu: 'III · The Empress',
    epithet: 'Fertility soured to obsession',
    description:
      'The seductive shell of the dark mother, fertility soured into obsession and the witch-fire of forbidden love. The tunnel inflames desire to the edge of dissolution, that what survives the burning may be truly willed.',
  },
  {
    id: 'hemethterith',
    pair: ['ghagiel', 'thagirion'],
    name: 'Hemethterith',
    letter: 'ה',
    letterName: 'Heh',
    atu: 'IV · The Emperor',
    epithet: 'Dominion hardened into rigidity',
    description:
      "The tyrant's tunnel: dominion turned to rigidity, the law that strangles what it would protect. To pass is to take sovereignty without becoming the stone throne that crushes its own kingdom.",
  },
  {
    id: 'uriens',
    pair: ['ghagiel', 'ghaagsheblah'],
    name: 'Uriens',
    letter: 'ו',
    letterName: 'Vau',
    atu: 'V · The Hierophant',
    epithet: 'The dark teacher of false revelation',
    description:
      'The bull-throated voice of false revelation, the dark teacher who whispers the doctrine you most wish to hear. The labour here is to take initiation from no mouth but your own.',
  },
  {
    id: 'zamradiel',
    pair: ['satariel', 'thagirion'],
    name: 'Zamradiel',
    letter: 'ז',
    letterName: 'Zain',
    atu: 'VI · The Lovers',
    epithet: 'The sundering blade between the twins',
    description:
      'The blade laid between the twins, division masquerading as union. Here the self meets its double and must choose which to slay and which to wed.',
  },
  {
    id: 'characith',
    pair: ['satariel', 'golachab'],
    name: 'Characith',
    letter: 'ח',
    letterName: 'Cheth',
    atu: 'VII · The Chariot',
    epithet: 'The sealed vessel across the abyss-waters',
    description:
      'The armoured vessel that carries the practitioner across the abyss-waters, sealed against what would drown it. Its danger is the armour itself — to arrive uncrossable, untouched, and therefore unchanged.',
  },
  {
    id: 'temphioth',
    pair: ['ghaagsheblah', 'golachab'],
    name: 'Temphioth',
    letter: 'ט',
    letterName: 'Teth',
    atu: 'VIII · Strength',
    epithet: 'The serpent-fire gripped in a bare hand',
    description:
      'The serpent-fire of lust and rage held in a bare hand, the beast not slain but ridden. Mastery here is not the conquest of the animal but its consent.',
  },
  {
    id: 'yamatu',
    pair: ['ghaagsheblah', 'thagirion'],
    name: 'Yamatu',
    letter: 'י',
    letterName: 'Yod',
    atu: 'IX · The Hermit',
    epithet: 'The solitary lamp in the dark furrow',
    description:
      'The solitary lamp carried down into the self, the hidden seed in the dark furrow. Its temptation is to mistake withdrawal for wisdom and never return bearing the light.',
  },
  {
    id: 'kurgasiax',
    pair: ['ghaagsheblah', 'aarab-zaraq'],
    name: 'Kurgasiax',
    letter: 'כ',
    letterName: 'Kaph',
    atu: 'X · Wheel of Fortune',
    epithet: 'The devouring wheel of fortune',
    description:
      'The turning wheel of devouring fortune, gain and ruin spinning into one. To walk it is to learn that the still centre of the wheel does not turn.',
  },
  {
    id: 'lafcursiax',
    pair: ['golachab', 'thagirion'],
    name: 'Lafcursiax',
    letter: 'ל',
    letterName: 'Lamed',
    atu: 'XI · Justice',
    epithet: 'The merciless balance',
    description:
      'The crooked balance of the nightside, judgement without mercy and the sword that answers itself. The tunnel weighs the heart against its own deeds and abides no plea.',
  },
  {
    id: 'malkunofat',
    pair: ['golachab', 'samael'],
    name: 'Malkunofat',
    letter: 'מ',
    letterName: 'Mem',
    atu: 'XII · The Hanged Man',
    epithet: 'The drowning waters of reversal',
    description:
      'The drowning waters of reversal, the world seen upside down through the flood. Surrender here is not defeat but the only way the current carries you onward.',
  },
  {
    id: 'niantiel',
    pair: ['thagirion', 'aarab-zaraq'],
    name: 'Niantiel',
    letter: 'נ',
    letterName: 'Nun',
    atu: 'XIII · Death',
    epithet: 'The putrefying tide of transformation',
    description:
      'The putrefying tide that dissolves the dead form so a new one may rise. Niantiel is not the end but the rot that feeds the next beginning; do not flee the stench of your own becoming.',
  },
  {
    id: 'saksaksalim',
    pair: ['thagirion', 'gamaliel'],
    name: 'Saksaksalim',
    letter: 'ס',
    letterName: 'Samekh',
    atu: 'XIV · Temperance',
    epithet: 'Poison tempered into medicine',
    description:
      'The dark alchemist mingling poison with poison until a medicine is born. The tunnel tempers the Black Sun in the lunar tide — and what is over-tempered shatters.',
  },
  {
    id: 'aanonin',
    pair: ['thagirion', 'samael'],
    name: "A'ano'nin",
    letter: 'ע',
    letterName: 'Ayin',
    atu: 'XV · The Devil',
    epithet: 'The horned gate of matter and mirth',
    description:
      "The horned gate of matter and mirth, the bondage that is also the body's joy. A'ano'nin shows the chain to be a thing you forged yourself; laughter, not struggle, unlocks it.",
  },
  {
    id: 'parfaxitas',
    pair: ['aarab-zaraq', 'samael'],
    name: 'Parfaxitas',
    letter: 'פ',
    letterName: 'Peh',
    atu: 'XVI · The Tower',
    epithet: 'The lightning that throws down the lie',
    description:
      'The lightning that throws down the false structure of mind and desire. Parfaxitas spares nothing built upon a lie; what still stands after the strike was always truly yours.',
  },
  {
    id: 'tzuflifu',
    pair: ['aarab-zaraq', 'gamaliel'],
    name: 'Tzuflifu',
    letter: 'צ',
    letterName: 'Tzaddi',
    atu: 'XVII · The Star',
    epithet: 'The black star in the dream-waters',
    description:
      'The black star reflected in the dream-waters, hope offered and withheld in the same breath. The tunnel pours out a light you cannot keep, teaching the longing that needs no fulfilment.',
  },
  {
    id: 'qulielfi',
    pair: ['aarab-zaraq', 'lilith'],
    name: 'Qulielfi',
    letter: 'ק',
    letterName: 'Qoph',
    atu: 'XVIII · The Moon',
    epithet: 'The dark moon over the threshold beasts',
    description:
      'The low tunnel of the dark moon, where the path sinks into the body and the beasts of the threshold howl. Here the dreamer learns to walk the nightmare awake.',
  },
  {
    id: 'raflifu',
    pair: ['samael', 'gamaliel'],
    name: 'Raflifu',
    letter: 'ר',
    letterName: 'Resh',
    atu: 'XIX · The Sun',
    epithet: 'The false dawn that blinds',
    description:
      'The black sun risen over the lunar shell, false dawn and the brilliance that blinds. Raflifu offers certainty as a trap; doubt is the one eye that survives the glare.',
  },
  {
    id: 'shalicu',
    pair: ['samael', 'lilith'],
    name: 'Shalicu',
    letter: 'ש',
    letterName: 'Shin',
    atu: 'XX · Judgement',
    epithet: 'The trumpet of reckoning in the dark earth',
    description:
      'The last trumpet sounded in the dark earth, the fire of reckoning that calls the buried self to rise. Shalicu does not forgive; it awakens, and what it wakes cannot be laid to sleep again.',
  },
  {
    id: 'thantifaxath',
    pair: ['gamaliel', 'lilith'],
    name: 'Thantifaxath',
    letter: 'ת',
    letterName: 'Tau',
    atu: 'XXI · The Universe',
    epithet: 'The silent walker at the root of the Tree',
    description:
      'The deepest tunnel at the root of the Tree, the silent walker between the first two gates. Thantifaxath is the threshold of all the rest — cross it, and the whole nightside opens beneath you.',
  },
];

function pairKey(a: QliphaId, b: QliphaId): string {
  return [a, b].sort().join('|');
}

const BY_ID = new Map<string, Tunnel>(TUNNELS.map((t) => [t.id, t]));
const BY_PAIR = new Map<string, Tunnel>(TUNNELS.map((t) => [pairKey(t.pair[0], t.pair[1]), t]));

export function getTunnel(id: string): Tunnel | undefined {
  return BY_ID.get(id);
}

/** Look up the tunnel for an edge regardless of endpoint order. */
export function getTunnelByPair(a: QliphaId, b: QliphaId): Tunnel | undefined {
  return BY_PAIR.get(pairKey(a, b));
}
