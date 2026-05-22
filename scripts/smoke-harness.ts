// Smoke harness: mounts each view into a container and exercises the data /
// component builders, asserting no exceptions and that DOM is produced.
// Bundled with esbuild and run under jsdom. Not shipped.

import { createTreeView } from '../src/views/tree';
import { createQliphaView } from '../src/views/qlipha';
import { createRitualView } from '../src/views/ritual';
import { createJournalView } from '../src/views/journal';
import { createAboutView } from '../src/views/about';
import { buildNav } from '../src/components/nav';
import { sigilSvg } from '../src/components/sigil';
import { buildTreeSvg } from '../src/components/tree-svg';
import { QLIPHOTH, TREE_PATHS, ASCENT, getQlipha } from '../src/data/qliphoth';
import { DEGREES } from '../src/data/degrees';
import { RITUALS } from '../src/data/rituals';

type Result = { name: string; ok: boolean; info?: string };
const results: Result[] = [];

function check(name: string, fn: () => string | void) {
  try {
    const info = fn();
    results.push({ name, ok: true, info: info || undefined });
  } catch (e) {
    results.push({ name, ok: false, info: e instanceof Error ? e.stack ?? e.message : String(e) });
  }
}

// --- Data integrity -------------------------------------------------------
check('qliphoth: 10 shells, unique ids/orders', () => {
  if (QLIPHOTH.length !== 10) throw new Error(`expected 10, got ${QLIPHOTH.length}`);
  const ids = new Set(QLIPHOTH.map((q) => q.id));
  const orders = new Set(QLIPHOTH.map((q) => q.order));
  if (ids.size !== 10) throw new Error('duplicate ids');
  if (orders.size !== 10) throw new Error('duplicate orders');
  return `${QLIPHOTH.length} shells`;
});

check('tree paths reference valid shells (22 paths)', () => {
  if (TREE_PATHS.length !== 22) throw new Error(`expected 22 paths, got ${TREE_PATHS.length}`);
  for (const [a, b] of TREE_PATHS) {
    if (!getQlipha(a)) throw new Error(`unknown path node ${a}`);
    if (!getQlipha(b)) throw new Error(`unknown path node ${b}`);
  }
  return `${TREE_PATHS.length} paths`;
});

check('every shell maps to a degree + ritual', () => {
  for (const q of QLIPHOTH) {
    if (!DEGREES.some((d) => d.id === q.degreeId)) throw new Error(`${q.id}: bad degreeId`);
    if (!RITUALS.some((r) => r.id === q.ritualId)) throw new Error(`${q.id}: bad ritualId`);
  }
  return `${DEGREES.length} degrees, ${RITUALS.length} rituals`;
});

check('ASCENT is base→crown (10 down to 1)', () => {
  if (ASCENT[0].order !== 10 || ASCENT[ASCENT.length - 1].order !== 1)
    throw new Error('ascent order wrong');
});

// --- Components ------------------------------------------------------------
check('sigilSvg produces an <svg> for each shell', () => {
  for (const q of QLIPHOTH) {
    const s = sigilSvg(q.sigil);
    if (!s.includes('<svg')) throw new Error(`${q.id}: no svg`);
  }
});

check('buildTreeSvg yields 10 node links + 22 path lines', () => {
  const svg = buildTreeSvg(() => {});
  const nodes = svg.querySelectorAll('a.tree-node').length;
  const paths = svg.querySelectorAll('line.tree-path').length;
  if (nodes !== 10) throw new Error(`nodes=${nodes}`);
  if (paths !== 22) throw new Error(`paths=${paths}`);
  return `nodes=${nodes} paths=${paths}`;
});

check('buildNav renders brand + links', () => {
  const nav = buildNav();
  if (!nav.querySelector('.brand')) throw new Error('no brand');
  if (nav.querySelectorAll('[data-nav]').length < 3) throw new Error('missing nav links');
});

// --- Views (mount/destroy lifecycle) --------------------------------------
function mountView(name: string, factory: () => { mount: Function; destroy: Function }, params: Record<string, string> = {}) {
  check(`view ${name}: mount produces DOM`, () => {
    const c = document.createElement('div');
    const v = factory();
    v.mount(c, params);
    if (c.children.length === 0) throw new Error('no DOM produced');
    v.destroy();
    return `${c.querySelectorAll('*').length} nodes`;
  });
}

mountView('tree', createTreeView);
mountView('qlipha(lilith)', createQliphaView, { id: 'lilith' });
mountView('qlipha(thaumiel)', createQliphaView, { id: 'thaumiel' });
mountView('qlipha(unknown)', createQliphaView, { id: 'nope' });
mountView('ritual(rite-lilith)', createRitualView, { id: 'rite-lilith' });
mountView('ritual(unknown)', createRitualView, { id: 'nope' });
mountView('journal', createJournalView);
mountView('about', createAboutView);

// --- Report ---------------------------------------------------------------
let failed = 0;
for (const r of results) {
  const tag = r.ok ? 'PASS' : 'FAIL';
  if (!r.ok) failed++;
  console.log(`[${tag}] ${r.name}${r.info ? ` — ${r.ok ? r.info : '\n' + r.info}` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
(globalThis as unknown as { __SMOKE_FAILED: number }).__SMOKE_FAILED = failed;
