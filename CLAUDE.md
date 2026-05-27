# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Drakonian is an offline-first PWA "digital grimoire" — a Draconian / Qliphothic ritual companion. It is a vanilla TypeScript single-page app built with Vite. **No UI framework** (no React/Vue), no backend: all content is hardcoded in `src/data/`, and all user data lives in the browser (IndexedDB + localStorage). It deploys to GitHub Pages under the base path `/drakonian/`.

## Commands

```bash
npm run dev        # Vite dev server (http://localhost:5173/drakonian/)
npm run build      # tsc --noEmit && vite build  → dist/
npm run preview    # serve the built dist/ locally
npm test           # smoke test (see below)
npm run generate-icons  # regenerate PWA icons from public/favicon.svg
```

- **Node 20** (only pinned in CI; no `.nvmrc`).
- **Typecheck is the lint.** There is no ESLint/Prettier. `tsconfig.json` is strict with `noUnusedLocals`/`noUnusedParameters`, so an unused import or variable **fails the build**. Run `npx tsc --noEmit` to check without bundling.
- CI (`.github/workflows/deploy.yml`) runs `npm ci → npm test → npm run build` and deploys `dist/` to Pages on push to `main`.

## Testing

There is no jest/vitest. `npm test` runs `scripts/run-smoke.mjs`, which esbuild-bundles `scripts/smoke-harness.ts` and executes it under **jsdom**. The harness mounts every view, exercises component/data builders, and asserts no exceptions + that DOM is produced.

- **Add a test** by adding a `check('name', () => { ... })` call in `scripts/smoke-harness.ts`; throw to fail.
- **No per-test filtering.** To run one check in isolation, temporarily comment out the others in that file.
- The harness stubs the environment: `matchMedia` always returns `matches: false` (so reduced-motion is *off* in tests), and `confirm` returns `true`. If you add code depending on other browser globals, register them in `run-smoke.mjs`'s globalize list.
- Several checks enforce **content invariants** (see below) — editing `src/data/` can break the smoke test on purpose.

## Architecture

### Boot and routing
`src/main.ts` registers routes, builds the nav, starts the smoke FX layer, kicks off `loadPersisted()` (async IndexedDB load), and starts the router. `src/router.ts` is a tiny **hash router**: `route('/qlipha/:id', factory)` registers a `ViewFactory`; on `hashchange` it resolves a route, calls `current.destroy()`, clears the container, then `view.mount(container, params)`. It dispatches a `route:changed` CustomEvent and fades views unless `prefersReducedMotion()`.

### The View contract (`src/types.ts`)
Every view is a `ViewFactory` (`() => View`) where `View = { mount(container, params), destroy() }`. Views are **created fresh on navigation and destroyed on leave** — there is no instance reuse. Anything stateful a view starts (timers, `requestAnimationFrame` loops, audio, store subscriptions, event listeners, wake locks) **must be torn down in `destroy()`**, or it leaks across navigations. Views render by assigning an HTML string to `.innerHTML` and then attaching listeners.

### State (`src/state/`)
`store.ts` defines a minimal `Observable<T>` (`get`/`set`/`update`/`subscribe`). **`subscribe` fires immediately with the current value** and returns an unsubscribe function — call it in `destroy()`. The `ambience` observable (drone/cues/candleMode) auto-persists to localStorage; because views subscribe to it, toggling ambience anywhere updates all live components without prop-drilling. `journal.ts` holds IndexedDB-backed observables (entries + initiation progress) via `idb-keyval`, plus backup/restore.

### Content model (`src/data/` + `src/types.ts`)
All ritual content is static data, not fetched. The four arrays — `QLIPHOTH` (10 shells), `TUNNELS` (22 paths), `DEGREES`, `RITUALS` — are cross-referenced by id. **Invariants enforced by the smoke test:** exactly 10 shells with unique ids/orders, exactly 22 tree paths referencing valid shells, and every shell mapping to a real `degreeId` + `ritualId`. Keep these consistent when editing data.

### Sigils (`src/components/sigil.ts` + `sigil-trace.ts`) — read both before touching either
`sigil.ts` generates sigil geometry **deterministically from a string key** (each shell carries a `sigil` key) via a seeded PRNG: same key ⇒ same glyph, forever. **The order of PRNG draws is load-bearing** — reordering or inserting draws silently changes every sigil shape (and breaks personal seals users have saved). `sigil-trace.ts` is the interactive tracer: it projects the pointer onto the *currently active chord* (one segment at a time) rather than the whole path, which is what prevents the fill from jumping across line crossings or stalling at sharp corners. Under reduced-motion (and in jsdom) it falls back to a single-tap-completes mode. When scaling the sigil into the full-screen overlay, dash lengths are scaled by the CTM because `vector-effect: non-scaling-stroke` resolves dashes in screen pixels.

### Rite flow (`src/views/ritual.ts` — the largest view)
A rite has three phases: **intro** (sigil tracer + ambience toggles + "Begin", which unlocks audio, starts the drone, and acquires the wake lock), **steps** (linear sequencer; each `RitualStep.type` of `breath`/`meditation` mounts the pacer or countdown from `components/timer.ts`, firing cues on phase changes), and **complete** (seal cue, fade drone, release wake lock, journal entry form). This view orchestrates audio, FX, wake lock, and persistence together — it's the best single file for understanding how the subsystems interact.

### Audio & FX
`src/audio/context.ts` holds a single `AudioContext`; **Web Audio requires a user gesture**, so `resumeAudio()` is called on "Begin". `cues.ts` (struck bell tones + haptics) and `drone.ts` (detuned oscillators + reverb) both gate on `ambience.cues`/`droneEnabled`. `src/fx/smoke.ts` is a canvas particle system and `src/fx/theme.ts` writes per-shell color palettes to CSS custom properties on `<body>`. All animation respects `prefersReducedMotion()`.

## Conventions

- Match the existing style: pure functions returning lifecycle objects (no classes except `Observable`), `.innerHTML` templates, SVG/canvas drawn by hand (no graphics libs).
- Always pair every subscription/listener/animation/timer with cleanup in `destroy()`.
- Gate motion and audio behind `prefersReducedMotion()` and the `ambience` flags, mirroring existing views.
- After any change, run `npm test` and `npx tsc --noEmit` — both must pass for CI to deploy.
