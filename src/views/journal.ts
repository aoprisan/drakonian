import type { View, JournalEntry, JournalEntryType } from '../types';
import {
  entries$,
  progress$,
  addEntry,
  deleteEntry,
  toggleAttained,
  setCurrentDegree,
  setDegreeNote,
  exportBackup,
  importBackup,
} from '../state/journal';
import { DEGREES } from '../data/degrees';
import { getQlipha } from '../data/qliphoth';

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const TYPE_LABEL: Record<JournalEntryType, string> = {
  rite: 'Rite',
  dream: 'Dream',
  note: 'Note',
};

export function createJournalView(): View {
  const unsubs: Array<() => void> = [];

  return {
    mount(container) {
      const section = document.createElement('section');
      section.className = 'view view-journal';
      section.innerHTML = `
        <header>
          <h1 class="display-title">The Black Book</h1>
          <p class="subtitle">Your private record. Stored only on this device.</p>
        </header>

        <div class="journal-grid">
          <div class="journal-col">
            <h2 class="section-title">Initiation</h2>
            <ol class="ladder"></ol>
          </div>

          <div class="journal-col">
            <h2 class="section-title">Entries</h2>
            <form class="entry-form">
              <div class="entry-form-row">
                <select name="type" aria-label="Entry type">
                  <option value="note">Note</option>
                  <option value="dream">Dream</option>
                  <option value="rite">Rite</option>
                </select>
                <input type="text" name="title" placeholder="Title" required />
              </div>
              <textarea name="body" rows="3" placeholder="What was seen, felt, or received…"></textarea>
              <button type="submit" class="primary-btn">Inscribe</button>
            </form>
            <ul class="entries"></ul>
          </div>
        </div>

        <footer class="journal-tools">
          <button type="button" class="ghost-btn" data-act="export">Export backup</button>
          <label class="ghost-btn import-label">
            Import backup
            <input type="file" accept="application/json" hidden data-act="import" />
          </label>
          <span class="import-msg" aria-live="polite"></span>
        </footer>
      `;
      container.appendChild(section);

      const ladder = section.querySelector<HTMLOListElement>('.ladder')!;
      const entriesEl = section.querySelector<HTMLUListElement>('.entries')!;
      const form = section.querySelector<HTMLFormElement>('.entry-form')!;
      const importMsg = section.querySelector<HTMLElement>('.import-msg')!;

      // --- Initiation ladder ---
      function renderLadder() {
        const p = progress$.get();
        ladder.innerHTML = '';
        // Show crown (order 1) at the top → render degrees in descending qlipha order.
        const ordered = [...DEGREES].sort((a, b) => {
          const qa = getQlipha(a.qliphaId)!;
          const qb = getQlipha(b.qliphaId)!;
          return qa.order - qb.order; // crown (1) first
        });
        for (const d of ordered) {
          const q = getQlipha(d.qliphaId)!;
          const attained = p.attained.includes(d.id);
          const current = p.current === d.id;
          const li = document.createElement('li');
          li.className = `rung ${attained ? 'attained' : ''} ${current ? 'current' : ''}`;
          li.innerHTML = `
            <button type="button" class="rung-mark" aria-pressed="${attained}" title="Mark attained">
              <span class="rung-label">${escapeHtml(d.label)}</span>
            </button>
            <div class="rung-body">
              <a class="rung-title" href="#/qlipha/${q.id}">${escapeHtml(d.title)}</a>
              <p class="rung-theme">${escapeHtml(d.theme)}</p>
              <details>
                <summary>Notes & focus</summary>
                <label class="rung-current">
                  <input type="radio" name="current-degree" ${current ? 'checked' : ''} />
                  Current working degree
                </label>
                <textarea class="rung-note" rows="2" placeholder="Personal notes for ${escapeHtml(d.title)}…">${escapeHtml(
                  p.notes[d.id] ?? '',
                )}</textarea>
              </details>
            </div>`;

          li.querySelector<HTMLButtonElement>('.rung-mark')!.addEventListener('click', () => {
            void toggleAttained(d.id);
          });
          li.querySelector<HTMLInputElement>('.rung-current')!.addEventListener('change', () => {
            void setCurrentDegree(current ? null : d.id);
          });
          const note = li.querySelector<HTMLTextAreaElement>('.rung-note')!;
          note.addEventListener('change', () => {
            void setDegreeNote(d.id, note.value);
          });
          ladder.appendChild(li);
        }
      }

      // --- Entries ---
      function renderEntries(list: JournalEntry[]) {
        entriesEl.innerHTML = '';
        if (list.length === 0) {
          entriesEl.innerHTML = `<li class="entries-empty">No entries yet. The book is open and waiting.</li>`;
          return;
        }
        for (const e of list) {
          const q = e.qliphaId ? getQlipha(e.qliphaId) : undefined;
          const li = document.createElement('li');
          li.className = `entry entry-${e.type}`;
          li.innerHTML = `
            <div class="entry-head">
              <span class="entry-type">${TYPE_LABEL[e.type]}</span>
              <time>${formatDate(e.createdAt)}</time>
              <button type="button" class="entry-del" title="Delete entry" aria-label="Delete entry">&#x2715;</button>
            </div>
            <h3 class="entry-title">${escapeHtml(e.title)}</h3>
            ${q ? `<a class="entry-tag" href="#/qlipha/${q.id}">${escapeHtml(q.name)}</a>` : ''}
            ${e.body ? `<p class="entry-body">${escapeHtml(e.body)}</p>` : ''}`;
          li.querySelector<HTMLButtonElement>('.entry-del')!.addEventListener('click', () => {
            if (confirm('Delete this entry? This cannot be undone.')) void deleteEntry(e.id);
          });
          entriesEl.appendChild(li);
        }
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const title = String(data.get('title') || '').trim();
        if (!title) return;
        await addEntry({
          type: (data.get('type') as JournalEntryType) || 'note',
          title,
          body: String(data.get('body') || '').trim(),
        });
        form.reset();
      });

      // --- Backup tools ---
      section.querySelector<HTMLButtonElement>('[data-act="export"]')!.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(exportBackup(), null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drakonian-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });

      section
        .querySelector<HTMLInputElement>('[data-act="import"]')!
        .addEventListener('change', async (ev) => {
          const input = ev.target as HTMLInputElement;
          const file = input.files?.[0];
          if (!file) return;
          try {
            const data = JSON.parse(await file.text());
            await importBackup(data);
            importMsg.textContent = 'Backup restored.';
          } catch (err) {
            importMsg.textContent = err instanceof Error ? err.message : 'Import failed.';
          } finally {
            input.value = '';
          }
        });

      unsubs.push(entries$.subscribe(renderEntries));
      unsubs.push(progress$.subscribe(renderLadder));
    },

    destroy() {
      unsubs.forEach((u) => u());
      unsubs.length = 0;
    },
  };
}
