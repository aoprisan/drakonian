import { ambience } from '../state/store';

// Top navigation bar with the ambience (candle mode) toggle. The drone toggle
// lives in the rite player where audio is actually started.

export function buildNav(): HTMLElement {
  const nav = document.createElement('nav');
  nav.className = 'topnav';
  nav.innerHTML = `
    <a class="brand" href="#/" aria-label="Drakonian — home">
      <span class="brand-mark" aria-hidden="true">&#x2625;</span>
      <span class="brand-text">Drakonian</span>
    </a>
    <div class="nav-links">
      <a href="#/" data-nav="/">Tree</a>
      <a href="#/seal" data-nav="/seal">Seal</a>
      <a href="#/journal" data-nav="/journal">Journal</a>
      <a href="#/about" data-nav="/about">Mysteries</a>
      <button type="button" class="candle-toggle" aria-pressed="false" title="Candle / blackout mode">
        <span aria-hidden="true">&#x1F56F;</span>
      </button>
    </div>`;

  const candleBtn = nav.querySelector<HTMLButtonElement>('.candle-toggle')!;
  candleBtn.addEventListener('click', () => {
    ambience.update((a) => ({ ...a, candleMode: !a.candleMode }));
  });

  ambience.subscribe((a) => {
    candleBtn.setAttribute('aria-pressed', String(a.candleMode));
    document.body.classList.toggle('candle-mode', a.candleMode);
  });

  function markActive() {
    const path = location.hash.replace(/^#/, '') || '/';
    nav.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
      const target = a.dataset.nav!;
      const active = target === '/' ? path === '/' : path.startsWith(target);
      a.classList.toggle('active', active);
    });
  }
  document.addEventListener('route:changed', markActive);
  markActive();

  return nav;
}
