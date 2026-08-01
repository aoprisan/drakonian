import type { Ritual, RitualStep, ThelemaTopic } from '../types';
import { RESH_STATIONS, type ReshStation } from '../sys/thelemic-date';

// ---------------------------------------------------------------------------
// Thelema — the current received by Aleister Crowley at Cairo in 1904.
//
// This grimoire's spine is the Nightside; this section is the daylight half of
// the same magick, and the tradition from which most of the modern Draconian
// vocabulary descends. The prose is original and expository; quotations are
// short and attributed. Nothing here is an order's official curriculum.
// ---------------------------------------------------------------------------

export const THELEMA: ThelemaTopic[] = [
  {
    id: 'law',
    kicker: 'The whole of the Law',
    title: 'Thelema',
    epithet: 'Will as the one law, and love as the way it is done.',
    sigil: 'thelema::law',
    body: [
      'Thelema is the Greek word for will — θέλημα — and it names both a book and the current that came with it. Its law is stated in a single sentence, and that sentence is almost always misread on first hearing. It is not a licence to do as one likes. It is the claim that every being has a true course, as particular and as impersonal as the orbit of a star, and that to find and hold that course is the whole of one\'s duty.',
      'The second sentence is the corrective to the first. Will without love is mere appetite; love without will is mere drift. Taken together they describe a life that is neither ruled from outside nor scattered from within: a will that is loved, and a love that is willed.',
      'Everything else in Thelema — the godforms, the grades, the rituals, the calendar — is scaffolding raised around that one problem: how a person discovers what they actually are, and then does it.',
    ],
    quote: {
      text: 'Do what thou wilt shall be the whole of the Law. … Love is the law, love under will.',
      source: 'Liber AL vel Legis I:40, I:57',
    },
    keys: [
      { term: 'Thelema', def: 'Will — the Greek word, and the name of the current.' },
      { term: 'Agapé', def: 'Love — the Greek word whose number, 93, equals that of Thelema.' },
      { term: 'The greeting', def: '"93" — one word standing for both halves of the Law.' },
    ],
  },
  {
    id: 'true-will',
    kicker: 'The one work',
    title: 'The True Will',
    epithet: 'Not what you want; what you are for.',
    sigil: 'thelema::will',
    body: [
      'The True Will is the course a person would take if nothing were pulling them off it — no inherited fear, no borrowed ambition, no craving for approval. Crowley compared it to the motion of a star: unforced, particular, and in no conflict with any other star, since two things moving truly cannot collide.',
      'It is therefore discovered rather than chosen. The practical work is subtractive: notice which desires arrive from outside, which pleasures leave you smaller, which duties you took up to be liked. What survives that stripping and still insists on itself is the beginning of the answer.',
      'The formal name for finding it is the Knowledge and Conversation of the Holy Guardian Angel — the encounter with one\'s own genius, treated as a real other so that it can tell you something you did not already believe. Everything before that meeting is preparation; everything after it is execution.',
    ],
    quote: {
      text: 'Every man and every woman is a star.',
      source: 'Liber AL vel Legis I:3',
    },
    keys: [
      {
        term: 'Holy Guardian Angel',
        def: 'The true self met as another — the aim of the Great Work.',
      },
      { term: 'Lust of result', def: 'Craving the outcome, the classic corruption of a will.' },
      { term: 'Silence', def: 'The discipline that lets a will be heard at all.' },
    ],
  },
  {
    id: 'liber-al',
    kicker: 'Cairo, April 1904',
    title: 'The Book of the Law',
    epithet: 'Three chapters written in three days, and never disowned.',
    sigil: 'thelema::liber-al',
    body: [
      'In the spring of 1904 Crowley and his wife Rose Kelly were in Cairo. She — who had no occult training and no interest in acquiring any — began relaying instructions, named a god she had no way of naming, and identified his image in the Boulak museum on the first attempt. On the eighth, ninth and tenth of April, for one hour each day, Crowley wrote at dictation from a voice he called Aiwass, which he described as speaking from over his left shoulder.',
      'The result is Liber AL vel Legis, the Book of the Law: three short chapters spoken by three godforms. It is aphoristic, imperious, occasionally savage, and full of unexplained numbers and cross-references that Crowley spent the next four decades reading. He disliked much of it, tried more than once to be rid of it, and always came back.',
      'Thelemites do not agree about what the book is — dictation from a praeterhuman intelligence, an eruption of Crowley\'s own genius, or a document whose origin is beside the point. They largely agree about the practical consequence: the book sets a law, and the reader is left to work out what obeying it means in their own case.',
    ],
    quote: {
      text: 'The Book of the Law is Written and Concealed.',
      source: 'Liber AL vel Legis, colophon',
    },
    keys: [
      { term: 'Aiwass', def: 'The voice of the dictation; called the minister of Hoor-paar-kraat.' },
      { term: 'Rose Kelly', def: 'The Scarlet Woman of the working; the channel by which it opened.' },
      { term: 'The Stélé', def: 'The funerary stélé of Ankh-af-na-khonsu, exhibit 666 in Boulak.' },
    ],
  },
  {
    id: 'trinity',
    kicker: 'The speakers of the book',
    title: 'Nuit, Hadit, Ra-Hoor-Khuit',
    epithet: 'Infinite space, the point within it, and the force that acts.',
    sigil: 'thelema::trinity',
    body: [
      'Each chapter of the Book of the Law is spoken by a different godform, and together they compose a cosmology. Nuit is the whole of space and every possibility in it — the night sky arched over everything, promising that no experience is forbidden to her. Hadit is the dimensionless point of consciousness at the centre of any experience whatever: the flame in the heart, the knower who can never be found as an object.',
      'Their union produces Ra-Hoor-Khuit, the crowned and conquering child — force and fire, action in the world, the aspect of the Aeon that will not be argued with. Beside him stands his twin Hoor-paar-kraat, Harpocrates, the god of silence: the same power at rest.',
      'Read psychologically, the three are the field of all that could be experienced, the point that experiences it, and the will that acts. Read as gods, they are addressed, invoked, and adored. Thelema is deliberately built so that both readings are workable.',
    ],
    quote: {
      text: 'I am Nuit, and my word is six and fifty.',
      source: 'Liber AL vel Legis I:24',
    },
    keys: [
      { term: 'Nuit', def: 'The infinite; the circumference that is nowhere.' },
      { term: 'Hadit', def: 'The infinitely small; the centre that is everywhere.' },
      { term: 'Ra-Hoor-Khuit', def: 'Their child: manifest force, the lord of the Aeon.' },
      { term: 'Hoor-paar-kraat', def: 'His silent twin; the same god, indrawn.' },
    ],
  },
  {
    id: 'aeons',
    kicker: 'The turning of the ages',
    title: 'The Three Aeons',
    epithet: 'Mother, dying god, and crowned child.',
    sigil: 'thelema::aeons',
    body: [
      'Thelema divides religious history into aeons, each with a governing formula. The Aeon of Isis was matriarchal and lunar: life understood as the gift of the mother, magick worked by fertility and by the turning of the year. The Aeon of Osiris was patriarchal and solar: the formula of the god who dies and is resurrected, and with it the machinery of priesthood, sacrifice and redemption from without.',
      'The Aeon of Horus, declared in 1904, has the formula of the child — self-arising, needing no death to be reborn, answerable to its own will. Its virtues are directness, vigour and the refusal of borrowed authority; its characteristic vices are the same qualities gone rancid, which the last hundred-odd years have illustrated well enough.',
      'Nothing in the scheme is a promise of improvement. An aeon is a set of terms, not a reward, and the terms of this one place the whole burden of authority on the individual who must now carry it.',
    ],
    quote: {
      text: 'The Aeon of Horus is come, and the word of the Law is Thelema.',
      source: 'After the Equinox of the Gods',
    },
    keys: [
      { term: 'Isis', def: 'The aeon of the mother; the formula of nature.' },
      { term: 'Osiris', def: 'The aeon of the dying god; the formula of sacrifice.' },
      { term: 'Horus', def: 'The aeon of the child; the formula of the self-arisen will.' },
    ],
  },
  {
    id: 'crowley',
    kicker: '1875 — 1947',
    title: 'Aleister Crowley',
    epithet: 'Poet, mountaineer, chess player, and the prophet of the new law.',
    sigil: 'thelema::crowley',
    body: [
      'Edward Alexander Crowley was born in Leamington in 1875 to a family of Plymouth Brethren, and spent the rest of his life reacting to it. He read Cambridge, climbed at the highest standard of his day, wrote a great deal of verse of very uneven quality, and in 1898 was initiated into the Hermetic Order of the Golden Dawn, where he learned the ceremonial grammar he would spend forty years rebuilding.',
      'After Cairo he founded the A∴A∴ with George Cecil Jones, edited the enormous periodical The Equinox, took over the British section of the O.T.O., ran the short-lived Abbey of Thelema at Cefalù, and published — among much else — Magick in Theory and Practice, The Book of Thoth and the Thoth Tarot painted by Lady Frieda Harris. He died at Hastings in 1947, poor and largely dismissed.',
      'He was, by the plain record, often cruel, frequently dishonest about money, and dependent on heroin from a doctor\'s prescription for the last decades of his life. He was also the most systematic magical theorist of his century, and almost every current in modern Western occultism — the Draconian work in this book included — is downstream of what he wrote. Both statements are true, and the second is not an excuse for the first.',
    ],
    quote: {
      text: 'Magick is the Science and Art of causing Change to occur in conformity with Will.',
      source: 'Magick in Theory and Practice, introduction',
    },
    keys: [
      { term: 'The Equinox', def: 'His periodical: "the Method of Science, the Aim of Religion".' },
      { term: 'Thoth Tarot', def: 'His deck, painted by Frieda Harris across five years.' },
      { term: 'Cefalù', def: 'The Abbey of Thelema in Sicily, 1920–23.' },
    ],
  },
  {
    id: 'magick',
    kicker: 'The k is deliberate',
    title: 'Magick',
    epithet: 'Change in conformity with Will — including the change called living.',
    sigil: 'thelema::magick',
    body: [
      'Crowley added the archaic k to distinguish his subject from stage conjuring, and defined it so broadly that it swallows ordinary life: every intentional act is magick, and the difference between a banishing ritual and making breakfast is one of degree, not of kind. What the definition insists on is conformity to will. An act that does not serve your true course is not magick, however much incense it burns.',
      'The practical corpus is nonetheless specific. Banishing before working; the assumption of godforms; invocation to become and evocation to summon; the pentagram and hexagram rituals; the daily adorations of Liber Resh; the discipline of the magical record, in which everything is written down so that self-deception has somewhere to be caught.',
      'The temper of the whole thing is empirical. Crowley\'s standing instruction was to keep records, compare results, and believe nothing that the record does not support — the method of science applied to the aim of religion.',
    ],
    quote: {
      text: 'The single supreme ritual is the attainment of the Knowledge and Conversation of the Holy Guardian Angel.',
      source: 'Magick in Theory and Practice',
    },
    keys: [
      { term: 'Banishing', def: 'Clearing the field before any working.' },
      { term: 'Invocation', def: 'Calling a force in, to become it.' },
      { term: 'Evocation', def: 'Calling a force out, to treat with it.' },
      { term: 'The Record', def: 'The magical diary; the only defence against wishful reading.' },
    ],
    seeAlso: { href: '#/journal', label: 'Keep your record in the Black Book' },
  },
  {
    id: 'resh',
    kicker: 'Four times a day',
    title: 'Liber Resh',
    epithet: 'The sun adored at dawn, noon, sunset and midnight.',
    sigil: 'thelema::resh',
    body: [
      'Liber Resh vel Helios is the simplest and most demanding practice in the Thelemic curriculum: four short adorations of the sun, at dawn, noon, sunset and midnight, every day, without exception. The sun is greeted under a different Egyptian godform at each station — Ra rising in the east, Ahathoor at the height, Tum going down in the west, and Khephra labouring beneath the earth at midnight.',
      'Its stated purpose is not devotion but orientation. Performed honestly it welds your attention to the actual motion of the actual sun, four times a day, until you always roughly know where you stand on the turning earth. Its unstated purpose is discipline: it is very easy, and therefore the failure to keep it is entirely diagnostic.',
      'The grimoire keeps the hours with you. The station shown on the Thelema page follows your own clock, and the rite for that station can be worked in a minute — standing, facing the quarter, sign given, adoration spoken.',
    ],
    quote: {
      text: 'Also it is better if in these adorations thou assume the God-form of Whom thou adorest.',
      source: 'Liber Resh vel Helios',
    },
    keys: RESH_STATIONS.map((s) => ({
      term: `${s.godform} · ${s.hour}`,
      def: `${s.quarter} — ${s.aspect}.`,
    })),
  },
  {
    id: 'holy-books',
    kicker: 'Class A',
    title: 'The Holy Books',
    epithet: 'Received texts, in which not a letter may be changed.',
    sigil: 'thelema::books',
    body: [
      'Crowley graded his published work by class. Class A holds the received books — texts he claimed were dictated rather than composed, and in which, by his own rule, not so much as the style of a letter may be altered. Class B is scholarly exposition, Class C is suggestive, Class D is official ritual, and Class E is public manifesto.',
      'Besides Liber AL, the Class A books include Liber LXV, the Book of the Heart Girt with a Serpent, on the love between the aspirant and the Angel; Liber VII, the Book of Lapis Lazuli, on the ecstasy of dissolution; Liber CCXX\'s companions Liber DCCCXIII vel Ararita, on the reduction of the sevenfold to unity; and Liber X, Porta Lucis, among others.',
      'They are not arguments and they resist being read as arguments. The usual counsel is to read them aloud, slowly, more than once, and to let the sense arrive late — nearer to how one reads poetry, or memorises a landscape.',
    ],
    quote: {
      text: 'Class A consists of books of which may be changed not so much as the style of a letter.',
      source: 'A Syllabus of the Official Instructions of the A∴A∴',
    },
    keys: [
      { term: 'Liber AL (CCXX)', def: 'The Book of the Law.' },
      { term: 'Liber LXV', def: 'The Book of the Heart Girt with a Serpent.' },
      { term: 'Liber VII', def: 'The Book of Lapis Lazuli.' },
      { term: 'Liber Ararita', def: 'On the reduction of the sevenfold to unity.' },
    ],
  },
  {
    id: 'orders',
    kicker: 'The two vehicles',
    title: 'A∴A∴ and O.T.O.',
    epithet: 'A ladder climbed alone, and a body of initiates.',
    sigil: 'thelema::orders',
    body: [
      'The A∴A∴, founded by Crowley and George Cecil Jones in 1907, is a teaching order structured as a ladder of grades laid over the Tree of Life: Probationer, Neophyte, Zelator, Practicus, Philosophus and Dominus Liminis in the Outer; Adeptus, Adeptus Major and Adeptus Exemptus in the Order of the Rose Cross; and beyond the Abyss, Magister Templi, Magus and Ipsissimus. Each member knows only their immediate superior and their own students, so the order is a chain of teachers rather than a congregation.',
      'The Ordo Templi Orientis is the other vehicle: an initiatory fraternity with degrees, a body of ritual, and — from 1913 — the Gnostic Mass at its public centre. Crowley reorganised it around the Law of Thelema after taking charge of its British section, and it remains a social and ceremonial organisation in a way the A∴A∴ deliberately is not.',
      'What is offered in this grimoire belongs to neither. It is a study companion: the shape of the ladder, the vocabulary, and rites written for private contemplative work. Any living order\'s curriculum is its own to give.',
    ],
    quote: {
      text: 'The Method of Science — the Aim of Religion.',
      source: 'Motto of The Equinox',
    },
    keys: [
      { term: 'Probationer', def: '0=0 — the first year, spent keeping a record.' },
      { term: 'Adeptus Minor', def: '5=6 — the grade of the Knowledge and Conversation.' },
      { term: 'Magister Templi', def: '8=3 — attained only across the Abyss.' },
    ],
    seeAlso: { href: '#/journal', label: 'Track your own ladder in the Black Book' },
  },
  {
    id: 'ninety-three',
    kicker: 'By gematria',
    title: 'Ninety-Three',
    epithet: 'Will and love, counted to the same number.',
    sigil: 'thelema::93',
    body: [
      'Greek and Hebrew letters carry numerical values, and Qabalists treat words of equal value as commenting on one another. Θέλημα — Thelema, will — sums to 93. So does Ἀγάπη, agapé, love. The two halves of the Law are therefore the same number, which is why Thelemites greet one another with "93" and close a letter "93 93/93": the whole Law, and love under will.',
      'Other numbers travel with it. 418 is Abrahadabra, the word of the Aeon and the number of the Great Work accomplished; 666 is the number of the Sun and the Beast, which Crowley claimed with relish and considerable publicity; 156 is Babalon; 11 is the number of magick itself, one more than the ten of the settled Tree.',
      'The practice is not numerology in the fortune-telling sense. It is a system of controlled association: a way of hanging ideas on a frame so that correspondences can be tested, argued about, and — often enough — discarded.',
    ],
    quote: {
      text: 'My number is 11, as all their numbers who are of us.',
      source: 'Liber AL vel Legis I:60',
    },
    keys: [
      { term: '93', def: 'Thelema · Agapé — will and love.' },
      { term: '418', def: 'Abrahadabra — the Great Work accomplished.' },
      { term: '156', def: 'Babalon.' },
      { term: '11', def: 'The number of magick.' },
    ],
  },
  {
    id: 'abyss',
    kicker: 'Where the two trees meet',
    title: 'The Abyss, Choronzon and Babalon',
    epithet: 'The gulf every system must cross, named twice.',
    sigil: 'thelema::abyss',
    body: [
      'Between the three supernal spheres and the seven below them lies the Abyss, and in it the false crown Daath. Nothing crosses it intact. The aspirant who reaches its edge is required to pour every drop of their blood — which is to say, every part of the self they still call their own — into the cup of Babalon, and to keep back nothing, since whatever is kept back becomes their portion in the Abyss.',
      'Its dweller is Choronzon, whom Crowley and Victor Neuburg evoked in the Algerian desert in 1909 in the tenth Aethyr: dispersion itself, the demon of every form and none, who imitates any voice and argues in any direction. He is not defeated by force. He is survived by having nothing left for him to take.',
      'The Nightside half of this grimoire treats the same territory in another vocabulary — the shells, their rulers, and the tunnels between them. The Abyss of the Thelemic ladder and the outer darkness of the Qliphothic ascent are the same country under two maps, and it is worth learning to read both.',
    ],
    quote: {
      text: 'I am Babalon, and she my daughter, unique, and there shall be no other women like her.',
      source: 'The Vision and the Voice, 12th Aethyr',
    },
    keys: [
      { term: 'Daath', def: 'The false knowledge; the hole where a sphere should be.' },
      { term: 'Choronzon', def: '333 — the dweller in the Abyss, dispersion in person.' },
      { term: 'Babalon', def: '156 — she who receives the blood of the adepts.' },
    ],
    seeAlso: { href: '#/qlipha/thaumiel', label: 'See the divided crown of Thaumiel' },
  },
  {
    id: 'feasts',
    kicker: 'The turning year',
    title: 'The Thelemic Calendar',
    epithet: 'Feasts for the days that made the Aeon, and for being alive in it.',
    sigil: 'thelema::feasts',
    body: [
      'The Book of the Law instructs its readers to keep feasts — for the events of the Aeon, for the turning quarters of the year, and for the ordinary passages of a human life: for fire and for water, for life and for death. The calendar is therefore short on obligation and long on occasion.',
      'Years are numbered from the vernal equinox of 1904 in cycles of twenty-two, written as a capital Roman numeral for the cycle and a lower-case one for the year within it. A document dated Anno V:xii belongs to the twelfth year of the fifth docosade — a small piece of arithmetic that quietly reminds the writer which age they are writing in.',
      'The full formula also records the places of the Sun and Moon and the Latin name of the weekday. The Thelema page keeps that reckoning for you, recalculated every time it is opened.',
    ],
    quote: {
      text: 'Let there be feasting and joy thereat.',
      source: 'Liber AL vel Legis II:42',
    },
  },
];

const TOPIC_BY_ID = new Map<string, ThelemaTopic>(THELEMA.map((t) => [t.id, t]));

export function getThelemaTopic(id: string): ThelemaTopic | undefined {
  return TOPIC_BY_ID.get(id);
}

// --- Feasts ----------------------------------------------------------------

export interface Feast {
  /** Month, 1..12. */
  month: number;
  /** Day of month. */
  day: number;
  name: string;
  note: string;
}

export const FEASTS: Feast[] = [
  {
    month: 3,
    day: 20,
    name: 'The Feast of the Supreme Ritual',
    note: 'The invocation of Horus, 1904, and the beginning of the Aeonic year.',
  },
  {
    month: 4,
    day: 8,
    name: 'The Three Days of the Writing of the Book of the Law',
    note: 'The eighth, ninth and tenth of April: one hour of dictation on each.',
  },
  {
    month: 6,
    day: 21,
    name: 'The Feast for the Equinox and Solstice',
    note: 'Kept at each turning quarter of the year.',
  },
  {
    month: 8,
    day: 12,
    name: 'The Feast for the First Night of the Prophet and his Bride',
    note: 'The marriage of Crowley and Rose Kelly, 1903.',
  },
  {
    month: 10,
    day: 12,
    name: 'The Feast of the Prophet',
    note: 'The birth of Aleister Crowley, 1875.',
  },
  {
    month: 12,
    day: 1,
    name: 'The Greater Feast of the Prophet',
    note: 'His death at Hastings, 1947 — a feast, not a mourning.',
  },
];

/** The next feast on or after the given date, wrapping into next year. */
export function nextFeast(date: Date = new Date()): { feast: Feast; when: Date } {
  const year = date.getFullYear();
  const today = new Date(year, date.getMonth(), date.getDate()).getTime();
  const candidates = FEASTS.map((feast) => ({
    feast,
    when: new Date(year, feast.month - 1, feast.day),
  }))
    .concat(
      FEASTS.map((feast) => ({ feast, when: new Date(year + 1, feast.month - 1, feast.day) })),
    )
    .filter((c) => c.when.getTime() >= today);
  return candidates[0];
}

// --- Rites -----------------------------------------------------------------

const HOME = { href: '#/thelema', label: 'Thelema' };

const WILL_BREATH: RitualStep = {
  type: 'breath',
  title: 'The Steady Breath',
  text: 'Stand or sit upright, spine easy, eyes closed or half-lidded. Breathe with the pacer and let the count do the work — there is nothing to force here. When the breath is even, the noise of the day begins to separate from whatever lies under it.',
  cadence: [4, 2, 6, 2],
  durationSec: 56,
};

function reshRite(station: ReshStation): Ritual {
  return {
    id: `rite-resh-${station.id}`,
    title: `The Adoration of ${station.godform}`,
    intent: `Adore the sun at ${station.hour.toLowerCase()}, facing the ${station.quarter.toLowerCase()}.`,
    intro: `The ${station.hour.toLowerCase()} station of the four daily adorations. Stand where you are, face the ${station.quarter.toLowerCase()}, and take one minute. The practice is small on purpose: what it trains is not intensity but the keeping of an appointment.`,
    home: HOME,
    steps: [
      {
        type: 'gesture',
        title: 'Face the quarter',
        text: `Stand and turn to the ${station.quarter.toLowerCase()}, where the sun is ${station.aspect}. Bring the feet together, straighten the spine, and give the sign: hands raised to the brow, then thrown open and forward, palms down, as though parting a curtain of light.`,
      },
      {
        type: 'breath',
        title: 'Draw the light',
        text: 'Four breaths, no more. Draw the light in at the brow, hold it at the heart, release it down through the body, and rest. Assume as you breathe the form of the god you are about to greet.',
        cadence: [4, 2, 4, 2],
        durationSec: 24,
      },
      {
        type: 'invocation',
        title: `Adore ${station.godform}`,
        text: station.adoration,
      },
      {
        type: 'gesture',
        title: 'Seal and go',
        text: 'Give the sign of silence — the forefinger to the lips, the god Harpocrates — and return to whatever you were doing. Nothing is carried away from the station but the fact of having kept it.',
      },
    ],
  };
}

const RITE_TRUE_WILL: Ritual = {
  id: 'rite-true-will',
  title: 'The Rite of the True Will',
  intent: 'Strip the borrowed wants away and listen for what is left.',
  intro:
    'A contemplative working, not an evocation. It asks a series of hard questions in a fixed order and gives you time to answer each honestly. Do it once and it is an exercise; do it monthly for a year and the answers begin to converge, which is the point.',
  home: HOME,
  steps: [
    WILL_BREATH,
    {
      type: 'meditation',
      title: 'The inventory',
      text: 'Call to mind the three things you most want at present. Take each in turn and ask where it came from: whose approval does it buy, whose voice praises you for it, what would be lost if nobody ever knew you had it. Do not judge what you find. Only mark which of the three survives the question.',
      durationSec: 90,
    },
    {
      type: 'meditation',
      title: 'The subtraction',
      text: 'Now take everything away. No name, no work, no one watching, nothing owed and nothing owing. In that emptiness, notice what still leans forward — the one movement that does not need an audience to keep moving. That leaning is the thread. Follow it as far as it goes and no further.',
      durationSec: 120,
    },
    {
      type: 'invocation',
      title: 'The declaration',
      text: 'Speak aloud: I am a star, and I move on my own course. What is mine to do, I will do; what is not mine, I set down. I ask for no permission and I take no orders, and I will not pretend that appetite is will. Love is the law — love under will.',
    },
    {
      type: 'gesture',
      title: 'The sealing',
      text: 'Cross the arms upon the breast, then open them wide. Write down, before you do anything else, the single sentence that came nearest to the thread. The record is the working; without it this was only an hour of pleasant feeling.',
    },
  ],
};

const RITE_NUIT: Ritual = {
  id: 'rite-nuit',
  title: 'The Adoration of Nuit',
  intent: 'Stand under the whole of space and be glad of it.',
  intro:
    'Best worked outdoors at night, under sky if you have any, at a window if you do not. This is an adoration rather than an invocation: nothing is called down, and nothing is asked for. The whole of the rite is attention.',
  home: HOME,
  steps: [
    {
      type: 'breath',
      title: 'The opening breath',
      text: 'Stand with the head tilted back and the eyes on the sky. Breathe slowly and let the field of vision widen until you are no longer looking at any one star. Let the body settle; let the sky stay where it is.',
      cadence: [5, 2, 7, 2],
      durationSec: 64,
    },
    {
      type: 'meditation',
      title: 'The infinite field',
      text: 'Every point of light is at a different distance, and between them is the greater part of what exists. Rest in the depth rather than the points. Nuit is not the stars; she is the space that holds them, and every possibility you have not yet lived is somewhere in it.',
      durationSec: 120,
    },
    {
      type: 'invocation',
      title: 'The adoration',
      text: 'Speak quietly: Lady of the night sky, whose body is the whole of space, I am one of your stars and I do not ask to be another. Bend down upon me. Let me burn the course that is mine, gladly, and without fear of the dark I am set in.',
    },
    {
      type: 'gesture',
      title: 'The sealing',
      text: 'Lower the head, bring the palms together at the breast, and hold the silence for as long as it holds. Then go in without ceremony, and do not discuss it with anyone tonight.',
    },
  ],
};

export const THELEMIC_RITES: Ritual[] = [
  ...RESH_STATIONS.map(reshRite),
  RITE_TRUE_WILL,
  RITE_NUIT,
];

/** The rites offered on the Thelema page, in the order they are listed. */
export const THELEMA_RITE_INDEX: { id: string; blurb: string }[] = [
  { id: 'rite-true-will', blurb: 'A contemplative stripping-away, to be repeated until it converges.' },
  { id: 'rite-nuit', blurb: 'An adoration of the night sky. Outdoors if you can manage it.' },
];
