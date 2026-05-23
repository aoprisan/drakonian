import { registerSW } from 'virtual:pwa-register';

// Service-worker registration in prompt mode. When a freshly built revision of
// the grimoire has been fetched and is waiting, the page does NOT silently
// reload — that could tear a rite or journal entry out from under the reader.
// Instead it raises a banner with an Update control so they choose the moment.

export function initUpdatePrompt(): void {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      showBanner(() => void updateSW(true));
    },
  });
}

function showBanner(apply: () => void): void {
  if (document.querySelector('.update-banner')) return;

  const banner = document.createElement('div');
  banner.className = 'update-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML = `
    <p class="update-banner-text">A new leaf of the grimoire has been inscribed.</p>
    <div class="update-banner-actions">
      <button type="button" class="primary-btn update-apply">Update</button>
      <button type="button" class="ghost-btn update-dismiss">Later</button>
    </div>`;

  banner.querySelector<HTMLButtonElement>('.update-apply')!.addEventListener('click', apply);
  banner.querySelector<HTMLButtonElement>('.update-dismiss')!.addEventListener('click', () => {
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 300);
  });

  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('visible'));
}
