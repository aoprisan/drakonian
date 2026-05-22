import type { Ritual, RitualStep, QliphaId } from '../types';

// ---------------------------------------------------------------------------
// Guided rites, one per shell. Each rite shares a frame — opening breath,
// the invocation of the gate, a meditation, and a sealing — with content
// unique to its Qlipha. All text is original, tradition-faithful prose.
// ---------------------------------------------------------------------------

const OPENING_BREATH: RitualStep = {
  type: 'breath',
  title: 'The Draconian Breath',
  text: 'Sit or stand in darkness. Let the spine become the dragon. Breathe with the pacer: draw the breath down to the base of the spine, hold the coiled fire, release it slowly upward, and rest in the void. Repeat until the room falls away.',
  cadence: [4, 4, 6, 2],
  durationSec: 64,
};

const CENTERING: RitualStep = {
  type: 'meditation',
  title: 'The Coiled Fire',
  text: 'At the base of the spine, sense a sleeping serpent of black fire. With each breath it stirs. Do not force it — only witness. Let its awareness rise to meet the gate you are about to open.',
  durationSec: 45,
};

interface RiteSeed {
  qliphaId: QliphaId;
  gate: string;
  intent: string;
  intro: string;
  invocation: string;
  meditation: string;
  sealing: string;
}

const SEEDS: RiteSeed[] = [
  {
    qliphaId: 'lilith',
    gate: 'Lilith',
    intent: 'Open the first gate; awaken the serpent in the dark earth.',
    intro:
      'The rite of the first gate. Here the practitioner descends beneath the garden to meet Lilith, queen of the night, and to take the serpent into the hand for the first time.',
    invocation:
      'Lilith, Night Spectre, queen who would not lie beneath — I come to the black earth and call your name into the dark. Open the first gate. Let the serpent stir in the soil of my spine. I refuse the sleep that was offered me; I choose the waking dark.',
    meditation:
      'See a black soil opening beneath you. From it rises a woman crowned with the dark moon, owl-winged, serpent-girded. She extends a coiled serpent toward your hands. Receive it. Feel its weight, cold then warm, as it twines up your arm.',
    sealing:
      'The gate of Lilith is open within me. I carry the serpent. I descend by my own will and I will rise the same way.',
  },
  {
    qliphaId: 'gamaliel',
    gate: 'Gamaliel',
    intent: 'Ride the lunar tide; enter the dream-serpent of Gamaliel.',
    intro:
      'The rite of the lunar serpent. Best performed at night or before sleep, this rite turns the dream-tide into a vessel for conscious descent.',
    invocation:
      'Gamaliel, lunar shell, tide of the unconscious deep — I open the dream beneath the dream. Let the moon turn black and the waters part. I ride the serpent of the night and I do not drown.',
    meditation:
      'A black tide rises around you, lit by a dark moon. Beneath the surface, a vast serpent moves. Mount its back. Let it carry you through the images that rise — desire, memory, the dead and the dreaming — observing all, claimed by none.',
    sealing:
      'I have ridden the lunar serpent and returned. The dream is mine to enter and to leave. I seal the tide behind me.',
  },
  {
    qliphaId: 'samael',
    gate: 'Samael',
    intent: 'Take the venom of mind knowingly; sharpen rather than blind.',
    intro:
      'The rite of the venom of mind. A working of discernment, in which the deceiving intellect is met and its poison turned to medicine.',
    invocation:
      'Samael, poison of the blind god, false light of the desert — I take your venom knowingly. Sharpen me; do not blind me. Let the lie reveal the truth it hides. I drink and I do not deceive myself.',
    meditation:
      'A figure of false brilliance approaches, offering a cup of luminous poison. You see the deception in its eyes and drink anyway, with full knowing. The venom burns, then clears the sight. What was glare becomes a cold and useful light.',
    sealing:
      'The poison is in me and it is medicine. I see by a light that does not flatter. I seal the gate of Samael.',
  },
  {
    qliphaId: 'aarab-zaraq',
    gate: "A'arab Zaraq",
    intent: 'Gather the scattered desires; forge them into one will.',
    intro:
      "The rite of the black flame of desire. The ravens of dispersion have scattered the heart; this rite calls the fragments home and forges them into a single fire.",
    invocation:
      "A'arab Zaraq, ravens of dispersion, black flame of Venus — return to me what you have scattered. Every desire flung to the winds, I call it home. Let longing become one fire, and that fire become my will.",
    meditation:
      'A flock of black ravens wheels around you, each carrying a fragment of your desire. One by one they return, dropping their burdens into a single black flame before you. The flame grows tall and steady. Step into it; let it become your spine.',
    sealing:
      'My desires are one fire and that fire is mine. The ravens are still. I seal the gate.',
  },
  {
    qliphaId: 'thagirion',
    gate: 'Thagirion',
    intent: 'Confront the self at the Black Sun; burn the false self away.',
    intro:
      'The rite of the Black Sun — the crisis of the centre. Here the practitioner faces the disputing self and emerges with a dark and sovereign radiance.',
    invocation:
      'Thagirion, Black Sun at the heart of the night — I come to the centre to face myself. Show me the false self that wars within. Let it burn in your dark light, that the true self may stand sovereign in the ashes.',
    meditation:
      'A black sun rises before you, radiating darkness as light. In its disc you see your own face — but distorted, the mask you have mistaken for yourself. Hold its gaze. Let the dark rays burn the mask away until only the witnessing self remains, crowned in dark fire.',
    sealing:
      'The false self is ash. I stand in the dark radiance of the Black Sun, sovereign and whole. I seal the centre.',
  },
  {
    qliphaId: 'golachab',
    gate: 'Golachab',
    intent: 'Master the war-fire; become flame directed and exact.',
    intro:
      'The rite of the war-fire. A working of severity in which destructive force is met, endured, and made into a precise instrument of will.',
    invocation:
      'Golachab, burning bodies, flame of the red star — I enter the crucible. Burn from me all that is weak and false. I do not flee the fire; I become it — directed, exact, a blade of flame in my own hand.',
    meditation:
      'You stand in a furnace of red and black flame. It consumes everything weak in you, painlessly, completely. As the weakness burns away, the fire gathers into your right hand and condenses into a single blade of flame, yours to wield with perfect control.',
    sealing:
      'The fire is mine to command. I am the blade and the hand that holds it. I seal the gate of Golachab.',
  },
  {
    qliphaId: 'ghaagsheblah',
    gate: "Gha'agsheblah",
    intent: 'Find the right measure of power; expand without devouring.',
    intro:
      "The rite of the measured abyss. A working of sovereignty in which boundless hunger is met and tempered into rightful, measured power.",
    invocation:
      "Gha'agsheblah, smiters of the deep, devouring expansion — I take your power but not your hunger. Teach me the measure of growth. Let me expand as a king expands his rule, not as a mouth devours the world.",
    meditation:
      'A great dark sea of abundance spreads before you, offering everything at once. The hunger rises to devour it all. Instead, you draw a circle around yourself — a measured kingdom — and let only what is rightful flow across its boundary. The sea calms; you are crowned within your measure.',
    sealing:
      'I hold power in measure. The hunger is mine to govern. I seal the abyss behind me.',
  },
  {
    qliphaId: 'satariel',
    gate: 'Satariel',
    intent: 'Cross the veil; dissolve the self and receive the hidden gnosis.',
    intro:
      'The rite of crossing the veil — the most demanding of the lower gates. Here the structures of the self are dissolved at the threshold of the abyss.',
    invocation:
      'Satariel, concealers of God, veil before the abyss — I come to be unmade. Dissolve the structures I have mistaken for myself. Draw back the veil and let me receive what waits in the silence behind it.',
    meditation:
      'A vast black veil hangs before you. As you approach, the edges of your self begin to dissolve into the dark. Do not resist. Let name, form, and memory thin to nothing. In the silence beyond the veil, a hidden knowing arrives without words. Carry it back as you reform.',
    sealing:
      'I have crossed the veil and returned, remade. The hidden gnosis is mine. I seal the silence.',
  },
  {
    qliphaId: 'ghagiel',
    gate: 'Ghagiel',
    intent: 'Find the still axis within the wheel of obstruction.',
    intro:
      'The rite of the still axis. A working against the swarming hindrance of Ghagiel, passed not by force but by becoming the unmoving centre.',
    invocation:
      'Ghagiel, hinderers, turning wheel of obstruction — your swarm cannot move what does not move. I become the still axis at your centre. Turn around me as you will; I do not turn. Let the way to the crown open through my stillness.',
    meditation:
      'A great wheel of black chaos turns violently around you, a swarm of obstruction trying to throw you from the path. Find the centre of the wheel — the single point that does not move — and stand upon it. The faster the wheel turns, the stiller you become.',
    sealing:
      'I am the still axis. The wheel turns and I do not. The way to the crown is open. I seal the gate of Ghagiel.',
  },
  {
    qliphaId: 'thaumiel',
    gate: 'Thaumiel',
    intent: 'Claim the divided crown; complete the Draconian ascent.',
    intro:
      'The rite of the divided crown — the summit of the Nightside Tree. Performed only after the lower gates are known, this rite claims the twin-headed crown of the dragon.',
    invocation:
      'Thaumiel, twins of God, divided crown of the dragon — I have climbed the Tree of Death sphere by sphere, and I come to claim the summit. Let the one become two in me and the two become whole. I take the crown not granted but seized, a god in revolt over my own ascent.',
    meditation:
      'Two black thrones stand upon the summit, and a single crown of dark fire hovers between them. You take both thrones at once — the one made two — and the crown settles upon you. Below, the whole Nightside Tree you have climbed glows in the dark, every gate open, every shell yours.',
    sealing:
      'The divided crown is mine. The ascent is complete and it begins again. I am the dragon, whole and divided. I seal the summit and descend by my own will.',
  },
];

function buildRitual(seed: RiteSeed): Ritual {
  const steps: RitualStep[] = [
    OPENING_BREATH,
    CENTERING,
    {
      type: 'invocation',
      title: `Invocation of ${seed.gate}`,
      text: seed.invocation,
    },
    {
      type: 'meditation',
      title: 'The Vision',
      text: seed.meditation,
      durationSec: 90,
    },
    {
      type: 'gesture',
      title: 'The Sealing',
      text: `Cross the arms over the chest, then open them outward to the dark. Speak the sealing words: "${seed.sealing}"`,
    },
  ];
  return {
    id: `rite-${seed.qliphaId}`,
    title: `Rite of ${seed.gate}`,
    qliphaId: seed.qliphaId,
    intent: seed.intent,
    intro: seed.intro,
    steps,
  };
}

export const RITUALS: Ritual[] = SEEDS.map(buildRitual);

const BY_ID = new Map<string, Ritual>(RITUALS.map((r) => [r.id, r]));

export function getRitual(id: string): Ritual | undefined {
  return BY_ID.get(id);
}
