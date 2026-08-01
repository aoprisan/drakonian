import {
  APP_VERSION,
  BUILD_COMMIT,
  BUILD_TIME,
  IS_STAMPED_BUILD,
  buildAge,
  buildDate,
  formatBuildTime,
} from '../sys/build';
import { checkForUpdate, forceUpdate, isOfflineCapable } from '../sys/refresh';
import { applyUpdate, updateReady } from '../sys/update-bus';

// The colophon: which leaf of the grimoire the reader is holding, and the two
// controls that matter when it is the wrong one — poll for a new revision, or
// burn the offline copy and fetch the book again.

export interface BuildInfo {
  el: HTMLElement;
  destroy(): void;
}

export function createBuildInfo(): BuildInfo {
  const el = document.createElement('section');
  el.className = 'leaf colophon';

  const date = buildDate();
  const stamped = IS_STAMPED_BUILD;

  el.innerHTML = `
    <h2 class="section-title">Colophon</h2>
    <p class="colophon-blurb">
      This copy of the grimoire was set from the sources below. If a passage seems
      missing, ask for a newer leaf — or force the book to be fetched again.
    </p>
    <dl class="colophon-grid">
      <div>
        <dt>Edition</dt>
        <dd>v${APP_VERSION}</dd>
      </div>
      <div>
        <dt>Revision</dt>
        <dd><code>${BUILD_COMMIT}</code></dd>
      </div>
      <div>
        <dt>Inscribed</dt>
        <dd>
          <time datetime="${BUILD_TIME}">${stamped ? formatBuildTime(date) : 'unbuilt sources'}</time>
          ${stamped ? `<span class="colophon-age">${buildAge(new Date(), date)}</span>` : ''}
        </dd>
      </div>
      <div>
        <dt>Offline</dt>
        <dd class="colophon-offline">${
          isOfflineCapable() ? 'Kept for the dark' : 'Not yet stored'
        }</dd>
      </div>
    </dl>
    <div class="colophon-actions">
      <button type="button" class="ghost-btn" data-act="check">Seek a newer leaf</button>
      <button type="button" class="primary-btn" data-act="apply" hidden>Open the new leaf</button>
      <button type="button" class="ghost-btn colophon-force" data-act="force">Force refresh</button>
    </div>
    <p class="colophon-status" role="status" aria-live="polite"></p>
    <p class="colophon-note">
      A forced refresh discards the stored copy of the application and fetches it anew.
      Your journal, seals and initiation notes live elsewhere on this device and are not touched.
    </p>`;

  const checkBtn = el.querySelector<HTMLButtonElement>('[data-act="check"]')!;
  const applyBtn = el.querySelector<HTMLButtonElement>('[data-act="apply"]')!;
  const forceBtn = el.querySelector<HTMLButtonElement>('[data-act="force"]')!;
  const status = el.querySelector<HTMLElement>('.colophon-status')!;

  function say(text: string, tone: 'idle' | 'good' | 'warn' = 'idle') {
    status.textContent = text;
    status.dataset.tone = tone;
  }

  function busy(on: boolean) {
    checkBtn.disabled = on;
    forceBtn.disabled = on;
  }

  checkBtn.addEventListener('click', async () => {
    busy(true);
    say('Sending for a newer leaf…');
    try {
      const result = await checkForUpdate();
      if (result === 'unsupported') say('This browser keeps no offline copy to renew.', 'warn');
      else if (result === 'none') say('No offline copy is stored yet — nothing to renew.', 'warn');
      else if (result === 'waiting') say('A new leaf is ready — open it.', 'good');
      else say('This is the newest leaf inscribed.', 'good');
    } catch {
      say('The messenger did not return — you may be offline.', 'warn');
    } finally {
      busy(false);
    }
  });

  applyBtn.addEventListener('click', () => {
    if (!applyUpdate()) say('The new leaf could not be opened. Try a forced refresh.', 'warn');
  });

  forceBtn.addEventListener('click', async () => {
    busy(true);
    say('Discarding the stored copy and fetching the book anew…');
    await forceUpdate();
  });

  const unsub = updateReady.subscribe((ready) => {
    applyBtn.hidden = !ready;
    if (ready) say('A new leaf is ready — open it.', 'good');
  });

  return {
    el,
    destroy() {
      unsub();
    },
  };
}
