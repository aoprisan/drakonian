# Drakonian — Roadmap

A backlog of features for the Nightside grimoire. Each item notes a rough
**effort** (S / M / L) and a **hook** into the current codebase so it can be
picked up cold. Everything here is offline-first and backend-free, in keeping
with the app's design.

---

## Shipped

- **Wake Lock** — screen stays lit through a rite. (`src/sys/wakelock.ts`)
- **Transition cues** — synthesized bell tones + haptics on begin/step/seal and
  breath turns; "Bells & vibration" toggle. (`src/audio/cues.ts`, `src/audio/context.ts`)
- **Tunnels of Set** — the 22 tunnels on the tree's edges + `/tunnel/:id` view.
  (`src/data/tunnels.ts`, `src/views/tunnel.ts`)
- **Per-shell theming** — the UI takes on each gate's hue. (`src/fx/theme.ts`)
- **Sigil tracing** — animated draw plus a "trace the sigil" pointer exercise in the
  rite intro; optional, never gates the rite, taps to focus where pointer tracing is
  unavailable. (`src/components/sigil-trace.ts`, `src/views/ritual.ts`)
- **Personal seal generator** — a sigil derived deterministically from a magical
  name/intent, exported to PNG and optionally inscribed in the journal.
  (`src/views/seal.ts`, `sigilSvgStandalone` in `src/components/sigil.ts`)
- **Lunar phase awareness** — local moon-phase maths drive a phase banner on the tree;
  the dark moon favours the gate of Gamaliel, and the moon's glow swells with its
  illumination. (`src/sys/lunar.ts`, `src/views/tree.ts`)
- **Standalone breath trainer** — the breath pacer decoupled from a full rite at
  `/breath`, with cadence presets (Square, Calm, Serpent, Triangle, Dragon) and span
  presets; reuses the rite player's bells/haptics and wake lock, and can inscribe a
  session to the journal. (`src/views/breath.ts`, `createBreathPacer` in `src/components/timer.ts`)

---

## Top picks next

1. **Sanctum / Settings view** — consolidates toggles now scattered across nav + rite intro.
2. **Planetary hours** — pairs naturally with the now-shipped lunar awareness.
3. **Custom rite builder** — turns a fixed grimoire into a personal one.

---

## Ritual practice depth

- **Planetary hours** *(M)* — Each shell carries a `planet`. Compute sunrise/sunset
  from optional geolocation and show "now is the hour of Saturn — Satariel stands
  open." *Hook:* `Qlipha.planet` in `src/data/qliphoth.ts`; display on
  `src/views/qlipha.ts`.
- **Custom rite builder** *(L)* — Compose a working from the existing step primitives
  (`breath`/`invocation`/`meditation`/`gesture`), save to IndexedDB, run in the same
  player. *Hook:* reuse `RitualStep` + `src/components/timer.ts`; persist like
  `src/state/journal.ts`; new route (e.g. `/forge`).
- **Ritual reminders** *(M)* — Set an intention for a working at a chosen time via the
  Notifications API. *Hook:* requires notification permission flow; pairs with lunar/
  planetary timing.
- **Ambient soundscapes per element** *(M)* — Water for Gamaliel, fire for Golachab,
  layered over the drone. *Hook:* extend `src/audio/drone.ts` using `Qlipha.element`.

## Content & the Tree

- **Glossary + name pronunciation** *(M)* — Tap-to-define Qabalistic/Draconian terms in
  the prose; struck tones for ruler/divine names. *Hook:* a terms map; wrap terms in
  `src/views/qlipha.ts` and `src/views/about.ts` prose.
- **Dayside overlay** *(M)* — Toggle the Tree of Death against the Tree of Life to show
  each shell inverting its sphere. *Hook:* `Qlipha.daysideSphere` exists; draw a second
  tree in `src/components/tree-svg.ts`.
- **Correspondence cross-reference** *(S)* — "Show me all Saturnian shells / all Water
  shells." *Hook:* filter `QLIPHOTH` by `planet`/`element`/`incense`.

## Journal & reflection

- **Search / filter / tags** *(M)* — The journal is add/delete/list only. Add tags,
  full-text search, and filter by shell/type/date. *Hook:* extend `JournalEntry`
  (`src/types.ts`); UI in `src/views/journal.ts`; `entries$` already reactive.
- **Markdown rendering in entries** *(S)* — Render entry bodies as Markdown. *Hook:*
  `src/views/journal.ts` render path (keep it dependency-free or add a tiny parser).
- **State before/after a rite** *(M)* — A mood/charge slider pre- and post-working,
  charted over time. *Hook:* add fields to `JournalEntry` or a metrics store; capture in
  `src/views/ritual.ts` intro + complete.
- **Practice timeline / heatmap** *(M)* — Visualize cadence from entry timestamps.
  *Hook:* derive from `entries$` `createdAt` in a new view.
- **Nightside oracle** *(M)* — Draw-a-card divination tied to the shells/tunnels, each
  draw logged to the journal. *Hook:* render with `sigilSvg`; write via `addEntry`.

## Progression & structure

- **"Today's working" suggestion** *(S)* — On the tree, suggest a rite from initiation
  progress + lunar phase. *Hook:* combine `progress$` (`src/state/journal.ts`) with the
  lunar util; surface in `src/views/tree.ts`.
- **Guided curriculum / path mode** *(L)* — Sequence the gates as a journey using the
  initiatory ladder, gently gated by practice. *Hook:* `DEGREES` + `progress$`.
- **Degree self-assessment** *(S)* — Reflective prompts before marking a degree attained.
  *Hook:* `toggleAttained` in `src/state/journal.ts`.

## Atmosphere & polish

- **Sanctum / Settings view** *(M)* — Consolidate the toggles (drone, candle, cues, and
  any future lunar) now scattered across `src/components/nav.ts` and the rite intro.
  *Hook:* new route `/sanctum`; bind to the `Ambience` store.
- **Passphrase-locked Black Book** *(L)* — Encrypt the IndexedDB journal store with a
  passphrase (WebCrypto). Thematic and genuinely protective. *Hook:* wrap get/set in
  `src/state/journal.ts`.
- **Manifest shortcuts + share** *(S/M)* — App shortcuts ("New entry", "Today's working")
  and export a rite or codex page as an illuminated image/PDF. *Hook:* PWA manifest in
  `vite.config.ts`; SVG-to-image for share.
- **Print stylesheet** *(S)* — A printed-grimoire `@media print` layout for the codex.
  *Hook:* `src/styles/main.css`.
- **Candle flame element** *(M)* — A canvas flame whose flicker optionally responds to the
  mic (blow it out). *Hook:* new fx alongside `src/fx/smoke.ts`.
- **Internationalization** *(L)* — Externalize strings for translation.

## Settings split (small follow-up)

- **Separate bells from haptics** *(S)* — Currently one `cues` flag covers both. Split into
  independent toggles for silent-with-vibration or sound-without. *Hook:* `Ambience` in
  `src/state/store.ts`; `src/audio/cues.ts` already isolates `strike()` vs `buzz()`.
