import type { View } from '../types';
import { buildTreeSvg } from '../components/tree-svg';
import { navigate } from '../router';
import { ASCENT } from '../data/qliphoth';
import { TUNNELS } from '../data/tunnels';
import { moonPhase, moonGlyphSvg, lunarOmen } from '../sys/lunar';

export function createTreeView(): View {
  return {
    mount(container) {
      const section = document.createElement('section');
      section.className = 'view view-tree';

      const phase = moonPhase();
      const omen = lunarOmen(phase);
      const pct = Math.round(phase.illumination * 100);
      const omenLink = omen.qliphaId
        ? ` <a class="lunar-link" href="#/qlipha/${omen.qliphaId}">Enter the gate &#x25B8;</a>`
        : '';

      section.innerHTML = `
        <header class="page-head tree-header">
          <p class="kicker">The Map</p>
          <h1 class="display-title">The Nightside Tree</h1>
          <p class="subtitle">Descend the Qliphoth. Climb the dragon from the gate of Lilith to the divided crown.</p>
        </header>
        <aside class="lunar-banner" style="--moon-illum: ${phase.illumination.toFixed(3)}">
          <span class="lunar-moon">${moonGlyphSvg(phase, { size: 60 })}</span>
          <div class="lunar-text">
            <p class="lunar-phase">${phase.name} &middot; ${pct}% lit</p>
            <p class="lunar-omen">${omen.text}${omenLink}</p>
          </div>
        </aside>
        <div class="tree-stage"></div>
        <p class="tree-hint">Touch a shell to enter its mystery, or a path to walk its tunnel.</p>
      `;
      const stage = section.querySelector<HTMLElement>('.tree-stage')!;
      const svg = buildTreeSvg(
        (id) => navigate(`/qlipha/${id}`),
        (id) => navigate(`/tunnel/${id}`),
      );
      stage.appendChild(svg);

      // A compact list beneath for quick navigation / accessibility.
      const shellsTitle = document.createElement('h2');
      shellsTitle.className = 'section-title';
      shellsTitle.textContent = 'The Ten Shells';
      section.appendChild(shellsTitle);

      const list = document.createElement('ol');
      list.className = 'ascent-list';
      for (const q of ASCENT) {
        const li = document.createElement('li');
        li.innerHTML = `
          <a href="#/qlipha/${q.id}">
            <span class="ascent-order">${q.order}</span>
            <span class="ascent-name">${q.name}</span>
            <span class="ascent-epithet">${q.epithet}</span>
          </a>`;
        list.appendChild(li);
      }
      section.appendChild(list);

      // The Twenty-Two Tunnels — an index for the paths between the shells,
      // which are hard to tap precisely on the map.
      const tunnelsWrap = document.createElement('details');
      tunnelsWrap.className = 'tunnels-index';
      const summary = document.createElement('summary');
      summary.textContent = 'The Twenty-Two Tunnels of Set';
      tunnelsWrap.appendChild(summary);
      const tlist = document.createElement('ol');
      tlist.className = 'tunnel-list';
      for (const t of TUNNELS) {
        const li = document.createElement('li');
        li.innerHTML = `
          <a href="#/tunnel/${t.id}">
            <span class="tunnel-list-letter" aria-hidden="true">${t.letter}</span>
            <span class="tunnel-list-name">${t.name}</span>
            <span class="tunnel-list-epithet">${t.epithet}</span>
          </a>`;
        tlist.appendChild(li);
      }
      tunnelsWrap.appendChild(tlist);
      section.appendChild(tunnelsWrap);

      // The daylight half of the same magick, one tap away.
      const bridge = document.createElement('aside');
      bridge.className = 'leaf tree-bridge';
      bridge.innerHTML = `
        <h2 class="section-title">The Other Half</h2>
        <p>
          The Nightside is one map of the country. The Thelemic current — the Law, the True Will,
          the Book of the Law and the Abyss — is the other, and most of this vocabulary descends
          from it.
        </p>
        <a class="enter-rite" href="#/thelema">Enter Thelema &#x25B8;</a>`;
      section.appendChild(bridge);

      container.appendChild(section);
    },
    destroy() {},
  };
}
