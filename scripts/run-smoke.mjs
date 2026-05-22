import { JSDOM } from 'jsdom';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// 1. Bundle the TS harness with esbuild (CJS for easy require).
const out = '/tmp/drakonian-smoke.cjs';
execFileSync(
  path.join(root, 'node_modules/.bin/esbuild'),
  [
    path.join(root, 'scripts/smoke-harness.ts'),
    '--bundle',
    '--platform=node',
    '--format=cjs',
    `--outfile=${out}`,
    '--log-level=warning',
  ],
  { stdio: 'inherit' },
);

// 2. Set up a browser-like environment via jsdom.
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/drakonian/#/',
  pretendToBeVisual: true,
});
const { window } = dom;

window.matchMedia = () => ({
  matches: false,
  media: '',
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {
    return false;
  },
});
window.confirm = () => true;
window.scrollTo = () => {};

for (const key of [
  'window',
  'document',
  'location',
  'localStorage',
  'HTMLElement',
  'SVGElement',
  'CustomEvent',
  'Event',
  'Node',
  'getComputedStyle',
  'matchMedia',
  'confirm',
]) {
  if (window[key] === undefined) continue;
  try {
    globalThis[key] = window[key];
  } catch {
    Object.defineProperty(globalThis, key, { value: window[key], configurable: true });
  }
}
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// 3. Run the bundle.
const require = createRequire(import.meta.url);
require(out);

const failed = globalThis.__SMOKE_FAILED ?? 0;
process.exit(failed > 0 ? 1 : 0);
