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
- `/partners`
- `/links`

The main technical gaps are:

- ~~No sitemap route~~ (completed in Sprint 1)
- ~~No robots route~~ (completed in Sprint 1)
- ~~No JSON-LD structured data~~ (completed in Sprint 2)
- ~~No page-level canonical metadata~~ (completed for priority public routes in Sprint 1)
- ~~No shared breadcrumb component/schema~~ (completed in Sprint 2)
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

- Use `https://agriminds.org` as the metadata base
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

## Phase 3 — Chapter SEO — in progress

### Active chapter pages

Improved `app/(site)/chapters/[slug]/page.tsx` metadata so every active public chapter has:

- Unique location-aware title and meta description
- Canonical URL generated from the chapter slug
- Breadcrumbs and BreadcrumbList schema
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

## Phase 4 — Blog SEO — in progress

### Article content model — first pass complete

Blog index metadata now lives in `shared/data/blog.ts`, providing a CMS-ready starting point containing:

- `slug`
- `title`
- `description`
- `eyebrow`
- `author`
- `datePublished`
- `category`
- `location`

Add publication dates, updated dates, hero images, and tags as new articles are created.

### Article template — partially complete

Blog articles now show:

- Published date where known
- Author/organization attribution
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

### Content clusters — first internal-linking pass complete

Build internal links around these clusters:

- Chapter stories
- Farmer and FPO success stories
- Agri-enterprise events
- Market access and value addition
- Agri-tech and AI
- Andhra Pradesh regional chapters

The launch-event and marketplace articles now link to related chapters, stories, and videos. Active chapter pages also link back into the blog, videos, and chapter directory. Continue expanding these links as new content is published.

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

1. Verify `agriminds.org` in Google Search Console.
2. Submit `https://agriminds.org/sitemap.xml`.
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

- [x] `app/sitemap.ts`
- [x] `app/robots.ts`
- [x] Canonicals for public page templates
- [x] Improved root metadata and social preview image
- [ ] Search Console verification plan

### Sprint 2 — Structured data

- [x] Organization JSON-LD
- [x] WebSite JSON-LD
- [x] Breadcrumb component and schema
- [x] Article JSON-LD
- [x] VideoObject JSON-LD
- [ ] Validate with Google Rich Results Test

### Sprint 3 — Chapter and blog templates

- [x] Add article author/date fields where known
- [x] Add chapter metadata and breadcrumbs
- [x] Add related-content links
- [x] Add `noindex` to thin coming-soon pages
- [x] Include active chapters in sitemap

### Sprint 4 — Content and authority — in progress

- [ ] Publish 2–4 useful articles per month
- [x] Add related-content links between chapters, articles, and videos
- [x] Add a public partner directory with official outbound links
- [x] Add Picxy and GAME to the partner directory
- [x] Create a shared blog content taxonomy for article categories and locations
- [ ] Create local pages only when unique content exists
- [ ] Request partner backlinks using `docs/partner-outreach-seo-pack.md`
- [ ] Review Search Console queries and improve titles/descriptions

## Phase 5A — Next SEO growth programme

The technical foundation is strong. The next gains should come from original local content, trusted references, and consistent measurement rather than producing large volumes of generic articles.

### Priority 1 — Build substantive chapter pages

For each active chapter, add unique local information:

- City, district, and Andhra Pradesh agriculture context
- Chapter mission and local leadership
- Upcoming and past events
- Member, farmer, FPO, or enterprise stories
- Local impact metrics and photographs
- Contact, application, or chapter participation path

Keep Vijayawada, Kurnool, and Tirupati as `noindex` until they contain enough unique local content. Do not create location pages that differ only by city name.

### Priority 2 — Create content clusters

Publish useful, first-hand articles around:

- FPO development in Andhra Pradesh
- Agripreneurship in Vizag
- Farmer-to-enterprise journeys
- Agri-food marketplace events
- Value addition and food processing
- AI and technology in agriculture
- Rural entrepreneurship and market access

Each article should link to at least one relevant chapter, event, partner, video, and participation page where appropriate. Use real authors, dates, photographs, quotes, outcomes, and source information.

Recommended publishing pace: two genuinely useful articles per month, reviewed for accuracy before publication. Do not use AI to create large volumes of thin, search-first content.

### Priority 3 — Add local and event discovery signals

- Create or maintain an eligible Google Business Profile.
- Keep the organization name, address, phone, website, and social profiles consistent.
- Add `Event` structured data to confirmed public events with matching visible event details.
- Add local chapter and event information to relevant partner and community pages.
- Request legitimate links from event hosts, speakers, partners, institutions, and participating enterprises.

Prioritize relevant references from real organizations over generic directory submissions or purchased links.

### Priority 4 — Improve authority and trust

- Add clear author or organization attribution to articles.
- Link author names to real profile or team pages where useful.
- Document how event numbers, impact metrics, and claims were collected.
- Add an About, contact, and organization information path that is easy to find.
- Use original photographs and first-hand reporting for events and community stories.
- Keep partner descriptions factual and avoid implying endorsements that do not exist.

### Priority 5 — Improve titles and click-through rate

Review pages with high impressions and low click-through rate in Search Console. Prefer specific titles such as:

- `AgriMinds Vizag Chapter | Agriculture Entrepreneurship Network`
- `Market Place Vizag | 23 Agri Enterprises and 1,500 Visitors`
- `AgriMinds Partners | Agriculture and Rural Enterprise Ecosystem`
- `AgriMinds Videos | Farmers, Events, and Agri-Enterprise Stories`

Titles must remain accurate and readable. Do not add keywords that are not supported by the page content.

### Priority 6 — Video and image SEO

- Add a written summary, date, event, location, and participants below each video embed.
- Keep every `VideoObject` upload date, thumbnail, URL, and description accurate.
- Use descriptive image filenames and useful alt text.
- Serve compressed WebP/AVIF images at an appropriate display size.
- Use event and location context naturally in captions and surrounding text.

### Priority 7 — Measurement and monthly review

Review Search Console monthly and after major content releases:

- Indexed pages and excluded pages
- Impressions, clicks, CTR, and average position by URL
- Queries containing AgriMinds, Vizag, Andhra Pradesh, chapters, FPOs, and events
- Pages marked `Crawled — currently not indexed`
- Structured-data enhancements and errors
- Core Web Vitals and mobile usability
- Chapter applications, event registrations, partner enquiries, and WhatsApp joins

The primary business outcomes are qualified participation, partnerships, and community growth—not traffic alone.

## Next sprint sequence

### Sprint 5 — Chapter and local SEO

- [x] Expand the Vizag meet page with unique local content and evidence
- [x] Target the natural phrase “Agripreneur Meet in Vizag” in the Vizag meet metadata and heading
- [x] Add Event schema to the completed Vizag agripreneur meet
- [ ] Confirm indexing and metadata for the Vizag chapter
- [ ] Keep Vijayawada, Kurnool, and Tirupati noindex until substantive content exists
- [ ] Add confirmed upcoming event data and validate Event schema

### Sprint 6 — Original content programme

- [ ] Publish two original farmer/FPO or enterprise case studies
- [ ] Add real author, date, location, image, and related links
- [ ] Connect each article to chapters, events, videos, and partners
- [ ] Add article entries to the sitemap automatically through the content model

### Sprint 7 — Authority and distribution

- [ ] Prepare partner-specific outreach using `docs/partner-outreach-seo-pack.md`
- [ ] Request relevant links from event hosts and participating organizations
- [ ] Publish LinkedIn summaries that link back to the canonical website articles
- [ ] Record referral traffic and assisted conversions in analytics

### Sprint 8 — Review and optimization

- [ ] Export Search Console query and page data
- [ ] Improve titles/descriptions for high-impression, low-CTR pages
- [ ] Validate all structured data in the Rich Results Test
- [ ] Re-run mobile and desktop PageSpeed tests
- [ ] Fix any new crawl, accessibility, hydration, or Core Web Vitals issues

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
