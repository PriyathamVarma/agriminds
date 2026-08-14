# AgriMinds Webapp — Project State & Handoff Notes

**Purpose of this file**: a continuity script for any AI agent (or human) picking this project up cold. It covers what the project is, the full tech stack, every 3D/Canvas animation system and how it works, the content/data model, backend integration, and exactly what's done vs. uncommitted vs. deliberately left out. Read this before touching the codebase.

Last updated: 2026-08-14 (hero skyline, evening palette, and weed-removal visuals refined).

---

## 1. What this project is

**AgriMinds** — marketing/landing site for the **Agriminds Ecosystem Foundation**, an Indian agri-food entrepreneurship nonprofit. Single-page Next.js site (`app/page.tsx`) with sections for pillars, flagship programmes, the chapter/expansion model, a 10-year roadmap, impact metrics, revenue model, and a join/contact form.

The brand identity underwent a scope change mid-project: it started as "AgriMinds Agripreneur Club" (small, Vizag-only, informal) and was rewritten to position it as the "Agriminds Ecosystem Foundation" — a decade-long (2026–2036), pan-India strategy targeting 100,000 enterprises, 1,000 FPOs, and 1M families. **`shared/data/agriminds.tsx` is the single source of truth** for this narrative (stats, pillars, roadmap phases, revenue streams, etc.) — always check it before writing new copy elsewhere, and keep it in sync if the underlying strategy changes again.

Current phase framing (confirmed by the project owner, supersedes anything else you find):
- **Origin**: Vizag / Andhra Pradesh (founding chapter)
- **Phase 1 (next focus)**: Karnataka, Telangana, Tamil Nadu
- **Phase 2**: Odisha, Jharkhand
- **Phase 3**: rest of India (national rollout)

---

## 2. Tech stack

- **Next.js 16.3.0**, App Router, Turbopack. **Read `node_modules/next/dist/docs/` before assuming any Next.js API** — the project's `AGENTS.md`/`CLAUDE.md` explicitly warn this is a newer/different Next.js than training data may assume.
- **React 19**, TypeScript (strict — `tsc --noEmit` must stay clean), Tailwind CSS v4 (`@theme` tokens in `app/globals.css`, no `tailwind.config.js`).
- **Framer Motion** (`framer-motion`) — the project's scroll-progress infrastructure. Every scroll-driven effect uses `useScroll({ target: ref, offset: [...] })`, never a hand-rolled scroll listener.
- **three.js** (`three`, hand-rolled — **no react-three-fiber/drei**, deliberately, per earlier direction: "the existing project already uses hand-rolled Three.js/WebGL, continue using that architecture unless there is a strong technical reason not to").
- **Canvas 2D** (native, no library) for the hero illustration — see §4.1.
- **Mongoose** (`mongoose`) + MongoDB Atlas for the contact form backend.
- **lucide-react** for icons, **react-hot-toast** for toasts.
- Fonts: `Fraunces` (display/serif headings, `font-display` utility) + `Geist Sans`/`Geist Mono` (body), loaded via `next/font/google` in `app/layout.tsx`. The site's `font-sans` stack already falls back through `Inter` after Geist — don't add a separate Inter import if porting something that wants Inter.
- Dev dependency: **`topojson-client`** — used only by `scripts/generate-india-geo.mjs` (a build-time data-prep script), not shipped in the client bundle.

---

## 3. Directory conventions

```
app/
  page.tsx              — the whole one-page site, composed from shared/components + shared/data
  api/contact/route.ts  — POST-only contact form endpoint
  layout.tsx            — fonts, metadata, <Shell>
  globals.css           — Tailwind v4 @theme tokens (colors, fonts, custom animations)

shared/
  data/agriminds.tsx    — ALL site copy/content arrays (SITE, STATS, PILLARS, ROADMAP_PHASES,
                           FLAGSHIP_PROGRAMS, REVENUE_STREAMS, SUCCESS_METRICS, JOIN_ROLES, etc.)
  components/
    molecules/           — small reusable pieces (FadeIn, ParallaxImage, SectionHeading, CounterStat,
                            JoinForm) plus a few larger scroll-owning section components
                            (roadmapTimeline.tsx, chapterModelSection.tsx)
    templates/            — navbar.tsx, footer.tsx (persistent chrome)
    hero/                 — the hero's Canvas 2D scene (see §4.1)
    three/                — every hand-rolled WebGL scene + shared WebGL utilities (see §4.2+)
    mainTemplate.tsx       — <Shell> wrapping Navbar + children + Footer
  lib/
    mongodb.ts            — cached Mongoose connection singleton (Next.js hot-reload/serverless-safe)
    utils.tsx              — cx() classname combiner
  models/
    contact.ts             — Mongoose ContactSubmission schema

scripts/
  generate-india-geo.mjs   — one-time/re-runnable data pipeline for the India map (see §4.3)
```

**Client-component pattern used everywhere for scroll/WebGL/Canvas pieces**: a small `"use client"` wrapper owns a `ref` + `useScroll(...)`, dynamically imports the actual scene component (`next/dynamic(..., { ssr: false })`) *except* where the content is real above-the-fold heading/CTA text that must be server-rendered for SEO (the hero is the one exception — see §4.1). The scene component itself does **all** its DOM mutation imperatively inside a `useEffect` + `requestAnimationFrame` loop (reading `progress.get()` each frame), never via React state, to avoid re-render churn on a 60fps loop.

---

## 4. 3D / Canvas animation systems

Five independent visual systems, all following the same performance discipline (detailed in §4.6):

### 4.1 Hero — Canvas 2D illustrated scroll scene
**Files**: `shared/components/hero/heroCanvas.ts` (drawing engine, ~1200 lines), `heroSection.tsx` (React wrapper), `heroStatsStrip.tsx` (the stats card below it).

Not WebGL — plain `<canvas>` 2D context. A 230vh scroll-stage (`h-[230vh]`) contains a `position: sticky` hero (`h-[100svh]`); as the user scrolls through the stage, the camera zooms/pans from a wide "meadow" view to a closer "ecosystem" view, cross-fading two headline moments (`scene1`/`scene2` refs) along the way. Scroll progress comes from `useScroll({ target: scrollStageRef, offset: ["start start", "end end"] })` — this exact offset pairing maps precisely onto the sticky-pin scroll math.

Procedurally drawn (no image assets): rolling ridges, a warm dusk sky gradient with sun rays, an eco-city skyline (5 building shapes: tier/taper/ring/spire/arc, lit windows, green/solar roofs), 5 wind turbines, 5 patrol drones on waypoint loops, a solar panel farm with glinting cells, wind-swayed grass in 4 depth bands, 2 pine trees with sparkle particles, 2 zebu cattle (**both eyes required** — a real bug was found and fixed where only one eye rendered), 2 weeding robots that sweep the **full width** of the field left-to-right-and-back (ping-pong, not a teleport-reset — also a real bug, fixed) with a reach/grip/lift/toss arm animation and dirt-puff particles, ambient dust motes.

The hero uses a muted teal evening palette with a warm amber horizon, matched to the owner-selected desktop hero screenshot. Its broader visual direction still draws from the supplied From Fauna screen recording: a cinematic landscape and broad distant ribbon of optimistic architecture. A later owner-provided architecture sheet now defines the city language: pearl-white parametric eco-buildings with twisting helix towers, ribbed shell structures, looped canopy hubs, planted crowns, curved split-crown towers, and rounded habitat pods. The robot cycle explicitly shows a weed before pickup and a lifted soil clump with exposed roots afterward, so the action reads as weed removal rather than an abstract arm movement.

Hero copy readability is protected by a stronger left-to-right contrast scrim, fully opaque body copy, deeper text shadows, and higher-contrast secondary CTAs. On narrow screens each headline state also gets a subtle translucent blurred backing panel, since wrapped copy occupies more of the bright sky there; that panel disappears at `sm` and above to retain the open cinematic desktop composition.

The field is now a continuous green pasture rather than exposed ground with sparse grass bands. Grass density increases toward the camera and foreground blades render in front of animals/machines for depth. Both cattle use a slow head-lowering grazing cycle, three grazing sheep have been added, and the robots retain the explicit reach/grip/lift weed-removal cycle with visible roots and attached soil.

Vertical centering of the headline blocks uses **flexbox** (`flex items-center` on a full-height wrapper), not a hardcoded `translateY(-58%)` — a real mobile bug happened here: the JS was double-applying both a CSS flex-center *and* a leftover `-58%` JS transform meant for the old (pre-flexbox) layout, pushing content up into the nav on narrow viewports where text wraps to more lines. Fixed by removing the JS's base-offset percentage and keeping only the small supplementary drift/settle motion. **If you touch hero vertical layout again, remember: centering is CSS's job, JS only adds small deltas on top.**

A right-edge curved SVG "progress rail" with two clickable dots lets users jump between scene 1/2. Reduced-motion, tab-visibility pause, and a text-only fallback (if `canvas.getContext("2d")` is null) are all handled.

### 4.2 Roadmap — "Growth Spine"
**Files**: `shared/components/three/growthSpineScene.tsx` + `growthSpineBackground.tsx`, orchestrated by `shared/components/molecules/roadmapTimeline.tsx`.

Replaces what was originally a static `border` line down the roadmap timeline. An organic, wandering shader-drawn line (fixed orthographic camera, full-bleed quad, fragment shader computes a sine-wandering centerline + reveal mask) grows top-to-bottom as `scrollYProgress` (scoped to the roadmap timeline container) advances, with a warm glowing tip and a few particles drifting along the grown portion. Phase dots (`RoadmapNode` inside `roadmapTimeline.tsx`) scale up with a halo + one-shot Tailwind `animate-ping` bloom via Framer Motion `useTransform`/`useSpring` on the *same* scroll value — deliberately **not** done inside the WebGL canvas, since the dots are already pixel-perfectly positioned DOM elements.

### 4.3 Chapter Model — real India state map
**Files**: `shared/components/three/indiaMapScene.tsx` + `indiaMapBackground.tsx`, geography in `indiaStatesData.ts` (generated, don't hand-edit) / `indiaProjection.ts` (Albers conic projection) / `indiaGeo.ts` (phase/activation story), orchestrated by `chapterModelSection.tsx`. Data pipeline: `scripts/generate-india-geo.mjs`.

**This replaced an earlier abstract point-cloud/hand-drawn-outline version** that the project owner rejected as "not looking like India." The current version uses **real state boundary data**: fetched from `udit-001/india-maps-data` (MIT-licensed, 2011-census-derived, GitHub), decoded from TopoJSON via `topojson-client`, Andaman & Nicobar / Lakshadweep excluded (island territories, would distort mainland proportions), each ring simplified via a hand-written Douglas-Peucker implementation, projected with a proper **Albers equal-area conic** formula (not naive lat/lon→x/y, which visibly distorts India's shape) parameterized for India (standard parallels 12°N/30°N, reference longitude 82.8°E), then normalized into `indiaStatesData.ts` (34 states/UTs, ~4900 points, ~122KB). `indiaProjection.ts`'s `projectIndia()` applies the *identical* formula at runtime for point features (the Vizag marker) so everything aligns.

Rendering: each state is a subtly extruded `THREE.ExtrudeGeometry` (`MeshLambertMaterial`, ambient + directional light), sitting in a group tilted ~11° for a relief-map look, inside a fixed-aspect "contain fit" orthographic camera (computed from the real data's bounding box on mount — never clips, at any container size). State fill color lerps from a neutral parchment tone toward its phase's category color (`origin`/`phase1`/`phase2`/`phase3` — see §1 for which states are in which) as scroll progress crosses that state's threshold (`STATE_ACTIVATIONS` in `indiaGeo.ts` — **this is the phase source of truth for the map**, keep it in sync with `shared/data/agriminds.tsx`'s roadmap copy). Connections are straight lines from Vizag/a connecting state's centroid to each newly-activating state, with a few particles traveling along active routes. **Hover** raycasts against the actual state meshes and shows a cursor-following tooltip with the state name (confirmed working live — e.g. hovering shows "Madhya Pradesh").

Lives in its own bounded, prominent card (`aspect-[9/10] max-w-2xl`) below the existing photo/text grid in `chapterModelSection.tsx` — **not** a full-section ambient background (an earlier version tried that; it was invisible/illegible because it was squeezed behind other content and spread across a section taller than one viewport, so you'd only ever see a cropped slice). A color legend sits at the bottom of the card.

**Known, disclosed scope trims** (not bugs, deliberate calls under time pressure): connections are straight, not curved arcs. No true WebGL-unavailable static fallback for this specific component (if WebGL creation fails, the card/heading still render, just no map inside — page doesn't break, but it's not "still shows a map" per a stricter reading of the original spec). No separate bold country-outline — the state boundaries collectively form the coastline/border correctly on their own (same as how real reference political maps work), so no polygon-union math was implemented.

**To regenerate the geography data** (e.g. if you need higher/lower simplification, or a different source): edit `scripts/generate-india-geo.mjs`'s `SIMPLIFY_EPSILON_DEG` or source URL, then `node scripts/generate-india-geo.mjs` — it prints the new Albers normalization constants, which you then must **manually copy into `indiaProjection.ts`** (`NORMALIZE_OFFSET_X/Y`, `NORMALIZE_SCALE`) to keep point features aligned with the regenerated polygons.

### 4.4 Pillars — soil-grain particle field
**Files**: `shared/components/three/pillarParticleFieldScene.tsx` + `pillarParticleFieldBackground.tsx`, used inside the featured pillar tile in `app/page.tsx`.

Small particle field behind the featured "Entrepreneur Discovery" tile's photo, gently repelled by the cursor within a radius and easing back to rest. **Non-obvious gotcha, already solved — don't re-break it**: the particle canvas sits *behind* the tile's text/gradient overlay in the DOM, and that overlay has no `pointer-events-none`, so it — not the particle div — is what actually receives hit-tests. The fix was to attach the `pointermove` listener to `container.parentElement` (the shared tile wrapper), not the particle div itself, since the event still bubbles up through the parent regardless of which child was hit. Verified interactive via a temporary debug boost (huge bright-magenta particles) showing a clear repulsion gap exactly where the cursor moved, then reverted.

### 4.5 Impact — rising particle field
**Files**: `shared/components/three/impactParticleFieldScene.tsx` + `impactParticleFieldBackground.tsx`, used in the Impact stats section in `app/page.tsx`.

Small warm particle field behind the stat grid, rising continuously with a brief "bloom" (more spread/brightness/speed) timed to roughly coincide with the `CounterStat` count-up animation, since both key off scroll-into-view independently (not tightly coupled, just similarly timed).

### 4.6 Shared performance discipline (applies to every scene above)
- `shared/components/three/webgl.ts`: `createLowPowerRenderer()` (alpha+antialias, `powerPreference: "low-power"`, returns `null` on failure — every scene checks this and no-ops rather than crashing), `disposeObject3D()` (recursive geometry/material/texture disposal), `prefersReducedMotion()`, `isLowPowerDevice()` (cores ≤4 / coarse pointer / narrow viewport → fewer particles, sometimes skip categories entirely).
- `shared/components/three/useInViewport.ts`: IntersectionObserver hook. Scenes fully **unmount their canvas/WebGL context** (not just pause rAF) when scrolled far out of view, then rebuild from scratch when back in view — frees GPU memory more aggressively than a pause-only approach.
- Reduced motion: mostly "freeze at final/meaningful state, stop the rAF loop, only re-render on direct user interaction" (hover, or the scroll-linked `progress.on("change", ...)` subscription) — not "render nothing." Confirmed working for growth spine, India map, and hero.
- Every new WebGL scene reuses this trio rather than reinventing renderer/dispose/visibility logic.

---

## 5. Backend — MongoDB contact form

- `shared/lib/mongodb.ts`: cached connection singleton (`global._mongooseCache`), `bufferCommands: false`, `serverSelectionTimeoutMS`/`socketTimeoutMS` set, strips stray quotes from the URI, resets the cached promise on connection failure so retries aren't stuck replaying a dead promise. Pattern was cross-checked against a sibling project's (`Viharam`) battle-tested version.
- `shared/models/contact.ts`: `ContactSubmission` Mongoose model (`name`, `email`, `role`, `message`, `timestamps: true`), `IContactSubmission` type is `InferSchemaType`'d straight from the schema.
- `app/api/contact/route.ts`: **POST only**. Validates all fields server-side, returns `400` with a specific message or `201` with the new `_id`. **Deliberately no `GET`** — with zero auth on this site, a list-all-submissions endpoint would leak every visitor's name/email/message. Don't add one without building real auth first.
- `shared/components/molecules/joinForm.tsx`: calls `/api/contact` directly (replaced an earlier mailto-based version), shows loading/disabled state, resets + toasts on success.
- `.env` holds `MONGODB_URI` (gitignored via `.env*` in `.gitignore` — confirmed never committed).
- Verified end-to-end multiple times by POSTing real data and querying Atlas directly to confirm writes, then cleaning up test records.

---

## 6. Design tokens (`app/globals.css`)

```
--color-primary:        #1f4d3a   (deep green)
--color-accent:         #c1712f   (burnt orange)
--color-deep:            #0f1d16   (near-black green, hero/impact section bg)
--color-surface:         #f2ecdd   (page background, cream)
--color-surface-card:    #fffdf8   (card background, near-white cream)
--font-display:          Fraunces
--font-sans:              Geist Sans (falls back through Inter)
```
The `CATEGORY_COLOR` map in `indiaGeo.ts` and the earth-tone particle palettes across the three/ scenes were hand-picked to sit within this same palette family (warm oranges/ambers/sage-greens on cream), not introduced independently — keep new visual work consistent with this.

---

## 7. Current git state — READ BEFORE DOING ANYTHING

```
 M app/page.tsx
 M shared/components/molecules/chapterModelSection.tsx
 D shared/components/three/cropFieldBackground.tsx   (superseded by hero/heroCanvas.ts)
 D shared/components/three/cropFieldScene.tsx          (superseded)
 D shared/components/three/heroCropFieldLayer.tsx      (superseded)
 M shared/components/three/indiaGeo.ts
 M shared/data/agriminds.tsx
?? shared/components/hero/                              (new, untracked)
```
**Nothing from this session has been committed.** Recent commit history (`git log --oneline`) shows a few commits (`3d graphics used`, `new 3d designs`, `mongodb connected`, ...) that appear to have been made automatically/externally during past sessions — not by explicit `git commit` calls from an assistant turn. Don't assume the working tree matches any given commit; always run `git status`/`git diff` first. **Do not commit or push without the project owner's explicit go-ahead** — that instruction has held throughout this project.

---

## 8. Verification checklist (follow this after any change)

This project has been kept at zero errors throughout — preserve that bar:
1. `npx tsc --noEmit` — must be clean.
2. `npx eslint app shared --ext .ts,.tsx` (add `scripts --ext .mjs` if you touched the data pipeline) — must be clean.
3. `npm run build` — must succeed.
4. **Visually verify, don't just trust the build.** The established pattern in this project: start `npm run dev`, use Playwright via `playwright-core` (already cached at `~/Library/Caches/ms-playwright/chromium-1234/...`, no reinstall needed — see any earlier turn's Bash calls for the exact `CHROMIUM_PATH` and launch args) to screenshot the actual rendered page at the relevant scroll position/viewport/interaction state, and **read the screenshot** before declaring something fixed. Multiple real bugs in this project (the mobile hero overlap, the cow's missing eye, the robot's teleport, the India map's invisible outline) were only caught this way — `tsc`/`eslint`/`build` passing does not mean the feature looks or works right.
5. Check `prefers-reduced-motion`, mobile viewport (~390×844), and hover interaction explicitly for anything scroll- or pointer-driven — these are exactly where bugs hid previously.
6. Stop the dev server and clean up any scratch/temp files (screenshots, throwaway Node scripts) when done — don't leave them in the repo.

---

## 9. Nothing is currently in-progress

As of this writing there is no half-finished task — the last request (fixing the mobile hero overlap, the cow's second eye, and the robot's left-to-right sweep) was completed and verified. If you're picking this up because a task got interrupted, check the conversation you're resuming for what was actually asked; this file describes *state*, not an active to-do list. If you make further changes, **update this file** (especially §7 and any new "known limitation" you introduce or resolve) so the next agent doesn't have to re-derive it.
