import type { View } from '../types';
import { THELEMA, getThelemaTopic } from '../data/thelema';
import { sigilSvg } from '../components/sigil';

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function createThelemaTopicView(): View {
  return {
    mount(container, params) {
      const topic = getThelemaTopic(params.id);
      const section = document.createElement('section');
      section.className = 'view view-thelema-topic';

      if (!topic) {
        section.innerHTML = `<p class="empty">No such leaf in this section. <a href="#/thelema">Return to Thelema.</a></p>`;
        container.appendChild(section);
        return;
      }

      const idx = THELEMA.findIndex((t) => t.id === topic.id);
      const prev = THELEMA[idx - 1];
      const next = THELEMA[idx + 1];

      const keys = topic.keys?.length
        ? `<dl class="correspondences topic-keys">${topic.keys
            .map(
              (k) =>
                `<div><dt>${escapeHtml(k.term)}</dt><dd>${escapeHtml(k.def)}</dd></div>`,
            )
            .join('')}</dl>`
        : '';

      const quote = topic.quote
        ? `<blockquote class="topic-quote">
             <p>${escapeHtml(topic.quote.text)}</p>
             <cite>${escapeHtml(topic.quote.source)}</cite>
           </blockquote>`
        : '';

      const seeAlso = topic.seeAlso
        ? `<a class="enter-rite" href="${topic.seeAlso.href}">${escapeHtml(topic.seeAlso.label)} &#x25B8;</a>`
        : '';

      section.innerHTML = `
        <a class="back-link" href="#/thelema">&#x2190; Thelema</a>
        <article class="leaf topic">
          <div class="topic-sigil">${sigilSvg(topic.sigil, { size: 140 })}</div>
          <header class="topic-head">
            <p class="kicker">${escapeHtml(topic.kicker)}</p>
            <h1 class="display-title">${escapeHtml(topic.title)}</h1>
            <p class="topic-epithet">${escapeHtml(topic.epithet)}</p>
          </header>

          <div class="prose topic-body">
            ${topic.body.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
          </div>

          ${quote}
          ${keys}
          ${seeAlso}
        </article>

        <nav class="qlipha-nav">
          ${prev ? `<a href="#/thelema/${prev.id}" class="prev">&#x2190; ${escapeHtml(prev.title)}</a>` : '<span></span>'}
          ${next ? `<a href="#/thelema/${next.id}" class="next">${escapeHtml(next.title)} &#x2192;</a>` : '<span></span>'}
        </nav>`;

      container.appendChild(section);
    },
    destroy() {},
  };
}
