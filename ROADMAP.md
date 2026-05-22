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

---

## Top picks next

1. **Lunar phase awareness** — most atmosphere for least code; the Nightside is lunar.
2. **Spoken invocation (TTS)** — biggest usability win for the dark-room use case.
3. **Sanctum / Settings view** — consolidates toggles now scattered across nav + rite intro.
4. **Custom rite builder** — turns a fixed grimoire into a personal one.

---

## Ritual practice depth

- **Lunar phase awareness** *(S)* — Compute the moon phase locally (pure math, no
  network) and surface "the dark moon favours the gate of Gamaliel" on the tree;
  optionally tint by phase. *Hook:* new util in `src/sys/`, consumed by
  `src/views/tree.ts`; Gamaliel is the lunar shell.
- **Planetary hours** *(M)* — Each shell carries a `planet`. Compute sunrise/sunset
  from optional geolocation and show "now is the hour of Saturn — Satariel stands
  open." *Hook:* `Qlipha.planet` in `src/data/qliphoth.ts`; display on
  `src/views/qlipha.ts`.
- **Spoken invocation (TTS)** *(M)* — Read each `RitualStep.text` aloud via the Web
  Speech API so the rite works hands-free, eyes closed. *Hook:* add a `tts` flag to
  `Ambience` (`src/state/store.ts`); speak in `src/views/ritual.ts` `renderStep`.
- **Custom rite builder** *(L)* — Compose a working from the existing step primitives
  (`breath`/`invocation`/`meditation`/`gesture`), save to IndexedDB, run in the same
  player. *Hook:* reuse `RitualStep` + `src/components/timer.ts`; persist like
  `src/state/journal.ts`; new route (e.g. `/forge`).
- **Standalone breath trainer** *(S)* — The breath pacer decoupled from a full rite,
  with cadence presets. *Hook:* `createBreathPacer` already stands alone in
  `src/components/timer.ts`.
- **Ritual reminders** *(M)* — Set an intention for a working at a chosen time via the
  Notifications API. *Hook:* requires notification permission flow; pairs with lunar/
  planetary timing.
- **Ambient soundscapes per element** *(M)* — Water for Gamaliel, fire for Golachab,
  layered over the drone. *Hook:* extend `src/audio/drone.ts` using `Qlipha.element`.

## Content & the Tree

- **Sigil tracing** *(M)* — Animate the sigil draw, then offer a "trace the sigil"
  pointer interaction as a focusing exercise before a rite. *Hook:* `src/components/sigil.ts`
  already emits the path; capture pointer movement over `.sigil-line`.
- **Personal seal generator** *(M)* — Derive a unique sigil deterministically from the
  practitioner's magical name/intent; export as an image. *Hook:* reuse `seedFrom()` in
  `src/components/sigil.ts`; serialize the SVG to PNG via canvas.
- **Glossary + name pronunciation** *(M)* — Tap-to-define Qabalistic/Draconian terms in
  the prose; TTS or tones for ruler/divine names. *Hook:* a terms map; wrap terms in
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
  any future TTS/lunar) now scattered across `src/components/nav.ts` and the rite intro.
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
