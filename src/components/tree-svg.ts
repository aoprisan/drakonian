import { QLIPHOTH, TREE_PATHS } from '../data/qliphoth';
import type { Qlipha } from '../types';

// Builds the interactive Nightside Tree as an SVG. Coordinates in the data are
// normalised 0..1; we project them into a tall viewBox. Nodes are anchors that
// route to the codex; paths are the 22 connections of the Tree.

const VB_W = 100;
const VB_H = 150;
const NODE_R = 5.4;

function project(q: Qlipha): { x: number; y: number } {
  return { x: q.pos.x * VB_W, y: q.pos.y * VB_H };
}

export function buildTreeSvg(onSelect: (id: string) => void): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
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

  // Paths.
  const pathGroup = document.createElementNS(ns, 'g');
  pathGroup.setAttribute('class', 'tree-paths');
  const byId = new Map(QLIPHOTH.map((q) => [q.id, q]));
  for (const [a, b] of TREE_PATHS) {
    const qa = byId.get(a)!;
    const qb = byId.get(b)!;
    const pa = project(qa);
    const pb = project(qb);
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', pa.x.toFixed(2));
    line.setAttribute('y1', pa.y.toFixed(2));
    line.setAttribute('x2', pb.x.toFixed(2));
    line.setAttribute('y2', pb.y.toFixed(2));
    line.setAttribute('class', 'tree-path');
    pathGroup.appendChild(line);
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
      onSelect(q.id);
    });
    a.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        onSelect(q.id);
      }
    });
    nodeGroup.appendChild(a);
  }
  svg.appendChild(nodeGroup);

  return svg;
}
