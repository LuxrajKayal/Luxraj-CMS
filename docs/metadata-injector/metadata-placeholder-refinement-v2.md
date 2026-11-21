# Luxraj CMS — Refined SEO Metadata Placeholder Matrix v2
**Planning scope:** 12 chosen website categories; 294 registered boilerplate entries (Blog has 28 owner-selected entries, other 266 are proposed).
**Date:** 21 November 2026  |  **Status:** Research refinement for owner review, NOT implementation authorization.
**Companion machine-readable file:** `Luxraj_CMS_All_12_Categories_294_Page_Metadata_Placeholder_Matrix_v2_refined.json`  |  **Original preserved:** `Luxraj_CMS_All_12_Categories_294_Page_Metadata_Placeholder_Matrix_v1.json` (SHA-256 `72ff895f76466b108461094468630be3a2d8767082b4d71802b96c626cd25c44`).

> This refinement answers **what metadata is appropriate and when it becomes populated/publish-ready**, not the mechanics of injecting/merging HTML. No GitHub or Supabase changes are made. The complete approved Blog catalog remains preserved; fields that are conditionally appropriate are not removed or silently disabled.

## 1. Outcome and non-negotiable design
A properly populated page can be eligible for Google indexing/ranking when search technical requirements and content requirements are met. Metadata/Schema.org improves description and potential supported rich-result eligibility, not a guarantee of indexing, rich results, or rank.
The current registry is detected only from manually inserted `<html>` attributes:
```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="BlogPosting">
```
**Never** automatically choose/insert those attributes. A recognized category plus an exact page-type key select the category-specific metadata plan; it does not prove page content or rich-result eligibility.

## 2. Three different meanings of “required”
| Term | Meaning | Never confuse with |
|---|---|---|
| **CMS baseline recommended** | Fields normally useful for a public, indexable page (unique title, meaningful description, correct canonical) | A Google indexing prerequisite |
| **Optional/conditional** | Included in the approved catalog, used only when real data/context is present (robots override, hreflang, RSS, OG extras, ratings) | A missing error on every page |
| **Feature-required** | Required by a specific current Google rich-result/merchant feature after that feature is explicitly targeted | A requirement for ordinary search rankings |

## 3. Explicit core-field policy — retain all 11 approved Blog definitions
| Field | Activation tier | Practical rule |
|---|---|---|
| `core.page_id` | `identity_reserved` | The permanent Page ID definition is retained; the HTML meta name is undecided. Do not invent an additional ID. |
| `core.seo_title` | `baseline_recommended` | Provide unique human-reviewed title that corresponds to visible content; preserve existing title. |
| `core.seo_description` | `baseline_recommended` | Provide useful, page-specific summary; search engines may choose other snippet text. |
| `core.canonical_url` | `baseline_recommended` | Canonical must be an absolute public preferred URL consistent with redirects and internal links; canonical is a hint. |
| `core.html_lang` | `preserve_or_conditional` | Preserve an existing document language; validate its BCP47 form, only default en when legitimately English and absent. |
| `core.charset` | `preserve_or_conditional` | Preserve existing charset; supply appropriate UTF-8 declaration only when missing and document encoding is UTF-8. |
| `core.robots_directives` | `conditional_maintainer_decision` | Do not guess noindex/index/nofollow or imply an indexing preference; maintain existing rules. |
| `core.googlebot_directives` | `conditional_maintainer_decision` | Only if Googlebot-specific behavior is deliberately required; no speculative directives. |
| `core.google_site_verification` | `conditional_site_configuration` | Use only verified genuine site property token, typically a site-level concern, never a per-page default. |
| `core.hreflang_code` | `conditional_real_alternates` | Only for real localized equivalents with accurate return/self references and absolute URLs; no fictitious languages. |
| `core.rss_feed_url` | `conditional_real_feed` | Only where an actual discoverable RSS feed exists, not on unrelated pages merely because the field is retained. |

**Crucial:** the permanent Page ID HTML meta name remains undecided. It must **not** be invented in v2; retain one `{{PAGE_ID}}` and keep it distinct from graph `@id` entity IDs and canonical URLs.

## 4. Social metadata applicability
The **full 25-property Blog OG catalog** and all six `twitter:` fields remain available; this refined applicability is not deletion or automatic suppression.
- OG core `og:title`, `og:type`, `og:url`, `og:description` are recommended for genuinely public shareable pages. `og:image` is part of the four fundamental OGP properties and should be a **real accessible image**; absent image => incomplete social preview, not a fabricated URL.
- `og:type` is mapped from the registered page type using **Open Graph vocabulary**, not Schema.org text. `article:*` extensions only for suitable articles; `profile:*` only for actual person profile pages. `og:image:url` is an alias of `og:image` and must not point to a different picture.
- Image dimensions, alternate locales, tags, publisher-related OG extensions and similar extras are conditional on real data. `og:locale:alternate` is not a substitute for real hreflang-linked pages.
- All six selected X/Twitter tags remain in the catalog. Card type, image URL and `twitter:site` remain placeholders until genuine values are supplied. They are not Google ranking requirements.

## 5. Nested Schema.org graph contracts — exact relationships, no invented nodes
An `@id` is the identity of a graph entity, **not** another permanent Page ID. A `WebPage` (or page subtype) and its main `Product`, `Course`, `Article`, `Book`, `Hotel`, etc. may be **separate nodes**. Every `@id` reference must resolve consistently.
**Recommended identity plan for later approval:** once the genuine public canonical URL is known, assign a consistent `#webpage` suffix for the page node and different type-specific fragments (e.g. `#product`, `#course`, `#article`) for main entities. A `WebSite` node should have one stable identity anchored to the actual site home, not a different per-page site ID. These are naming conventions in planning, not an instruction to infer URLs automatically.

| Relationship | Only activate when | Required when activated / safety |
|---|---|---|
| `WebPage/ItemPage/CollectionPage → mainEntity → registry main entity` | page node and verified primary content entity | page.@id, entity.@id, matching referenced @id; The primary entity must actually be the subject; never attach a mismatched Product or Course. |
| `WebPage → isPartOf → WebSite` | public webpage with known parent site | site canonical identity, same WebSite @id across same site; Use the origin/known site home identity, not a fresh WebSite @id per page. |
| `Article family → author → Person/Organization` | actual identifiable author listed on article | real author name, real author node or a coherent inline object; Do not invent an author; article author and Person node IDs must agree. |
| `Article family → publisher → Organization/Person` | genuine publishing organization/person exists | real publisher identity; Only use public identifiable publisher, not fabricated logo or corporate identity. |
| `Product → offers → Offer` | actual sellable offer available and advertised | Product identity, Offer identity or nested object, real active price, valid currency; Real listing data only; a product *review* need not assert an offer. |
| `Product → review/aggregateRating → Review/AggregateRating` | real displayed user or editorial reviews and ratings | real rating count/value if aggregated, actual itemReviewed relationship; Never manufacture rating/review counts; follow Google self-serving review restrictions. |
| `ProductGroup → hasVariant → Product` | there are factual variants with explicit variant properties | variant-specific identity, isVariantOf or consistent ProductGroup; Do not confuse separate product pages with variants automatically. |
| `Course → provider → Organization/Person` | real institution/teacher providing the course | real provider identity; Provider is not inferred from website category. |
| `Course → hasCourseInstance → CourseInstance` | a real scheduled or modality-specific course offering exists | real instance identity, real mode/date if claimed; Do not invent a class session for an on-demand course. |
| `ItemList → itemListElement → ListItem → Course` | page visibly lists at least 3 distinct real courses and course list feature is requested | 3 or more distinct items, positions, unique canonical URLs, real course name and description; No synthetic filler courses or bogus list items. |
| `Review → itemReviewed → Book/Product/Service/Movie/etc` | a real review of a specific item | actual subject type, name and stable identity; Book review must reference Book, not a second unrelated Review. |
| `Hotel → address → PostalAddress` | hotel is a public physical place | actual address locality/country and available street/region/ZIP; Use authentic address; do not fabricate stars, offers, or amenities. |
| `Hotel → amenityFeature → LocationFeatureSpecification` | specific verified amenity exists | amenity name, real boolean or value; No blanket amenity assumptions, false Wi-Fi or pool claims. |
| `Event/EducationEvent → location → Place/VirtualLocation` | Event is genuine main entity | event name, actual startDate, real location or virtual access; Event announcements/articles not automatically event rich result pages. |
| `WebPage → breadcrumb → BreadcrumbList` | visible navigational breadcrumb trail exists | real ordered ListItems, real page URLs; Do not invent breadcrumbs from filesystem paths. |
| `WebPage/VideoGallery → mainEntity/video → VideoObject` | visible playable video exists | real video name, real thumbnail, real uploadDate; A VideoGallery needs actual child videos; a generic gallery does not warrant a single fictitious video. |
| `ImageGallery/WebPage → image → ImageObject` | real discoverable images exist | real image URL, real alt/title when available; Do not invent an ImageObject for an absent image. |
| `DiscussionForumPosting → comment → Comment` | real public discussion comments exist | actual body and author of public comment; Do not publish private user data or fabricate interaction counts. |

**Additional nested property profiles:** `PostalAddress`, `AggregateRating`, `Rating`, `ListItem`, `Brand`, `Answer`, and `LocationFeatureSpecification` are explicitly defined in the companion JSON as supporting property groups, without forcing them onto pages that lack their real-world objects. Each of the 294 entries also contains conditional `nested_node_blueprints` with explicit parent property, target type, field placeholders, and evidence requirements.

## 6. Current search feature requirements (conditional on target feature)
These rules were researched from official Google documentation as of this revision. They are **feature-specific**. They do not replace or remove the broader Schema.org catalogs.
### Article
- **Applies to candidate schema types:** `Article`, `BlogPosting`, `TechArticle`, `NewsArticle`, `OpinionNewsArticle`, `LiveBlogPosting`, `AnalysisNewsArticle`, `ReportageNewsArticle`, `BackgroundNewsArticle`, `ScholarlyArticle`.
- **Feature gates:**  No mandatory properties for this feature per current guidance.
- **Recommended when factual:** `headline`, `author`, `datePublished`, `dateModified`, `image`, `publisher`, `mainEntityOfPage`.
- **Evidence:** real article, real author, actual dates, real image.
- **Boundary:** Google Article structured-data guide explicitly says it has no required properties; list is recommended when applicable.
- **Official source:** [google_article](https://developers.google.com/search/docs/appearance/structured-data/article).

### Merchant Listing
- **Applies to candidate schema types:** `Product`, `ProductGroup`.
- **Feature gates:** `Product.name`; `Product.image`; `Product.offers.Offer.price`; `Product.offers.Offer.priceCurrency`.
- **Recommended when factual:** `Product.brand`, `Product.sku`, `Product.offers.Offer.availability`, `Product.offers.Offer.url`, `Product.offers.Offer.itemCondition`.
- **Evidence:** seller is actually selling the product, active price and ISO currency, real offer and displayed product image.
- **Boundary:** Only for genuine merchant selling offers. The official guide has additional contextual requirements; consult before claiming feature eligibility.
- **Official source:** [google_merchant](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

### Product Snippet
- **Applies to candidate schema types:** `Product`, `ProductGroup`.
- **Feature gates:** `Product.name`; `ONE_OF(Product.review, Product.aggregateRating, Product.offers)`.
- **Recommended when factual:** `Product.image`, `Product.description`, `Product.brand`, `Product.offers.priceCurrency`.
- **Evidence:** a real reviewed product and/or a real offer, authentic visible ratings only.
- **Boundary:** Product-snippet eligibility differs from merchant listing, no forced fake reviews/offers.
- **Official source:** [google_product_snippet](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

### Course List
- **Applies to candidate schema types:** `Course`, `ItemList`.
- **Feature gates:** `AT_LEAST_THREE_DISTINCT_VISIBLE_COURSES`; `Course.name`; `Course.description`; `ItemList.itemListElement[].position`; `ItemList.itemListElement[].url`.
- **Recommended when factual:** `Course.provider`.
- **Evidence:** at least three real courses listed with unique canonical URLs.
- **Boundary:** A single Course detail is not by itself a complete Course-list feature; separate list and page roles.
- **Official source:** [google_course_list](https://developers.google.com/search/docs/appearance/structured-data/course).

### Video
- **Applies to candidate schema types:** `VideoObject`.
- **Feature gates:** `VideoObject.name`; `VideoObject.thumbnailUrl`; `VideoObject.uploadDate`.
- **Recommended when factual:** `VideoObject.contentUrl`, `VideoObject.embedUrl`, `VideoObject.duration`.
- **Evidence:** actual accessible video thumbnail, real upload date and video URL.
- **Boundary:** Video feature readiness needs real video availability and a valid thumbnail, not an empty VideoObject.
- **Official source:** [google_video](https://developers.google.com/search/docs/appearance/structured-data/video).

### Event
- **Applies to candidate schema types:** `Event`, `EducationEvent`.
- **Feature gates:** `Event.name`; `Event.startDate`; `Event.location`.
- **Recommended when factual:** `Event.endDate`, `Event.image`, `Event.description`, `Event.offers`, `Event.organizer`, `Event.eventStatus`.
- **Evidence:** real event with real time and venue/online location.
- **Boundary:** An announcement *about* an event is not necessarily an event detail page; apply only when Event is its actual main entity.
- **Official source:** [google_event](https://developers.google.com/search/docs/appearance/structured-data/event).

### Review
- **Applies to candidate schema types:** `Review`.
- **Feature gates:** `Review.itemReviewed`; `Review.author`; `Review.reviewRating WHEN_RATING_CLAIMED`.
- **Recommended when factual:** `Review.reviewBody`, `Review.datePublished`.
- **Evidence:** genuine specific thing being reviewed, real visible score if provided.
- **Boundary:** Feature restrictions differ by item type; never fabricate stars or self-serving local-business review markup.
- **Official source:** [google_review](https://developers.google.com/search/docs/appearance/structured-data/review-snippet).

### Software App
- **Applies to candidate schema types:** `SoftwareApplication`, `WebApplication`, `MobileApplication`.
- **Feature gates:** `SoftwareApplication.name`; `SoftwareApplication.offers.Offer.price`; `ONE_OF(SoftwareApplication.aggregateRating, SoftwareApplication.review)`.
- **Recommended when factual:** `SoftwareApplication.applicationCategory`, `SoftwareApplication.operatingSystem`, `SoftwareApplication.description`, `SoftwareApplication.image`.
- **Evidence:** actual app, compatibility, offer/rating details.
- **Boundary:** Do not assert search enhancement eligibility merely by applying SoftwareApplication @type. Verify current guide.
- **Official source:** [google_software](https://developers.google.com/search/docs/appearance/structured-data/software-app).

### Special feature limitations
- **FAQPage:** Google FAQ rich results generally appear only for well-known, authoritative government and health websites. Using FAQPage on an ordinary blog is not a promise of FAQ rich results.
- **HowTo:** valid Schema.org type, but Google no longer provides How-to rich results.
- **SearchAction:** keep the original approved S40 capability, but Google removed the sitelinks search box visual feature in November 2024.
- **Hotel:** Hotel structured data describes a hotel but does not automatically qualify a page for a dedicated Google hotel rich result; specific travel/vacation rental experiences have additional partner eligibility.

## 7. Search-ready checks after SEO placeholder filling
**Stage A – registry**: exact manual category/type matches; no automatic type inference, no Category 02–12 proposal treated as owner approved.
**Stage B – schema template**: each enabled property belongs to correct node and has a legitimate relation; catalog retained; no invented data or detached nested IDs.
**Stage C – populated HTML/JSON-LD**: page title, summary, canonical and social metadata accurate; real URLs, dates, images, prices, currencies, authors and locations; no unresolved `{{...}}` tokens publicly served; valid JSON-LD and unique graph IDs; no duplicate/conflicting metadata; structured data matches visible content.
**Stage D – deployed URL**: crawlable and working HTTP response, indexable public content, no accidental `noindex` or robots blockage, correct canonical/hreflang, Rich Results Test if a supported feature is targeted, Search Console URL Inspection if available. A successful result still gives no rank/appearance guarantee.
**No automatic silent disabling:** If unfinished placeholder markup would go public, flag the page as **not SEO-ready**, preserve the approved catalog, and require explicit human resolution. The exact publication gate is a later implementation decision.

## 8. Four representative sample checks
### BlogPosting article
- **Coverage:** Core title/description/canonical + relevant OG article + X fields + BlogPosting article and real author/Publisher nodes.
- **Assessment:** Strong foundation for normal indexable article.
- **Must verify:** Date, author identity, image, canonical and graph references must match actual publication.

### E-commerce Product
- **Coverage:** Core + OG + Product, conditional Offer and review/rating branches.
- **Assessment:** Strong foundation for product pages; rich-merchant feature requires extra genuine fields.
- **Must verify:** If seller markets product: real Product.name/image, nested Offer.price and priceCurrency; avoid invented reviews.

### Education Course
- **Coverage:** Core + Course.name/description/provider + optional CourseInstance and course collection ItemList.
- **Assessment:** Good for normal course detail.
- **Must verify:** Course-list feature needs at least three distinct courses + linked ItemList; no invented instances.

### Travel Hotel
- **Coverage:** Core + Hotel node and real PostalAddress/amenities with optional offers.
- **Assessment:** Good for ordinary hotel discovery and understanding.
- **Must verify:** No generic hotel rich-result entitlement; address and amenities must be true; no false booking availability.

## 9. Complete 294-entry applicability index
This index is generated from the **actual v1 JSON**. The full field-by-field policies for every entry are in v2 JSON under `page_type_entries[].refined_metadata_plan`. Counts are planned candidates, **not a claim that every property should be injected**.
### Blog & Publishing — `blog` (28 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 01-01 | Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 01-02 | Blog Main Page | `Blog` | `WebPage` / `Blog` | `website` | — |
| 01-03 | Category Page | `blog-category` | `CollectionPage` / `ItemList` | `website` | — |
| 01-04 | Tag Page | `blog-tag` | `CollectionPage` / `ItemList` | `website` | — |
| 01-05 | Archive Page | `blog-archive` | `CollectionPage` / `ItemList` | `website` | — |
| 01-06 | About Page | `AboutPage` | `AboutPage` / `none` | `website` | — |
| 01-07 | Contact Page | `ContactPage` | `ContactPage` / `none` | `website` | — |
| 01-08 | Author Profile | `ProfilePage` | `ProfilePage` / `Person` | `profile` | — |
| 01-09 | General / Static Page | `WebPage` | `WebPage` / `none` | `website` | — |
| 01-10 | General Article | `Article` | `WebPage` / `Article` | `article` | article |
| 01-11 | Blog Post | `BlogPosting` | `WebPage` / `BlogPosting` | `article` | article |
| 01-12 | Technical Article | `TechArticle` | `WebPage` / `TechArticle` | `article` | article |
| 01-13 | News Article | `NewsArticle` | `WebPage` / `NewsArticle` | `article` | article |
| 01-14A | General Opinion / Editorial | `opinion-editorial` | `WebPage` / `Article` | `article` | article |
| 01-14B | News Opinion / Editorial | `OpinionNewsArticle` | `WebPage` / `OpinionNewsArticle` | `article` | article |
| 01-15 | Live Blog | `LiveBlogPosting` | `WebPage` / `LiveBlogPosting` | `article` | article |
| 01-16 | Tutorial / How-to | `HowTo` | `WebPage` / `HowTo` | `article` | — |
| 01-17 | Review | `Review` | `WebPage` / `Review` | `article` | review |
| 01-18 | Book Information / Details | `Book` | `WebPage` / `Book` | `book` | — |
| 01-19 | Book Review | `book-review` | `WebPage` / `Review` | `article` | review |
| 01-20 | FAQ Page | `FAQPage` | `FAQPage` / `Question` | `website` | — |
| 01-21 | Q&A Page | `QAPage` | `QAPage` / `Question` | `website` | — |
| 01-22 | Image Gallery | `ImageGallery` | `ImageGallery` / `none` | `website` | — |
| 01-23 | Video Gallery | `VideoGallery` | `VideoGallery` / `none` | `website` | — |
| 01-24 | Video Content Page | `video-page` | `WebPage` / `VideoObject` | `video.other` | video |
| 01-25 | Podcast Episode | `PodcastEpisode` | `WebPage` / `PodcastEpisode` | `website` | — |
| 01-26A | Event Details | `event-detail` | `WebPage` / `Event` | `website` | event |
| 01-26B | Event Announcement | `event-announcement` | `WebPage` / `Article` | `article` | article, event |

### News & Magazine — `news` (25 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 02-01 | Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 02-02 | News Main Page | `news-main` | `CollectionPage` / `ItemList` | `website` | — |
| 02-03 | Section / Category Page | `news-section` | `CollectionPage` / `ItemList` | `website` | — |
| 02-04 | Topic / Tag Page | `news-topic` | `CollectionPage` / `ItemList` | `website` | — |
| 02-05 | Date Archive | `news-archive` | `CollectionPage` / `ItemList` | `website` | — |
| 02-06 | About Publication | `AboutPage` | `AboutPage` / `none` | `website` | — |
| 02-07 | Contact / News Tips | `ContactPage` | `ContactPage` / `none` | `website` | — |
| 02-08 | Reporter Profile | `ProfilePage` | `ProfilePage` / `Person` | `profile` | — |
| 02-09 | General Information Page | `WebPage` | `WebPage` / `none` | `website` | — |
| 02-10 | Standard News Article | `NewsArticle` | `WebPage` / `NewsArticle` | `article` | article |
| 02-11 | Breaking News Article | `breaking-news` | `WebPage` / `NewsArticle` | `article` | article |
| 02-12 | News Analysis | `AnalysisNewsArticle` | `WebPage` / `AnalysisNewsArticle` | `article` | article |
| 02-13 | News Reportage | `ReportageNewsArticle` | `WebPage` / `ReportageNewsArticle` | `article` | article |
| 02-14 | Background / Explainer News | `BackgroundNewsArticle` | `WebPage` / `BackgroundNewsArticle` | `article` | article |
| 02-15 | Opinion News Article | `OpinionNewsArticle` | `WebPage` / `OpinionNewsArticle` | `article` | article |
| 02-16 | General Editorial | `news-editorial` | `WebPage` / `Article` | `article` | article |
| 02-17 | Fact Check | `ClaimReview` | `WebPage` / `ClaimReview` | `article` | — |
| 02-18 | Live News Blog | `LiveBlogPosting` | `WebPage` / `LiveBlogPosting` | `article` | article |
| 02-19 | Feature Article | `Article` | `WebPage` / `Article` | `article` | article |
| 02-20 | Interview Article | `news-interview` | `WebPage` / `Article` | `article` | article |
| 02-21 | Photo Gallery | `ImageGallery` | `ImageGallery` / `none` | `website` | — |
| 02-22 | Video Report | `news-video` | `WebPage` / `VideoObject` | `video.other` | video |
| 02-23 | Video Gallery | `VideoGallery` | `VideoGallery` / `none` | `website` | — |
| 02-24 | Podcast Episode | `PodcastEpisode` | `WebPage` / `PodcastEpisode` | `website` | — |
| 02-25 | News Event Details | `news-event` | `WebPage` / `Event` | `website` | event |

### Personal Portfolio — `portfolio` (22 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 03-01 | Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 03-02 | Personal Profile / About | `ProfilePage` | `ProfilePage` / `Person` | `profile` | — |
| 03-03 | Professional Biography | `portfolio-bio` | `ProfilePage` / `Person` | `profile` | — |
| 03-04 | Resume / CV Page | `portfolio-resume` | `WebPage` / `Person` | `profile` | — |
| 03-05 | Contact | `ContactPage` | `ContactPage` / `none` | `website` | — |
| 03-06 | Services Overview | `portfolio-services` | `CollectionPage` / `ItemList` | `website` | — |
| 03-07 | Individual Service | `Service` | `WebPage` / `Service` | `website` | — |
| 03-08 | FAQ | `FAQPage` | `FAQPage` / `Question` | `website` | — |
| 03-09 | Projects Index | `portfolio-projects` | `CollectionPage` / `ItemList` | `website` | — |
| 03-10 | Project Detail | `portfolio-project` | `WebPage` / `CreativeWork` | `website` | — |
| 03-11 | Case Study | `portfolio-case-study` | `WebPage` / `Article` | `article` | article |
| 03-12 | Visual Artwork | `VisualArtwork` | `WebPage` / `VisualArtwork` | `website` | — |
| 03-13 | Photography Work | `Photograph` | `WebPage` / `Photograph` | `website` | — |
| 03-14 | Image Gallery | `ImageGallery` | `ImageGallery` / `none` | `website` | — |
| 03-15 | Video Showreel | `portfolio-showreel` | `WebPage` / `VideoObject` | `video.other` | video |
| 03-16 | Software Project | `SoftwareSourceCode` | `WebPage` / `SoftwareSourceCode` | `website` | — |
| 03-17 | Writing Sample | `Article` | `WebPage` / `Article` | `article` | article |
| 03-18 | Creative Work Collection | `CollectionPage` | `CollectionPage` / `ItemList` | `website` | — |
| 03-19 | Blog Post | `BlogPosting` | `WebPage` / `BlogPosting` | `article` | article |
| 03-20 | Client Testimonial / Review | `portfolio-review` | `WebPage` / `Review` | `website` | review |
| 03-21 | Event / Speaking Engagement | `Event` | `WebPage` / `Event` | `website` | event |
| 03-22 | Press / Media Feature | `portfolio-press` | `WebPage` / `Article` | `article` | article |

### Documentation & Knowledge Base — `documentation` (22 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 04-01 | Documentation Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 04-02 | Documentation Index | `docs-index` | `CollectionPage` / `ItemList` | `website` | — |
| 04-03 | Documentation Category | `docs-category` | `CollectionPage` / `ItemList` | `website` | — |
| 04-04 | Version Index | `docs-version` | `CollectionPage` / `ItemList` | `website` | — |
| 04-05 | Knowledge Base Landing | `knowledge-base` | `CollectionPage` / `ItemList` | `website` | — |
| 04-06 | Glossary Index | `DefinedTermSet` | `WebPage` / `DefinedTermSet` | `website` | — |
| 04-07 | Glossary Term | `DefinedTerm` | `WebPage` / `DefinedTerm` | `website` | — |
| 04-08 | API Reference | `APIReference` | `WebPage` / `APIReference` | `article` | — |
| 04-09 | Technical Article | `TechArticle` | `WebPage` / `TechArticle` | `article` | article |
| 04-10 | Developer Guide | `docs-developer-guide` | `WebPage` / `TechArticle` | `article` | article |
| 04-11 | Tutorial / How-to | `HowTo` | `WebPage` / `HowTo` | `article` | — |
| 04-12 | Troubleshooting Guide | `docs-troubleshooting` | `WebPage` / `TechArticle` | `article` | article |
| 04-13 | Configuration Reference | `docs-configuration` | `WebPage` / `TechArticle` | `article` | article |
| 04-14 | Code Example | `SoftwareSourceCode` | `WebPage` / `SoftwareSourceCode` | `website` | — |
| 04-15 | Release Notes | `docs-release-notes` | `WebPage` / `TechArticle` | `article` | article |
| 04-16 | Changelog | `docs-changelog` | `WebPage` / `WebPage` | `website` | — |
| 04-17 | Software Documentation Page | `docs-software-page` | `WebPage` / `SoftwareApplication` | `website` | software_app |
| 04-18 | FAQ Page | `FAQPage` | `FAQPage` / `Question` | `website` | — |
| 04-19 | Community Q&A | `QAPage` | `QAPage` / `Question` | `website` | — |
| 04-20 | Video Tutorial | `docs-video` | `WebPage` / `VideoObject` | `video.other` | video |
| 04-21 | Support Article | `docs-support-article` | `WebPage` / `TechArticle` | `article` | article |
| 04-22 | Contact / Support | `ContactPage` | `ContactPage` / `none` | `website` | — |

### E-commerce / Online Store — `ecommerce` (24 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 05-01 | Store Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 05-02 | Shop Main Page | `storefront` | `CollectionPage` / `ItemList` | `website` | — |
| 05-03 | Product Category | `product-category` | `CollectionPage` / `ItemList` | `website` | — |
| 05-04 | Product Collection | `product-collection` | `CollectionPage` / `ItemList` | `website` | — |
| 05-05 | Brand Landing Page | `brand-page` | `CollectionPage` / `ItemList` | `website` | — |
| 05-06 | New Arrivals Listing | `new-arrivals` | `CollectionPage` / `ItemList` | `website` | — |
| 05-07 | Sale / Promotions Page | `store-promotions` | `CollectionPage` / `ItemList` | `website` | — |
| 05-08 | Product Detail | `Product` | `ItemPage` / `Product` | `website` | merchant_listing, product_snippet |
| 05-09 | Product Group / Variants | `ProductGroup` | `ItemPage` / `ProductGroup` | `website` | merchant_listing, product_snippet |
| 05-10 | Specific Product Variant | `product-variant` | `ItemPage` / `Product` | `website` | merchant_listing, product_snippet |
| 05-11 | Digital Product | `digital-product` | `ItemPage` / `Product` | `website` | merchant_listing, product_snippet |
| 05-12 | Software Product | `SoftwareApplication` | `ItemPage` / `SoftwareApplication` | `website` | software_app |
| 05-13 | Service Offering | `Service` | `ItemPage` / `Service` | `website` | — |
| 05-14 | Individual Offer Page | `Offer` | `ItemPage` / `Offer` | `website` | — |
| 05-15 | Product Comparison | `product-comparison` | `CollectionPage` / `ItemList` | `website` | — |
| 05-16 | Buying Guide | `store-buying-guide` | `WebPage` / `Article` | `article` | article |
| 05-17 | Product Review Article | `store-product-review` | `WebPage` / `Review` | `article` | review |
| 05-18 | Product FAQ | `FAQPage` | `FAQPage` / `Question` | `website` | — |
| 05-19 | About Store | `AboutPage` | `AboutPage` / `none` | `website` | — |
| 05-20 | Contact Store | `ContactPage` | `ContactPage` / `none` | `website` | — |
| 05-21 | Store Location | `Store` | `WebPage` / `Store` | `website` | — |
| 05-22 | Store Locator | `store-locator` | `CollectionPage` / `ItemList` | `website` | — |
| 05-23 | Shipping Policy | `shipping-policy` | `WebPage` / `none` | `website` | — |
| 05-24 | Returns Policy | `returns-policy` | `WebPage` / `none` | `website` | — |

### Business / Corporate — `business` (24 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 06-01 | Corporate Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 06-02 | About Company | `AboutPage` | `AboutPage` / `none` | `website` | — |
| 06-03 | Contact Company | `ContactPage` | `ContactPage` / `none` | `website` | — |
| 06-04 | Company Locations | `business-locations` | `CollectionPage` / `ItemList` | `website` | — |
| 06-05 | Individual Office Location | `business-location` | `WebPage` / `Place` | `website` | — |
| 06-06 | Leadership / Team Directory | `leadership-directory` | `CollectionPage` / `ItemList` | `website` | — |
| 06-07 | Executive Profile | `ProfilePage` | `ProfilePage` / `Person` | `profile` | — |
| 06-08 | Company Divisions | `business-divisions` | `CollectionPage` / `ItemList` | `website` | — |
| 06-09 | Services Overview | `business-services` | `CollectionPage` / `ItemList` | `website` | — |
| 06-10 | Service Detail | `Service` | `WebPage` / `Service` | `website` | — |
| 06-11 | Product Detail | `Product` | `ItemPage` / `Product` | `website` | merchant_listing, product_snippet |
| 06-12 | Solution Detail | `business-solution` | `WebPage` / `Service` | `website` | — |
| 06-13 | Industry Solution Page | `business-industry` | `WebPage` / `Service` | `website` | — |
| 06-14 | Customer Case Study | `business-case-study` | `WebPage` / `Article` | `article` | article |
| 06-15 | Partners Directory | `business-partners` | `CollectionPage` / `ItemList` | `website` | — |
| 06-16 | FAQ | `FAQPage` | `FAQPage` / `Question` | `website` | — |
| 06-17 | Newsroom | `business-newsroom` | `CollectionPage` / `ItemList` | `website` | — |
| 06-18 | Press Release | `business-press-release` | `WebPage` / `NewsArticle` | `article` | article |
| 06-19 | Corporate Blog Post | `BlogPosting` | `WebPage` / `BlogPosting` | `article` | article |
| 06-20 | Job Openings | `business-careers` | `CollectionPage` / `ItemList` | `website` | — |
| 06-21 | Job Posting | `JobPosting` | `WebPage` / `JobPosting` | `website` | — |
| 06-22 | Corporate Event | `Event` | `WebPage` / `Event` | `website` | event |
| 06-23 | Annual Report | `Report` | `WebPage` / `Report` | `website` | — |
| 06-24 | Investor Relations | `investor-relations` | `WebPage` / `none` | `website` | — |

### Professional Services / Agency — `services` (21 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 07-01 | Agency Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 07-02 | About Agency | `AboutPage` | `AboutPage` / `none` | `website` | — |
| 07-03 | Contact / Inquiry | `ContactPage` | `ContactPage` / `none` | `website` | — |
| 07-04 | Services Index | `services-index` | `CollectionPage` / `ItemList` | `website` | — |
| 07-05 | Individual Service | `Service` | `WebPage` / `Service` | `website` | — |
| 07-06 | Specialty / Practice Area | `practice-area` | `WebPage` / `Service` | `website` | — |
| 07-07 | Industries Served | `industries-served` | `CollectionPage` / `ItemList` | `website` | — |
| 07-08 | Locations Served | `service-locations` | `CollectionPage` / `ItemList` | `website` | — |
| 07-09 | Pricing / Packages | `service-pricing` | `WebPage` / `Service` | `website` | — |
| 07-10 | Team Directory | `team-directory` | `CollectionPage` / `ItemList` | `website` | — |
| 07-11 | Practitioner Profile | `ProfilePage` | `ProfilePage` / `Person` | `profile` | — |
| 07-12 | Portfolio / Work Index | `work-index` | `CollectionPage` / `ItemList` | `website` | — |
| 07-13 | Client Case Study | `agency-case-study` | `WebPage` / `Article` | `article` | article |
| 07-14 | Client Testimonial | `client-testimonial` | `WebPage` / `Review` | `website` | review |
| 07-15 | Award / Recognition | `agency-award` | `WebPage` / `none` | `website` | — |
| 07-16 | Agency Blog Post | `BlogPosting` | `WebPage` / `BlogPosting` | `article` | article |
| 07-17 | Professional Article | `Article` | `WebPage` / `Article` | `article` | article |
| 07-18 | How-to Guide | `HowTo` | `WebPage` / `HowTo` | `article` | — |
| 07-19 | FAQ Page | `FAQPage` | `FAQPage` / `Question` | `website` | — |
| 07-20 | Consultation Information | `consultation-info` | `WebPage` / `Service` | `website` | — |
| 07-21 | Workshop / Training Event | `EducationEvent` | `WebPage` / `EducationEvent` | `website` | event |

### Education / E-learning — `education` (28 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 08-01 | Education Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 08-02 | Learning Catalog | `learning-catalog` | `CollectionPage` / `ItemList` | `website` | course_list |
| 08-03 | Subject Category | `subject-category` | `CollectionPage` / `ItemList` | `website` | course_list |
| 08-04 | Course Directory | `course-directory` | `CollectionPage` / `ItemList` | `website` | course_list |
| 08-05 | Learning Path | `learning-path` | `CollectionPage` / `ItemList` | `website` | course_list |
| 08-06 | Instructor Directory | `instructor-directory` | `CollectionPage` / `ItemList` | `website` | course_list |
| 08-07 | About Platform | `AboutPage` | `AboutPage` / `none` | `website` | — |
| 08-08 | Contact | `ContactPage` | `ContactPage` / `none` | `website` | — |
| 08-09 | Course Detail | `Course` | `ItemPage` / `Course` | `website` | course_list |
| 08-10 | Course Offering / Session | `CourseInstance` | `ItemPage` / `CourseInstance` | `website` | — |
| 08-11 | Educational Program | `EducationalOccupationalProgram` | `ItemPage` / `EducationalOccupationalProgram` | `website` | — |
| 08-12 | Lesson / Learning Resource | `LearningResource` | `WebPage` / `LearningResource` | `website` | — |
| 08-13 | Lesson Module | `lesson-module` | `CollectionPage` / `ItemList` | `website` | course_list |
| 08-14 | Tutorial / How-to | `HowTo` | `WebPage` / `HowTo` | `article` | — |
| 08-15 | Technical Lesson Article | `TechArticle` | `WebPage` / `TechArticle` | `article` | article |
| 08-16 | Study Guide | `study-guide` | `WebPage` / `LearningResource` | `website` | — |
| 08-17 | Quiz | `Quiz` | `WebPage` / `Quiz` | `website` | — |
| 08-18 | Assignment / Worksheet | `education-worksheet` | `WebPage` / `LearningResource` | `website` | — |
| 08-19 | Video Lesson | `education-video` | `WebPage` / `VideoObject` | `video.other` | video |
| 08-20 | Book / Textbook Detail | `Book` | `ItemPage` / `Book` | `book` | — |
| 08-21 | Instructor Profile | `ProfilePage` | `ProfilePage` / `Person` | `profile` | — |
| 08-22 | Education Article | `Article` | `WebPage` / `Article` | `article` | article |
| 08-23 | Education Blog Post | `BlogPosting` | `WebPage` / `BlogPosting` | `article` | article |
| 08-24 | Research Article | `ScholarlyArticle` | `WebPage` / `ScholarlyArticle` | `article` | article |
| 08-25 | FAQ Page | `FAQPage` | `FAQPage` / `Question` | `website` | — |
| 08-26 | Q&A Page | `QAPage` | `QAPage` / `Question` | `website` | — |
| 08-27 | Webinar / Workshop | `EducationEvent` | `WebPage` / `EducationEvent` | `website` | event |
| 08-28 | Resources Library | `education-resources` | `CollectionPage` / `ItemList` | `website` | course_list |

### Software / SaaS — `software` (26 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 09-01 | Software Website Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 09-02 | Product Overview | `software-overview` | `WebPage` / `SoftwareApplication` | `website` | software_app |
| 09-03 | Web App Details | `WebApplication` | `ItemPage` / `WebApplication` | `website` | software_app |
| 09-04 | Mobile App Details | `MobileApplication` | `ItemPage` / `MobileApplication` | `website` | software_app |
| 09-05 | Software Application Details | `SoftwareApplication` | `ItemPage` / `SoftwareApplication` | `website` | software_app |
| 09-06 | Features Overview | `software-features` | `CollectionPage` / `ItemList` | `website` | — |
| 09-07 | Single Feature | `software-feature` | `WebPage` / `SoftwareApplication` | `website` | software_app |
| 09-08 | Pricing Plans | `software-pricing` | `WebPage` / `SoftwareApplication` | `website` | software_app |
| 09-09 | Integration Directory | `software-integrations` | `CollectionPage` / `ItemList` | `website` | — |
| 09-10 | Integration Detail | `integration-detail` | `WebPage` / `SoftwareApplication` | `website` | software_app |
| 09-11 | About Company | `AboutPage` | `AboutPage` / `none` | `website` | — |
| 09-12 | Contact | `ContactPage` | `ContactPage` / `none` | `website` | — |
| 09-13 | Documentation Hub | `software-docs` | `CollectionPage` / `ItemList` | `website` | — |
| 09-14 | API Reference | `APIReference` | `WebPage` / `APIReference` | `article` | — |
| 09-15 | Developer Guide | `software-developer-guide` | `WebPage` / `TechArticle` | `article` | article |
| 09-16 | Technical Article | `TechArticle` | `WebPage` / `TechArticle` | `article` | article |
| 09-17 | How-to Tutorial | `HowTo` | `WebPage` / `HowTo` | `article` | — |
| 09-18 | Release Notes | `software-release-notes` | `WebPage` / `TechArticle` | `article` | article |
| 09-19 | Changelog | `software-changelog` | `WebPage` / `none` | `website` | — |
| 09-20 | Open Source Code Project | `SoftwareSourceCode` | `WebPage` / `SoftwareSourceCode` | `website` | — |
| 09-21 | Knowledge Base | `software-help` | `CollectionPage` / `ItemList` | `website` | — |
| 09-22 | FAQ Page | `FAQPage` | `FAQPage` / `Question` | `website` | — |
| 09-23 | Security / Trust Information | `software-security` | `WebPage` / `none` | `website` | — |
| 09-24 | Customer Case Study | `software-case-study` | `WebPage` / `Article` | `article` | article |
| 09-25 | Software Comparison | `software-comparison` | `CollectionPage` / `ItemList` | `website` | — |
| 09-26 | Product Blog Post | `BlogPosting` | `WebPage` / `BlogPosting` | `article` | article |

### Community / Forum — `community` (21 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 10-01 | Community Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 10-02 | Forum Main Page | `forum-main` | `CollectionPage` / `ItemList` | `website` | — |
| 10-03 | Forum Category | `forum-category` | `CollectionPage` / `ItemList` | `website` | — |
| 10-04 | Topic / Thread | `DiscussionForumPosting` | `WebPage` / `DiscussionForumPosting` | `article` | — |
| 10-05 | Question Thread | `community-question` | `QAPage` / `Question` | `website` | — |
| 10-06 | Public Member Directory | `member-directory` | `CollectionPage` / `ItemList` | `website` | — |
| 10-07 | Tag / Topic Directory | `community-tags` | `CollectionPage` / `ItemList` | `website` | — |
| 10-08 | About Community | `AboutPage` | `AboutPage` / `none` | `website` | — |
| 10-09 | Contact / Moderation | `ContactPage` | `ContactPage` / `none` | `website` | — |
| 10-10 | Member Profile | `ProfilePage` | `ProfilePage` / `Person` | `profile` | — |
| 10-11 | Moderator Profile | `moderator-profile` | `ProfilePage` / `Person` | `profile` | — |
| 10-12 | Q&A Page | `QAPage` | `QAPage` / `Question` | `website` | — |
| 10-13 | Discussion Announcement | `community-announcement` | `WebPage` / `Article` | `article` | article |
| 10-14 | Community Blog Post | `BlogPosting` | `WebPage` / `BlogPosting` | `article` | article |
| 10-15 | Guide / Tutorial | `HowTo` | `WebPage` / `HowTo` | `article` | — |
| 10-16 | FAQ Page | `FAQPage` | `FAQPage` / `Question` | `website` | — |
| 10-17 | Community Guidelines | `community-guidelines` | `WebPage` / `none` | `website` | — |
| 10-18 | Community Rules | `community-rules` | `WebPage` / `none` | `website` | — |
| 10-19 | Community Event | `Event` | `WebPage` / `Event` | `website` | event |
| 10-20 | Resource Directory | `community-resources` | `CollectionPage` / `ItemList` | `website` | — |
| 10-21 | Public Poll Page | `community-poll` | `WebPage` / `none` | `website` | — |

### Entertainment / Media — `entertainment` (25 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 11-01 | Entertainment Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 11-02 | Media Catalog | `media-catalog` | `CollectionPage` / `ItemList` | `website` | — |
| 11-03 | Genre / Category | `media-genre` | `CollectionPage` / `ItemList` | `website` | — |
| 11-04 | Actor / Creator Profile | `ProfilePage` | `ProfilePage` / `Person` | `profile` | — |
| 11-05 | Music Artist Page | `MusicGroup` | `WebPage` / `MusicGroup` | `website` | — |
| 11-06 | About Media Site | `AboutPage` | `AboutPage` / `none` | `website` | — |
| 11-07 | Contact | `ContactPage` | `ContactPage` / `none` | `website` | — |
| 11-08 | Movie Detail | `Movie` | `ItemPage` / `Movie` | `video.movie` | — |
| 11-09 | TV Show Detail | `TVSeries` | `ItemPage` / `TVSeries` | `video.tv_show` | — |
| 11-10 | TV Season Detail | `TVSeason` | `ItemPage` / `TVSeason` | `website` | — |
| 11-11 | TV Episode Detail | `TVEpisode` | `ItemPage` / `TVEpisode` | `video.episode` | — |
| 11-12 | Video Content | `media-video` | `WebPage` / `VideoObject` | `video.other` | video |
| 11-13 | Video Gallery | `VideoGallery` | `VideoGallery` / `none` | `website` | — |
| 11-14 | Image Gallery | `ImageGallery` | `ImageGallery` / `none` | `website` | — |
| 11-15 | Trailer / Teaser | `media-trailer` | `WebPage` / `VideoObject` | `video.other` | video |
| 11-16 | Music Track | `MusicRecording` | `ItemPage` / `MusicRecording` | `music.song` | — |
| 11-17 | Music Album | `MusicAlbum` | `ItemPage` / `MusicAlbum` | `music.album` | — |
| 11-18 | Music Playlist | `MusicPlaylist` | `ItemPage` / `MusicPlaylist` | `music.playlist` | — |
| 11-19 | Podcast Series | `PodcastSeries` | `ItemPage` / `PodcastSeries` | `website` | — |
| 11-20 | Podcast Episode | `PodcastEpisode` | `ItemPage` / `PodcastEpisode` | `website` | — |
| 11-21 | Audio Content | `AudioObject` | `ItemPage` / `AudioObject` | `website` | — |
| 11-22 | Entertainment News | `NewsArticle` | `WebPage` / `NewsArticle` | `article` | article |
| 11-23 | Review | `Review` | `WebPage` / `Review` | `article` | review |
| 11-24 | Feature Article | `Article` | `WebPage` / `Article` | `article` | article |
| 11-25 | Entertainment Event | `Event` | `WebPage` / `Event` | `website` | event |

### Travel / Tourism — `travel` (28 entries)
| ID | Page type | CMS key | Page / main entity | OG | Candidate feature profiles |
|---|---|---|---|---|---|
| 12-01 | Travel Homepage | `homepage` | `WebPage` / `WebSite` | `website` | — |
| 12-02 | Destinations Directory | `travel-destinations` | `CollectionPage` / `ItemList` | `website` | — |
| 12-03 | Destination Detail | `TouristDestination` | `ItemPage` / `TouristDestination` | `website` | — |
| 12-04 | Attraction Detail | `TouristAttraction` | `ItemPage` / `TouristAttraction` | `website` | — |
| 12-05 | Travel Guides Index | `travel-guides` | `CollectionPage` / `ItemList` | `website` | — |
| 12-06 | Trip Itineraries Index | `travel-itineraries` | `CollectionPage` / `ItemList` | `website` | — |
| 12-07 | Hotel Directory | `travel-hotels` | `CollectionPage` / `ItemList` | `website` | — |
| 12-08 | Restaurant Directory | `travel-restaurants` | `CollectionPage` / `ItemList` | `website` | — |
| 12-09 | About Travel Site | `AboutPage` | `AboutPage` / `none` | `website` | — |
| 12-10 | Contact | `ContactPage` | `ContactPage` / `none` | `website` | — |
| 12-11 | Tourist Itinerary | `TouristTrip` | `ItemPage` / `TouristTrip` | `website` | — |
| 12-12 | Trip Detail | `Trip` | `ItemPage` / `Trip` | `website` | — |
| 12-13 | Tour / Travel Service | `Service` | `ItemPage` / `Service` | `website` | — |
| 12-14 | Travel Package | `travel-package` | `ItemPage` / `TouristTrip` | `website` | — |
| 12-15 | Hotel Detail | `Hotel` | `ItemPage` / `Hotel` | `website` | — |
| 12-16 | Accommodation Detail | `Accommodation` | `ItemPage` / `Accommodation` | `website` | — |
| 12-17 | Restaurant Detail | `Restaurant` | `ItemPage` / `Restaurant` | `website` | — |
| 12-18 | Flight Information | `Flight` | `ItemPage` / `Flight` | `website` | — |
| 12-19 | Event / Activity | `Event` | `WebPage` / `Event` | `website` | event |
| 12-20 | Destination Guide Article | `travel-destination-guide` | `WebPage` / `Article` | `article` | article |
| 12-21 | Travel Blog Post | `BlogPosting` | `WebPage` / `BlogPosting` | `article` | article |
| 12-22 | Travel News | `NewsArticle` | `WebPage` / `NewsArticle` | `article` | article |
| 12-23 | Travel Tutorial | `HowTo` | `WebPage` / `HowTo` | `article` | — |
| 12-24 | Travel Review | `Review` | `WebPage` / `Review` | `article` | review |
| 12-25 | Travel Image Gallery | `ImageGallery` | `ImageGallery` / `none` | `website` | — |
| 12-26 | Travel Video | `travel-video` | `WebPage` / `VideoObject` | `video.other` | video |
| 12-27 | FAQ Page | `FAQPage` | `FAQPage` / `Question` | `website` | — |
| 12-28 | Booking Information | `travel-booking-info` | `WebPage` / `none` | `website` | — |

## 10. What remains deferred, and what has not changed
- The Metadata Injector **source-edit algorithm**, exact HTML placeholder placement, deduplication, merge, partial verification states, validation UI, and draft/commit behavior remain for the next planning stage; no implementation action authorized here.
- The **approved original Blog 11 core, 25 OG, six X, and S01–S40 schema catalog** is preserved, including definitions that might only apply conditionally. No tags have been deleted or silently commented out.
- The 28 Blog boilerplates remain owner-selected; **266 other category page types are proposals** pending owner review and customizations.
- The Page ID HTML meta tag name remains undecided from the original README. Do not invent it.

## 11. Official reference set
- **google_indexing:** https://developers.google.com/search/docs/essentials/technical
- **google_sd_guidelines:** https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- **google_technical_indexing:** https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- **google_title:** https://developers.google.com/search/docs/appearance/title-link
- **google_snippet:** https://developers.google.com/search/docs/appearance/snippet
- **google_canonical:** https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- **google_hreflang:** https://developers.google.com/search/docs/specialty/international/localized-versions
- **google_article:** https://developers.google.com/search/docs/appearance/structured-data/article
- **google_merchant:** https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- **google_product_snippet:** https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- **google_course_list:** https://developers.google.com/search/docs/appearance/structured-data/course
- **google_video:** https://developers.google.com/search/docs/appearance/structured-data/video
- **google_event:** https://developers.google.com/search/docs/appearance/structured-data/event
- **google_review:** https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- **google_software:** https://developers.google.com/search/docs/appearance/structured-data/software-app
- **google_vacation_rental:** https://developers.google.com/search/docs/appearance/structured-data/vacation-rental
- **google_sitelinks_retired:** https://developers.google.com/search/blog/2024/10/sitelinks-search-box
- **google_faq_howto_changes:** https://developers.google.com/search/blog/2023/08/howto-faq-changes
- **og_protocol:** https://ogp.me/
- **schema_hierarchy:** https://schema.org/docs/full.html
- **schema_product:** https://schema.org/Product
- **schema_offer:** https://schema.org/Offer
- **schema_course:** https://schema.org/Course
- **schema_review:** https://schema.org/Review
- **schema_hotel:** https://schema.org/Hotel

## 12. Audit outcomes and scope limits
- Checked document against original v1 and cross-checked 294 records by category/type/HTML snippet and original schema node paths.
- Added explicit policies to each original per-page `core`, OG, X and Schema.org property candidate; added graph relationship contracts and feature-specific gates; did not run 294 live Google Rich Results Tests, which require real populated/deployed pages.
- Full Schema.org and Google rich-result eligibility requires a later implementation with actual populated data. All expanded property mappings are research proposals, not final verified executable JSON-LD templates.
