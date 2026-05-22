import type { View } from '../types';
import { buildTreeSvg } from '../components/tree-svg';
import { navigate } from '../router';
import { ASCENT } from '../data/qliphoth';

export function createTreeView(): View {
  return {
    mount(container) {
      const section = document.createElement('section');
      section.className = 'view view-tree';
      section.innerHTML = `
        <header class="tree-header">
          <h1 class="display-title">The Nightside Tree</h1>
          <p class="subtitle">Descend the Qliphoth. Climb the dragon from the gate of Lilith to the divided crown.</p>
        </header>
        <div class="tree-stage"></div>
        <p class="tree-hint">Touch a shell to enter its mystery.</p>
      `;
      const stage = section.querySelector<HTMLElement>('.tree-stage')!;
      const svg = buildTreeSvg((id) => navigate(`/qlipha/${id}`));
      stage.appendChild(svg);

      // A compact list beneath for quick navigation / accessibility.
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
      container.appendChild(section);
    },
    destroy() {},
  };
}
