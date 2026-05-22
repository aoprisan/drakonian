// ---------------------------------------------------------------------------
// Domain types for the Draconian / Qliphothic content model.
// ---------------------------------------------------------------------------

export type QliphaId =
  | 'lilith'
  | 'gamaliel'
  | 'samael'
  | 'aarab-zaraq'
  | 'thagirion'
  | 'golachab'
  | 'ghaagsheblah'
  | 'satariel'
  | 'ghagiel'
  | 'thaumiel';

export interface Qlipha {
  id: QliphaId;
  /** Display number on the nightside tree (10 = base / Malkuth-Nahemoth, 1 = crown). */
  order: number;
  name: string;
  translation: string;
  /** Ruling intelligence(s) of the shell. */
  rulers: string[];
  /** The dayside (Tree of Life) sphere this shell inverts. */
  daysideSphere: string;
  planet: string;
  element: string;
  colors: string[];
  incense: string[];
  /** Short evocative summary shown on the tree. */
  epithet: string;
  /** Longer codex description (tradition-faithful, original prose). */
  description: string;
  /** Associated Dragon Rouge degree id. */
  degreeId: string;
  /** Associated ritual id. */
  ritualId: string;
  /** Position on the SVG tree, normalised 0..1 (x left→right, y top→bottom). */
  pos: { x: number; y: number };
  /** Path key used by the sigil renderer. */
  sigil: string;
}

export interface Degree {
  id: string;
  /** Dragon Rouge notation, e.g. "1.0". */
  label: string;
  title: string;
  qliphaId: QliphaId;
  theme: string;
}

export type RitualStepType = 'invocation' | 'breath' | 'meditation' | 'gesture';

export interface RitualStep {
  type: RitualStepType;
  title: string;
  text: string;
  /** Optional auto-advance duration in seconds. Breath steps drive the pacer ring. */
  durationSec?: number;
  /** Breath cadence in seconds [inhale, hold, exhale, hold]; used by breath steps. */
  cadence?: [number, number, number, number];
}

export interface Ritual {
  id: string;
  title: string;
  qliphaId: QliphaId;
  intent: string;
  intro: string;
  steps: RitualStep[];
}

// --- Persistence (IndexedDB) ---------------------------------------------

export type JournalEntryType = 'rite' | 'dream' | 'note';

export interface JournalEntry {
  id: string;
  createdAt: number;
  type: JournalEntryType;
  title: string;
  body: string;
  qliphaId?: QliphaId;
  ritualId?: string;
}

export interface InitiationProgress {
  /** Degree ids the practitioner has marked as attained. */
  attained: string[];
  /** The current working degree id, if any. */
  current: string | null;
  /** Free-form notes keyed by degree id. */
  notes: Record<string, string>;
}

// --- View / router contracts ---------------------------------------------

export interface View {
  mount(container: HTMLElement, params: Record<string, string>): void;
  destroy(): void;
}

export type ViewFactory = () => View;
