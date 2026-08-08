# AgriMinds

Marketing site for AgriMinds — the agripreneur ecosystem founded in Vizag, nurturing agri &
food entrepreneurs from idea to MVP through mentoring, training, implementation partnerships,
and capital access.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Structure

- `app/` — routes and layout (see `app/page.tsx` for the homepage sections)
- `shared/data/agriminds.tsx` — all site copy and image URLs (pillars, roadmap, metrics, etc.)
  — edit this file to update content
- `shared/components/` — navbar, footer, and reusable section components
- `shared/components/three/` — the animated crop-field Three.js hero background
  (`cropFieldScene.tsx`), loaded client-only via `cropFieldBackground.tsx`

This is a static/content-driven site — no database or authentication. The "Join the Movement"
form opens a pre-filled email via `mailto:` to the address set in `CONTACT_EMAIL`
(`shared/data/agriminds.tsx`) — update that to your real contact address before launch.

## Design system

- Palette, type pairing (Fraunces serif + Geist sans), organic-blob and grain-texture utilities
  all live in `app/globals.css` as CSS custom properties / Tailwind v4 `@theme` tokens.
- Photography is sourced from Unsplash via `images.unsplash.com` (see `IMAGES` in
  `shared/data/agriminds.tsx`) — swap these for your own photography whenever you have it;
  `next.config.ts` is already configured to allow that host.
- Above-the-fold content (hero) uses CSS-only entrance animation so it's never invisible while
  waiting on JavaScript; everything below the fold uses `framer-motion` scroll-reveal
  (`shared/components/molecules/fadeIn.tsx`).
