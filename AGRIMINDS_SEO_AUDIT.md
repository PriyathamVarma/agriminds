# AgriMinds SEO & Technical Audit

Audit date: 8 October 2026  
Repository: `webapp-agriminds`  
Primary domain: `https://agriminds.org`  
Development domain supplied: `https://agriminds.netlify.app`

## Scope and evidence

This audit is based on the source tree, route files, metadata, JSON-LD helpers, sitemap, robots configuration, package configuration, and the existing PageSpeed/Search Console evidence supplied in the project context. A direct HTTP check of `agriminds.org` could not be completed from this environment because DNS resolution was unavailable. Production HTTP status, headers, deployed HTML, redirects, and Search Console coverage therefore remain explicitly unverified.

## A. Executive summary

AgriMinds has a solid SEO foundation: Next.js metadata is present, the site has a generated sitemap and robots file, canonical URLs are defined on the main public pages, Organization/WebSite/Breadcrumb/Article/Event/Video JSON-LD exists, and the site has dedicated pages for Vizag, events, chapters, blog content, partners, and the AgriTech Summit.

The highest-value remaining work is not adding more keywords. It is making the public information architecture complete and consistent, protecting private routes from indexing, strengthening local business/entity signals, improving event and article schema accuracy, and validating the deployed site with Search Console and real HTTP/Lighthouse checks.

### Top five actions

1. Verify production crawling, canonical tags, redirects, security headers, sitemap contents, and Search Console coverage after every deploy.
2. Add explicit noindex controls to private/auth route layouts and confirm that protected pages return redirects or authentication responses before content is rendered.
3. Improve local entity signals: consistent public organization details, a verified Google Business Profile only if eligible, a contact/location page, and links from genuine local partners.
4. Finish metadata and structured-data coverage for every public page, especially dynamic chapter pages, event registration details, article dates/images, and social cards.
5. Continue mobile performance work around the hero image, JavaScript bundles, CSS critical path, and third-party/client components; re-test with both Lighthouse and field data.

## B. SEO scorecard

Scores represent source-level readiness, not Google rankings. A score is only assigned where the repository provides evidence. Production-dependent categories are marked Not verified.

| Area | Score | Basis |
|---|---:|---|
| Technical SEO | 78/100 | Generated sitemap/robots and canonicals exist; deployed HTTP behavior is not verified. |
| On-page SEO | 78/100 | Main landing pages and recent articles have titles, descriptions, H1s, and internal links; coverage is uneven across dynamic routes. |
| Content quality | 82/100 | Original local/event content and useful problem-led articles exist; topic clusters and editorial governance can grow. |
| Local SEO readiness | 58/100 | Vizag location and chapter content exist; GBP eligibility, NAP consistency, public contact detail, and external citations are not verified. |
| Performance | 82/100 | Supplied PageSpeed evidence showed strong desktop scores and mobile performance around 89; current production results are not verified. |
| Mobile usability | Not verified | Requires current deployed-device testing. |
| Accessibility | 80/100 | Source uses semantic elements and labels in many areas; supplied Lighthouse evidence showed 96, but remaining contrast/label findings need verification after deploy. |
| Structured data | 78/100 | Organization, WebSite, Breadcrumb, Article, Event, and Video helpers exist; validation and event completeness remain. |
| Trust and credibility | 65/100 | Organization, partners, chapters, events, and authoring context exist; privacy/contact/editorial/about signals should be expanded. |

## C. Public route inventory

These routes are present in the source and intended to be public unless noted otherwise.

| URL | Purpose | Indexability | Source SEO status |
|---|---|---|---|
| `/` | Organization homepage | Index | Global metadata, Organization/WebSite JSON-LD; strong internal-link hub. |
| `/chapters` | Chapter directory | Index | Metadata and canonical present. |
| `/chapters/[slug]` | Public chapter detail | Conditional index | Dynamic metadata and canonical; database availability and unique chapter content require production verification. |
| `/chapters/vizag` | Vizag chapter | Intended index | Local chapter content and event links. |
| `/chapters/vizag/meets/ai-in-agri-future` | Vizag event recap | Index | Event metadata, Event JSON-LD, photos, local intent. |
| `/chapters/vijayawada` | Coming-soon chapter | Noindex | Correctly set `robots.index=false`. |
| `/chapters/kurnool` | Coming-soon chapter | Noindex | Correctly set `robots.index=false`. |
| `/chapters/tirupati` | Coming-soon chapter | Noindex | Correctly set `robots.index=false`. |
| `/blog` | Blog directory | Index | Metadata; date/category filters and 10-item pagination now exist. |
| `/blog/launch-event` | Launch story | Index | Article content and canonical. |
| `/blog/market-place` | Marketplace story | Index | Article JSON-LD and image. |
| `/blog/agripreneurship-in-vizag` | Local SEO guide | Index | Article JSON-LD, local keyword intent, internal links. |
| `/blog/agripreneurs-in-vizag` | Local SEO guide | Index | Article JSON-LD, local keyword intent, internal links. |
| `/blog/sustainable-agriculture-saameeripura` | Pilot story | Index | Article JSON-LD and sustainability topic cluster. |
| `/videos` | Video library | Index | VideoObject JSON-LD for current videos. |
| `/partners` | Partner information | Index | Metadata and public partnership intent. |
| `/links` | Social/link hub | Index | Canonical and metadata; keep useful public context. |
| `/team` | Team information | Index | Metadata; expand biographies and expertise where consented. |
| `/Agritech-summit-2026` | Hackathon/event landing page | Index | Event JSON-LD, problem statements, venue/date, canonical. |
| `/agritech-2026` | Legacy event URL | Redirect | Route redirects to the canonical summit URL. |
| `/coming-soon` | Placeholder | Noindex via robots | Confirm it is not linked from important public pages. |

Private or sensitive route families include `/admin`, `/dashboard`, `/api`, authentication pages, invitation acceptance, password reset, and unauthorized pages. Robots disallow many of these, but robots.txt is not an access-control mechanism. Authentication and server authorization must remain the control that prevents exposure.

## D. Detailed findings

### AGRI-001 — Production crawlability is not verified

- Severity: High
- Affected URL/file: `https://agriminds.org`, `app/robots.ts`, `app/sitemap.ts`
- Evidence: Local source generates robots and sitemap. Direct DNS/HTTP verification was unavailable in this audit environment.
- Why it matters: A correct source implementation can still be broken by deployment, redirects, CDN, DNS, or stale build output.
- Recommended fix: In Search Console URL Inspection, test `/`, `/blog`, `/chapters/vizag`, and `/Agritech-summit-2026`; inspect rendered HTML, canonical, indexability, and sitemap discovery after deploy.
- Effort: Small

### AGRI-002 — Private routes rely partly on robots disallow rules

- Severity: High
- Affected URL/file: `app/robots.ts`, `/admin`, `/dashboard`, `/api`, auth routes
- Evidence: Robots disallows private paths, while layouts also redirect based on session for admin/dashboard.
- Why it matters: Disallowed URLs can still be discovered; robots does not prevent indexing of known URLs or protect data.
- Recommended fix: Keep server-side auth as the control. Add `noindex, nofollow` metadata to private/auth layouts where appropriate, avoid sensitive content in unauthenticated HTML, and verify unauthenticated responses.
- Effort: Medium

### AGRI-003 — Dynamic chapter metadata needs production validation

- Severity: Medium
- Affected URL/file: `app/(site)/chapters/[slug]/page.tsx`
- Evidence: Metadata depends on a database record and uses a generic fallback when a record is missing.
- Why it matters: Empty, duplicate, or fallback metadata weakens local pages and can create indexable low-value URLs.
- Recommended fix: Ensure every public chapter has a unique name, city/state, description, canonical, H1, image alt text, and meaningful content. Return 404 for non-public records, as the page already does.
- Effort: Medium

### AGRI-004 — Event schema should be validated against actual registration state

- Severity: Medium
- Affected URL/file: `app/(site)/Agritech-summit-2026/page.tsx`, `shared/components/seo/jsonLd.tsx`
- Evidence: Event JSON-LD includes date, venue, organizer, status, and URL; registration and exact start/end time are not yet supplied.
- Why it matters: Incomplete or inaccurate event markup can prevent rich results or mislead users.
- Recommended fix: Add exact timezone-aware start/end times, registration URL, event image, and offer information only when confirmed. Validate in Rich Results Test and Search Console.
- Effort: Small

### AGRI-005 — Article images and social images are inconsistent

- Severity: Medium
- Affected URL/file: recent blog pages
- Evidence: Several new Article JSON-LD records currently reuse the hero image URL, while the Saameeripura article still needs its supplied field photograph added as a real public asset.
- Why it matters: Unique article imagery improves social previews, image search relevance, and content trust.
- Recommended fix: Store approved images in `public/brand` or the configured CDN, use descriptive filenames and alt text, and pass the same stable image to Open Graph and Article JSON-LD.
- Effort: Small per article

### AGRI-006 — Google Business Profile eligibility and setup are not verified

- Severity: Medium
- Affected area: Local SEO
- Evidence: The source contains Vizag/Visakhapatnam references, but no verified GBP profile or eligibility evidence was available.
- Why it matters: A GBP can support branded/local discovery only when the organization meets Google’s eligibility requirements and has a real-world presence or service-area basis.
- Recommended fix: Confirm eligibility first. If eligible, use one consistent name, category, phone, website, address/service area, hours, photos, and verification. Do not create duplicate listings or use a virtual office as a workaround.
- Effort: Medium

### AGRI-007 — Topic-cluster landing pages remain opportunities

- Severity: Medium
- Affected area: Information architecture
- Evidence: Existing coverage includes chapters, partners, blog, events, marketplace, and summit; dedicated pages for agripreneurship club, startup mentorship, food branding workshops, agricultural waste innovation, and farmer/FPO collaboration are not all present as standalone landing pages.
- Why it matters: Dedicated pages make search intent, internal linking, and conversion paths clearer.
- Recommended fix: Build only pages backed by real programmes or evidence. Suggested hierarchy: `/programmes/agripreneurship`, `/programmes/startup-mentorship`, `/programmes/fpo-collaboration`, `/events`, and `/knowledge/agricultural-waste-innovation`.
- Effort: Medium to large

### AGRI-008 — Blog filtering is client-side only

- Severity: Low
- Affected URL/file: `shared/components/blog/blogIndex.tsx`
- Evidence: Category/month filters and pagination use React state over a static in-memory list.
- Why it matters: Filter states are not independently crawlable URLs and cannot be shared or indexed as filtered collections.
- Recommended fix: Keep client filtering for usability, but use query parameters such as `?category=...&month=...` if shareable states are needed. Do not create indexable duplicate filter URLs without a canonical strategy.
- Effort: Small

### AGRI-009 — Performance gains should be revalidated after recent additions

- Severity: Medium
- Affected area: Homepage and new content
- Evidence: Supplied PageSpeed results previously showed desktop 98 and mobile around 89, with mobile LCP around 3.7 seconds and image/JavaScript opportunities. Recent additions include countdown/client components and new pages.
- Why it matters: New client code, images, and layout can change Core Web Vitals.
- Recommended fix: Re-run Lighthouse on mobile and desktop for `/`, `/blog`, `/chapters/vizag`, and the summit page. Prioritize hero image sizing/priority, client JavaScript, font loading, and cache headers. Separate lab results from CrUX field data.
- Effort: Medium

### AGRI-010 — Accessibility findings require a fresh verification pass

- Severity: Medium
- Affected area: Homepage, event page, forms
- Evidence: Supplied Lighthouse evidence showed accessibility 96 but identified select-label and contrast findings in an earlier run.
- Why it matters: Accessibility issues affect usability, compliance risk, and semantic understanding by search systems.
- Recommended fix: Re-test keyboard navigation, select labels, contrast, focus visibility, heading order, reduced motion, touch targets, and mobile overflow after the latest UI changes.
- Effort: Medium

## E. Keyword and content plan

Do not create one page for every keyword variation. Use topic clusters with natural language:

| Cluster | Primary page | Supporting content |
|---|---|---|
| Agripreneurship in Vizag | `/blog/agripreneurship-in-vizag` | Vizag chapter, meet recap, launch story, partnerships |
| Agripreneurs in Vizag | `/blog/agripreneurs-in-vizag` | Chapter page, events, founder/enterprise stories |
| Agritech events in Vizag | `/Agritech-summit-2026` and event pages | Blog event recaps, videos, partner links |
| Sustainable agriculture innovation | `/blog/sustainable-agriculture-saameeripura` | Pilot updates, measurement learnings, FPO stories |
| Agriculture startup support | Future programme landing page | Mentorship stories, partner pages, application CTA |
| FPO market access | Future collaboration landing page | Marketplace story, direct delivery problem statement |

Content should demonstrate first-hand experience, identify authors or the responsible organization, state dates and locations accurately, and link to evidence. Avoid repeating the same keyword in every heading.

## F. Local SEO and Google Business checklist

1. Confirm whether AgriMinds has a staffed, eligible public location or qualifies as a service-area organization.
2. Keep organization name, address, phone, email, website, and social profiles consistent everywhere.
3. Publish a contact/about page with appropriate public contact information and the Visakhapatnam location context.
4. Create or claim one GBP only if eligible; complete verification and use a precise primary category.
5. Add genuine photos of events, team, venue, and field activity with consent.
6. Ask real partners, participants, and institutions for honest mentions or reviews; never manufacture reviews or links.
7. Use Organization/LocalBusiness schema only for information actually visible and accurate on the site.

## G. Structured-data recommendations

Current helpers cover Organization, WebSite, BreadcrumbList, Article, Event, and VideoObject. Next improvements:

- Add stable `@id` values for organization and website entities.
- Add `dateModified` to articles when an article changes.
- Add `author` person profiles only when genuine author pages exist; otherwise the organization author is appropriate.
- Add Event `offers` and `url` only when registration is live and the information is accurate.
- Add `location.address` details only as publicly confirmed.
- Use FAQPage markup only for visible, genuine FAQ content and only where the intended search appearance is appropriate; FAQ markup does not guarantee a rich result.
- Validate JSON-LD using Rich Results Test and Schema Markup Validator after deployment.

## H. Recommended implementation order

### Sprint 1 — Verify and protect

- Production URL inspection, sitemap, robots, canonical, redirects, headers.
- Add private/auth noindex metadata and verify server protection.
- Resolve any stale or duplicate URLs.

### Sprint 2 — Local and event conversion

- Confirm GBP eligibility and publish consistent contact/location details.
- Add confirmed registration links and complete event schema.
- Add approved event/pilot photography with alt text and social metadata.

### Sprint 3 — Content clusters

- Publish programme pages only for active offerings.
- Build internal links between chapter, event, blog, partner, and summit pages.
- Add author/editor/date/update conventions.

### Sprint 4 — Performance and accessibility

- Re-run mobile/desktop Lighthouse and inspect CrUX when available.
- Optimize LCP images and client components.
- Resolve select-label, contrast, keyboard, focus, and mobile layout findings.

## I. Verification checklist before every SEO-related push

- [ ] Every new public page has a unique title, description, H1, canonical, and useful body content.
- [ ] Internal links use the final canonical URL and no accidental duplicate casing.
- [ ] New article/event pages are included in the sitemap.
- [ ] JSON-LD matches visible content and confirmed dates/locations.
- [ ] Private routes remain authenticated and are not exposed as indexable content.
- [ ] `git diff --check` passes.
- [ ] `npm run lint` passes without new warnings.
- [ ] Production URL Inspection is scheduled after deployment.
- [ ] PageSpeed is checked on both mobile and desktop for affected pages.

## Items not verified in this audit

- Google Search Console coverage, manual actions, indexed URL count, and enhancement reports.
- Google Business Profile ownership, eligibility, verification, reviews, and Maps presence.
- Live production HTTP status, redirect chain, response headers, cache behavior, and deployed HTML.
- Current Lighthouse/CrUX measurements after the latest deployment.
- Full broken-link crawl, keyboard-only review, screen-reader review, and cross-browser mobile testing.
- Competitor rankings, search volume, keyword difficulty, traffic, and backlink authority.
