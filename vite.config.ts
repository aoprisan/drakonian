import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Project page served from https://aoprisan.github.io/drakonian/
const BASE = '/drakonian/';

export default defineConfig({
  base: BASE,
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: BASE,
        name: 'Drakonian — Grimoire of the Nightside',
        short_name: 'Drakonian',
        description:
          'A Draconian ritual companion: the Qliphoth, their rulers, guided rites, and a private magical journal.',
        lang: 'en',
        dir: 'ltr',
        theme_color: '#6b0f1a',
        background_color: '#0a0708',
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
