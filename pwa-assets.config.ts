import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the PWA icon set from the source SVG into public/.
// The source already carries the dark background, so maskable padding reads cleanly.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { background: '#0a0708' },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { background: '#0a0708' },
    },
  },
  images: ['public/favicon.svg'],
});
