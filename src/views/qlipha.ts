import type { View } from '../types';
import { getQlipha, ASCENT } from '../data/qliphoth';
import { getDegree } from '../data/degrees';
import { getRitual } from '../data/rituals';
import { sigilSvg } from '../components/sigil';
import { applyShellTheme } from '../fx/theme';

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function createQliphaView(): View {
  return {
    mount(container, params) {
      const q = getQlipha(params.id);
      const section = document.createElement('section');
      section.className = 'view view-qlipha';

      if (!q) {
        section.innerHTML = `<p class="empty">This shell is not found upon the Tree. <a href="#/">Return to the Tree.</a></p>`;
        container.appendChild(section);
        return;
      }

      const degree = getDegree(q.degreeId);
      const ritual = getRitual(q.ritualId);

      // Prev/next along the ascent order.
      const idx = ASCENT.findIndex((x) => x.id === q.id);
      const prev = ASCENT[idx - 1];
      const next = ASCENT[idx + 1];

      section.style.setProperty('--accent', q.colors[1] ?? '#6b0f1a');
      applyShellTheme(q.colors);
      section.innerHTML = `
        <a class="back-link" href="#/">&#x2190; The Tree</a>
        <article class="qlipha">
          <div class="qlipha-sigil">${sigilSvg(q.sigil, { size: 160 })}</div>
          <header class="qlipha-head">
            <p class="qlipha-order">Shell ${q.order} · ${escapeHtml(q.daysideSphere)} inverted</p>
            <h1 class="display-title">${escapeHtml(q.name)}</h1>
            <p class="qlipha-translation">${escapeHtml(q.translation)} — ${escapeHtml(q.epithet)}</p>
          </header>

          <dl class="correspondences">
            <div><dt>Rulers</dt><dd>${q.rulers.map(escapeHtml).join(', ')}</dd></div>
            <div><dt>Planet</dt><dd>${escapeHtml(q.planet)}</dd></div>
            <div><dt>Element</dt><dd>${escapeHtml(q.element)}</dd></div>
            <div><dt>Incense</dt><dd>${q.incense.map(escapeHtml).join(', ')}</dd></div>
            <div><dt>Degree</dt><dd>${degree ? `${escapeHtml(degree.label)} · ${escapeHtml(degree.title)}` : '—'}</dd></div>
            <div><dt>Colours</dt><dd><span class="swatches">${q.colors
              .map((c) => `<i style="background:${c}"></i>`)
              .join('')}</span></dd></div>
          </dl>

          <p class="qlipha-desc">${escapeHtml(q.description)}</p>

          ${
            ritual
              ? `<a class="enter-rite" href="#/ritual/${ritual.id}">Enter the ${escapeHtml(ritual.title)} &#x25B8;</a>`
              : ''
          }
        </article>

        <nav class="qlipha-nav">
          ${prev ? `<a href="#/qlipha/${prev.id}" class="prev">&#x2190; ${escapeHtml(prev.name)}</a>` : '<span></span>'}
          ${next ? `<a href="#/qlipha/${next.id}" class="next">${escapeHtml(next.name)} &#x2192;</a>` : '<span></span>'}
        </nav>
      `;
      container.appendChild(section);
    },
    destroy() {
      applyShellTheme(null);
    },
  };
}
