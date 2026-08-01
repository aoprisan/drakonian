// Compile-time constants stamped in by Vite's `define` (see vite.config.ts).
// They are absent when the sources are bundled outside Vite (e.g. the smoke
// harness), so every read goes through src/sys/build.ts, which guards on
// `typeof`.

declare const __BUILD_TIME__: string;
declare const __BUILD_COMMIT__: string;
declare const __APP_VERSION__: string;
