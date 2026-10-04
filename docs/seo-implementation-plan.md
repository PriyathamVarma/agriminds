# AgriMinds SEO Implementation Plan

## Goal

Make AgriMinds’ important pages independently discoverable in search, especially:

- Public chapters and chapter locations
- Blog articles and event stories
- Videos and event coverage
- The AgriMinds organization and its regional presence

The primary outcome is not only ranking for “AgriMinds”, but also appearing for useful searches such as “agriculture entrepreneurship network in Vizag”, “FPO support in Andhra Pradesh”, and “agripreneurship events in Visakhapatnam”.

## Current state

The site already has useful indexable content:

- `/chapters`
- `/chapters/[slug]`
- `/chapters/vizag/meets/ai-in-agri-future`
- `/blog`
- `/blog/launch-event`
- `/blog/market-place`
- `/videos`
- `/links`

The main technical gaps are:

- ~~No sitemap route~~ (completed in Sprint 1)
- ~~No robots route~~ (completed in Sprint 1)
- No JSON-LD structured data (Sprint 2 in progress)
- ~~No page-level canonical metadata~~ (completed for priority public routes in Sprint 1)
- No shared breadcrumb component/schema (Sprint 2 in progress)
- Blog metadata does not include author, published date, or updated date
- Chapter pages are not yet represented in a deliberate sitemap/indexing strategy
- Coming-soon pages are thin and should not be indexed yet

## Phase 1 — Technical SEO foundation

### 1. Add sitemap — complete

Create `app/sitemap.ts` using Next.js metadata routes.

Include:

- Homepage
- `/chapters`
- Public active chapter URLs from the database
- Published chapter-meet pages
- `/blog`
- Every published blog article
- `/videos`
- `/links`

Do not include:

- `/admin/**`
- `/dashboard/**`
- `/login`
- `/register`
- `/coming-soon`
- `/chapters/vijayawada`
- `/chapters/kurnool`
- `/chapters/tirupati`

The three upcoming chapter pages should be excluded until they contain substantial location-specific content.

### 2. Add robots.txt — complete

Create `app/robots.ts`.

Rules:

- Allow public website routes
- Disallow `/admin/`, `/dashboard/`, `/api/`, `/login`, `/register`, and password flows
- Point to `https://agriminds.in/sitemap.xml`

### 3. Add canonical URLs — complete for priority routes

Use `alternates.canonical` in `metadata` or `generateMetadata` for all public page templates.

Canonical URL policy:

- Use `https://agriminds.in` as the metadata base
- Keep one canonical URL per chapter and article
- Avoid query-string URLs as canonicals
- Keep trailing-slash behavior consistent

### 4. Improve global metadata — complete

Update `app/layout.tsx` with:

- Better default title template: `%s | AgriMinds`
- Default Open Graph image
- Twitter card metadata
- `metadataBase`
- Consistent `applicationName`

The existing `public/brand/images/hero-banner.webp` is currently used as the social preview image. A dedicated SEO social card can replace it later.

## Phase 2 — Structured data

Create reusable JSON-LD helpers in `shared/components/seo/` or `shared/lib/seo/`. **In progress:** implemented in `shared/components/seo/jsonLd.tsx` and `shared/components/seo/breadcrumbs.tsx`.

### Organization schema

Added to the root layout so the public site exposes the organization identity.

Recommended properties:

- `@type: Organization`
- `name`
- `url`
- `logo`
- `description`
- `sameAs` for LinkedIn, Instagram, X, YouTube, and other official profiles
- `email`
- `telephone` if publicly available

Google recommends Organization structured data to help disambiguate an organization and its brand details. See: <https://developers.google.com/search/docs/appearance/structured-data/organization>

### WebSite schema

Added to the root layout with:

- Site name: AgriMinds
- Official URL

### BreadcrumbList schema

Added visible breadcrumbs and matching JSON-LD to blog articles, chapter detail pages, and the videos page. Extend to future event pages.

- Chapter detail pages
- Blog article pages
- Event pages
- Video page if it gains subpages

Examples:

- Home → Chapters → Vizag
- Home → Blog → Market Place
- Home → Chapters → Vizag → AI in Agriculture Meet

### Article schema

Added to the marketplace article. Add to the launch article once its real publication date and author are confirmed.

- `headline`
- `description`
- `image`
- `datePublished`
- `dateModified`
- `author`
- `publisher`
- `mainEntityOfPage`

Do not add article schema until the article has real author and date values.

### VideoObject schema

Added to `/videos` for both current YouTube videos and future individual video pages.

- `name`
- `description`
- `thumbnailUrl`
- `uploadDate` when known
- `embedUrl`
- `contentUrl` when available

Only publish dates and thumbnails that are factually known.

## Phase 3 — Chapter SEO

### Active chapter pages

Improve `app/(site)/chapters/[slug]/page.tsx` so every active public chapter has:

- Unique title: `{Chapter} | AgriMinds`
- Unique meta description
- Canonical URL
- Breadcrumbs
- City, district, and state in visible text
- Chapter mission
- Leadership and team
- Local impact metrics
- Upcoming events
- Past events and gallery
- Public contact or join action
- Links to related blog articles and meets

### Chapter title patterns

Examples:

- `AgriMinds Vizag Chapter | Agriculture Entrepreneurship Network`
- `AgriMinds Vijayawada Chapter | Coming Soon`

Avoid generating many pages with identical text. A chapter page should not be indexable until it has enough unique local content.

### Upcoming chapter pages

For `/chapters/vijayawada`, `/chapters/kurnool`, and `/chapters/tirupati`:

- Keep them available for users
- Add `robots: { index: false, follow: true }` while content is minimal
- Remove `noindex` once each page has a local lead, mission, contact path, events, or other substantive content

## Phase 4 — Blog SEO

### Article content model

Move blog article metadata into a shared data structure or CMS-ready model containing:

- `slug`
- `title`
- `description`
- `eyebrow`
- `author`
- `datePublished`
- `dateModified`
- `heroImage`
- `category`
- `location`
- `tags`

### Article template

Update blog articles to show:

- Published date
- Updated date when applicable
- Author
- Location/event context
- Featured image alt text
- Related articles
- Breadcrumbs
- Social sharing metadata

### Search-oriented article titles

Prefer specific titles over purely branded titles.

Example:

`Agri Marketplace in Vizag Connects 23 FPOs and Agri Enterprises with 1,500 Visitors`

The page can still use a more editorial headline visually, but the metadata title and description should communicate the search intent clearly.

### Content clusters

Build internal links around these clusters:

- Chapter stories
- Farmer and FPO success stories
- Agri-enterprise events
- Market access and value addition
- Agri-tech and AI
- Andhra Pradesh regional chapters

Every article should link to at least one related chapter and one related article where relevant.

## Phase 5 — Local and authority signals

Set up and maintain:

- Google Search Console
- Google Business Profile, if eligible
- Consistent organization name, address, phone, and website
- Official social profile links in Organization schema
- Partner backlinks from RTIH, World Bank programs, AP MSME, RAMP, universities, and event partners
- Event and press coverage pages with links back to relevant chapters

Prioritize real partner and local institution links over generic directory submissions.

## Phase 6 — Measurement

### Search Console setup

1. Verify `agriminds.in` in Google Search Console.
2. Submit `https://agriminds.in/sitemap.xml`.
3. Inspect the homepage, `/chapters`, `/chapters/vizag`, and both published blog articles.
4. Request indexing for newly published priority pages.

### Monthly metrics

Track:

- Indexed pages
- Impressions by URL
- Click-through rate
- Queries containing “AgriMinds”
- Chapter/city queries
- Blog/article queries
- Average position
- Crawl errors
- Core Web Vitals
- Rich-result enhancements

## Implementation order

### Sprint 1 — Technical foundation

- [ ] `app/sitemap.ts`
- [ ] `app/robots.ts`
- [ ] Canonicals for public page templates
- [ ] Improved root metadata and social preview image
- [ ] Search Console verification plan

### Sprint 2 — Structured data

- [ ] Organization JSON-LD
- [ ] WebSite JSON-LD
- [ ] Breadcrumb component and schema
- [ ] Article JSON-LD
- [ ] VideoObject JSON-LD
- [ ] Validate with Google Rich Results Test

### Sprint 3 — Chapter and blog templates

- [ ] Add article author/date fields
- [ ] Add chapter metadata and breadcrumbs
- [ ] Add related-content links
- [ ] Add `noindex` to thin coming-soon pages
- [ ] Include active chapters in sitemap

### Sprint 4 — Content and authority

- [ ] Publish 2–4 useful articles per month
- [ ] Create local pages only when unique content exists
- [ ] Request partner backlinks
- [ ] Review Search Console queries and improve titles/descriptions

## Definition of done

SEO implementation is complete when:

- `/sitemap.xml` returns all intended public URLs
- `/robots.txt` allows public content and blocks private routes
- Every indexable chapter and article has a canonical URL
- Organization, WebSite, BreadcrumbList, Article, and VideoObject schemas validate where applicable
- Thin coming-soon pages are excluded from indexing
- Search Console has been verified and the sitemap submitted
- The priority pages have been inspected in Search Console
- No private/dashboard/admin URL appears in the sitemap
- Titles and descriptions are unique across chapters and articles
- Every priority page has at least one relevant internal link from another public page

## References

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google Search appearance and structured data](https://developers.google.com/search/docs/appearance)
- [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
