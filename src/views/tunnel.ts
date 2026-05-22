import type { View } from '../types';
import { TUNNELS, getTunnel } from '../data/tunnels';
import { getQlipha } from '../data/qliphoth';
import { sigilSvg } from '../components/sigil';
import { applyShellTheme, blendPalettes } from '../fx/theme';

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function createTunnelView(): View {
  return {
    mount(container, params) {
      const t = getTunnel(params.id);
      const section = document.createElement('section');
      section.className = 'view view-tunnel';

      if (!t) {
        section.innerHTML = `<p class="empty">This tunnel is uncharted. <a href="#/">Return to the Tree.</a></p>`;
        container.appendChild(section);
        return;
      }

      const from = getQlipha(t.pair[0]);
      const to = getQlipha(t.pair[1]);

      // Tint the UI with a blend of the two shells this tunnel bridges.
      if (from && to) {
        const palette = blendPalettes(from.colors, to.colors);
        applyShellTheme(palette);
        section.style.setProperty('--accent', palette[1] ?? palette[0]);
      }

      // Prev/next along the traditional tunnel order (Aleph → Tau).
      const idx = TUNNELS.findIndex((x) => x.id === t.id);
      const prev = TUNNELS[idx - 1];
      const next = TUNNELS[idx + 1];

      section.innerHTML = `
        <a class="back-link" href="#/">&#x2190; The Tree</a>
        <article class="tunnel">
          <div class="tunnel-glyph">
            <span class="tunnel-letter" aria-hidden="true">${escapeHtml(t.letter)}</span>
            ${sigilSvg(`tunnel-${t.id}`, { size: 150, className: 'sigil-tunnel' })}
          </div>
          <header class="tunnel-head">
            <p class="tunnel-kicker">Tunnel of Set · ${escapeHtml(t.letterName)} · ${escapeHtml(t.atu)}</p>
            <h1 class="display-title">${escapeHtml(t.name)}</h1>
            <p class="tunnel-epithet">${escapeHtml(t.epithet)}</p>
          </header>

          <p class="tunnel-bridge">
            Runs between
            ${from ? `<a href="#/qlipha/${from.id}">${escapeHtml(from.name)}</a>` : '—'}
            and
            ${to ? `<a href="#/qlipha/${to.id}">${escapeHtml(to.name)}</a>` : '—'}.
          </p>

          <p class="tunnel-desc">${escapeHtml(t.description)}</p>
        </article>

        <nav class="qlipha-nav">
          ${prev ? `<a href="#/tunnel/${prev.id}" class="prev">&#x2190; ${escapeHtml(prev.name)}</a>` : '<span></span>'}
          ${next ? `<a href="#/tunnel/${next.id}" class="next">${escapeHtml(next.name)} &#x2192;</a>` : '<span></span>'}
        </nav>
      `;
      container.appendChild(section);
    },
    destroy() {
      applyShellTheme(null);
    },
  };
}
