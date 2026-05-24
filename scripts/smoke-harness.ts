// Smoke harness: mounts each view into a container and exercises the data /
// component builders, asserting no exceptions and that DOM is produced.
// Bundled with esbuild and run under jsdom. Not shipped.

import { createTreeView } from '../src/views/tree';
import { createQliphaView } from '../src/views/qlipha';
import { createTunnelView } from '../src/views/tunnel';
import { createRitualView } from '../src/views/ritual';
import { createJournalView } from '../src/views/journal';
import { createAboutView } from '../src/views/about';
import { createSealView } from '../src/views/seal';
import { createBreathView } from '../src/views/breath';
import { buildNav } from '../src/components/nav';
import { sigilSvg, sigilSvgStandalone, sigilGeometry } from '../src/components/sigil';
import { createSigilTracer } from '../src/components/sigil-trace';
import { buildTreeSvg } from '../src/components/tree-svg';
import { moonPhase, moonGlyphSvg, lunarOmen } from '../src/sys/lunar';
import { QLIPHOTH, TREE_PATHS, ASCENT, getQlipha } from '../src/data/qliphoth';
import { TUNNELS, getTunnel, getTunnelByPair } from '../src/data/tunnels';
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

check('22 tunnels, unique ids, one per tree path', () => {
  if (TUNNELS.length !== 22) throw new Error(`expected 22 tunnels, got ${TUNNELS.length}`);
  const ids = new Set(TUNNELS.map((t) => t.id));
  if (ids.size !== 22) throw new Error('duplicate tunnel ids');
  for (const [a, b] of TREE_PATHS) {
    if (!getTunnelByPair(a, b)) throw new Error(`path ${a}↔${b} has no tunnel`);
  }
  for (const t of TUNNELS) {
    if (!getQlipha(t.pair[0]) || !getQlipha(t.pair[1])) throw new Error(`${t.id}: bad pair`);
    if (!getTunnel(t.id)) throw new Error(`${t.id}: not retrievable by id`);
  }
  return `${TUNNELS.length} tunnels`;
});

// --- Components ------------------------------------------------------------
check('sigilSvg produces an <svg> for each shell', () => {
  for (const q of QLIPHOTH) {
    const s = sigilSvg(q.sigil);
    if (!s.includes('<svg')) throw new Error(`${q.id}: no svg`);
    if (!s.includes('class="sigil-line"')) throw new Error(`${q.id}: no sigil line`);
  }
});

check('sigilGeometry is deterministic and yields a path', () => {
  const a = sigilGeometry('lilith');
  const b = sigilGeometry('lilith');
  if (a.sigilPath !== b.sigilPath) throw new Error('non-deterministic path');
  if (a.linePts.length < 5) throw new Error('too few line points');
  if (sigilGeometry('thaumiel').sigilPath === a.sigilPath) throw new Error('keys not distinct');
  return `${a.linePts.length} points`;
});

check('sigilSvgStandalone inlines styles + optional caption', () => {
  const plain = sigilSvgStandalone('seal::test::');
  if (!plain.includes('xmlns=')) throw new Error('not standalone (no xmlns)');
  if (plain.includes('class="sigil-line"')) throw new Error('should not rely on CSS classes');
  const captioned = sigilSvgStandalone('seal::test::', { caption: 'Vovin & <Dragon>' });
  if (!captioned.includes('<text')) throw new Error('caption missing');
  if (captioned.includes('<Dragon>')) throw new Error('caption not XML-escaped');
});

check('createSigilTracer mounts (tap fallback under jsdom)', () => {
  const t = createSigilTracer('lilith', { size: 180 });
  if (!t.el.querySelector('svg')) throw new Error('no svg');
  if (!t.el.classList.contains('trace-tap')) throw new Error('expected tap fallback in jsdom');
  t.el.querySelector('svg')!.dispatchEvent(new Event('click'));
  if (!t.el.classList.contains('traced')) throw new Error('tap did not complete trace');
  t.destroy();
});

check('moonPhase: known new/full epochs read correctly', () => {
  const SYNODIC = 29.530588853 * 86_400_000;
  const newMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const fullMoon = new Date(newMoon.getTime() + SYNODIC / 2);
  const n = moonPhase(newMoon);
  const f = moonPhase(fullMoon);
  if (n.name !== 'New Moon') throw new Error(`new → ${n.name}`);
  if (n.illumination > 0.02) throw new Error(`new illum ${n.illumination}`);
  if (f.name !== 'Full Moon') throw new Error(`full → ${f.name}`);
  if (f.illumination < 0.98) throw new Error(`full illum ${f.illumination}`);
  if (!moonPhase(new Date(newMoon.getTime() + SYNODIC * 0.25)).waxing) throw new Error('quarter not waxing');
  return `${n.name} / ${f.name}`;
});

check('lunarOmen favours Gamaliel at the dark moon', () => {
  const newMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  if (lunarOmen(moonPhase(newMoon)).qliphaId !== 'gamaliel') throw new Error('new moon should favour gamaliel');
  const full = moonPhase(new Date(newMoon.getTime() + 29.530588853 * 86_400_000 / 2));
  if (lunarOmen(full).qliphaId) throw new Error('full moon should favour no shell');
});

check('moonGlyphSvg renders a disc + lit limb', () => {
  const svg = moonGlyphSvg(moonPhase(new Date()));
  if (!svg.includes('<svg')) throw new Error('no svg');
  if (!svg.includes('class="moon-lit"')) throw new Error('no lit limb');
});

check('buildTreeSvg yields 10 nodes + 22 paths + 22 tunnel links', () => {
  const svg = buildTreeSvg(() => {}, () => {});
  const nodes = svg.querySelectorAll('a.tree-node').length;
  const paths = svg.querySelectorAll('line.tree-path').length;
  const tunnels = svg.querySelectorAll('a.tree-tunnel[href]').length;
  if (nodes !== 10) throw new Error(`nodes=${nodes}`);
  if (paths !== 22) throw new Error(`paths=${paths}`);
  if (tunnels !== 22) throw new Error(`tunnels=${tunnels}`);
  return `nodes=${nodes} paths=${paths} tunnels=${tunnels}`;
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
mountView('tunnel(thantifaxath)', createTunnelView, { id: 'thantifaxath' });
mountView('tunnel(unknown)', createTunnelView, { id: 'nope' });
mountView('ritual(rite-lilith)', createRitualView, { id: 'rite-lilith' });
mountView('ritual(unknown)', createRitualView, { id: 'nope' });
mountView('seal', createSealView);
mountView('breath', createBreathView);
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
