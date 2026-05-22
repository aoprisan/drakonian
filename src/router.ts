import type { View, ViewFactory } from './types';
import { prefersReducedMotion } from './state/store';

interface Route {
  pattern: RegExp;
  keys: string[];
  factory: ViewFactory;
}

const routes: Route[] = [];
let notFound: ViewFactory | null = null;

let current: View | null = null;
let container: HTMLElement;

/** Register a route. Pattern uses :param segments, e.g. "/qlipha/:id". */
export function route(pattern: string, factory: ViewFactory): void {
  const keys: string[] = [];
  const regex = pattern
    .replace(/[/]/g, '\\/')
    .replace(/:([a-zA-Z]+)/g, (_, key: string) => {
      keys.push(key);
      return '([^/]+)';
    });
  routes.push({ pattern: new RegExp(`^${regex}$`), keys, factory });
}

export function fallback(factory: ViewFactory): void {
  notFound = factory;
}

function parseHash(): { path: string } {
  const raw = location.hash.replace(/^#/, '');
  const path = raw === '' ? '/' : raw;
  return { path };
}

function resolve(path: string): { factory: ViewFactory; params: Record<string, string> } | null {
  for (const r of routes) {
    const m = r.pattern.exec(path);
    if (m) {
      const params: Record<string, string> = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      return { factory: r.factory, params };
    }
  }
  if (notFound) return { factory: notFound, params: {} };
  return null;
}

async function render(): Promise<void> {
  const { path } = parseHash();
  const match = resolve(path);
  if (!match) return;

  const reduce = prefersReducedMotion();

  // Fade the outgoing view out.
  if (current && !reduce) {
    container.classList.add('view-leaving');
    await wait(180);
  }

  current?.destroy();
  container.innerHTML = '';
  container.classList.remove('view-leaving');

  const view = match.factory();
  current = view;
  view.mount(container, match.params);

  // Fade the incoming view in.
  if (!reduce) {
    container.classList.add('view-entering');
    requestAnimationFrame(() => container.classList.remove('view-entering'));
  }

  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  document.dispatchEvent(new CustomEvent('route:changed', { detail: { path } }));
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function startRouter(mountEl: HTMLElement): void {
  container = mountEl;
  window.addEventListener('hashchange', () => void render());
  void render();
}

export function navigate(path: string): void {
  location.hash = path;
}
