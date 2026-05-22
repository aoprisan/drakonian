import { get, set } from 'idb-keyval';
import type { JournalEntry, InitiationProgress } from '../types';
import { Observable } from './store';

// ---------------------------------------------------------------------------
// Private, offline persistence for the journal and initiation progress.
// Backed by IndexedDB via idb-keyval. Nothing leaves the device.
// ---------------------------------------------------------------------------

const ENTRIES_KEY = 'drakonian:journal:entries';
const PROGRESS_KEY = 'drakonian:initiation:progress';

const EMPTY_PROGRESS: InitiationProgress = { attained: [], current: null, notes: {} };

export const entries$ = new Observable<JournalEntry[]>([]);
export const progress$ = new Observable<InitiationProgress>(EMPTY_PROGRESS);

let loaded = false;

export async function loadPersisted(): Promise<void> {
  if (loaded) return;
  loaded = true;
  const [storedEntries, storedProgress] = await Promise.all([
    get<JournalEntry[]>(ENTRIES_KEY),
    get<InitiationProgress>(PROGRESS_KEY),
  ]);
  if (storedEntries) entries$.set(storedEntries);
  if (storedProgress) progress$.set({ ...EMPTY_PROGRESS, ...storedProgress });
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function addEntry(
  entry: Omit<JournalEntry, 'id' | 'createdAt'>,
): Promise<JournalEntry> {
  const full: JournalEntry = { ...entry, id: uid(), createdAt: Date.now() };
  const next = [full, ...entries$.get()];
  entries$.set(next);
  await set(ENTRIES_KEY, next);
  return full;
}

export async function deleteEntry(id: string): Promise<void> {
  const next = entries$.get().filter((e) => e.id !== id);
  entries$.set(next);
  await set(ENTRIES_KEY, next);
}

export async function saveProgress(progress: InitiationProgress): Promise<void> {
  progress$.set(progress);
  await set(PROGRESS_KEY, progress);
}

export async function toggleAttained(degreeId: string): Promise<void> {
  const p = progress$.get();
  const attained = p.attained.includes(degreeId)
    ? p.attained.filter((d) => d !== degreeId)
    : [...p.attained, degreeId];
  await saveProgress({ ...p, attained });
}

export async function setCurrentDegree(degreeId: string | null): Promise<void> {
  await saveProgress({ ...progress$.get(), current: degreeId });
}

export async function setDegreeNote(degreeId: string, note: string): Promise<void> {
  const p = progress$.get();
  await saveProgress({ ...p, notes: { ...p.notes, [degreeId]: note } });
}

// --- Backup / restore -----------------------------------------------------

export interface Backup {
  app: 'drakonian';
  version: 1;
  exportedAt: number;
  entries: JournalEntry[];
  progress: InitiationProgress;
}

export function exportBackup(): Backup {
  return {
    app: 'drakonian',
    version: 1,
    exportedAt: Date.now(),
    entries: entries$.get(),
    progress: progress$.get(),
  };
}

export async function importBackup(data: unknown): Promise<void> {
  if (
    !data ||
    typeof data !== 'object' ||
    (data as Backup).app !== 'drakonian' ||
    !Array.isArray((data as Backup).entries)
  ) {
    throw new Error('This file is not a valid Drakonian backup.');
  }
  const backup = data as Backup;
  entries$.set(backup.entries);
  await set(ENTRIES_KEY, backup.entries);
  if (backup.progress) {
    progress$.set({ ...EMPTY_PROGRESS, ...backup.progress });
    await set(PROGRESS_KEY, backup.progress);
  }
}
