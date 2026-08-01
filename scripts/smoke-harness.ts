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
import { createThelemaView } from '../src/views/thelema';
import { createThelemaTopicView } from '../src/views/thelema-topic';
import { buildNav } from '../src/components/nav';
import { createBuildInfo } from '../src/components/build-info';
import { unicursalHexagramSvg } from '../src/components/hexagram';
import { sigilSvg, sigilSvgStandalone, sigilGeometry } from '../src/components/sigil';
import { createSigilTracer } from '../src/components/sigil-trace';
import { buildTreeSvg } from '../src/components/tree-svg';
import { moonPhase, moonGlyphSvg, lunarOmen } from '../src/sys/lunar';
import { QLIPHOTH, TREE_PATHS, ASCENT, getQlipha } from '../src/data/qliphoth';
import { TUNNELS, getTunnel, getTunnelByPair } from '../src/data/tunnels';
import { DEGREES } from '../src/data/degrees';
import { RITUALS, getRitual } from '../src/data/rituals';
import {
  THELEMA,
  THELEMA_RITE_INDEX,
  THELEMIC_RITES,
  FEASTS,
  getThelemaTopic,
  nextFeast,
} from '../src/data/thelema';
import {
  RESH_STATIONS,
  aeonYear,
  reshStation,
  roman,
  thelemicDate,
  zodiac,
  sunLongitude,
} from '../src/sys/thelemic-date';
import { buildAge, buildLabel, BUILD_TIME } from '../src/sys/build';

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

check('thelema: unique topics, each with body + sigil', () => {
  if (THELEMA.length < 10) throw new Error(`only ${THELEMA.length} topics`);
  const ids = new Set(THELEMA.map((t) => t.id));
  if (ids.size !== THELEMA.length) throw new Error('duplicate topic ids');
  for (const t of THELEMA) {
    if (!t.body.length) throw new Error(`${t.id}: no body`);
    if (!t.sigil) throw new Error(`${t.id}: no sigil key`);
    if (!getThelemaTopic(t.id)) throw new Error(`${t.id}: not retrievable`);
    if (t.seeAlso && !t.seeAlso.href.startsWith('#/')) throw new Error(`${t.id}: bad seeAlso`);
  }
  return `${THELEMA.length} topics`;
});

check('thelemic rites resolve through getRitual and carry a home', () => {
  const ids = new Set(THELEMIC_RITES.map((r) => r.id));
  if (ids.size !== THELEMIC_RITES.length) throw new Error('duplicate rite ids');
  for (const r of THELEMIC_RITES) {
    if (!getRitual(r.id)) throw new Error(`${r.id}: not resolvable`);
    if (r.steps.length < 3) throw new Error(`${r.id}: too few steps`);
    if (!r.home) throw new Error(`${r.id}: no return link`);
    if (r.qliphaId) throw new Error(`${r.id}: should not claim a shell`);
  }
  for (const s of RESH_STATIONS) {
    if (!getRitual(`rite-resh-${s.id}`)) throw new Error(`no rite for station ${s.id}`);
  }
  for (const entry of THELEMA_RITE_INDEX) {
    if (!getRitual(entry.id)) throw new Error(`index points at missing rite ${entry.id}`);
  }
  // The Nightside rites must still resolve.
  if (!getRitual('rite-lilith')) throw new Error('shell rites no longer resolve');
  return `${THELEMIC_RITES.length} rites`;
});

check('the meditation rite teaches asana, breath and dharana', () => {
  const rite = getRitual('rite-meditation');
  if (!rite) throw new Error('no meditation rite');
  if (!getThelemaTopic('meditation')) throw new Error('no meditation leaf');
  if (!rite.steps.some((s) => s.type === 'breath' && s.cadence))
    throw new Error('no paced breath');
  const held = rite.steps.filter((s) => s.type === 'meditation');
  if (held.length < 2) throw new Error('expected a dharana and a count of the breaks');
  for (const s of held) {
    if (!s.durationSec) throw new Error(`${s.title}: meditation steps need a duration`);
  }
  if (!THELEMA_RITE_INDEX.some((e) => e.id === rite.id)) throw new Error('not listed on the page');
  return `${rite.steps.length} steps`;
});

check('feasts: every entry is a real calendar day, and one is next', () => {
  for (const f of FEASTS) {
    if (f.month < 1 || f.month > 12) throw new Error(`${f.name}: bad month`);
    if (f.day < 1 || f.day > 31) throw new Error(`${f.name}: bad day`);
  }
  const upcoming = nextFeast(new Date(2026, 6, 4));
  if (upcoming.feast.month !== 8) throw new Error(`July 2026 → ${upcoming.feast.name}`);
  const wrapped = nextFeast(new Date(2026, 11, 25));
  if (wrapped.when.getFullYear() !== 2027) throw new Error('late December should wrap');
  return upcoming.feast.name;
});

check('aeon years count in docosades from the 1904 equinox', () => {
  if (roman(0) !== '0') throw new Error('zero should be written 0');
  if (roman(22) !== 'XXII' || roman(4) !== 'IV') throw new Error('bad roman numerals');
  const first = aeonYear(new Date(Date.UTC(1904, 5, 1)));
  if (first.aeonYear !== 0 || first.roman !== '0:0') throw new Error(`1904 → ${first.roman}`);
  const before = aeonYear(new Date(Date.UTC(1905, 0, 5)));
  if (before.aeonYear !== 0) throw new Error('before the equinox is still year 0');
  const after = aeonYear(new Date(Date.UTC(1926, 5, 1)));
  if (after.docosade !== 1 || after.yearInDocosade !== 0 || after.roman !== 'I:0')
    throw new Error(`1926 → ${after.roman}`);
  const now = aeonYear(new Date(Date.UTC(2026, 7, 1)));
  if (now.roman !== 'V:xii') throw new Error(`2026 → ${now.roman}`);
  return now.roman;
});

check('the sun sits in Aries at the March equinox', () => {
  const equinox = zodiac(sunLongitude(new Date(Date.UTC(2026, 2, 20, 12, 0))));
  if (equinox.sign !== 'Aries' && equinox.sign !== 'Pisces')
    throw new Error(`equinox → ${equinox.label}`);
  const midsummer = zodiac(sunLongitude(new Date(Date.UTC(2026, 6, 20, 12, 0))));
  if (midsummer.sign !== 'Cancer' && midsummer.sign !== 'Leo')
    throw new Error(`late July → ${midsummer.label}`);
  const formula = thelemicDate(new Date(Date.UTC(2026, 7, 1, 12, 0)));
  if (!formula.label.includes('Anno')) throw new Error('no anno in the formula');
  if (!formula.dies.startsWith('dies ')) throw new Error(`bad weekday ${formula.dies}`);
  return formula.label;
});

check('resh stations follow the clock', () => {
  const at = (h: number) => reshStation(new Date(2026, 7, 1, h, 0)).id;
  if (at(6) !== 'ra') throw new Error(`06:00 → ${at(6)}`);
  if (at(12) !== 'ahathoor') throw new Error(`12:00 → ${at(12)}`);
  if (at(18) !== 'tum') throw new Error(`18:00 → ${at(18)}`);
  if (at(1) !== 'khephra') throw new Error(`01:00 → ${at(1)}`);
  if (RESH_STATIONS.length !== 4) throw new Error('expected four adorations');
});

// --- Components ------------------------------------------------------------
check('unicursalHexagramSvg draws one closed stroke + rose', () => {
  const svg = unicursalHexagramSvg({ size: 120 });
  if (!svg.includes('<svg')) throw new Error('no svg');
  const path = /<path class="hexagram-line" d="([^"]+)"/.exec(svg);
  if (!path) throw new Error('no hexagram path');
  if (!path[1].trim().endsWith('Z')) throw new Error('path is not closed');
  if ((path[1].match(/L /g) ?? []).length !== 5) throw new Error('expected six points');
  if ((svg.match(/hexagram-petal/g) ?? []).length !== 5) throw new Error('expected five petals');
  if (unicursalHexagramSvg({ ring: false, showRose: false }).includes('hexagram-petal'))
    throw new Error('rose should be suppressible');
});

check('createBuildInfo reports the stamp and offers the controls', () => {
  const info = createBuildInfo();
  const time = info.el.querySelector('time');
  if (!time) throw new Error('no build time');
  if (time.getAttribute('datetime') !== BUILD_TIME) throw new Error('datetime not stamped');
  for (const act of ['check', 'apply', 'force']) {
    if (!info.el.querySelector(`[data-act="${act}"]`)) throw new Error(`missing ${act} control`);
  }
  if (!info.el.querySelector<HTMLButtonElement>('[data-act="apply"]')!.hidden)
    throw new Error('apply should be hidden until a revision waits');
  info.destroy();
  const then = new Date('2026-01-01T00:00:00Z');
  if (buildAge(new Date('2026-01-01T00:00:30Z'), then) !== 'moments ago')
    throw new Error('sub-minute age');
  if (buildAge(new Date('2026-01-01T06:00:00Z'), then) !== '6 hours ago')
    throw new Error(`six hours → ${buildAge(new Date('2026-01-01T06:00:00Z'), then)}`);
  if (buildAge(new Date('2026-01-02T00:00:00Z'), then) !== '1 day ago')
    throw new Error(`a day → ${buildAge(new Date('2026-01-02T00:00:00Z'), then)}`);
  if (buildAge(new Date('2026-03-01T00:00:00Z'), then) !== '2 months ago')
    throw new Error('two months');
  return buildLabel();
});

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
mountView('thelema', createThelemaView);
mountView('thelema(law)', createThelemaTopicView, { id: 'law' });
mountView('thelema(abyss)', createThelemaTopicView, { id: 'abyss' });
mountView('thelema(meditation)', createThelemaTopicView, { id: 'meditation' });
mountView('thelema(unknown)', createThelemaTopicView, { id: 'nope' });
mountView('ritual(rite-resh-ra)', createRitualView, { id: 'rite-resh-ra' });
mountView('ritual(rite-true-will)', createRitualView, { id: 'rite-true-will' });
mountView('ritual(rite-meditation)', createRitualView, { id: 'rite-meditation' });

// --- Report ---------------------------------------------------------------
let failed = 0;
for (const r of results) {
  const tag = r.ok ? 'PASS' : 'FAIL';
  if (!r.ok) failed++;
  console.log(`[${tag}] ${r.name}${r.info ? ` — ${r.ok ? r.info : '\n' + r.info}` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
(globalThis as unknown as { __SMOKE_FAILED: number }).__SMOKE_FAILED = failed;
