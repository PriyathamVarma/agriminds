# AI SEO and PageSpeed Change Checklist

This document is mandatory context for any AI agent changing the public AgriMinds website. Read it before editing, and complete the relevant checks before committing or pushing.

## Core rule

Every public page must be useful to people, understandable to search engines, crawlable, accessible, and fast. Do not optimize only for a Lighthouse score: preserve accurate content, clear navigation, and the existing AgriMinds design system.

## Before making changes

1. Read `AGENTS.md` and the relevant Next.js guidance in `node_modules/next/dist/docs/`.
2. Inspect the existing route, metadata, shared components, sitemap, robots rules, and related internal links.
3. Confirm whether the page is public and indexable. Never expose admin, dashboard, auth, API, or unfinished coming-soon routes to search.
4. Preserve the canonical production domain: `https://agriminds.org`.
5. Check the working tree first. Do not overwrite unrelated user changes.

## SEO requirements for every new or changed public page

### Metadata

- Add a unique, concise `title` containing the page subject and AgriMinds where appropriate.
- Add a useful, unique `description` that explains the page rather than repeating generic brand copy.
- Add `alternates.canonical` for the page's canonical route.
- Add `openGraph` and Twitter metadata when the page has a distinct share image or article identity.
- Use `generateMetadata` for dynamic chapter, blog, event, and video pages.
- Keep dates, authors, locations, claims, and organization names factually accurate.

### Content and structure

- Use one clear `h1` and logical `h2`/`h3` headings.
- Put the page's main subject, location, audience, and purpose in visible HTML text.
- Use descriptive anchor text such as “Vizag chapter” or “AgriMinds partner links,” not “click here.”
- Link new pages from a relevant existing page, the main navigation when appropriate, and the homepage or an index page when important.
- Add related-content links between chapters, blogs, videos, events, partners, and links pages.
- Avoid duplicate pages with near-identical text. Add unique local or event-specific information before indexing a new route.

### Crawlability and indexing

- Add important public routes to `app/sitemap.ts`.
- Keep `app/robots.ts` current and block private routes.
- Exclude unfinished or thin pages from the sitemap and use `robots: { index: false, follow: true }` where appropriate.
- Ensure internal links use real `<a>`/Next `Link` elements with valid URLs.
- Verify the page does not accidentally use `noindex`, require authentication, or depend on client-only content for its primary text.

### Structured data

Use the shared helpers in `shared/components/seo/jsonLd.tsx` and visible matching content.

- Organization and WebSite schema belong at the site level.
- BreadcrumbList must match the visible breadcrumb trail.
- Article schema requires accurate headline, description, image, publication date, author, publisher, and canonical page.
- VideoObject requires accurate `name`, `description`, `thumbnailUrl`, `uploadDate`, `embedUrl`, and `contentUrl` when available.
- Never invent dates, authors, metrics, partner relationships, or event details to satisfy a schema field.
- Keep JSON-LD valid JSON and render it server-side where possible.

## PageSpeed and accessibility requirements

### Images and LCP

- Use `next/image` for local raster images.
- Give every meaningful image descriptive `alt` text; use `alt=""` and `aria-hidden` for decorative images.
- Mark only the true above-the-fold LCP image as `priority`/`fetchPriority="high"`.
- Do not priority-load logos, below-the-fold galleries, or decorative backgrounds.
- Set an appropriate `sizes` value and avoid delivering an image substantially larger than its display size.
- Compress hero and gallery images, while preserving acceptable visual quality.
- Do not lazy-load the true LCP image; lazy-load below-the-fold media and YouTube iframes.

### JavaScript and rendering

- Keep homepage client components small and defer non-essential interactive features.
- Avoid importing heavy animation, chart, map, or Three.js code into the initial bundle unless it is visible and necessary above the fold.
- Use dynamic imports for heavy below-the-fold or interaction-only components when safe.
- Do not read `Date.now()`, random values, browser APIs, viewport size, or locale-dependent formatting during server-rendered initial output unless the result is deterministic.
- Hydration output must match between server and browser. Move live clocks, countdowns, and browser-only behavior into effects after a deterministic initial render.
- Avoid forced reflow patterns: do not read layout geometry immediately after mutating styles or the DOM; batch reads and writes with `requestAnimationFrame` when needed.

### Accessibility

- Every input, select, and textarea needs a visible `<label>` or an equivalent accessible name.
- Use semantic headings, landmarks, buttons, and links.
- Keep keyboard focus visible and preserve keyboard navigation.
- Check color contrast for text on both light and dark surfaces, including small uppercase labels.
- Give icon-only controls an accessible label and decorative icons `aria-hidden="true"`.
- Do not use motion or animated backgrounds as the only way to communicate meaning.

## Required validation before commit

Run from the repository root:

```bash
git diff --check
npm run lint
```

If a build is relevant, also run:

```bash
npm run build
```

If build failure is caused by external network access, report it clearly; do not claim the build passed.

For public SEO changes, verify the deployed response when possible:

```bash
curl -I https://agriminds.org/<route>
curl -s https://agriminds.org/sitemap.xml
curl -s https://agriminds.org/robots.txt
```

Then inspect the page source for the canonical URL, title, description, and JSON-LD. Use Google Search Console URL Inspection after deployment for important new or changed pages.

## PageSpeed review checklist

Run PageSpeed Insights for both mobile and desktop after deployment. Record:

- Performance score and LCP, FCP, CLS, TBT, and Speed Index.
- Accessibility score and every failing element.
- Best Practices and SEO scores.
- Image-delivery savings, render-blocking requests, unused JavaScript, forced reflow, and network dependency warnings.
- Browser console errors, hydration errors, and missing source maps.

Prioritize fixes in this order:

1. Broken functionality, hydration errors, and incorrect content.
2. Accessibility failures and poor LCP/image delivery.
3. Large unused JavaScript and render-blocking resources.
4. Secondary diagnostics such as legacy JavaScript and source maps.

Scores vary between runs. Do not trade readable content, accessibility, or correct SEO markup for a small score increase.

## Before push

- Review `git diff` and `git status`.
- Stage only files related to the requested change.
- Confirm no `.env`, credentials, generated secrets, or user changes are included.
- Commit with a clear message describing the outcome.
- Push only after lint and relevant validation complete.
- Report the commit hash, validation results, known warnings, and any remaining manual Search Console/PageSpeed steps.

## Current project references

- SEO roadmap: `docs/seo-implementation-plan.md`
- Shared structured data: `shared/components/seo/jsonLd.tsx`
- Breadcrumbs: `shared/components/seo/breadcrumbs.tsx`
- Sitemap: `app/sitemap.ts`
- Robots: `app/robots.ts`
- Production domain: `https://agriminds.org`
