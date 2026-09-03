# AgriMinds

The AgriMinds Ecosystem Foundation website — the public marketing site, plus a full chapter
management platform: registration & login, a general member dashboard, a chapter dashboard
(profile, team, requirements, updates, documents, impact reporting), central admin tooling, and
public chapter directory/profile pages.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in real values (MongoDB Atlas connection string,
   Cloudinary credentials, and a generated `AUTH_SECRET` — see the file for exact instructions
   and the command to generate a secret).
3. Create the first `super_admin` account:
   ```bash
   npm run seed:admin
   ```
   This promotes (or creates) the user at `SUPER_ADMIN_EMAIL` (from `.env`) to `super_admin`. If
   it creates a brand-new account, the generated password is printed once in the terminal —
   save it, it's never shown again and only its hash is stored.
4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Sign in with the super_admin account at
   `/login` — you'll land on `/admin`.

## Structure

- `app/(site)/` — the public marketing pages (homepage, `/blog/*`, `/chapters`, `/chapters/[slug]`)
  — these share the `Navbar`/`Footer` chrome via `shared/components/mainTemplate.tsx`.
- `app/(auth)/` — `/login`, `/register`, `/forgot-password`, `/reset-password`, `/unauthorized`,
  `/invitations/accept` — a minimal centered-card layout, no site nav.
- `app/dashboard/` — the general member dashboard (`/dashboard`) and the chapter dashboard
  (`/dashboard/chapter/*`: profile, team, requirements, updates, documents, impact).
- `app/admin/` — central administration (`/admin`, `/admin/chapters`, `/admin/chapters/[id]`,
  `/admin/applications`, `/admin/announcements`) — `super_admin` only.
- `app/api/` — all route handlers: `auth/*` (register/login/logout/password reset/session),
  `chapters/*` (chapters + their team/requirements/updates/documents/impact sub-resources),
  `applications/*`, `invitations/*`, `announcements/*`, `admin/*`.
- `proxy.ts` (project root) — route protection for `/dashboard/*` and `/admin/*`. **Note:** this
  Next.js build renamed `middleware.ts` to `proxy.ts` (`middleware.ts` is deprecated in this
  version) — don't reintroduce a `middleware.ts` file for this.
- `shared/models/` — every Mongoose model (`User`, `Chapter`, `ChapterMembership`,
  `ChapterApplication`, `RequirementTemplate`, `ChapterRequirement`, `RequirementSubmission`,
  `ChapterUpdate`, `ChapterDocument`, `ImpactReport`, `Announcement`, `Invitation`, `AuditLog`).
- `shared/lib/auth/` — session (JWT via `jose`, HTTP-only cookie), password hashing (`bcryptjs`),
  RBAC guards for route handlers (`rbac.ts`), rate limiting, token generation for password
  reset/invitations.
- `shared/lib/validation/` — Zod schemas for every form/API payload.
- `shared/lib/mongodb.ts` — the cached connection helper (safe for Next's dev hot-reload).
- `shared/components/dashboard/` — the shared dashboard shell (collapsible sidebar + mobile
  drawer), and every dashboard/admin manager component (`teamManager`, `requirementsManager`,
  `updatesManager`, `documentsManager`, `impactManager`, `chaptersAdminList`,
  `adminChapterDetail`, `applicationsAdminList`, `announcementsAdminManager`, ...).
- `shared/lib/hooks/useResource.ts` — the small fetch-on-mount hook used across every manager
  component (guards against React's effect-purity rule while still refetching after mutations).
- `shared/data/agriminds.tsx` — all static marketing copy (pillars, roadmap, metrics, nav links,
  etc.) — unrelated to the platform above, still the place to edit homepage content.
- `shared/components/three/` — the animated Three.js hero/section backgrounds.

## Roles & permissions

- `super_admin` — full platform control: create/approve/suspend/archive chapters, assign chapter
  administrators, assign requirements, review submissions/updates/applications, send
  announcements.
- `chapter_admin` — manages only their assigned chapter (team, requirements progress, updates,
  documents, impact reports). Can never approve their own submissions.
- `chapter_member` — views the chapter dashboard; can act only where the chapter_admin has
  granted permission (`ChapterMembership.permissions`).
- `registered_user` — the default role on public registration. Can apply to join a chapter or
  propose a new one; gets no chapter-management access until approved.

Every protected action is enforced server-side in the route handlers (`shared/lib/auth/rbac.ts`)
regardless of what the UI shows — a hidden button is never the only protection. Privileged roles
are never selectable at registration; they're only ever granted by an admin action (assigning a
chapter admin, approving a join application, accepting an invitation).

## Testing the platform end to end

There's no automated test suite wired into `npm test` yet — the flows below were verified via a
scripted Playwright walkthrough during development (registration → login → role-based redirects
→ chapter creation → admin assignment → requirement assignment → evidence submission → review →
approval → public chapter page), covering both API-level checks (auth, RBAC boundaries,
privilege-escalation attempts) and full browser rendering of every dashboard page. To repeat
manually:

1. `npm run seed:admin`, then sign in at `/login`.
2. As super_admin: `/admin/chapters` → "New chapter" → open its detail page → assign an
   administrator by email (they must have registered first) → set status to Active and check
   "Public chapter page" → save.
3. Sign in as that assigned user (they'll land on `/dashboard/chapter` automatically) → fill in
   the chapter profile, add team members, and check the other tabs.
4. Back as super_admin, assign a requirement to the chapter from its detail page.
5. As the chapter admin, open Requirements, enter a value + evidence link, and submit for review.
6. As super_admin, approve it from the chapter detail page's "Submissions awaiting review".
7. Visit `/chapters` and `/chapters/<slug>` signed out — confirm the chapter appears and only
   approved/public content shows.

## Design system

- Palette (deep forest `--color-primary`, warm terracotta `--color-accent`, `--color-deep` for
  full-bleed dark sections, `--color-surface`/`--color-surface-card` for content backgrounds),
  the Ubuntu type family, and organic-blob/grain-texture utilities all live in `app/globals.css`
  as Tailwind v4 `@theme` tokens — the dashboard/admin UI reuses these same tokens rather than a
  separate admin-template palette.
- Photography is sourced from Unsplash via `images.unsplash.com` and from Cloudinary via
  `res.cloudinary.com` (see `IMAGES` in `shared/data/agriminds.tsx` and `next-cloudinary`'s
  `<CldImage>` usage in `shared/components/blog/`) — both hosts are allowed in
  `next.config.ts`.
- Above-the-fold content (hero) uses CSS-only entrance animation so it's never invisible while
  waiting on JavaScript; everything below the fold uses `framer-motion` scroll-reveal
  (`shared/components/molecules/fadeIn.tsx`).

## Brand assets

- `public/brand/images/agriminds_svg.svg` — the current AgriMinds wordmark, used everywhere
  (navbar, footer, `/links`, dashboard sidebar) — forced to pure white via a CSS `filter` where
  it sits over a dark background, and shown at full colour everywhere else.
- `public/brand/agriminds-logo-source.png`, `agriminds-mark.png`, `agriminds-icon.png`,
  `agriminds-badge.png` — an earlier "AEF" mark, kept only as the browser favicon
  (`app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`) for now.

If you get a higher-resolution or vector (SVG) version of the favicon mark later, regenerate
those three files from that instead of the current screenshot-resolution source.
