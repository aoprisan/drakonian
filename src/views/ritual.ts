import type { View, Ritual, RitualStep } from '../types';
import { getRitual } from '../data/rituals';
import { getQlipha } from '../data/qliphoth';
import { createBreathPacer, createCountdown, type Pacer } from '../components/timer';
import { startDrone, stopDrone, isRunning } from '../audio/drone';
import { resumeAudio } from '../audio/context';
import { cue } from '../audio/cues';
import { acquireWakeLock, releaseWakeLock } from '../sys/wakelock';
import { ambience } from '../state/store';
import { addEntry } from '../state/journal';

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function createRitualView(): View {
  let pacer: Pacer | null = null;
  let unsubAmbience: (() => void) | null = null;
  let droneStartedHere = false;

  function teardownAudio() {
    if (droneStartedHere) {
      stopDrone();
      droneStartedHere = false;
    }
  }

  return {
    mount(container, params) {
      const ritual = getRitual(params.id) as Ritual | undefined;
      const section = document.createElement('section');
      section.className = 'view view-ritual';

      if (!ritual) {
        section.innerHTML = `<p class="empty">This rite is not inscribed. <a href="#/">Return to the Tree.</a></p>`;
        container.appendChild(section);
        return;
      }

      const qlipha = getQlipha(ritual.qliphaId);
      let index = -1; // -1 = intro screen

      section.innerHTML = `
        <a class="back-link" href="#/qlipha/${ritual.qliphaId}">&#x2190; ${escapeHtml(qlipha?.name ?? 'Codex')}</a>
        <div class="rite-stage"></div>`;
      const stage = section.querySelector<HTMLElement>('.rite-stage')!;
      container.appendChild(section);

      function clearPacer() {
        pacer?.destroy();
        pacer = null;
      }

      function renderIntro() {
        clearPacer();
        stage.innerHTML = `
          <header class="rite-intro">
            <p class="rite-kicker">Guided Rite</p>
            <h1 class="display-title">${escapeHtml(ritual!.title)}</h1>
            <p class="rite-intent">${escapeHtml(ritual!.intent)}</p>
            <p class="rite-blurb">${escapeHtml(ritual!.intro)}</p>
            <div class="rite-controls-intro">
              <label class="drone-toggle">
                <input type="checkbox" data-toggle="drone" ${ambience.get().droneEnabled ? 'checked' : ''} />
                <span>Ambient drone</span>
              </label>
              <label class="drone-toggle">
                <input type="checkbox" data-toggle="cues" ${ambience.get().cues ? 'checked' : ''} />
                <span>Bells &amp; vibration</span>
              </label>
              <button type="button" class="begin-rite primary-btn">Begin the Rite</button>
            </div>
            <p class="rite-warn">Find a dark, quiet place. The rite advances at your pace.</p>
          </header>`;

        const droneInput = stage.querySelector<HTMLInputElement>('[data-toggle="drone"]')!;
        droneInput.addEventListener('change', () => {
          ambience.update((a) => ({ ...a, droneEnabled: droneInput.checked }));
        });
        const cuesInput = stage.querySelector<HTMLInputElement>('[data-toggle="cues"]')!;
        cuesInput.addEventListener('change', () => {
          ambience.update((a) => ({ ...a, cues: cuesInput.checked }));
        });

        stage.querySelector<HTMLButtonElement>('.begin-rite')!.addEventListener('click', async () => {
          // User gesture: unlock audio (for cues) and start the drone if wanted.
          await resumeAudio();
          if (ambience.get().droneEnabled && !isRunning()) {
            try {
              await startDrone();
              droneStartedHere = true;
            } catch {
              /* audio not available; continue silently */
            }
          }
          // Keep the screen awake for the duration of the working.
          void acquireWakeLock();
          cue.begin();
          index = 0;
          renderStep();
        });
      }

      function renderStep() {
        clearPacer();
        const step = ritual!.steps[index];
        const n = index + 1;
        const total = ritual!.steps.length;

        const wrap = document.createElement('div');
        wrap.className = `rite-step rite-step-${step.type}`;
        wrap.innerHTML = `
          <div class="rite-progress" aria-label="Step ${n} of ${total}">
            ${ritual!.steps.map((_, i) => `<span class="${i <= index ? 'on' : ''}"></span>`).join('')}
          </div>
          <p class="rite-step-type">${stepLabel(step)}</p>
          <h2 class="rite-step-title">${escapeHtml(step.title)}</h2>
          <p class="rite-step-text">${escapeHtml(step.text)}</p>
          <div class="rite-pacer-slot"></div>
          <div class="rite-controls">
            <button type="button" class="ghost-btn" data-act="prev" ${index === 0 ? 'disabled' : ''}>Back</button>
            <button type="button" class="primary-btn" data-act="next">${
              index === total - 1 ? 'Complete the Rite' : 'Continue'
            }</button>
          </div>`;
        stage.replaceChildren(wrap);

        // Attach pacer for timed step types.
        const slot = wrap.querySelector<HTMLElement>('.rite-pacer-slot')!;
        if (step.type === 'breath') {
          pacer = createBreathPacer(step, () => {}, (phase) => {
            if (phase === 'inhale') cue.breathIn();
            else if (phase === 'exhale') cue.breathOut();
          });
          slot.appendChild(pacer.el);
          pacer.start();
        } else if (step.durationSec) {
          pacer = createCountdown(step.durationSec, () => {});
          slot.appendChild(pacer.el);
          pacer.start();
        }

        wrap.querySelector<HTMLButtonElement>('[data-act="prev"]')!.addEventListener('click', () => {
          if (index > 0) {
            index--;
            cue.step();
            renderStep();
          }
        });
        wrap.querySelector<HTMLButtonElement>('[data-act="next"]')!.addEventListener('click', () => {
          if (index < total - 1) {
            index++;
            cue.step();
            renderStep();
          } else {
            renderComplete();
          }
        });
      }

      function renderComplete() {
        clearPacer();
        cue.seal();
        releaseWakeLock();
        teardownAudio();
        stage.innerHTML = `
          <div class="rite-complete">
            <div class="rite-seal" aria-hidden="true">&#x2625;</div>
            <h2 class="display-title">The Rite is Sealed</h2>
            <p>The gate of ${escapeHtml(qlipha?.name ?? 'the shell')} has been worked. Record what was seen, felt, or received.</p>
            <form class="rite-record">
              <input type="text" name="title" placeholder="Title for this working" value="${escapeHtml(ritual!.title)}" />
              <textarea name="body" rows="5" placeholder="Visions, sensations, omens, results…"></textarea>
              <div class="rite-complete-actions">
                <button type="submit" class="primary-btn">Record in Journal</button>
                <a class="ghost-btn" href="#/qlipha/${ritual!.qliphaId}">Return to the Shell</a>
              </div>
            </form>
            <p class="rite-saved" hidden>Inscribed in your journal. <a href="#/journal">Open the journal &#x25B8;</a></p>
          </div>`;

        const form = stage.querySelector<HTMLFormElement>('.rite-record')!;
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const data = new FormData(form);
          await addEntry({
            type: 'rite',
            title: String(data.get('title') || ritual!.title),
            body: String(data.get('body') || ''),
            qliphaId: ritual!.qliphaId,
            ritualId: ritual!.id,
          });
          form.hidden = true;
          stage.querySelector<HTMLElement>('.rite-saved')!.hidden = false;
        });
      }

      // React to drone toggle while inside the rite.
      unsubAmbience = ambience.subscribe((a) => {
        if (!a.droneEnabled && isRunning()) {
          stopDrone();
          droneStartedHere = false;
        }
      });

      renderIntro();
    },

    destroy() {
      pacer?.destroy();
      pacer = null;
      unsubAmbience?.();
      unsubAmbience = null;
      releaseWakeLock();
      teardownAudio();
    },
  };
}

function stepLabel(step: RitualStep): string {
  switch (step.type) {
    case 'invocation':
      return 'Invocation · speak aloud';
    case 'breath':
      return 'Breath · follow the pacer';
    case 'meditation':
      return 'Vision · close the eyes';
    case 'gesture':
      return 'Gesture · seal the working';
  }
}
