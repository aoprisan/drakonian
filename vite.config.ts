import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Project page served from https://aoprisan.github.io/drakonian/
const BASE = '/drakonian/';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

/** Short commit of the revision being built; "local" outside a git checkout. */
function gitRevision(): string {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'local';
  }
}

// Stamped into the bundle so the colophon can say exactly which leaf of the
// grimoire the reader is holding — and so a stale service worker is obvious.
const BUILD_TIME = new Date().toISOString();
const BUILD_COMMIT = gitRevision();

export default defineConfig({
  base: BASE,
  define: {
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
    __BUILD_COMMIT__: JSON.stringify(BUILD_COMMIT),
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: BASE,
        name: 'Drakonian — Grimoire of the Nightside',
        short_name: 'Drakonian',
        description:
          'A Draconian ritual companion: the Qliphoth, their rulers, guided rites, and a private magical journal.',
        lang: 'en',
        dir: 'ltr',
        theme_color: '#8c1c12',
        background_color: '#15100a',
        display: 'standalone',
        orientation: 'portrait',
        scope: BASE,
        start_url: BASE,
        categories: ['lifestyle', 'education', 'books'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: `${BASE}index.html`,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
