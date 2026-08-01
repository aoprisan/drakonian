import { ambience } from '../state/store';
import { APP_VERSION, BUILD_COMMIT } from '../sys/build';

// The header band: the brand, the index of sections, and the two controls that
// belong to the whole book (candle mode, and — on a narrow screen — the index
// itself, which folds into a drawer so the section list can grow without
// crowding the bar).

const LINKS: { href: string; label: string }[] = [
  { href: '/', label: 'Tree' },
  { href: '/thelema', label: 'Thelema' },
  { href: '/breath', label: 'Breath' },
  { href: '/seal', label: 'Seal' },
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'Mysteries' },
];

export function buildNav(): HTMLElement {
  const nav = document.createElement('nav');
  nav.className = 'topnav';
  nav.innerHTML = `
    <a class="brand" href="#/" aria-label="Drakonian — home">
      <span class="brand-mark" aria-hidden="true">&#x2625;</span>
      <span class="brand-text">Drakonian</span>
    </a>
    <div class="nav-links" id="nav-index">
      ${LINKS.map((l) => `<a href="#${l.href}" data-nav="${l.href}">${l.label}</a>`).join('')}
      <a class="nav-stamp" href="#/about" title="Colophon — edition and revision">
        v${APP_VERSION} &middot; ${BUILD_COMMIT}
      </a>
    </div>
    <div class="nav-tools">
      <button type="button" class="icon-btn candle-toggle" aria-pressed="false" aria-label="Candle / blackout mode" title="Candle / blackout mode">
        <span aria-hidden="true">&#x1F56F;</span>
      </button>
      <button type="button" class="icon-btn nav-menu" aria-expanded="false" aria-controls="nav-index" aria-label="Open the index">
        <span class="nav-menu-bars" aria-hidden="true"></span>
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

  // --- The drawer ---------------------------------------------------------
  const menuBtn = nav.querySelector<HTMLButtonElement>('.nav-menu')!;

  function setMenu(open: boolean) {
    nav.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close the index' : 'Open the index');
  }

  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
  nav.querySelectorAll<HTMLAnchorElement>('.nav-links a').forEach((a) =>
    a.addEventListener('click', () => setMenu(false)),
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });
  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('menu-open')) return;
    if (!nav.contains(e.target as Node)) setMenu(false);
  });

  // --- Active section ------------------------------------------------------
  function markActive() {
    const path = location.hash.replace(/^#/, '') || '/';
    nav.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
      const target = a.dataset.nav!;
      const active = target === '/' ? path === '/' : path.startsWith(target);
      a.classList.toggle('active', active);
    });
    setMenu(false);
  }
  document.addEventListener('route:changed', markActive);
  markActive();

  return nav;
}
