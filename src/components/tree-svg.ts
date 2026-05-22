import { QLIPHOTH, TREE_PATHS } from '../data/qliphoth';
import { getTunnelByPair } from '../data/tunnels';
import type { Qlipha } from '../types';

// Builds the interactive Nightside Tree as an SVG. Coordinates in the data are
// normalised 0..1; we project them into a tall viewBox. Nodes are anchors that
// route to the codex; the 22 connecting paths are the Tunnels of Set, each a
// link to its tunnel page.

const VB_W = 100;
const VB_H = 150;
const NODE_R = 5.4;

function project(q: Qlipha): { x: number; y: number } {
  return { x: q.pos.x * VB_W, y: q.pos.y * VB_H };
}

const ns = 'http://www.w3.org/2000/svg';

function setLine(el: SVGLineElement, a: { x: number; y: number }, b: { x: number; y: number }): void {
  el.setAttribute('x1', a.x.toFixed(2));
  el.setAttribute('y1', a.y.toFixed(2));
  el.setAttribute('x2', b.x.toFixed(2));
  el.setAttribute('y2', b.y.toFixed(2));
}

export function buildTreeSvg(
  onSelectNode: (id: string) => void,
  onSelectTunnel: (id: string) => void,
): SVGSVGElement {
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
  svg.setAttribute('class', 'tree-svg');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', 'The Nightside Tree of the Qliphoth');

  // The coiled-dragon spine: a faint vertical serpentine behind the tree.
  const spine = document.createElementNS(ns, 'path');
  spine.setAttribute('class', 'tree-spine');
  spine.setAttribute(
    'd',
    `M ${VB_W / 2} ${VB_H} C 30 ${VB_H * 0.78}, 70 ${VB_H * 0.62}, 50 ${VB_H * 0.5} ` +
      `S 30 ${VB_H * 0.3}, 50 ${VB_H * 0.16} S 60 6, 50 2`,
  );
  svg.appendChild(spine);

  // Paths — the Tunnels of Set. Each is a link with a wide invisible hit-line
  // so the thin visible stroke is still easy to tap.
  const pathGroup = document.createElementNS(ns, 'g');
  pathGroup.setAttribute('class', 'tree-paths');
  const byId = new Map(QLIPHOTH.map((q) => [q.id, q]));
  for (const [a, b] of TREE_PATHS) {
    const pa = project(byId.get(a)!);
    const pb = project(byId.get(b)!);
    const tunnel = getTunnelByPair(a, b);

    const link = document.createElementNS(ns, 'a');
    link.setAttribute('class', 'tree-tunnel');

    const hit = document.createElementNS(ns, 'line');
    setLine(hit, pa, pb);
    hit.setAttribute('class', 'tree-path-hit');

    const line = document.createElementNS(ns, 'line');
    setLine(line, pa, pb);
    line.setAttribute('class', 'tree-path');

    if (tunnel) {
      link.setAttribute('href', `#/tunnel/${tunnel.id}`);
      link.setAttribute('tabindex', '0');
      link.setAttribute('role', 'link');
      link.setAttribute('aria-label', `Tunnel of ${tunnel.name} — ${tunnel.epithet}`);
      const title = document.createElementNS(ns, 'title');
      title.textContent = `${tunnel.name} · ${tunnel.atu}`;
      link.appendChild(title);
      link.append(hit, line);
      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        onSelectTunnel(tunnel.id);
      });
      link.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          onSelectTunnel(tunnel.id);
        }
      });
    } else {
      link.append(hit, line);
    }
    pathGroup.appendChild(link);
  }
  svg.appendChild(pathGroup);

  // Nodes.
  const nodeGroup = document.createElementNS(ns, 'g');
  nodeGroup.setAttribute('class', 'tree-nodes');
  for (const q of QLIPHOTH) {
    const p = project(q);
    const a = document.createElementNS(ns, 'a');
    a.setAttribute('class', 'tree-node');
    a.setAttribute('href', `#/qlipha/${q.id}`);
    a.setAttribute('tabindex', '0');
    a.setAttribute('role', 'link');
    a.setAttribute('aria-label', `${q.name} — ${q.epithet}`);
    a.style.setProperty('--node-delay', `${(q.order - 1) * 0.08}s`);

    const halo = document.createElementNS(ns, 'circle');
    halo.setAttribute('cx', p.x.toFixed(2));
    halo.setAttribute('cy', p.y.toFixed(2));
    halo.setAttribute('r', String(NODE_R + 3));
    halo.setAttribute('class', 'tree-node-halo');

    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', p.x.toFixed(2));
    circle.setAttribute('cy', p.y.toFixed(2));
    circle.setAttribute('r', String(NODE_R));
    circle.setAttribute('class', 'tree-node-circle');
    circle.style.fill = q.colors[1] ?? '#6b0f1a';

    const num = document.createElementNS(ns, 'text');
    num.setAttribute('x', p.x.toFixed(2));
    num.setAttribute('y', (p.y + 0.1).toFixed(2));
    num.setAttribute('class', 'tree-node-num');
    num.setAttribute('text-anchor', 'middle');
    num.setAttribute('dominant-baseline', 'central');
    num.textContent = String(q.order);

    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', p.x.toFixed(2));
    label.setAttribute('y', (p.y + NODE_R + 4.5).toFixed(2));
    label.setAttribute('class', 'tree-node-label');
    label.setAttribute('text-anchor', 'middle');
    label.textContent = q.name;

    a.append(halo, circle, num, label);
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      onSelectNode(q.id);
    });
    a.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        onSelectNode(q.id);
      }
    });
    nodeGroup.appendChild(a);
  }
  svg.appendChild(nodeGroup);

  return svg;
}
