import type { View, RitualStep } from '../types';
import { createBreathPacer, type Pacer } from '../components/timer';
import { resumeAudio } from '../audio/context';
import { cue } from '../audio/cues';
import { acquireWakeLock, releaseWakeLock } from '../sys/wakelock';
import { ambience } from '../state/store';
import { addEntry } from '../state/journal';

type Cadence = [number, number, number, number];

interface CadencePreset {
  id: string;
  name: string;
  cadence: Cadence;
  note: string;
}

// Real breathwork patterns, named for the Nightside. Cadence is
// [inhale, hold-in, exhale, hold-out] in seconds; a zero phase is skipped.
const CADENCES: CadencePreset[] = [
  { id: 'square', name: 'Square', cadence: [4, 4, 4, 4], note: 'Box breath — four equal counts. Steadies and centres.' },
  { id: 'calm', name: 'Calm', cadence: [6, 0, 6, 0], note: 'Coherent breath — long, even waves that slow the pulse.' },
  { id: 'serpent', name: 'Serpent', cadence: [4, 7, 8, 0], note: 'The four-seven-eight — a long exhale to loosen the body.' },
  { id: 'triangle', name: 'Triangle', cadence: [4, 4, 4, 0], note: 'Threefold — in, hold, out. A simple ascent.' },
  { id: 'dragon', name: 'Dragon', cadence: [5, 2, 7, 0], note: 'Deep draught — a slow fill, brief hold, long release.' },
];

interface SpanPreset {
  label: string;
  sec: number;
}
const SPANS: SpanPreset[] = [
  { label: '2 min', sec: 120 },
  { label: '5 min', sec: 300 },
  { label: '10 min', sec: 600 },
];

function formatCadence(c: Cadence): string {
  const labels = ['In', 'Hold', 'Out', 'Rest'];
  return c
    .map((n, i) => (n > 0 ? `${labels[i]} ${n}` : null))
    .filter(Boolean)
    .join(' · ');
}

function clock(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function createBreathView(): View {
  let pacer: Pacer | null = null;
  let ticker: number | null = null;
  let startedAt = 0;
  let lastSessionMs = 0;

  let cadence = CADENCES[0];
  let span = SPANS[1];

  function clearPacer() {
    pacer?.destroy();
    pacer = null;
  }
  function clearTicker() {
    if (ticker !== null) {
      clearInterval(ticker);
      ticker = null;
    }
  }

  return {
    mount(container) {
      const section = document.createElement('section');
      section.className = 'view view-breath';
      section.innerHTML = `
        <header>
          <p class="rite-kicker">Breath</p>
          <h1 class="display-title">The Breath Pacer</h1>
          <p class="subtitle">A standing practice with no rite to work — choose a cadence and a span, then follow the orb in and out.</p>
        </header>
        <div class="breath-stage"></div>`;
      const stage = section.querySelector<HTMLElement>('.breath-stage')!;
      container.appendChild(section);

      function renderSetup() {
        clearPacer();
        clearTicker();
        releaseWakeLock();

        const cadenceChips = CADENCES.map(
          (c) =>
            `<button type="button" class="breath-chip ${c.id === cadence.id ? 'on' : ''}" data-cadence="${c.id}" aria-pressed="${c.id === cadence.id}">
               <span class="breath-chip-name">${c.name}</span>
               <span class="breath-chip-pattern">${formatCadence(c.cadence)}</span>
             </button>`,
        ).join('');
        const spanChips = SPANS.map(
          (s) =>
            `<button type="button" class="breath-chip ${s.sec === span.sec ? 'on' : ''}" data-span="${s.sec}" aria-pressed="${s.sec === span.sec}">${s.label}</button>`,
        ).join('');

        stage.innerHTML = `
          <div class="breath-setup">
            <fieldset class="breath-group">
              <legend>Cadence</legend>
              <div class="breath-chips" data-group="cadence">${cadenceChips}</div>
              <p class="breath-note"></p>
            </fieldset>
            <fieldset class="breath-group">
              <legend>Span</legend>
              <div class="breath-chips breath-chips-span" data-group="span">${spanChips}</div>
            </fieldset>
            <label class="drone-toggle">
              <input type="checkbox" data-toggle="cues" ${ambience.get().cues ? 'checked' : ''} />
              <span>Bells &amp; vibration</span>
            </label>
            <button type="button" class="primary-btn begin-breath">Begin</button>
          </div>`;

        const note = stage.querySelector<HTMLElement>('.breath-note')!;
        note.textContent = cadence.note;

        stage.querySelectorAll<HTMLButtonElement>('[data-cadence]').forEach((btn) => {
          btn.addEventListener('click', () => {
            cadence = CADENCES.find((c) => c.id === btn.dataset.cadence) ?? cadence;
            stage.querySelectorAll<HTMLButtonElement>('[data-cadence]').forEach((b) => {
              const on = b === btn;
              b.classList.toggle('on', on);
              b.setAttribute('aria-pressed', String(on));
            });
            note.textContent = cadence.note;
          });
        });

        stage.querySelectorAll<HTMLButtonElement>('[data-span]').forEach((btn) => {
          btn.addEventListener('click', () => {
            span = SPANS.find((s) => String(s.sec) === btn.dataset.span) ?? span;
            stage.querySelectorAll<HTMLButtonElement>('[data-span]').forEach((b) => {
              const on = b === btn;
              b.classList.toggle('on', on);
              b.setAttribute('aria-pressed', String(on));
            });
          });
        });

        const cuesInput = stage.querySelector<HTMLInputElement>('[data-toggle="cues"]')!;
        cuesInput.addEventListener('change', () => {
          ambience.update((a) => ({ ...a, cues: cuesInput.checked }));
        });

        stage.querySelector<HTMLButtonElement>('.begin-breath')!.addEventListener('click', async () => {
          await resumeAudio();
          void acquireWakeLock();
          cue.begin();
          renderActive();
        });
      }

      function renderActive() {
        clearPacer();
        clearTicker();

        const wrap = document.createElement('div');
        wrap.className = 'breath-active';
        wrap.innerHTML = `
          <p class="breath-readout">${formatCadence(cadence.cadence)}</p>
          <div class="breath-pacer-slot"></div>
          <p class="breath-remaining" aria-hidden="true">${clock(span.sec * 1000)}</p>
          <div class="rite-controls">
            <button type="button" class="ghost-btn" data-act="stop">End the breath</button>
          </div>`;
        stage.replaceChildren(wrap);

        // Run the pacer a touch past the chosen span so the orb keeps moving
        // until our own clock decides the session is complete.
        const step: RitualStep = {
          type: 'breath',
          title: '',
          text: '',
          cadence: cadence.cadence,
          durationSec: span.sec + 3,
        };
        pacer = createBreathPacer(
          step,
          () => {},
          (phase) => {
            if (phase === 'inhale') cue.breathIn();
            else if (phase === 'exhale') cue.breathOut();
          },
        );
        wrap.querySelector<HTMLElement>('.breath-pacer-slot')!.appendChild(pacer.el);
        pacer.start();

        const remainingEl = wrap.querySelector<HTMLElement>('.breath-remaining')!;
        startedAt = Date.now();
        const tick = () => {
          const remaining = span.sec * 1000 - (Date.now() - startedAt);
          remainingEl.textContent = clock(remaining);
          if (remaining <= 0) finish();
        };
        ticker = window.setInterval(tick, 250);

        wrap.querySelector<HTMLButtonElement>('[data-act="stop"]')!.addEventListener('click', finish);
      }

      function finish() {
        lastSessionMs = Math.min(span.sec * 1000, Date.now() - startedAt);
        clearPacer();
        clearTicker();
        releaseWakeLock();
        cue.seal();
        renderDone();
      }

      function renderDone() {
        stage.innerHTML = `
          <div class="breath-done">
            <div class="rite-seal" aria-hidden="true">&#x2625;</div>
            <h2 class="display-title">Be still</h2>
            <p>You drew breath for ${clock(lastSessionMs)} at the ${cadence.name} cadence.</p>
            <div class="breath-done-actions">
              <button type="button" class="primary-btn" data-act="again">Breathe again</button>
              <button type="button" class="ghost-btn" data-act="inscribe">Inscribe in journal</button>
              <a class="ghost-btn" href="#/">Return to the Tree</a>
            </div>
            <p class="breath-saved" hidden>Inscribed in your journal. <a href="#/journal">Open the journal &#x25B8;</a></p>
          </div>`;

        stage.querySelector<HTMLButtonElement>('[data-act="again"]')!.addEventListener('click', renderSetup);

        const inscribeBtn = stage.querySelector<HTMLButtonElement>('[data-act="inscribe"]')!;
        inscribeBtn.addEventListener('click', async () => {
          await addEntry({
            type: 'note',
            title: `Breathwork — ${cadence.name}`,
            body: `${clock(lastSessionMs)} of breath at the ${cadence.name} cadence (${formatCadence(cadence.cadence)}).`,
          });
          inscribeBtn.disabled = true;
          stage.querySelector<HTMLElement>('.breath-saved')!.hidden = false;
        });
      }

      renderSetup();
    },

    destroy() {
      clearPacer();
      clearTicker();
      releaseWakeLock();
    },
  };
}
