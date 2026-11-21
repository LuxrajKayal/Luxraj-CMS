# Luxraj CMS — Task 15: Consolidated Website-Type & Page-Type Boilerplate Specification
## All 12 owner-selected website categories | Sidebar → Manual HTML snippets → Schema.org → Open Graph

**Edition:** v3.0 · **Date:** 21 November 2026 · **Scope:** Task 15 planning only · **Status:** No repository code, database, README, roadmap, or deployments modified.

> **Review boundary:** The owner chose all **12 website categories** and the **26 Blog concepts / 28 Blog boilerplates**. The 11 other category page-type lists below are carefully structured **proposals**, not owner-handpicked approvals. Their exact mappings are explicit for review, but implementation of newly specialized metadata templates still requires separate approval. The document is a deterministic mapping proposal, not a claim of SEO rich-result eligibility.

## 0. Contents and scope

| # | Website category | Exact `data-cms-website` | Boilerplates | Page-type approval |
|---|---|---|---:|---|
| 01 | Blog & Publishing | `blog` | 28 | Owner selected (28 variants from 26 concepts) |
| 02 | News & Magazine | `news` | 25 | Proposed; owner review required |
| 03 | Personal Portfolio | `portfolio` | 22 | Proposed; owner review required |
| 04 | Documentation & Knowledge Base | `documentation` | 22 | Proposed; owner review required |
| 05 | E-commerce / Online Store | `ecommerce` | 24 | Proposed; owner review required |
| 06 | Business / Corporate | `business` | 24 | Proposed; owner review required |
| 07 | Professional Services / Agency | `services` | 21 | Proposed; owner review required |
| 08 | Education / E-learning | `education` | 28 | Proposed; owner review required |
| 09 | Software / SaaS | `software` | 26 | Proposed; owner review required |
| 10 | Community / Forum | `community` | 21 | Proposed; owner review required |
| 11 | Entertainment / Media | `entertainment` | 25 | Proposed; owner review required |
| 12 | Travel / Tourism | `travel` | 28 | Proposed; owner review required |

**Total:** 294 individual sidebar leaves, including all 28 preserved Blog leaves; 266 proposals in the other 11 categories.

## 1. Controlling design decisions — no implicit behavior

1. **Sidebar hierarchy:** `Metadata Injector → Website Type → Website Category → Page Type → Group → Individual Page Type → Read-only Boilerplate + Copy`. `Group` is presentation-only and does not enter HTML.
2. **Manual only:** the maintainer inspects the existing page and manually merges the CMS markers into its existing opening `<html>` tag. The metadata injector **never inserts, changes, guesses, or removes** the CMS identification attributes.
3. **Exact identifier contract:** `data-cms-seo="true"` + exactly one valid `data-cms-website="..."` + exactly one case-sensitive `data-cms-seo-type="..."`. A valid combination is the two-part lookup key (`website`, `page type`). Do not infer from folder paths or file names.
4. **Semantics:** the CMS key is a lookup identifier; it is not necessarily Schema.org `@type` nor Open Graph `og:type`. The mapping record gives the HTML page node type, the principal entity, and a separate official OG type.
5. **Registry status:** Category 01 mapping is carried from its v2 specification without removing/renaming a leaf. Categories 02–12 are proposed candidate boilerplates pending owner selection. Do not treat their detailed inclusion as approval to implement.
6. **Template isolation:** 12 category templates may start from a Blog snapshot, but must be independently editable; never synchronize the copies or assume every Blog schema field applies to every other website type.
7. **Shared source control:** all later metadata modifications go through scoped drafts → changed-file diff → explicit authorized commit. A boilerplate Copy action is not a commit.
8. **Existing metadata wins:** mismatched existing `og:type` / Schema.org structures raise a visible conflict; do not silently replace, delete, or duplicate them. No fabricated real SEO values.
9. **No rich-result promises:** Schema.org type validity and Google Search rich-result eligibility are different questions; add real structured data only for content that visibly exists.
10. **Future new-page templates:** separate later milestone; this catalog chiefly supports retrofitting older pages that lack markers/metadata.

### 1.1 Exact opening-tag format

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="BlogPosting">
```

**Critical:** `lang="en"` is an illustration, not a forced language. Do not paste a second `<html>` tag into an existing HTML file; manually merge only the three CMS `data-*` attributes with existing `lang`, `dir`, `class`, etc. If an old `data-seo` or `data-page-type` exists, identify it as legacy; never auto-migrate or treat it as the new eligibility contract. Missing or invalid combinations do not qualify for automatic placeholder preparation.

### 1.2 Exact mapping behavior

| Field in JSON | Contract |
|---|---|
| `cms_type_key` | Exact case-sensitive value in `data-cms-seo-type` |
| `schema_page_type` | Official Schema.org class representing the page itself |
| `schema_main_entity` | Main represented entity/content if distinct, not an additional HTML page type |
| `schema_relationship` | Exact directed relationship, normalized where the v2 format used compound shorthand |
| `schema_graph` | Machine-readable page/entity nodes, exact edges/cardinality/content preconditions (FAQ, Q&A, galleries, book reviews explicitly modeled) |
| `og_type` | Exact registered Open Graph value, not derived by lowercasing Schema.org type |
| `selection_rule` | When a human should pick the leaf |
| `property_plan` | Candidate evidence-based schema fields; **not permission** to add fields absent from the approved category catalog |
| `boilerplate_html` | Exact copyable HTML opening-tag example for that leaf |
| `mapping_status` | Shows which mappings follow the selected Blog catalog and which need owner review |

**Normalized v2 graph notation:** Category 01 keeps its 28 original keys and labels. For FAQ/Q&A, the former v2 composite `schema_main_entity` string is normalized to `Question` with explicit Answer edges; for Image/VideoGallery, v2 shorthand `ImageObject[]`/`VideoObject[]` is normalized to typed `hasPart` arrays, without claiming a singular `mainEntity`. The original v2 shorthand remains under `v2_original_main_entity_notation` in JSON for traceability. This improves precision without changing any copied HTML marker.

**Relationship convention:** For a listing, the main entity may be an `ItemList`, populated only from actually listed items. For dedicated product, course, event, software, trip, or media pages, the page node may be `ItemPage`/`WebPage` while `mainEntity` is the content entity. Do not create the same `@id` for unrelated nodes. A relationship to `WebSite` or `Organization` requires a real configured entity, not an invented publisher.

**Separate schema-property approval:** The previously approved Blog 11 core / 25 OG / 6 Twitter/X / S01–S40 catalog remains unchanged. Adding a type like `TechArticle`, `ProductGroup`, `Hotel`, or `Quiz` to this planning registry does not authorize inventing additional metadata fields or filling actual values. Planned field profiles guide later approvals.

### 1.3 Page choices excluded from automatic SEO preparation

**Private / transactional pages**—sign-in, user dashboard, shopping cart, checkout/payment, order confirmation, private bookings, individual learning progress, private messages, moderation tools, and internal search results—are not included as SEO-ready leaves. They may require proper indexing controls later, but must not acquire `data-cms-seo="true"` simply because a generic Schema.org type exists. Public informational pages about booking, payment, pricing, or help may be included explicitly as different leaves.

### 1.4 Global OG mapping policy

The official `og:type` values used in this catalog are `website`, `article`, `profile`, `book`, `video.movie`, `video.tv_show`, `video.episode`, `video.other`, `music.song`, `music.album`, `music.playlist`. No `og:type="Product"`, `og:type="Course"`, `og:type="HowTo"`, `og:type="FAQPage"`, or invented OG extensions. If a type is neither a suitable official OG subtype nor specifically article/profile/book/media, use `website`. The Blog-approved existing `og:type` stays unchanged unless the owner authorizes a correction.

## 2. Exact sidebar tree (12 categories)

```text
Metadata Injector
└── Website Type
    ├── 01 Blog & Publishing [blog]
    │   └── Page Type
    │       ├── General website pages
    │       │   ├── 01-01 Homepage → Boilerplate + Copy
    │       │   ├── 01-02 Blog Main Page → Boilerplate + Copy
    │       │   ├── 01-03 Category Page → Boilerplate + Copy
    │       │   ├── 01-04 Tag Page → Boilerplate + Copy
    │       │   ├── 01-05 Archive Page → Boilerplate + Copy
    │       │   ├── 01-06 About Page → Boilerplate + Copy
    │       │   ├── 01-07 Contact Page → Boilerplate + Copy
    │       │   ├── 01-08 Author Profile → Boilerplate + Copy
    │       │   └── 01-09 General / Static Page → Boilerplate + Copy
    │       ├── Articles and publishing pages
    │       │   ├── 01-10 General Article → Boilerplate + Copy
    │       │   ├── 01-11 Blog Post → Boilerplate + Copy
    │       │   ├── 01-12 Technical Article → Boilerplate + Copy
    │       │   ├── 01-13 News Article → Boilerplate + Copy
    │       │   ├── 01-14A General Opinion / Editorial → Boilerplate + Copy
    │       │   ├── 01-14B News Opinion / Editorial → Boilerplate + Copy
    │       │   ├── 01-15 Live Blog → Boilerplate + Copy
    │       │   ├── 01-16 Tutorial / How-to → Boilerplate + Copy
    │       │   ├── 01-17 Review → Boilerplate + Copy
    │       │   ├── 01-18 Book Information / Details → Boilerplate + Copy
    │       │   ├── 01-19 Book Review → Boilerplate + Copy
    │       │   ├── 01-20 FAQ Page → Boilerplate + Copy
    │       │   └── 01-21 Q&A Page → Boilerplate + Copy
    │       └── Multimedia and specialized pages
    │           ├── 01-22 Image Gallery → Boilerplate + Copy
    │           ├── 01-23 Video Gallery → Boilerplate + Copy
    │           ├── 01-24 Video Content Page → Boilerplate + Copy
    │           ├── 01-25 Podcast Episode → Boilerplate + Copy
    │           ├── 01-26A Event Details → Boilerplate + Copy
    │           └── 01-26B Event Announcement → Boilerplate + Copy
    ├── 02 News & Magazine [news]
    │   └── Page Type
    │       ├── General pages and collections
    │       │   ├── 02-01 Homepage → Boilerplate + Copy
    │       │   ├── 02-02 News Main Page → Boilerplate + Copy
    │       │   ├── 02-03 Section / Category Page → Boilerplate + Copy
    │       │   ├── 02-04 Topic / Tag Page → Boilerplate + Copy
    │       │   ├── 02-05 Date Archive → Boilerplate + Copy
    │       │   ├── 02-06 About Publication → Boilerplate + Copy
    │       │   ├── 02-07 Contact / News Tips → Boilerplate + Copy
    │       │   ├── 02-08 Reporter Profile → Boilerplate + Copy
    │       │   └── 02-09 General Information Page → Boilerplate + Copy
    │       ├── Reporting and editorial content
    │       │   ├── 02-10 Standard News Article → Boilerplate + Copy
    │       │   ├── 02-11 Breaking News Article → Boilerplate + Copy
    │       │   ├── 02-12 News Analysis → Boilerplate + Copy
    │       │   ├── 02-13 News Reportage → Boilerplate + Copy
    │       │   ├── 02-14 Background / Explainer News → Boilerplate + Copy
    │       │   ├── 02-15 Opinion News Article → Boilerplate + Copy
    │       │   ├── 02-16 General Editorial → Boilerplate + Copy
    │       │   ├── 02-17 Fact Check → Boilerplate + Copy
    │       │   ├── 02-18 Live News Blog → Boilerplate + Copy
    │       │   ├── 02-19 Feature Article → Boilerplate + Copy
    │       │   └── 02-20 Interview Article → Boilerplate + Copy
    │       └── Media and special coverage
    │           ├── 02-21 Photo Gallery → Boilerplate + Copy
    │           ├── 02-22 Video Report → Boilerplate + Copy
    │           ├── 02-23 Video Gallery → Boilerplate + Copy
    │           ├── 02-24 Podcast Episode → Boilerplate + Copy
    │           └── 02-25 News Event Details → Boilerplate + Copy
    ├── 03 Personal Portfolio [portfolio]
    │   └── Page Type
    │       ├── Identity and general pages
    │       │   ├── 03-01 Homepage → Boilerplate + Copy
    │       │   ├── 03-02 Personal Profile / About → Boilerplate + Copy
    │       │   ├── 03-03 Professional Biography → Boilerplate + Copy
    │       │   ├── 03-04 Resume / CV Page → Boilerplate + Copy
    │       │   ├── 03-05 Contact → Boilerplate + Copy
    │       │   ├── 03-06 Services Overview → Boilerplate + Copy
    │       │   ├── 03-07 Individual Service → Boilerplate + Copy
    │       │   └── 03-08 FAQ → Boilerplate + Copy
    │       ├── Projects and creative work
    │       │   ├── 03-09 Projects Index → Boilerplate + Copy
    │       │   ├── 03-10 Project Detail → Boilerplate + Copy
    │       │   ├── 03-11 Case Study → Boilerplate + Copy
    │       │   ├── 03-12 Visual Artwork → Boilerplate + Copy
    │       │   ├── 03-13 Photography Work → Boilerplate + Copy
    │       │   ├── 03-14 Image Gallery → Boilerplate + Copy
    │       │   ├── 03-15 Video Showreel → Boilerplate + Copy
    │       │   ├── 03-16 Software Project → Boilerplate + Copy
    │       │   ├── 03-17 Writing Sample → Boilerplate + Copy
    │       │   └── 03-18 Creative Work Collection → Boilerplate + Copy
    │       └── Professional updates
    │           ├── 03-19 Blog Post → Boilerplate + Copy
    │           ├── 03-20 Client Testimonial / Review → Boilerplate + Copy
    │           ├── 03-21 Event / Speaking Engagement → Boilerplate + Copy
    │           └── 03-22 Press / Media Feature → Boilerplate + Copy
    ├── 04 Documentation & Knowledge Base [documentation]
    │   └── Page Type
    │       ├── Documentation navigation
    │       │   ├── 04-01 Documentation Homepage → Boilerplate + Copy
    │       │   ├── 04-02 Documentation Index → Boilerplate + Copy
    │       │   ├── 04-03 Documentation Category → Boilerplate + Copy
    │       │   ├── 04-04 Version Index → Boilerplate + Copy
    │       │   ├── 04-05 Knowledge Base Landing → Boilerplate + Copy
    │       │   ├── 04-06 Glossary Index → Boilerplate + Copy
    │       │   └── 04-07 Glossary Term → Boilerplate + Copy
    │       ├── Technical documentation
    │       │   ├── 04-08 API Reference → Boilerplate + Copy
    │       │   ├── 04-09 Technical Article → Boilerplate + Copy
    │       │   ├── 04-10 Developer Guide → Boilerplate + Copy
    │       │   ├── 04-11 Tutorial / How-to → Boilerplate + Copy
    │       │   ├── 04-12 Troubleshooting Guide → Boilerplate + Copy
    │       │   ├── 04-13 Configuration Reference → Boilerplate + Copy
    │       │   ├── 04-14 Code Example → Boilerplate + Copy
    │       │   ├── 04-15 Release Notes → Boilerplate + Copy
    │       │   ├── 04-16 Changelog → Boilerplate + Copy
    │       │   └── 04-17 Software Documentation Page → Boilerplate + Copy
    │       └── Help and media
    │           ├── 04-18 FAQ Page → Boilerplate + Copy
    │           ├── 04-19 Community Q&A → Boilerplate + Copy
    │           ├── 04-20 Video Tutorial → Boilerplate + Copy
    │           ├── 04-21 Support Article → Boilerplate + Copy
    │           └── 04-22 Contact / Support → Boilerplate + Copy
    ├── 05 E-commerce / Online Store [ecommerce]
    │   └── Page Type
    │       ├── Store and browsing pages
    │       │   ├── 05-01 Store Homepage → Boilerplate + Copy
    │       │   ├── 05-02 Shop Main Page → Boilerplate + Copy
    │       │   ├── 05-03 Product Category → Boilerplate + Copy
    │       │   ├── 05-04 Product Collection → Boilerplate + Copy
    │       │   ├── 05-05 Brand Landing Page → Boilerplate + Copy
    │       │   ├── 05-06 New Arrivals Listing → Boilerplate + Copy
    │       │   └── 05-07 Sale / Promotions Page → Boilerplate + Copy
    │       ├── Products and selling information
    │       │   ├── 05-08 Product Detail → Boilerplate + Copy
    │       │   ├── 05-09 Product Group / Variants → Boilerplate + Copy
    │       │   ├── 05-10 Specific Product Variant → Boilerplate + Copy
    │       │   ├── 05-11 Digital Product → Boilerplate + Copy
    │       │   ├── 05-12 Software Product → Boilerplate + Copy
    │       │   ├── 05-13 Service Offering → Boilerplate + Copy
    │       │   ├── 05-14 Individual Offer Page → Boilerplate + Copy
    │       │   ├── 05-15 Product Comparison → Boilerplate + Copy
    │       │   ├── 05-16 Buying Guide → Boilerplate + Copy
    │       │   ├── 05-17 Product Review Article → Boilerplate + Copy
    │       │   └── 05-18 Product FAQ → Boilerplate + Copy
    │       └── Store identity and support
    │           ├── 05-19 About Store → Boilerplate + Copy
    │           ├── 05-20 Contact Store → Boilerplate + Copy
    │           ├── 05-21 Store Location → Boilerplate + Copy
    │           ├── 05-22 Store Locator → Boilerplate + Copy
    │           ├── 05-23 Shipping Policy → Boilerplate + Copy
    │           └── 05-24 Returns Policy → Boilerplate + Copy
    ├── 06 Business / Corporate [business]
    │   └── Page Type
    │       ├── Corporate identity and navigation
    │       │   ├── 06-01 Corporate Homepage → Boilerplate + Copy
    │       │   ├── 06-02 About Company → Boilerplate + Copy
    │       │   ├── 06-03 Contact Company → Boilerplate + Copy
    │       │   ├── 06-04 Company Locations → Boilerplate + Copy
    │       │   ├── 06-05 Individual Office Location → Boilerplate + Copy
    │       │   ├── 06-06 Leadership / Team Directory → Boilerplate + Copy
    │       │   ├── 06-07 Executive Profile → Boilerplate + Copy
    │       │   └── 06-08 Company Divisions → Boilerplate + Copy
    │       ├── Products, services and proof
    │       │   ├── 06-09 Services Overview → Boilerplate + Copy
    │       │   ├── 06-10 Service Detail → Boilerplate + Copy
    │       │   ├── 06-11 Product Detail → Boilerplate + Copy
    │       │   ├── 06-12 Solution Detail → Boilerplate + Copy
    │       │   ├── 06-13 Industry Solution Page → Boilerplate + Copy
    │       │   ├── 06-14 Customer Case Study → Boilerplate + Copy
    │       │   ├── 06-15 Partners Directory → Boilerplate + Copy
    │       │   └── 06-16 FAQ → Boilerplate + Copy
    │       └── Corporate news and opportunities
    │           ├── 06-17 Newsroom → Boilerplate + Copy
    │           ├── 06-18 Press Release → Boilerplate + Copy
    │           ├── 06-19 Corporate Blog Post → Boilerplate + Copy
    │           ├── 06-20 Job Openings → Boilerplate + Copy
    │           ├── 06-21 Job Posting → Boilerplate + Copy
    │           ├── 06-22 Corporate Event → Boilerplate + Copy
    │           ├── 06-23 Annual Report → Boilerplate + Copy
    │           └── 06-24 Investor Relations → Boilerplate + Copy
    ├── 07 Professional Services / Agency [services]
    │   └── Page Type
    │       ├── Agency structure
    │       │   ├── 07-01 Agency Homepage → Boilerplate + Copy
    │       │   ├── 07-02 About Agency → Boilerplate + Copy
    │       │   ├── 07-03 Contact / Inquiry → Boilerplate + Copy
    │       │   ├── 07-04 Services Index → Boilerplate + Copy
    │       │   ├── 07-05 Individual Service → Boilerplate + Copy
    │       │   ├── 07-06 Specialty / Practice Area → Boilerplate + Copy
    │       │   ├── 07-07 Industries Served → Boilerplate + Copy
    │       │   ├── 07-08 Locations Served → Boilerplate + Copy
    │       │   └── 07-09 Pricing / Packages → Boilerplate + Copy
    │       ├── People, work and credibility
    │       │   ├── 07-10 Team Directory → Boilerplate + Copy
    │       │   ├── 07-11 Practitioner Profile → Boilerplate + Copy
    │       │   ├── 07-12 Portfolio / Work Index → Boilerplate + Copy
    │       │   ├── 07-13 Client Case Study → Boilerplate + Copy
    │       │   ├── 07-14 Client Testimonial → Boilerplate + Copy
    │       │   └── 07-15 Award / Recognition → Boilerplate + Copy
    │       └── Helpful content and events
    │           ├── 07-16 Agency Blog Post → Boilerplate + Copy
    │           ├── 07-17 Professional Article → Boilerplate + Copy
    │           ├── 07-18 How-to Guide → Boilerplate + Copy
    │           ├── 07-19 FAQ Page → Boilerplate + Copy
    │           ├── 07-20 Consultation Information → Boilerplate + Copy
    │           └── 07-21 Workshop / Training Event → Boilerplate + Copy
    ├── 08 Education / E-learning [education]
    │   └── Page Type
    │       ├── Education platform and discovery
    │       │   ├── 08-01 Education Homepage → Boilerplate + Copy
    │       │   ├── 08-02 Learning Catalog → Boilerplate + Copy
    │       │   ├── 08-03 Subject Category → Boilerplate + Copy
    │       │   ├── 08-04 Course Directory → Boilerplate + Copy
    │       │   ├── 08-05 Learning Path → Boilerplate + Copy
    │       │   ├── 08-06 Instructor Directory → Boilerplate + Copy
    │       │   ├── 08-07 About Platform → Boilerplate + Copy
    │       │   └── 08-08 Contact → Boilerplate + Copy
    │       ├── Courses, lessons and resources
    │       │   ├── 08-09 Course Detail → Boilerplate + Copy
    │       │   ├── 08-10 Course Offering / Session → Boilerplate + Copy
    │       │   ├── 08-11 Educational Program → Boilerplate + Copy
    │       │   ├── 08-12 Lesson / Learning Resource → Boilerplate + Copy
    │       │   ├── 08-13 Lesson Module → Boilerplate + Copy
    │       │   ├── 08-14 Tutorial / How-to → Boilerplate + Copy
    │       │   ├── 08-15 Technical Lesson Article → Boilerplate + Copy
    │       │   ├── 08-16 Study Guide → Boilerplate + Copy
    │       │   ├── 08-17 Quiz → Boilerplate + Copy
    │       │   ├── 08-18 Assignment / Worksheet → Boilerplate + Copy
    │       │   ├── 08-19 Video Lesson → Boilerplate + Copy
    │       │   └── 08-20 Book / Textbook Detail → Boilerplate + Copy
    │       └── Learning community and publishing
    │           ├── 08-21 Instructor Profile → Boilerplate + Copy
    │           ├── 08-22 Education Article → Boilerplate + Copy
    │           ├── 08-23 Education Blog Post → Boilerplate + Copy
    │           ├── 08-24 Research Article → Boilerplate + Copy
    │           ├── 08-25 FAQ Page → Boilerplate + Copy
    │           ├── 08-26 Q&A Page → Boilerplate + Copy
    │           ├── 08-27 Webinar / Workshop → Boilerplate + Copy
    │           └── 08-28 Resources Library → Boilerplate + Copy
    ├── 09 Software / SaaS [software]
    │   └── Page Type
    │       ├── Product and company pages
    │       │   ├── 09-01 Software Website Homepage → Boilerplate + Copy
    │       │   ├── 09-02 Product Overview → Boilerplate + Copy
    │       │   ├── 09-03 Web App Details → Boilerplate + Copy
    │       │   ├── 09-04 Mobile App Details → Boilerplate + Copy
    │       │   ├── 09-05 Software Application Details → Boilerplate + Copy
    │       │   ├── 09-06 Features Overview → Boilerplate + Copy
    │       │   ├── 09-07 Single Feature → Boilerplate + Copy
    │       │   ├── 09-08 Pricing Plans → Boilerplate + Copy
    │       │   ├── 09-09 Integration Directory → Boilerplate + Copy
    │       │   ├── 09-10 Integration Detail → Boilerplate + Copy
    │       │   ├── 09-11 About Company → Boilerplate + Copy
    │       │   └── 09-12 Contact → Boilerplate + Copy
    │       ├── Technical help and releases
    │       │   ├── 09-13 Documentation Hub → Boilerplate + Copy
    │       │   ├── 09-14 API Reference → Boilerplate + Copy
    │       │   ├── 09-15 Developer Guide → Boilerplate + Copy
    │       │   ├── 09-16 Technical Article → Boilerplate + Copy
    │       │   ├── 09-17 How-to Tutorial → Boilerplate + Copy
    │       │   ├── 09-18 Release Notes → Boilerplate + Copy
    │       │   ├── 09-19 Changelog → Boilerplate + Copy
    │       │   ├── 09-20 Open Source Code Project → Boilerplate + Copy
    │       │   ├── 09-21 Knowledge Base → Boilerplate + Copy
    │       │   ├── 09-22 FAQ Page → Boilerplate + Copy
    │       │   └── 09-23 Security / Trust Information → Boilerplate + Copy
    │       └── Publishing and use cases
    │           ├── 09-24 Customer Case Study → Boilerplate + Copy
    │           ├── 09-25 Software Comparison → Boilerplate + Copy
    │           └── 09-26 Product Blog Post → Boilerplate + Copy
    ├── 10 Community / Forum [community]
    │   └── Page Type
    │       ├── Community navigation
    │       │   ├── 10-01 Community Homepage → Boilerplate + Copy
    │       │   ├── 10-02 Forum Main Page → Boilerplate + Copy
    │       │   ├── 10-03 Forum Category → Boilerplate + Copy
    │       │   ├── 10-04 Topic / Thread → Boilerplate + Copy
    │       │   ├── 10-05 Question Thread → Boilerplate + Copy
    │       │   ├── 10-06 Public Member Directory → Boilerplate + Copy
    │       │   ├── 10-07 Tag / Topic Directory → Boilerplate + Copy
    │       │   ├── 10-08 About Community → Boilerplate + Copy
    │       │   └── 10-09 Contact / Moderation → Boilerplate + Copy
    │       ├── Members, participation and editorial
    │       │   ├── 10-10 Member Profile → Boilerplate + Copy
    │       │   ├── 10-11 Moderator Profile → Boilerplate + Copy
    │       │   ├── 10-12 Q&A Page → Boilerplate + Copy
    │       │   ├── 10-13 Discussion Announcement → Boilerplate + Copy
    │       │   ├── 10-14 Community Blog Post → Boilerplate + Copy
    │       │   ├── 10-15 Guide / Tutorial → Boilerplate + Copy
    │       │   ├── 10-16 FAQ Page → Boilerplate + Copy
    │       │   ├── 10-17 Community Guidelines → Boilerplate + Copy
    │       │   └── 10-18 Community Rules → Boilerplate + Copy
    │       └── Events and resources
    │           ├── 10-19 Community Event → Boilerplate + Copy
    │           ├── 10-20 Resource Directory → Boilerplate + Copy
    │           └── 10-21 Public Poll Page → Boilerplate + Copy
    ├── 11 Entertainment / Media [entertainment]
    │   └── Page Type
    │       ├── Entertainment catalog and identity
    │       │   ├── 11-01 Entertainment Homepage → Boilerplate + Copy
    │       │   ├── 11-02 Media Catalog → Boilerplate + Copy
    │       │   ├── 11-03 Genre / Category → Boilerplate + Copy
    │       │   ├── 11-04 Actor / Creator Profile → Boilerplate + Copy
    │       │   ├── 11-05 Music Artist Page → Boilerplate + Copy
    │       │   ├── 11-06 About Media Site → Boilerplate + Copy
    │       │   └── 11-07 Contact → Boilerplate + Copy
    │       ├── Movies, shows and videos
    │       │   ├── 11-08 Movie Detail → Boilerplate + Copy
    │       │   ├── 11-09 TV Show Detail → Boilerplate + Copy
    │       │   ├── 11-10 TV Season Detail → Boilerplate + Copy
    │       │   ├── 11-11 TV Episode Detail → Boilerplate + Copy
    │       │   ├── 11-12 Video Content → Boilerplate + Copy
    │       │   ├── 11-13 Video Gallery → Boilerplate + Copy
    │       │   ├── 11-14 Image Gallery → Boilerplate + Copy
    │       │   └── 11-15 Trailer / Teaser → Boilerplate + Copy
    │       ├── Music, podcasts and audio
    │       │   ├── 11-16 Music Track → Boilerplate + Copy
    │       │   ├── 11-17 Music Album → Boilerplate + Copy
    │       │   ├── 11-18 Music Playlist → Boilerplate + Copy
    │       │   ├── 11-19 Podcast Series → Boilerplate + Copy
    │       │   ├── 11-20 Podcast Episode → Boilerplate + Copy
    │       │   └── 11-21 Audio Content → Boilerplate + Copy
    │       └── Media publishing and events
    │           ├── 11-22 Entertainment News → Boilerplate + Copy
    │           ├── 11-23 Review → Boilerplate + Copy
    │           ├── 11-24 Feature Article → Boilerplate + Copy
    │           └── 11-25 Entertainment Event → Boilerplate + Copy
    └── 12 Travel / Tourism [travel]
        └── Page Type
            ├── Travel portal and directories
            │   ├── 12-01 Travel Homepage → Boilerplate + Copy
            │   ├── 12-02 Destinations Directory → Boilerplate + Copy
            │   ├── 12-03 Destination Detail → Boilerplate + Copy
            │   ├── 12-04 Attraction Detail → Boilerplate + Copy
            │   ├── 12-05 Travel Guides Index → Boilerplate + Copy
            │   ├── 12-06 Trip Itineraries Index → Boilerplate + Copy
            │   ├── 12-07 Hotel Directory → Boilerplate + Copy
            │   ├── 12-08 Restaurant Directory → Boilerplate + Copy
            │   ├── 12-09 About Travel Site → Boilerplate + Copy
            │   └── 12-10 Contact → Boilerplate + Copy
            ├── Trips, lodging and services
            │   ├── 12-11 Tourist Itinerary → Boilerplate + Copy
            │   ├── 12-12 Trip Detail → Boilerplate + Copy
            │   ├── 12-13 Tour / Travel Service → Boilerplate + Copy
            │   ├── 12-14 Travel Package → Boilerplate + Copy
            │   ├── 12-15 Hotel Detail → Boilerplate + Copy
            │   ├── 12-16 Accommodation Detail → Boilerplate + Copy
            │   ├── 12-17 Restaurant Detail → Boilerplate + Copy
            │   ├── 12-18 Flight Information → Boilerplate + Copy
            │   └── 12-19 Event / Activity → Boilerplate + Copy
            └── Travel stories and practical resources
                ├── 12-20 Destination Guide Article → Boilerplate + Copy
                ├── 12-21 Travel Blog Post → Boilerplate + Copy
                ├── 12-22 Travel News → Boilerplate + Copy
                ├── 12-23 Travel Tutorial → Boilerplate + Copy
                ├── 12-24 Travel Review → Boilerplate + Copy
                ├── 12-25 Travel Image Gallery → Boilerplate + Copy
                ├── 12-26 Travel Video → Boilerplate + Copy
                ├── 12-27 FAQ Page → Boilerplate + Copy
                └── 12-28 Booking Information → Boilerplate + Copy
```

## 3. Full mapping index

### Category 01 — Blog & Publishing (`blog`)

**Page-type status:** Owner selected — 26 concepts, 28 leaves.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 01-01 | Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 01-02 | Blog Main Page | `Blog` | `WebPage` | `Blog` | `website` |
| 01-03 | Category Page | `blog-category` | `CollectionPage` | `ItemList` | `website` |
| 01-04 | Tag Page | `blog-tag` | `CollectionPage` | `ItemList` | `website` |
| 01-05 | Archive Page | `blog-archive` | `CollectionPage` | `ItemList` | `website` |
| 01-06 | About Page | `AboutPage` | `AboutPage` | — | `website` |
| 01-07 | Contact Page | `ContactPage` | `ContactPage` | — | `website` |
| 01-08 | Author Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` |
| 01-09 | General / Static Page | `WebPage` | `WebPage` | — | `website` |
| 01-10 | General Article | `Article` | `WebPage` | `Article` | `article` |
| 01-11 | Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` |
| 01-12 | Technical Article | `TechArticle` | `WebPage` | `TechArticle` | `article` |
| 01-13 | News Article | `NewsArticle` | `WebPage` | `NewsArticle` | `article` |
| 01-14A | General Opinion / Editorial | `opinion-editorial` | `WebPage` | `Article` | `article` |
| 01-14B | News Opinion / Editorial | `OpinionNewsArticle` | `WebPage` | `OpinionNewsArticle` | `article` |
| 01-15 | Live Blog | `LiveBlogPosting` | `WebPage` | `LiveBlogPosting` | `article` |
| 01-16 | Tutorial / How-to | `HowTo` | `WebPage` | `HowTo` | `article` |
| 01-17 | Review | `Review` | `WebPage` | `Review` | `article` |
| 01-18 | Book Information / Details | `Book` | `WebPage` | `Book` | `book` |
| 01-19 | Book Review | `book-review` | `WebPage` | `Review` | `article` |
| 01-20 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` |
| 01-21 | Q&A Page | `QAPage` | `QAPage` | `Question` | `website` |
| 01-22 | Image Gallery | `ImageGallery` | `ImageGallery` | — | `website` |
| 01-23 | Video Gallery | `VideoGallery` | `VideoGallery` | — | `website` |
| 01-24 | Video Content Page | `video-page` | `WebPage` | `VideoObject` | `video.other` |
| 01-25 | Podcast Episode | `PodcastEpisode` | `WebPage` | `PodcastEpisode` | `website` |
| 01-26A | Event Details | `event-detail` | `WebPage` | `Event` | `website` |
| 01-26B | Event Announcement | `event-announcement` | `WebPage` | `Article` | `article` |

### Category 02 — News & Magazine (`news`)

**Page-type status:** PROPOSED for owner handpicking.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 02-01 | Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 02-02 | News Main Page | `news-main` | `CollectionPage` | `ItemList` | `website` |
| 02-03 | Section / Category Page | `news-section` | `CollectionPage` | `ItemList` | `website` |
| 02-04 | Topic / Tag Page | `news-topic` | `CollectionPage` | `ItemList` | `website` |
| 02-05 | Date Archive | `news-archive` | `CollectionPage` | `ItemList` | `website` |
| 02-06 | About Publication | `AboutPage` | `AboutPage` | — | `website` |
| 02-07 | Contact / News Tips | `ContactPage` | `ContactPage` | — | `website` |
| 02-08 | Reporter Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` |
| 02-09 | General Information Page | `WebPage` | `WebPage` | — | `website` |
| 02-10 | Standard News Article | `NewsArticle` | `WebPage` | `NewsArticle` | `article` |
| 02-11 | Breaking News Article | `breaking-news` | `WebPage` | `NewsArticle` | `article` |
| 02-12 | News Analysis | `AnalysisNewsArticle` | `WebPage` | `AnalysisNewsArticle` | `article` |
| 02-13 | News Reportage | `ReportageNewsArticle` | `WebPage` | `ReportageNewsArticle` | `article` |
| 02-14 | Background / Explainer News | `BackgroundNewsArticle` | `WebPage` | `BackgroundNewsArticle` | `article` |
| 02-15 | Opinion News Article | `OpinionNewsArticle` | `WebPage` | `OpinionNewsArticle` | `article` |
| 02-16 | General Editorial | `news-editorial` | `WebPage` | `Article` | `article` |
| 02-17 | Fact Check | `ClaimReview` | `WebPage` | `ClaimReview` | `article` |
| 02-18 | Live News Blog | `LiveBlogPosting` | `WebPage` | `LiveBlogPosting` | `article` |
| 02-19 | Feature Article | `Article` | `WebPage` | `Article` | `article` |
| 02-20 | Interview Article | `news-interview` | `WebPage` | `Article` | `article` |
| 02-21 | Photo Gallery | `ImageGallery` | `ImageGallery` | — | `website` |
| 02-22 | Video Report | `news-video` | `WebPage` | `VideoObject` | `video.other` |
| 02-23 | Video Gallery | `VideoGallery` | `VideoGallery` | — | `website` |
| 02-24 | Podcast Episode | `PodcastEpisode` | `WebPage` | `PodcastEpisode` | `website` |
| 02-25 | News Event Details | `news-event` | `WebPage` | `Event` | `website` |

### Category 03 — Personal Portfolio (`portfolio`)

**Page-type status:** PROPOSED for owner handpicking.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 03-01 | Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 03-02 | Personal Profile / About | `ProfilePage` | `ProfilePage` | `Person` | `profile` |
| 03-03 | Professional Biography | `portfolio-bio` | `ProfilePage` | `Person` | `profile` |
| 03-04 | Resume / CV Page | `portfolio-resume` | `WebPage` | `Person` | `profile` |
| 03-05 | Contact | `ContactPage` | `ContactPage` | — | `website` |
| 03-06 | Services Overview | `portfolio-services` | `CollectionPage` | `ItemList` | `website` |
| 03-07 | Individual Service | `Service` | `WebPage` | `Service` | `website` |
| 03-08 | FAQ | `FAQPage` | `FAQPage` | `Question` | `website` |
| 03-09 | Projects Index | `portfolio-projects` | `CollectionPage` | `ItemList` | `website` |
| 03-10 | Project Detail | `portfolio-project` | `WebPage` | `CreativeWork` | `website` |
| 03-11 | Case Study | `portfolio-case-study` | `WebPage` | `Article` | `article` |
| 03-12 | Visual Artwork | `VisualArtwork` | `WebPage` | `VisualArtwork` | `website` |
| 03-13 | Photography Work | `Photograph` | `WebPage` | `Photograph` | `website` |
| 03-14 | Image Gallery | `ImageGallery` | `ImageGallery` | — | `website` |
| 03-15 | Video Showreel | `portfolio-showreel` | `WebPage` | `VideoObject` | `video.other` |
| 03-16 | Software Project | `SoftwareSourceCode` | `WebPage` | `SoftwareSourceCode` | `website` |
| 03-17 | Writing Sample | `Article` | `WebPage` | `Article` | `article` |
| 03-18 | Creative Work Collection | `CollectionPage` | `CollectionPage` | `ItemList` | `website` |
| 03-19 | Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` |
| 03-20 | Client Testimonial / Review | `portfolio-review` | `WebPage` | `Review` | `website` |
| 03-21 | Event / Speaking Engagement | `Event` | `WebPage` | `Event` | `website` |
| 03-22 | Press / Media Feature | `portfolio-press` | `WebPage` | `Article` | `article` |

### Category 04 — Documentation & Knowledge Base (`documentation`)

**Page-type status:** PROPOSED for owner handpicking.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 04-01 | Documentation Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 04-02 | Documentation Index | `docs-index` | `CollectionPage` | `ItemList` | `website` |
| 04-03 | Documentation Category | `docs-category` | `CollectionPage` | `ItemList` | `website` |
| 04-04 | Version Index | `docs-version` | `CollectionPage` | `ItemList` | `website` |
| 04-05 | Knowledge Base Landing | `knowledge-base` | `CollectionPage` | `ItemList` | `website` |
| 04-06 | Glossary Index | `DefinedTermSet` | `WebPage` | `DefinedTermSet` | `website` |
| 04-07 | Glossary Term | `DefinedTerm` | `WebPage` | `DefinedTerm` | `website` |
| 04-08 | API Reference | `APIReference` | `WebPage` | `APIReference` | `article` |
| 04-09 | Technical Article | `TechArticle` | `WebPage` | `TechArticle` | `article` |
| 04-10 | Developer Guide | `docs-developer-guide` | `WebPage` | `TechArticle` | `article` |
| 04-11 | Tutorial / How-to | `HowTo` | `WebPage` | `HowTo` | `article` |
| 04-12 | Troubleshooting Guide | `docs-troubleshooting` | `WebPage` | `TechArticle` | `article` |
| 04-13 | Configuration Reference | `docs-configuration` | `WebPage` | `TechArticle` | `article` |
| 04-14 | Code Example | `SoftwareSourceCode` | `WebPage` | `SoftwareSourceCode` | `website` |
| 04-15 | Release Notes | `docs-release-notes` | `WebPage` | `TechArticle` | `article` |
| 04-16 | Changelog | `docs-changelog` | `WebPage` | `WebPage` | `website` |
| 04-17 | Software Documentation Page | `docs-software-page` | `WebPage` | `SoftwareApplication` | `website` |
| 04-18 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` |
| 04-19 | Community Q&A | `QAPage` | `QAPage` | `Question` | `website` |
| 04-20 | Video Tutorial | `docs-video` | `WebPage` | `VideoObject` | `video.other` |
| 04-21 | Support Article | `docs-support-article` | `WebPage` | `TechArticle` | `article` |
| 04-22 | Contact / Support | `ContactPage` | `ContactPage` | — | `website` |

### Category 05 — E-commerce / Online Store (`ecommerce`)

**Page-type status:** PROPOSED for owner handpicking.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 05-01 | Store Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 05-02 | Shop Main Page | `storefront` | `CollectionPage` | `ItemList` | `website` |
| 05-03 | Product Category | `product-category` | `CollectionPage` | `ItemList` | `website` |
| 05-04 | Product Collection | `product-collection` | `CollectionPage` | `ItemList` | `website` |
| 05-05 | Brand Landing Page | `brand-page` | `CollectionPage` | `ItemList` | `website` |
| 05-06 | New Arrivals Listing | `new-arrivals` | `CollectionPage` | `ItemList` | `website` |
| 05-07 | Sale / Promotions Page | `store-promotions` | `CollectionPage` | `ItemList` | `website` |
| 05-08 | Product Detail | `Product` | `ItemPage` | `Product` | `website` |
| 05-09 | Product Group / Variants | `ProductGroup` | `ItemPage` | `ProductGroup` | `website` |
| 05-10 | Specific Product Variant | `product-variant` | `ItemPage` | `Product` | `website` |
| 05-11 | Digital Product | `digital-product` | `ItemPage` | `Product` | `website` |
| 05-12 | Software Product | `SoftwareApplication` | `ItemPage` | `SoftwareApplication` | `website` |
| 05-13 | Service Offering | `Service` | `ItemPage` | `Service` | `website` |
| 05-14 | Individual Offer Page | `Offer` | `ItemPage` | `Offer` | `website` |
| 05-15 | Product Comparison | `product-comparison` | `CollectionPage` | `ItemList` | `website` |
| 05-16 | Buying Guide | `store-buying-guide` | `WebPage` | `Article` | `article` |
| 05-17 | Product Review Article | `store-product-review` | `WebPage` | `Review` | `article` |
| 05-18 | Product FAQ | `FAQPage` | `FAQPage` | `Question` | `website` |
| 05-19 | About Store | `AboutPage` | `AboutPage` | — | `website` |
| 05-20 | Contact Store | `ContactPage` | `ContactPage` | — | `website` |
| 05-21 | Store Location | `Store` | `WebPage` | `Store` | `website` |
| 05-22 | Store Locator | `store-locator` | `CollectionPage` | `ItemList` | `website` |
| 05-23 | Shipping Policy | `shipping-policy` | `WebPage` | — | `website` |
| 05-24 | Returns Policy | `returns-policy` | `WebPage` | — | `website` |

### Category 06 — Business / Corporate (`business`)

**Page-type status:** PROPOSED for owner handpicking.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 06-01 | Corporate Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 06-02 | About Company | `AboutPage` | `AboutPage` | — | `website` |
| 06-03 | Contact Company | `ContactPage` | `ContactPage` | — | `website` |
| 06-04 | Company Locations | `business-locations` | `CollectionPage` | `ItemList` | `website` |
| 06-05 | Individual Office Location | `business-location` | `WebPage` | `Place` | `website` |
| 06-06 | Leadership / Team Directory | `leadership-directory` | `CollectionPage` | `ItemList` | `website` |
| 06-07 | Executive Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` |
| 06-08 | Company Divisions | `business-divisions` | `CollectionPage` | `ItemList` | `website` |
| 06-09 | Services Overview | `business-services` | `CollectionPage` | `ItemList` | `website` |
| 06-10 | Service Detail | `Service` | `WebPage` | `Service` | `website` |
| 06-11 | Product Detail | `Product` | `ItemPage` | `Product` | `website` |
| 06-12 | Solution Detail | `business-solution` | `WebPage` | `Service` | `website` |
| 06-13 | Industry Solution Page | `business-industry` | `WebPage` | `Service` | `website` |
| 06-14 | Customer Case Study | `business-case-study` | `WebPage` | `Article` | `article` |
| 06-15 | Partners Directory | `business-partners` | `CollectionPage` | `ItemList` | `website` |
| 06-16 | FAQ | `FAQPage` | `FAQPage` | `Question` | `website` |
| 06-17 | Newsroom | `business-newsroom` | `CollectionPage` | `ItemList` | `website` |
| 06-18 | Press Release | `business-press-release` | `WebPage` | `NewsArticle` | `article` |
| 06-19 | Corporate Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` |
| 06-20 | Job Openings | `business-careers` | `CollectionPage` | `ItemList` | `website` |
| 06-21 | Job Posting | `JobPosting` | `WebPage` | `JobPosting` | `website` |
| 06-22 | Corporate Event | `Event` | `WebPage` | `Event` | `website` |
| 06-23 | Annual Report | `Report` | `WebPage` | `Report` | `website` |
| 06-24 | Investor Relations | `investor-relations` | `WebPage` | — | `website` |

### Category 07 — Professional Services / Agency (`services`)

**Page-type status:** PROPOSED for owner handpicking.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 07-01 | Agency Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 07-02 | About Agency | `AboutPage` | `AboutPage` | — | `website` |
| 07-03 | Contact / Inquiry | `ContactPage` | `ContactPage` | — | `website` |
| 07-04 | Services Index | `services-index` | `CollectionPage` | `ItemList` | `website` |
| 07-05 | Individual Service | `Service` | `WebPage` | `Service` | `website` |
| 07-06 | Specialty / Practice Area | `practice-area` | `WebPage` | `Service` | `website` |
| 07-07 | Industries Served | `industries-served` | `CollectionPage` | `ItemList` | `website` |
| 07-08 | Locations Served | `service-locations` | `CollectionPage` | `ItemList` | `website` |
| 07-09 | Pricing / Packages | `service-pricing` | `WebPage` | `Service` | `website` |
| 07-10 | Team Directory | `team-directory` | `CollectionPage` | `ItemList` | `website` |
| 07-11 | Practitioner Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` |
| 07-12 | Portfolio / Work Index | `work-index` | `CollectionPage` | `ItemList` | `website` |
| 07-13 | Client Case Study | `agency-case-study` | `WebPage` | `Article` | `article` |
| 07-14 | Client Testimonial | `client-testimonial` | `WebPage` | `Review` | `website` |
| 07-15 | Award / Recognition | `agency-award` | `WebPage` | — | `website` |
| 07-16 | Agency Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` |
| 07-17 | Professional Article | `Article` | `WebPage` | `Article` | `article` |
| 07-18 | How-to Guide | `HowTo` | `WebPage` | `HowTo` | `article` |
| 07-19 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` |
| 07-20 | Consultation Information | `consultation-info` | `WebPage` | `Service` | `website` |
| 07-21 | Workshop / Training Event | `EducationEvent` | `WebPage` | `EducationEvent` | `website` |

### Category 08 — Education / E-learning (`education`)

**Page-type status:** PROPOSED for owner handpicking.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 08-01 | Education Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 08-02 | Learning Catalog | `learning-catalog` | `CollectionPage` | `ItemList` | `website` |
| 08-03 | Subject Category | `subject-category` | `CollectionPage` | `ItemList` | `website` |
| 08-04 | Course Directory | `course-directory` | `CollectionPage` | `ItemList` | `website` |
| 08-05 | Learning Path | `learning-path` | `CollectionPage` | `ItemList` | `website` |
| 08-06 | Instructor Directory | `instructor-directory` | `CollectionPage` | `ItemList` | `website` |
| 08-07 | About Platform | `AboutPage` | `AboutPage` | — | `website` |
| 08-08 | Contact | `ContactPage` | `ContactPage` | — | `website` |
| 08-09 | Course Detail | `Course` | `ItemPage` | `Course` | `website` |
| 08-10 | Course Offering / Session | `CourseInstance` | `ItemPage` | `CourseInstance` | `website` |
| 08-11 | Educational Program | `EducationalOccupationalProgram` | `ItemPage` | `EducationalOccupationalProgram` | `website` |
| 08-12 | Lesson / Learning Resource | `LearningResource` | `WebPage` | `LearningResource` | `website` |
| 08-13 | Lesson Module | `lesson-module` | `CollectionPage` | `ItemList` | `website` |
| 08-14 | Tutorial / How-to | `HowTo` | `WebPage` | `HowTo` | `article` |
| 08-15 | Technical Lesson Article | `TechArticle` | `WebPage` | `TechArticle` | `article` |
| 08-16 | Study Guide | `study-guide` | `WebPage` | `LearningResource` | `website` |
| 08-17 | Quiz | `Quiz` | `WebPage` | `Quiz` | `website` |
| 08-18 | Assignment / Worksheet | `education-worksheet` | `WebPage` | `LearningResource` | `website` |
| 08-19 | Video Lesson | `education-video` | `WebPage` | `VideoObject` | `video.other` |
| 08-20 | Book / Textbook Detail | `Book` | `ItemPage` | `Book` | `book` |
| 08-21 | Instructor Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` |
| 08-22 | Education Article | `Article` | `WebPage` | `Article` | `article` |
| 08-23 | Education Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` |
| 08-24 | Research Article | `ScholarlyArticle` | `WebPage` | `ScholarlyArticle` | `article` |
| 08-25 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` |
| 08-26 | Q&A Page | `QAPage` | `QAPage` | `Question` | `website` |
| 08-27 | Webinar / Workshop | `EducationEvent` | `WebPage` | `EducationEvent` | `website` |
| 08-28 | Resources Library | `education-resources` | `CollectionPage` | `ItemList` | `website` |

### Category 09 — Software / SaaS (`software`)

**Page-type status:** PROPOSED for owner handpicking.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 09-01 | Software Website Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 09-02 | Product Overview | `software-overview` | `WebPage` | `SoftwareApplication` | `website` |
| 09-03 | Web App Details | `WebApplication` | `ItemPage` | `WebApplication` | `website` |
| 09-04 | Mobile App Details | `MobileApplication` | `ItemPage` | `MobileApplication` | `website` |
| 09-05 | Software Application Details | `SoftwareApplication` | `ItemPage` | `SoftwareApplication` | `website` |
| 09-06 | Features Overview | `software-features` | `CollectionPage` | `ItemList` | `website` |
| 09-07 | Single Feature | `software-feature` | `WebPage` | `SoftwareApplication` | `website` |
| 09-08 | Pricing Plans | `software-pricing` | `WebPage` | `SoftwareApplication` | `website` |
| 09-09 | Integration Directory | `software-integrations` | `CollectionPage` | `ItemList` | `website` |
| 09-10 | Integration Detail | `integration-detail` | `WebPage` | `SoftwareApplication` | `website` |
| 09-11 | About Company | `AboutPage` | `AboutPage` | — | `website` |
| 09-12 | Contact | `ContactPage` | `ContactPage` | — | `website` |
| 09-13 | Documentation Hub | `software-docs` | `CollectionPage` | `ItemList` | `website` |
| 09-14 | API Reference | `APIReference` | `WebPage` | `APIReference` | `article` |
| 09-15 | Developer Guide | `software-developer-guide` | `WebPage` | `TechArticle` | `article` |
| 09-16 | Technical Article | `TechArticle` | `WebPage` | `TechArticle` | `article` |
| 09-17 | How-to Tutorial | `HowTo` | `WebPage` | `HowTo` | `article` |
| 09-18 | Release Notes | `software-release-notes` | `WebPage` | `TechArticle` | `article` |
| 09-19 | Changelog | `software-changelog` | `WebPage` | — | `website` |
| 09-20 | Open Source Code Project | `SoftwareSourceCode` | `WebPage` | `SoftwareSourceCode` | `website` |
| 09-21 | Knowledge Base | `software-help` | `CollectionPage` | `ItemList` | `website` |
| 09-22 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` |
| 09-23 | Security / Trust Information | `software-security` | `WebPage` | — | `website` |
| 09-24 | Customer Case Study | `software-case-study` | `WebPage` | `Article` | `article` |
| 09-25 | Software Comparison | `software-comparison` | `CollectionPage` | `ItemList` | `website` |
| 09-26 | Product Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` |

### Category 10 — Community / Forum (`community`)

**Page-type status:** PROPOSED for owner handpicking.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 10-01 | Community Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 10-02 | Forum Main Page | `forum-main` | `CollectionPage` | `ItemList` | `website` |
| 10-03 | Forum Category | `forum-category` | `CollectionPage` | `ItemList` | `website` |
| 10-04 | Topic / Thread | `DiscussionForumPosting` | `WebPage` | `DiscussionForumPosting` | `article` |
| 10-05 | Question Thread | `community-question` | `QAPage` | `Question` | `website` |
| 10-06 | Public Member Directory | `member-directory` | `CollectionPage` | `ItemList` | `website` |
| 10-07 | Tag / Topic Directory | `community-tags` | `CollectionPage` | `ItemList` | `website` |
| 10-08 | About Community | `AboutPage` | `AboutPage` | — | `website` |
| 10-09 | Contact / Moderation | `ContactPage` | `ContactPage` | — | `website` |
| 10-10 | Member Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` |
| 10-11 | Moderator Profile | `moderator-profile` | `ProfilePage` | `Person` | `profile` |
| 10-12 | Q&A Page | `QAPage` | `QAPage` | `Question` | `website` |
| 10-13 | Discussion Announcement | `community-announcement` | `WebPage` | `Article` | `article` |
| 10-14 | Community Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` |
| 10-15 | Guide / Tutorial | `HowTo` | `WebPage` | `HowTo` | `article` |
| 10-16 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` |
| 10-17 | Community Guidelines | `community-guidelines` | `WebPage` | — | `website` |
| 10-18 | Community Rules | `community-rules` | `WebPage` | — | `website` |
| 10-19 | Community Event | `Event` | `WebPage` | `Event` | `website` |
| 10-20 | Resource Directory | `community-resources` | `CollectionPage` | `ItemList` | `website` |
| 10-21 | Public Poll Page | `community-poll` | `WebPage` | — | `website` |

### Category 11 — Entertainment / Media (`entertainment`)

**Page-type status:** PROPOSED for owner handpicking.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 11-01 | Entertainment Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 11-02 | Media Catalog | `media-catalog` | `CollectionPage` | `ItemList` | `website` |
| 11-03 | Genre / Category | `media-genre` | `CollectionPage` | `ItemList` | `website` |
| 11-04 | Actor / Creator Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` |
| 11-05 | Music Artist Page | `MusicGroup` | `WebPage` | `MusicGroup` | `website` |
| 11-06 | About Media Site | `AboutPage` | `AboutPage` | — | `website` |
| 11-07 | Contact | `ContactPage` | `ContactPage` | — | `website` |
| 11-08 | Movie Detail | `Movie` | `ItemPage` | `Movie` | `video.movie` |
| 11-09 | TV Show Detail | `TVSeries` | `ItemPage` | `TVSeries` | `video.tv_show` |
| 11-10 | TV Season Detail | `TVSeason` | `ItemPage` | `TVSeason` | `website` |
| 11-11 | TV Episode Detail | `TVEpisode` | `ItemPage` | `TVEpisode` | `video.episode` |
| 11-12 | Video Content | `media-video` | `WebPage` | `VideoObject` | `video.other` |
| 11-13 | Video Gallery | `VideoGallery` | `VideoGallery` | — | `website` |
| 11-14 | Image Gallery | `ImageGallery` | `ImageGallery` | — | `website` |
| 11-15 | Trailer / Teaser | `media-trailer` | `WebPage` | `VideoObject` | `video.other` |
| 11-16 | Music Track | `MusicRecording` | `ItemPage` | `MusicRecording` | `music.song` |
| 11-17 | Music Album | `MusicAlbum` | `ItemPage` | `MusicAlbum` | `music.album` |
| 11-18 | Music Playlist | `MusicPlaylist` | `ItemPage` | `MusicPlaylist` | `music.playlist` |
| 11-19 | Podcast Series | `PodcastSeries` | `ItemPage` | `PodcastSeries` | `website` |
| 11-20 | Podcast Episode | `PodcastEpisode` | `ItemPage` | `PodcastEpisode` | `website` |
| 11-21 | Audio Content | `AudioObject` | `ItemPage` | `AudioObject` | `website` |
| 11-22 | Entertainment News | `NewsArticle` | `WebPage` | `NewsArticle` | `article` |
| 11-23 | Review | `Review` | `WebPage` | `Review` | `article` |
| 11-24 | Feature Article | `Article` | `WebPage` | `Article` | `article` |
| 11-25 | Entertainment Event | `Event` | `WebPage` | `Event` | `website` |

### Category 12 — Travel / Tourism (`travel`)

**Page-type status:** PROPOSED for owner handpicking.

| Leaf | Page type / sidebar label | CMS key | Schema page node | Main entity | Exact OG type |
|---|---|---|---|---|---|
| 12-01 | Travel Homepage | `homepage` | `WebPage` | `WebSite` | `website` |
| 12-02 | Destinations Directory | `travel-destinations` | `CollectionPage` | `ItemList` | `website` |
| 12-03 | Destination Detail | `TouristDestination` | `ItemPage` | `TouristDestination` | `website` |
| 12-04 | Attraction Detail | `TouristAttraction` | `ItemPage` | `TouristAttraction` | `website` |
| 12-05 | Travel Guides Index | `travel-guides` | `CollectionPage` | `ItemList` | `website` |
| 12-06 | Trip Itineraries Index | `travel-itineraries` | `CollectionPage` | `ItemList` | `website` |
| 12-07 | Hotel Directory | `travel-hotels` | `CollectionPage` | `ItemList` | `website` |
| 12-08 | Restaurant Directory | `travel-restaurants` | `CollectionPage` | `ItemList` | `website` |
| 12-09 | About Travel Site | `AboutPage` | `AboutPage` | — | `website` |
| 12-10 | Contact | `ContactPage` | `ContactPage` | — | `website` |
| 12-11 | Tourist Itinerary | `TouristTrip` | `ItemPage` | `TouristTrip` | `website` |
| 12-12 | Trip Detail | `Trip` | `ItemPage` | `Trip` | `website` |
| 12-13 | Tour / Travel Service | `Service` | `ItemPage` | `Service` | `website` |
| 12-14 | Travel Package | `travel-package` | `ItemPage` | `TouristTrip` | `website` |
| 12-15 | Hotel Detail | `Hotel` | `ItemPage` | `Hotel` | `website` |
| 12-16 | Accommodation Detail | `Accommodation` | `ItemPage` | `Accommodation` | `website` |
| 12-17 | Restaurant Detail | `Restaurant` | `ItemPage` | `Restaurant` | `website` |
| 12-18 | Flight Information | `Flight` | `ItemPage` | `Flight` | `website` |
| 12-19 | Event / Activity | `Event` | `WebPage` | `Event` | `website` |
| 12-20 | Destination Guide Article | `travel-destination-guide` | `WebPage` | `Article` | `article` |
| 12-21 | Travel Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` |
| 12-22 | Travel News | `NewsArticle` | `WebPage` | `NewsArticle` | `article` |
| 12-23 | Travel Tutorial | `HowTo` | `WebPage` | `HowTo` | `article` |
| 12-24 | Travel Review | `Review` | `WebPage` | `Review` | `article` |
| 12-25 | Travel Image Gallery | `ImageGallery` | `ImageGallery` | — | `website` |
| 12-26 | Travel Video | `travel-video` | `WebPage` | `VideoObject` | `video.other` |
| 12-27 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` |
| 12-28 | Booking Information | `travel-booking-info` | `WebPage` | — | `website` |

## 4. Individual specialized boilerplates — one fully specified leaf at a time

**Each leaf below is a separately selectable, read-only sidebar snippet.** This is not a generated HTML page, a full SEO `<head>`, or automatically injected attributes. It is the exact manual marker boilerplate linked to a fixed schema/OG mapping.

### Category 01 — Blog & Publishing (`data-cms-website="blog"`)

**Status:** 28 owner-selected Blog boilerplate leaves (from original v2 registry). **Metadata template:** independent category snapshot, not linked to another category.

#### General website pages

##### 01-01 — Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite; WebPage.isPartOf → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose only for the homepage of this blog website, not every landing page..
- **Structured-data field profile:** WebPage: name, description, url; WebSite: name, url, publisher (only when known).
- **Mapping notes:** The website landing page; WebSite is an entity describing the site, not a WebPage subtype.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="homepage">
```

##### 01-02 — Blog Main Page

- **CMS key:** `Blog` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Blog`](https://schema.org/Blog).
- **Graph relationship:** WebPage.mainEntity → Blog; Blog.isPartOf → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for the main index/landing page of a blog, not an individual post..
- **Structured-data field profile:** Blog: name, description, url, publisher; blogPost links only when real posts are listed.
- **Mapping notes:** Blog is an official CreativeWork type, not an HTML WebPage subtype.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="Blog">
```

##### 01-03 — Category Page

- **CMS key:** `blog-category` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for a blog category listing, not a single article..
- **Structured-data field profile:** CollectionPage: name, url; ItemList: itemListElement (ListItem with position, url) based on visible entries.
- **Mapping notes:** Editorial category archive with a group of posts; no Schema.org BlogCategory class.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="blog-category">
```

##### 01-04 — Tag Page

- **CMS key:** `blog-tag` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for a tag-based listing, not the category index..
- **Structured-data field profile:** CollectionPage: name, url; ItemList: itemListElement from actual tag listing.
- **Mapping notes:** Tag/topic listing; distinct CMS profile but shares official Schema.org CollectionPage.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="blog-tag">
```

##### 01-05 — Archive Page

- **CMS key:** `blog-archive` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for an archive, not the Blog main page..
- **Structured-data field profile:** CollectionPage: name, url; ItemList: itemListElement from actual archive listing.
- **Mapping notes:** Chronological, author-based, or other archive of blog entries.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="blog-archive">
```

##### 01-06 — About Page

- **CMS key:** `AboutPage` — official Schema.org type name.
- **Schema.org document node:** [`AboutPage`](https://schema.org/AboutPage); **primary entity:** none required.
- **Graph relationship:** AboutPage.about → existing configured Person or Organization, only if actually described.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for a page explaining the site, publisher, or author..
- **Structured-data field profile:** AboutPage: name, description, url; about when known.
- **Mapping notes:** AboutPage is an official WebPage subtype. Do not invent a publisher identity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="AboutPage">
```

##### 01-07 — Contact Page

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** ContactPage.about → existing configured publishing identity, only if present.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for a public contact-information page..
- **Structured-data field profile:** ContactPage: name, description, url; contact references only with real details.
- **Mapping notes:** ContactPage is an official WebPage subtype. ContactPoint is not mandatory.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="ContactPage">
```

##### 01-08 — Author Profile

- **CMS key:** `ProfilePage` — official Schema.org type name.
- **Schema.org document node:** [`ProfilePage`](https://schema.org/ProfilePage); **primary entity:** [`Person`](https://schema.org/Person).
- **Graph relationship:** ProfilePage.mainEntity → Person.
- **Exact OG:** `<meta property="og:type" content="profile">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for one identifiable author/person, not an organization profile..
- **Structured-data field profile:** Person: name, url, image, sameAs, description when known; ProfilePage: name, url.
- **Mapping notes:** ProfilePage is the page type; Person is the subject. Open Graph profile refers to an individual.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="ProfilePage">
```

##### 01-09 — General / Static Page

- **CMS key:** `WebPage` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No forced mainEntity.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose only if none of the other selected types accurately matches..
- **Structured-data field profile:** WebPage: name, description, url; optional breadcrumb.
- **Mapping notes:** General public content page without a more precise defined profile.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="WebPage">
```

#### Articles and publishing pages

##### 01-10 — General Article

- **CMS key:** `Article` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article; Article.mainEntityOfPage → WebPage.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for an authored article that is neither a BlogPosting, TechArticle, nor NewsArticle..
- **Structured-data field profile:** Article: headline, description, author, datePublished, dateModified, publisher, image, articleBody if known.
- **Mapping notes:** Default authored article, without a more specific Article subtype.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="Article">
```

##### 01-11 — Blog Post

- **CMS key:** `BlogPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`BlogPosting`](https://schema.org/BlogPosting).
- **Graph relationship:** WebPage.mainEntity → BlogPosting; BlogPosting.isPartOf → Blog (if Blog configured).
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for a conventional blog entry..
- **Structured-data field profile:** BlogPosting: headline, author, datePublished, dateModified, publisher, image; isPartOf when known.
- **Mapping notes:** BlogPosting is a specific official Article subtype.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="BlogPosting">
```

##### 01-12 — Technical Article

- **CMS key:** `TechArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`TechArticle`](https://schema.org/TechArticle).
- **Graph relationship:** WebPage.mainEntity → TechArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for technical explanations, reference articles, or engineering articles..
- **Structured-data field profile:** TechArticle: headline, author, datePublished, dateModified, publisher; proficiencyLevel/dependencies only when known and validated.
- **Mapping notes:** TechArticle is the official Article subtype, distinct from a generic tutorial HowTo.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="TechArticle">
```

##### 01-13 — News Article

- **CMS key:** `NewsArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`NewsArticle`](https://schema.org/NewsArticle).
- **Graph relationship:** WebPage.mainEntity → NewsArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for a reported news story..
- **Structured-data field profile:** NewsArticle: headline, author, datePublished, dateModified, publisher, image.
- **Mapping notes:** Use for journalism/reporting, not any article merely about a recent topic.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="NewsArticle">
```

##### 01-14A — General Opinion / Editorial

- **CMS key:** `opinion-editorial` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for non-news commentary/opinion..
- **Structured-data field profile:** Article: headline, author, datePublished, publisher, articleBody when known.
- **Mapping notes:** CMS alias for essay/editorial not presented as news coverage. No invented OpinionArticle Schema.org class.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="opinion-editorial">
```

##### 01-14B — News Opinion / Editorial

- **CMS key:** `OpinionNewsArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`OpinionNewsArticle`](https://schema.org/OpinionNewsArticle).
- **Graph relationship:** WebPage.mainEntity → OpinionNewsArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for an opinion piece explicitly part of news coverage..
- **Structured-data field profile:** OpinionNewsArticle: headline, author, datePublished, publisher, image when known.
- **Mapping notes:** OpinionNewsArticle is an official subtype of NewsArticle; use only for news-oriented opinion.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="OpinionNewsArticle">
```

##### 01-15 — Live Blog

- **CMS key:** `LiveBlogPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`LiveBlogPosting`](https://schema.org/LiveBlogPosting).
- **Graph relationship:** WebPage.mainEntity → LiveBlogPosting; LiveBlogPosting.liveBlogUpdate → BlogPosting updates (when present).
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for continually updated live text coverage..
- **Structured-data field profile:** LiveBlogPosting: headline, coverageStartTime, coverageEndTime, liveBlogUpdate, author, publisher; only true factual values.
- **Mapping notes:** LiveBlogPosting is an official subtype of BlogPosting intended for rolling coverage.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="LiveBlogPosting">
```

##### 01-16 — Tutorial / How-to

- **CMS key:** `HowTo` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`HowTo`](https://schema.org/HowTo).
- **Graph relationship:** WebPage.mainEntity → HowTo; HowTo.step → HowToStep when actual steps exist.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for a procedural, step-by-step tutorial..
- **Structured-data field profile:** HowTo: name, description, step, supply/tool only when present; do not infer steps.
- **Mapping notes:** HowTo is a CreativeWork type, not an Article subtype. OG article is a publishing presentation choice.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="HowTo">
```

##### 01-17 — Review

- **CMS key:** `Review` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Review`](https://schema.org/Review).
- **Graph relationship:** WebPage.mainEntity → Review; Review.itemReviewed → existing reviewed Thing.
  - `page.mainEntity → Review`: **one**; The page genuinely centers on the mapped entity.
  - `Review.itemReviewed → actual_reviewed_entity`: **one**; Only an actually reviewed product, service, creative work, etc.; its type is sourced from the content, never guessed.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for an authored review of a specific item, service, or creative work..
- **Structured-data field profile:** Review: name, reviewBody, author, itemReviewed; reviewRating only if a real rating exists.
- **Mapping notes:** This is an editorial review; the reviewed item must be specified when data is populated.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="Review">
```

##### 01-18 — Book Information / Details

- **CMS key:** `Book` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Book`](https://schema.org/Book).
- **Graph relationship:** WebPage.mainEntity → Book.
- **Exact OG:** `<meta property="og:type" content="book">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for information about a book itself, not a critical book review..
- **Structured-data field profile:** Book: name, author, isbn, datePublished, image, publisher when known.
- **Mapping notes:** Book describes the work; WebPage describes the page. OG book is an official global type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="Book">
```

##### 01-19 — Book Review

- **CMS key:** `book-review` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Review`](https://schema.org/Review).
- **Graph relationship:** WebPage.mainEntity → Review; Review.itemReviewed → Book.
- **Supporting schema nodes:** `Book`; only according to the conditions below.
  - `page.mainEntity → Review`: **one**; The page genuinely centers on the mapped entity.
  - `Review.itemReviewed → Book`: **one**; Must describe the real book being reviewed.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose when the page evaluates a particular book..
- **Structured-data field profile:** Review: reviewBody, author, itemReviewed; Book: name, author, isbn when known.
- **Mapping notes:** BookReview is not used as a made-up Schema.org class. Two distinct nodes: Review and Book.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="book-review">
```

##### 01-20 — FAQ Page

- **CMS key:** `FAQPage` — official Schema.org type name.
- **Schema.org document node:** [`FAQPage`](https://schema.org/FAQPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one_or_more**; Only actual FAQ items visibly present.
  - `Question.acceptedAnswer → Answer`: **one_per_answered_question**; Only real publisher-provided accepted answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for an FAQ collection, not one community question..
- **Structured-data field profile:** FAQPage: name, url; Question: name, acceptedAnswer.text when real content exists.
- **Mapping notes:** Multiple questions with site-provided answers; not the same as an individual Q&A discussion.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="FAQPage">
```

##### 01-21 — Q&A Page

- **CMS key:** `QAPage` — official Schema.org type name.
- **Schema.org document node:** [`QAPage`](https://schema.org/QAPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** QAPage.mainEntity → Question; Question.acceptedAnswer/suggestedAnswer → real Answer objects.
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one**; One actual central user/community question.
  - `Question.acceptedAnswer → Answer`: **zero_or_one**; Only where a real answer is formally accepted.
  - `Question.suggestedAnswer → Answer`: **zero_or_more**; Only real community answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for one primary question and associated answers..
- **Structured-data field profile:** QAPage: name, url; Question: name, answerCount and answers when present.
- **Mapping notes:** One primary question and its candidate or accepted answers.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="QAPage">
```

#### Multimedia and specialized pages

##### 01-22 — Image Gallery

- **CMS key:** `ImageGallery` — official Schema.org type name.
- **Schema.org document node:** [`ImageGallery`](https://schema.org/ImageGallery); **primary entity:** none required.
- **Graph relationship:** ImageGallery.hasPart → ImageObject[] (only visible media, no forced singular mainEntity).
- **Supporting schema nodes:** `ImageObject`; only according to the conditions below.
  - `page.hasPart → ImageObject`: **zero_or_more**; Only media truly contained or listed in this gallery.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for a page whose main purpose is an image gallery..
- **Structured-data field profile:** ImageGallery: name, url; ImageObject: contentUrl/url, caption when known.
- **Mapping notes:** ImageGallery is an official CollectionPage/MediaGallery subtype.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="ImageGallery">
```

##### 01-23 — Video Gallery

- **CMS key:** `VideoGallery` — official Schema.org type name.
- **Schema.org document node:** [`VideoGallery`](https://schema.org/VideoGallery); **primary entity:** none required.
- **Graph relationship:** VideoGallery.hasPart → VideoObject[] (only visible media, no forced singular mainEntity).
- **Supporting schema nodes:** `VideoObject`; only according to the conditions below.
  - `page.hasPart → VideoObject`: **zero_or_more**; Only media truly contained or listed in this gallery.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for a collection of multiple videos..
- **Structured-data field profile:** VideoGallery: name, url; VideoObject: name, embedUrl/contentUrl, thumbnailUrl when known.
- **Mapping notes:** VideoGallery is an official CollectionPage/MediaGallery subtype; it is not a single-video page.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="VideoGallery">
```

##### 01-24 — Video Content Page

- **CMS key:** `video-page` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`VideoObject`](https://schema.org/VideoObject).
- **Graph relationship:** WebPage.mainEntity → VideoObject.
- **Exact OG:** `<meta property="og:type" content="video.other">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose only when the main item is a playable video; otherwise choose another type..
- **Structured-data field profile:** VideoObject: name, description, thumbnailUrl, uploadDate, embedUrl/contentUrl when known.
- **Mapping notes:** Dedicated video watch/view page, so use the official video.other OG type. Not a general article merely embedding a video.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="video-page">
```

##### 01-25 — Podcast Episode

- **CMS key:** `PodcastEpisode` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`PodcastEpisode`](https://schema.org/PodcastEpisode).
- **Graph relationship:** WebPage.mainEntity → PodcastEpisode; PodcastEpisode.associatedMedia → AudioObject; partOfSeries → PodcastSeries if identified.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for a specific audio podcast episode, not the main podcast index..
- **Structured-data field profile:** PodcastEpisode: name, description, datePublished, associatedMedia, partOfSeries when known.
- **Mapping notes:** PodcastEpisode is valid Schema.org; no official global og:type for podcast episodes.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="PodcastEpisode">
```

##### 01-26A — Event Details

- **CMS key:** `event-detail` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Event`](https://schema.org/Event).
- **Graph relationship:** WebPage.mainEntity → Event.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for one event-detail page..
- **Structured-data field profile:** Event: name, startDate, endDate, location, organizer, offers only when factually known.
- **Mapping notes:** Dedicated event page. Event is the represented thing, not an HTML page subtype.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="event-detail">
```

##### 01-26B — Event Announcement

- **CMS key:** `event-announcement` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article; Article.about → Event only if that event is modeled.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Choose for an article announcing or discussing an event, not the event landing page..
- **Structured-data field profile:** Article: headline, author, datePublished; linked Event node only with verified event data.
- **Mapping notes:** Written announcement/news post about an event; the main content is the article.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="event-announcement">
```

### Category 02 — News & Magazine (`data-cms-website="news"`)

**Status:** Proposed candidate page types; select/reject explicitly before implementation. **Metadata template:** independent category snapshot, not linked to another category.

#### General pages and collections

##### 02-01 — Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Main landing page for the entire news publication.
- **Structured-data field profile:** WebSite: name, url; publisher only if real and configured.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="homepage">
```

##### 02-02 — News Main Page

- **CMS key:** `news-main` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Primary news feed or latest-headlines listing.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-main">
```

##### 02-03 — Section / Category Page

- **CMS key:** `news-section` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Section listing such as politics or technology; not an individual story.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-section">
```

##### 02-04 — Topic / Tag Page

- **CMS key:** `news-topic` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Listing of stories grouped by a named topic or tag.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-topic">
```

##### 02-05 — Date Archive

- **CMS key:** `news-archive` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Chronological archive of published stories.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-archive">
```

##### 02-06 — About Publication

- **CMS key:** `AboutPage` — official Schema.org type name.
- **Schema.org document node:** [`AboutPage`](https://schema.org/AboutPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** About the news publisher or publication.
- **Structured-data field profile:** AboutPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="AboutPage">
```

##### 02-07 — Contact / News Tips

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public editorial contact or news tips information page.
- **Structured-data field profile:** ContactPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="ContactPage">
```

##### 02-08 — Reporter Profile

- **CMS key:** `ProfilePage` — official Schema.org type name.
- **Schema.org document node:** [`ProfilePage`](https://schema.org/ProfilePage); **primary entity:** [`Person`](https://schema.org/Person).
- **Graph relationship:** ProfilePage.mainEntity → Person.
- **Exact OG:** `<meta property="og:type" content="profile">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single named journalist or reporter biography.
- **Structured-data field profile:** Person: name, url; image, sameAs, description only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="ProfilePage">
```

##### 02-09 — General Information Page

- **CMS key:** `WebPage` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public static page that is not a story, section or profile.
- **Structured-data field profile:** WebPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="WebPage">
```

#### Reporting and editorial content

##### 02-10 — Standard News Article

- **CMS key:** `NewsArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`NewsArticle`](https://schema.org/NewsArticle).
- **Graph relationship:** WebPage.mainEntity → NewsArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Straight news story without a more precise reporting subtype.
- **Structured-data field profile:** NewsArticle: headline, author, datePublished, dateModified, publisher and image when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="NewsArticle">
```

##### 02-11 — Breaking News Article

- **CMS key:** `breaking-news` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`NewsArticle`](https://schema.org/NewsArticle).
- **Graph relationship:** WebPage.mainEntity → NewsArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Breaking news story; breaking is editorial status not a separate Schema.org type.
- **Structured-data field profile:** NewsArticle: headline, author, datePublished, dateModified, publisher and image when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="breaking-news">
```

##### 02-12 — News Analysis

- **CMS key:** `AnalysisNewsArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`AnalysisNewsArticle`](https://schema.org/AnalysisNewsArticle).
- **Graph relationship:** WebPage.mainEntity → AnalysisNewsArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** News analysis providing interpretation and context.
- **Structured-data field profile:** AnalysisNewsArticle: headline, author, datePublished; articleBody only when actually present.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="AnalysisNewsArticle">
```

##### 02-13 — News Reportage

- **CMS key:** `ReportageNewsArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`ReportageNewsArticle`](https://schema.org/ReportageNewsArticle).
- **Graph relationship:** WebPage.mainEntity → ReportageNewsArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Reported factual account emphasizing observation over commentary.
- **Structured-data field profile:** ReportageNewsArticle: headline, author, datePublished; articleBody only when actually present.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="ReportageNewsArticle">
```

##### 02-14 — Background / Explainer News

- **CMS key:** `BackgroundNewsArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`BackgroundNewsArticle`](https://schema.org/BackgroundNewsArticle).
- **Graph relationship:** WebPage.mainEntity → BackgroundNewsArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Background briefing that puts a news event in historical context.
- **Structured-data field profile:** BackgroundNewsArticle: headline, author, datePublished; articleBody only when actually present.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="BackgroundNewsArticle">
```

##### 02-15 — Opinion News Article

- **CMS key:** `OpinionNewsArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`OpinionNewsArticle`](https://schema.org/OpinionNewsArticle).
- **Graph relationship:** WebPage.mainEntity → OpinionNewsArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Opinion writing about a news topic by an identified author.
- **Structured-data field profile:** OpinionNewsArticle: headline, author, datePublished; articleBody only when actually present.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="OpinionNewsArticle">
```

##### 02-16 — General Editorial

- **CMS key:** `news-editorial` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Editorial that is not specifically news-opinion subtype.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-editorial">
```

##### 02-17 — Fact Check

- **CMS key:** `ClaimReview` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`ClaimReview`](https://schema.org/ClaimReview).
- **Graph relationship:** WebPage.mainEntity → ClaimReview.
- **Supporting schema nodes:** `Claim`; only according to the conditions below.
  - `page.mainEntity → ClaimReview`: **one**; The page genuinely centers on the mapped entity.
  - `ClaimReview.itemReviewed → Claim`: **one**; A verified target factual claim must be documented; never fabricate.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Published assessment of a specific factual claim; not merely an opinion piece.
- **Structured-data field profile:** ClaimReview: claimReviewed and reviewRating only when a real documented assessment exists.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="ClaimReview">
```

##### 02-18 — Live News Blog

- **CMS key:** `LiveBlogPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`LiveBlogPosting`](https://schema.org/LiveBlogPosting).
- **Graph relationship:** WebPage.mainEntity → LiveBlogPosting.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Continuously updated live coverage with updates.
- **Structured-data field profile:** LiveBlogPosting: headline, coverageStartTime, liveBlogUpdate only for real published update entries.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="LiveBlogPosting">
```

##### 02-19 — Feature Article

- **CMS key:** `Article` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Long-form non-breaking published feature.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="Article">
```

##### 02-20 — Interview Article

- **CMS key:** `news-interview` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Written interview or interview transcript presented as editorial article.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-interview">
```

#### Media and special coverage

##### 02-21 — Photo Gallery

- **CMS key:** `ImageGallery` — official Schema.org type name.
- **Schema.org document node:** [`ImageGallery`](https://schema.org/ImageGallery); **primary entity:** none required.
- **Graph relationship:** ImageGallery.hasPart → ImageObject[] (only visible media, no forced singular mainEntity).
- **Supporting schema nodes:** `ImageObject`; only according to the conditions below.
  - `page.hasPart → ImageObject`: **zero_or_more**; Only media truly contained or listed in this gallery.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Collection of news photographs with the gallery as the primary page.
- **Structured-data field profile:** ImageObject: contentUrl or url, caption, creator when actually available.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="ImageGallery">
```

##### 02-22 — Video Report

- **CMS key:** `news-video` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`VideoObject`](https://schema.org/VideoObject).
- **Graph relationship:** WebPage.mainEntity → VideoObject.
- **Exact OG:** `<meta property="og:type" content="video.other">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single playable video report as the principal content.
- **Structured-data field profile:** VideoObject: name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-video">
```

##### 02-23 — Video Gallery

- **CMS key:** `VideoGallery` — official Schema.org type name.
- **Schema.org document node:** [`VideoGallery`](https://schema.org/VideoGallery); **primary entity:** none required.
- **Graph relationship:** VideoGallery.hasPart → VideoObject[] (only visible media, no forced singular mainEntity).
- **Supporting schema nodes:** `VideoObject`; only according to the conditions below.
  - `page.hasPart → VideoObject`: **zero_or_more**; Only media truly contained or listed in this gallery.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Multiple news videos listed together rather than one video page.
- **Structured-data field profile:** VideoObject: name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="VideoGallery">
```

##### 02-24 — Podcast Episode

- **CMS key:** `PodcastEpisode` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`PodcastEpisode`](https://schema.org/PodcastEpisode).
- **Graph relationship:** WebPage.mainEntity → PodcastEpisode.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One news podcast episode rather than series landing page.
- **Structured-data field profile:** PodcastEpisode: name, episodeNumber, partOfSeries and audio when accurate.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="PodcastEpisode">
```

##### 02-25 — News Event Details

- **CMS key:** `news-event` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Event`](https://schema.org/Event).
- **Graph relationship:** WebPage.mainEntity → Event.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Dedicated description of a real scheduled event; not its news coverage.
- **Structured-data field profile:** Event: name, startDate, location, eventStatus, organizer when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-event">
```

### Category 03 — Personal Portfolio (`data-cms-website="portfolio"`)

**Status:** Proposed candidate page types; select/reject explicitly before implementation. **Metadata template:** independent category snapshot, not linked to another category.

#### Identity and general pages

##### 03-01 — Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Personal portfolio homepage.
- **Structured-data field profile:** WebSite: name, url; publisher only if real and configured.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="homepage">
```

##### 03-02 — Personal Profile / About

- **CMS key:** `ProfilePage` — official Schema.org type name.
- **Schema.org document node:** [`ProfilePage`](https://schema.org/ProfilePage); **primary entity:** [`Person`](https://schema.org/Person).
- **Graph relationship:** ProfilePage.mainEntity → Person.
- **Exact OG:** `<meta property="og:type" content="profile">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Page profiling one individual portfolio owner.
- **Structured-data field profile:** Person: name, url; image, sameAs, description only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="ProfilePage">
```

##### 03-03 — Professional Biography

- **CMS key:** `portfolio-bio` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`ProfilePage`](https://schema.org/ProfilePage); **primary entity:** [`Person`](https://schema.org/Person).
- **Graph relationship:** ProfilePage.mainEntity → Person.
- **Exact OG:** `<meta property="og:type" content="profile">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Long-form biography for an individual, distinct from a short profile page.
- **Structured-data field profile:** Person: name, url; image, sameAs, description only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-bio">
```

##### 03-04 — Resume / CV Page

- **CMS key:** `portfolio-resume` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Person`](https://schema.org/Person).
- **Graph relationship:** WebPage.mainEntity → Person.
- **Exact OG:** `<meta property="og:type" content="profile">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public resume or curriculum vitae page for the portfolio owner.
- **Structured-data field profile:** Person: name, url; image, sameAs, description only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-resume">
```

##### 03-05 — Contact

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public contact page for the portfolio owner.
- **Structured-data field profile:** ContactPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="ContactPage">
```

##### 03-06 — Services Overview

- **CMS key:** `portfolio-services` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Listing of the owner's offered services.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-services">
```

##### 03-07 — Individual Service

- **CMS key:** `Service` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Service`](https://schema.org/Service).
- **Graph relationship:** WebPage.mainEntity → Service.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Detail page describing one service personally offered.
- **Structured-data field profile:** Service: name, description, provider, areaServed, serviceType when evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="Service">
```

##### 03-08 — FAQ

- **CMS key:** `FAQPage` — official Schema.org type name.
- **Schema.org document node:** [`FAQPage`](https://schema.org/FAQPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one_or_more**; Only actual FAQ items visibly present.
  - `Question.acceptedAnswer → Answer`: **one_per_answered_question**; Only real publisher-provided accepted answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Frequently asked questions about the person and work.
- **Structured-data field profile:** FAQPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="FAQPage">
```

#### Projects and creative work

##### 03-09 — Projects Index

- **CMS key:** `portfolio-projects` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Listing of past projects and portfolio pieces.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-projects">
```

##### 03-10 — Project Detail

- **CMS key:** `portfolio-project` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`CreativeWork`](https://schema.org/CreativeWork).
- **Graph relationship:** WebPage.mainEntity → CreativeWork.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Page describing one creative or technical project.
- **Structured-data field profile:** CreativeWork: name, creator, description, dateCreated when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-project">
```

##### 03-11 — Case Study

- **CMS key:** `portfolio-case-study` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Written project case study explaining problem and outcome.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-case-study">
```

##### 03-12 — Visual Artwork

- **CMS key:** `VisualArtwork` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`VisualArtwork`](https://schema.org/VisualArtwork).
- **Graph relationship:** WebPage.mainEntity → VisualArtwork.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single artwork detail page.
- **Structured-data field profile:** VisualArtwork: name, creator, artform, image when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="VisualArtwork">
```

##### 03-13 — Photography Work

- **CMS key:** `Photograph` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Photograph`](https://schema.org/Photograph).
- **Graph relationship:** WebPage.mainEntity → Photograph.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One photograph presented as the principal portfolio work.
- **Structured-data field profile:** Photograph: name, creator, image when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="Photograph">
```

##### 03-14 — Image Gallery

- **CMS key:** `ImageGallery` — official Schema.org type name.
- **Schema.org document node:** [`ImageGallery`](https://schema.org/ImageGallery); **primary entity:** none required.
- **Graph relationship:** ImageGallery.hasPart → ImageObject[] (only visible media, no forced singular mainEntity).
- **Supporting schema nodes:** `ImageObject`; only according to the conditions below.
  - `page.hasPart → ImageObject`: **zero_or_more**; Only media truly contained or listed in this gallery.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Collection of portfolio photographs or illustrations.
- **Structured-data field profile:** ImageObject: contentUrl or url, caption, creator when actually available.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="ImageGallery">
```

##### 03-15 — Video Showreel

- **CMS key:** `portfolio-showreel` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`VideoObject`](https://schema.org/VideoObject).
- **Graph relationship:** WebPage.mainEntity → VideoObject.
- **Exact OG:** `<meta property="og:type" content="video.other">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One playable video demonstration of work.
- **Structured-data field profile:** VideoObject: name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-showreel">
```

##### 03-16 — Software Project

- **CMS key:** `SoftwareSourceCode` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`SoftwareSourceCode`](https://schema.org/SoftwareSourceCode).
- **Graph relationship:** WebPage.mainEntity → SoftwareSourceCode.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Software code project featured in portfolio.
- **Structured-data field profile:** SoftwareSourceCode: codeRepository, programmingLanguage, runtimePlatform only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="SoftwareSourceCode">
```

##### 03-17 — Writing Sample

- **CMS key:** `Article` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One published writing or article sample.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="Article">
```

##### 03-18 — Creative Work Collection

- **CMS key:** `CollectionPage` — official Schema.org type name.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Curated portfolio selection, distinct from all projects index.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="CollectionPage">
```

#### Professional updates

##### 03-19 — Blog Post

- **CMS key:** `BlogPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`BlogPosting`](https://schema.org/BlogPosting).
- **Graph relationship:** WebPage.mainEntity → BlogPosting.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Personal professional blog entry.
- **Structured-data field profile:** BlogPosting: headline, author, datePublished; modified date and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="BlogPosting">
```

##### 03-20 — Client Testimonial / Review

- **CMS key:** `portfolio-review` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Review`](https://schema.org/Review).
- **Graph relationship:** WebPage.mainEntity → Review.
  - `page.mainEntity → Review`: **one**; The page genuinely centers on the mapped entity.
  - `Review.itemReviewed → actual_reviewed_entity`: **one**; Only an actually reviewed product, service, creative work, etc.; its type is sourced from the content, never guessed.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Real third-party testimonial displayed on an independent public page.
- **Structured-data field profile:** Review: itemReviewed, author, reviewBody, reviewRating only for real published review.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-review">
```

##### 03-21 — Event / Speaking Engagement

- **CMS key:** `Event` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Event`](https://schema.org/Event).
- **Graph relationship:** WebPage.mainEntity → Event.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public talk, workshop or personal speaking event details.
- **Structured-data field profile:** Event: name, startDate, location, eventStatus, organizer when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="Event">
```

##### 03-22 — Press / Media Feature

- **CMS key:** `portfolio-press` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Article about media coverage or recognition.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-press">
```

### Category 04 — Documentation & Knowledge Base (`data-cms-website="documentation"`)

**Status:** Proposed candidate page types; select/reject explicitly before implementation. **Metadata template:** independent category snapshot, not linked to another category.

#### Documentation navigation

##### 04-01 — Documentation Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Primary homepage of this documentation website.
- **Structured-data field profile:** WebSite: name, url; publisher only if real and configured.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="homepage">
```

##### 04-02 — Documentation Index

- **CMS key:** `docs-index` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Central documentation topic listing.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-index">
```

##### 04-03 — Documentation Category

- **CMS key:** `docs-category` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Section or category of documentation pages.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-category">
```

##### 04-04 — Version Index

- **CMS key:** `docs-version` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Index of documentation for one version or release.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-version">
```

##### 04-05 — Knowledge Base Landing

- **CMS key:** `knowledge-base` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public support knowledge base portal.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="knowledge-base">
```

##### 04-06 — Glossary Index

- **CMS key:** `DefinedTermSet` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`DefinedTermSet`](https://schema.org/DefinedTermSet).
- **Graph relationship:** WebPage.mainEntity → DefinedTermSet.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Catalog of defined terms.
- **Structured-data field profile:** DefinedTermSet: name, hasDefinedTerm only when term list is real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="DefinedTermSet">
```

##### 04-07 — Glossary Term

- **CMS key:** `DefinedTerm` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`DefinedTerm`](https://schema.org/DefinedTerm).
- **Graph relationship:** WebPage.mainEntity → DefinedTerm.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Definition page for one technical term.
- **Structured-data field profile:** DefinedTerm: name, description, inDefinedTermSet when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="DefinedTerm">
```

#### Technical documentation

##### 04-08 — API Reference

- **CMS key:** `APIReference` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`APIReference`](https://schema.org/APIReference).
- **Graph relationship:** WebPage.mainEntity → APIReference.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Reference page describing an API endpoint or interface.
- **Structured-data field profile:** APIReference: name, description, programmingLanguage, targetPlatform only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="APIReference">
```

##### 04-09 — Technical Article

- **CMS key:** `TechArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`TechArticle`](https://schema.org/TechArticle).
- **Graph relationship:** WebPage.mainEntity → TechArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Explanatory technical document or concept.
- **Structured-data field profile:** TechArticle: headline, author, datePublished; dependencies and proficiencyLevel only if evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="TechArticle">
```

##### 04-10 — Developer Guide

- **CMS key:** `docs-developer-guide` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`TechArticle`](https://schema.org/TechArticle).
- **Graph relationship:** WebPage.mainEntity → TechArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Developer walkthrough or structured guide, not API endpoint reference.
- **Structured-data field profile:** TechArticle: headline, author, datePublished; dependencies and proficiencyLevel only if evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-developer-guide">
```

##### 04-11 — Tutorial / How-to

- **CMS key:** `HowTo` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`HowTo`](https://schema.org/HowTo).
- **Graph relationship:** WebPage.mainEntity → HowTo.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Step-by-step procedure with explicit steps.
- **Structured-data field profile:** HowTo: name, step containing actual HowToStep/HowToDirection content, never invented steps.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="HowTo">
```

##### 04-12 — Troubleshooting Guide

- **CMS key:** `docs-troubleshooting` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`TechArticle`](https://schema.org/TechArticle).
- **Graph relationship:** WebPage.mainEntity → TechArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Diagnostic document about a known problem and resolution.
- **Structured-data field profile:** TechArticle: headline, author, datePublished; dependencies and proficiencyLevel only if evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-troubleshooting">
```

##### 04-13 — Configuration Reference

- **CMS key:** `docs-configuration` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`TechArticle`](https://schema.org/TechArticle).
- **Graph relationship:** WebPage.mainEntity → TechArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Reference for configuration keys, values or options.
- **Structured-data field profile:** TechArticle: headline, author, datePublished; dependencies and proficiencyLevel only if evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-configuration">
```

##### 04-14 — Code Example

- **CMS key:** `SoftwareSourceCode` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`SoftwareSourceCode`](https://schema.org/SoftwareSourceCode).
- **Graph relationship:** WebPage.mainEntity → SoftwareSourceCode.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Standalone sample source-code artifact.
- **Structured-data field profile:** SoftwareSourceCode: codeRepository, programmingLanguage, runtimePlatform only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="SoftwareSourceCode">
```

##### 04-15 — Release Notes

- **CMS key:** `docs-release-notes` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`TechArticle`](https://schema.org/TechArticle).
- **Graph relationship:** WebPage.mainEntity → TechArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Detailed prose about changes in a release.
- **Structured-data field profile:** TechArticle: headline, author, datePublished; dependencies and proficiencyLevel only if evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-release-notes">
```

##### 04-16 — Changelog

- **CMS key:** `docs-changelog` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebPage`](https://schema.org/WebPage).
- **Graph relationship:** WebPage.mainEntity → WebPage.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Chronological change listing, rather than a technical article.
- **Structured-data field profile:** Use only published, genuine properties of the mapped type; do not invent values.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-changelog">
```

##### 04-17 — Software Documentation Page

- **CMS key:** `docs-software-page` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`SoftwareApplication`](https://schema.org/SoftwareApplication).
- **Graph relationship:** WebPage.mainEntity → SoftwareApplication.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** A product-specific documentation landing page about an application.
- **Structured-data field profile:** SoftwareApplication: name, applicationCategory, operatingSystem, offers only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-software-page">
```

#### Help and media

##### 04-18 — FAQ Page

- **CMS key:** `FAQPage` — official Schema.org type name.
- **Schema.org document node:** [`FAQPage`](https://schema.org/FAQPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one_or_more**; Only actual FAQ items visibly present.
  - `Question.acceptedAnswer → Answer`: **one_per_answered_question**; Only real publisher-provided accepted answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Multiple site-authored questions and answers.
- **Structured-data field profile:** FAQPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="FAQPage">
```

##### 04-19 — Community Q&A

- **CMS key:** `QAPage` — official Schema.org type name.
- **Schema.org document node:** [`QAPage`](https://schema.org/QAPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** QAPage.mainEntity → Question; Question.acceptedAnswer/suggestedAnswer → real Answer objects.
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one**; One actual central user/community question.
  - `Question.acceptedAnswer → Answer`: **zero_or_one**; Only where a real answer is formally accepted.
  - `Question.suggestedAnswer → Answer`: **zero_or_more**; Only real community answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Page whose primary purpose is a question with user answers.
- **Structured-data field profile:** QAPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="QAPage">
```

##### 04-20 — Video Tutorial

- **CMS key:** `docs-video` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`VideoObject`](https://schema.org/VideoObject).
- **Graph relationship:** WebPage.mainEntity → VideoObject.
- **Exact OG:** `<meta property="og:type" content="video.other">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single instructional video as main content.
- **Structured-data field profile:** VideoObject: name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-video">
```

##### 04-21 — Support Article

- **CMS key:** `docs-support-article` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`TechArticle`](https://schema.org/TechArticle).
- **Graph relationship:** WebPage.mainEntity → TechArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public technical support guidance article.
- **Structured-data field profile:** TechArticle: headline, author, datePublished; dependencies and proficiencyLevel only if evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-support-article">
```

##### 04-22 — Contact / Support

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** How to contact documentation maintainers or support.
- **Structured-data field profile:** ContactPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="ContactPage">
```

### Category 05 — E-commerce / Online Store (`data-cms-website="ecommerce"`)

**Status:** Proposed candidate page types; select/reject explicitly before implementation. **Metadata template:** independent category snapshot, not linked to another category.

#### Store and browsing pages

##### 05-01 — Store Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public homepage of an online shop.
- **Structured-data field profile:** WebSite: name, url; publisher only if real and configured.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="homepage">
```

##### 05-02 — Shop Main Page

- **CMS key:** `storefront` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Top-level collection of publicly sold items.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="storefront">
```

##### 05-03 — Product Category

- **CMS key:** `product-category` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public category listing with product items.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="product-category">
```

##### 05-04 — Product Collection

- **CMS key:** `product-collection` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Curated group or collection of related products.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="product-collection">
```

##### 05-05 — Brand Landing Page

- **CMS key:** `brand-page` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Brand-specific product selection or storefront.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="brand-page">
```

##### 05-06 — New Arrivals Listing

- **CMS key:** `new-arrivals` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Collection of newly available items.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="new-arrivals">
```

##### 05-07 — Sale / Promotions Page

- **CMS key:** `store-promotions` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public listing of products on promotion; no fabricated offers.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="store-promotions">
```

#### Products and selling information

##### 05-08 — Product Detail

- **CMS key:** `Product` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Product`](https://schema.org/Product).
- **Graph relationship:** ItemPage.mainEntity → Product.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Page describing one identifiable purchasable product.
- **Structured-data field profile:** Product: name, description, sku, brand, image; offers/reviews only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="Product">
```

##### 05-09 — Product Group / Variants

- **CMS key:** `ProductGroup` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`ProductGroup`](https://schema.org/ProductGroup).
- **Graph relationship:** ItemPage.mainEntity → ProductGroup.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Parent grouping multiple product variants as one group.
- **Structured-data field profile:** ProductGroup: name, productGroupID, variesBy, hasVariant when available.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="ProductGroup">
```

##### 05-10 — Specific Product Variant

- **CMS key:** `product-variant` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Product`](https://schema.org/Product).
- **Graph relationship:** ItemPage.mainEntity → Product.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Page for one uniquely identifiable product variant.
- **Structured-data field profile:** Product: name, description, sku, brand, image; offers/reviews only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="product-variant">
```

##### 05-11 — Digital Product

- **CMS key:** `digital-product` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Product`](https://schema.org/Product).
- **Graph relationship:** ItemPage.mainEntity → Product.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Digital item sold as a product when no specialized subtype is asserted.
- **Structured-data field profile:** Product: name, description, sku, brand, image; offers/reviews only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="digital-product">
```

##### 05-12 — Software Product

- **CMS key:** `SoftwareApplication` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`SoftwareApplication`](https://schema.org/SoftwareApplication).
- **Graph relationship:** ItemPage.mainEntity → SoftwareApplication.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Downloadable software or application sold in the shop.
- **Structured-data field profile:** SoftwareApplication: name, applicationCategory, operatingSystem, offers only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="SoftwareApplication">
```

##### 05-13 — Service Offering

- **CMS key:** `Service` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Service`](https://schema.org/Service).
- **Graph relationship:** ItemPage.mainEntity → Service.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One service offered for purchase or booking, with service as main entity.
- **Structured-data field profile:** Service: name, description, provider, areaServed, serviceType when evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="Service">
```

##### 05-14 — Individual Offer Page

- **CMS key:** `Offer` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Offer`](https://schema.org/Offer).
- **Graph relationship:** ItemPage.mainEntity → Offer.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public offer terms for a named item or service.
- **Structured-data field profile:** Offer: price, priceCurrency, availability, seller when actual offer exists.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="Offer">
```

##### 05-15 — Product Comparison

- **CMS key:** `product-comparison` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Neutral structured comparison listing multiple products.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="product-comparison">
```

##### 05-16 — Buying Guide

- **CMS key:** `store-buying-guide` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Editorial guide helping customers choose a product.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="store-buying-guide">
```

##### 05-17 — Product Review Article

- **CMS key:** `store-product-review` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Review`](https://schema.org/Review).
- **Graph relationship:** WebPage.mainEntity → Review.
  - `page.mainEntity → Review`: **one**; The page genuinely centers on the mapped entity.
  - `Review.itemReviewed → actual_reviewed_entity`: **one**; Only an actually reviewed product, service, creative work, etc.; its type is sourced from the content, never guessed.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Editorial review of a specific product, not a product sales page.
- **Structured-data field profile:** Review: itemReviewed, author, reviewBody, reviewRating only for real published review.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="store-product-review">
```

##### 05-18 — Product FAQ

- **CMS key:** `FAQPage` — official Schema.org type name.
- **Schema.org document node:** [`FAQPage`](https://schema.org/FAQPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one_or_more**; Only actual FAQ items visibly present.
  - `Question.acceptedAnswer → Answer`: **one_per_answered_question**; Only real publisher-provided accepted answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Frequently asked questions about products or buying.
- **Structured-data field profile:** FAQPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="FAQPage">
```

#### Store identity and support

##### 05-19 — About Store

- **CMS key:** `AboutPage` — official Schema.org type name.
- **Schema.org document node:** [`AboutPage`](https://schema.org/AboutPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** About the public online shop.
- **Structured-data field profile:** AboutPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="AboutPage">
```

##### 05-20 — Contact Store

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public customer contact details.
- **Structured-data field profile:** ContactPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="ContactPage">
```

##### 05-21 — Store Location

- **CMS key:** `Store` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Store`](https://schema.org/Store).
- **Graph relationship:** WebPage.mainEntity → Store.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One physical store's public location information.
- **Structured-data field profile:** Store: name, address, openingHoursSpecification when accurate.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="Store">
```

##### 05-22 — Store Locator

- **CMS key:** `store-locator` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Directory of multiple physical store locations.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="store-locator">
```

##### 05-23 — Shipping Policy

- **CMS key:** `shipping-policy` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public shipping information and policy.
- **Structured-data field profile:** WebPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="shipping-policy">
```

##### 05-24 — Returns Policy

- **CMS key:** `returns-policy` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Returns or refund policy page.
- **Structured-data field profile:** WebPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="returns-policy">
```

### Category 06 — Business / Corporate (`data-cms-website="business"`)

**Status:** Proposed candidate page types; select/reject explicitly before implementation. **Metadata template:** independent category snapshot, not linked to another category.

#### Corporate identity and navigation

##### 06-01 — Corporate Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Main company website homepage.
- **Structured-data field profile:** WebSite: name, url; publisher only if real and configured.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="homepage">
```

##### 06-02 — About Company

- **CMS key:** `AboutPage` — official Schema.org type name.
- **Schema.org document node:** [`AboutPage`](https://schema.org/AboutPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Corporate background and mission.
- **Structured-data field profile:** AboutPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="AboutPage">
```

##### 06-03 — Contact Company

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Corporate contact information.
- **Structured-data field profile:** ContactPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="ContactPage">
```

##### 06-04 — Company Locations

- **CMS key:** `business-locations` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Directory of public company locations.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-locations">
```

##### 06-05 — Individual Office Location

- **CMS key:** `business-location` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Place`](https://schema.org/Place).
- **Graph relationship:** WebPage.mainEntity → Place.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Physical office or corporate location detail.
- **Structured-data field profile:** Place: name, address, geo when accurate.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-location">
```

##### 06-06 — Leadership / Team Directory

- **CMS key:** `leadership-directory` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Listing of executives or staff profiles.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="leadership-directory">
```

##### 06-07 — Executive Profile

- **CMS key:** `ProfilePage` — official Schema.org type name.
- **Schema.org document node:** [`ProfilePage`](https://schema.org/ProfilePage); **primary entity:** [`Person`](https://schema.org/Person).
- **Graph relationship:** ProfilePage.mainEntity → Person.
- **Exact OG:** `<meta property="og:type" content="profile">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One named executive or team member biography.
- **Structured-data field profile:** Person: name, url; image, sameAs, description only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="ProfilePage">
```

##### 06-08 — Company Divisions

- **CMS key:** `business-divisions` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Directory of internal divisions or business units.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-divisions">
```

#### Products, services and proof

##### 06-09 — Services Overview

- **CMS key:** `business-services` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Overview of offered business services.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-services">
```

##### 06-10 — Service Detail

- **CMS key:** `Service` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Service`](https://schema.org/Service).
- **Graph relationship:** WebPage.mainEntity → Service.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single corporate service detail.
- **Structured-data field profile:** Service: name, description, provider, areaServed, serviceType when evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="Service">
```

##### 06-11 — Product Detail

- **CMS key:** `Product` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Product`](https://schema.org/Product).
- **Graph relationship:** ItemPage.mainEntity → Product.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single sold or commercially marketed product.
- **Structured-data field profile:** Product: name, description, sku, brand, image; offers/reviews only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="Product">
```

##### 06-12 — Solution Detail

- **CMS key:** `business-solution` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Service`](https://schema.org/Service).
- **Graph relationship:** WebPage.mainEntity → Service.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Business solution positioned as a service, not a software application.
- **Structured-data field profile:** Service: name, description, provider, areaServed, serviceType when evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-solution">
```

##### 06-13 — Industry Solution Page

- **CMS key:** `business-industry` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Service`](https://schema.org/Service).
- **Graph relationship:** WebPage.mainEntity → Service.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Service solution tailored to a named industry.
- **Structured-data field profile:** Service: name, description, provider, areaServed, serviceType when evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-industry">
```

##### 06-14 — Customer Case Study

- **CMS key:** `business-case-study` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Detailed customer story written as an article.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-case-study">
```

##### 06-15 — Partners Directory

- **CMS key:** `business-partners` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Published directory of partner organizations.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-partners">
```

##### 06-16 — FAQ

- **CMS key:** `FAQPage` — official Schema.org type name.
- **Schema.org document node:** [`FAQPage`](https://schema.org/FAQPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one_or_more**; Only actual FAQ items visibly present.
  - `Question.acceptedAnswer → Answer`: **one_per_answered_question**; Only real publisher-provided accepted answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Company FAQs with publisher-authored answers.
- **Structured-data field profile:** FAQPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="FAQPage">
```

#### Corporate news and opportunities

##### 06-17 — Newsroom

- **CMS key:** `business-newsroom` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Corporate press and announcement index.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-newsroom">
```

##### 06-18 — Press Release

- **CMS key:** `business-press-release` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`NewsArticle`](https://schema.org/NewsArticle).
- **Graph relationship:** WebPage.mainEntity → NewsArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Official published press release written as news.
- **Structured-data field profile:** NewsArticle: headline, author, datePublished, dateModified, publisher and image when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-press-release">
```

##### 06-19 — Corporate Blog Post

- **CMS key:** `BlogPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`BlogPosting`](https://schema.org/BlogPosting).
- **Graph relationship:** WebPage.mainEntity → BlogPosting.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Published company blog entry.
- **Structured-data field profile:** BlogPosting: headline, author, datePublished; modified date and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="BlogPosting">
```

##### 06-20 — Job Openings

- **CMS key:** `business-careers` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Directory of publicly available positions.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-careers">
```

##### 06-21 — Job Posting

- **CMS key:** `JobPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`JobPosting`](https://schema.org/JobPosting).
- **Graph relationship:** WebPage.mainEntity → JobPosting.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One open job vacancy with real job details.
- **Structured-data field profile:** JobPosting: title, description, hiringOrganization, datePosted, jobLocation when actual.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="JobPosting">
```

##### 06-22 — Corporate Event

- **CMS key:** `Event` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Event`](https://schema.org/Event).
- **Graph relationship:** WebPage.mainEntity → Event.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Scheduled company event or webinar.
- **Structured-data field profile:** Event: name, startDate, location, eventStatus, organizer when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="Event">
```

##### 06-23 — Annual Report

- **CMS key:** `Report` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Report`](https://schema.org/Report).
- **Graph relationship:** WebPage.mainEntity → Report.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One publicly published annual or official report.
- **Structured-data field profile:** Report: name, author, datePublished, about when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="Report">
```

##### 06-24 — Investor Relations

- **CMS key:** `investor-relations` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** General investor information landing page.
- **Structured-data field profile:** WebPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="investor-relations">
```

### Category 07 — Professional Services / Agency (`data-cms-website="services"`)

**Status:** Proposed candidate page types; select/reject explicitly before implementation. **Metadata template:** independent category snapshot, not linked to another category.

#### Agency structure

##### 07-01 — Agency Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Homepage of a professional services business.
- **Structured-data field profile:** WebSite: name, url; publisher only if real and configured.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="homepage">
```

##### 07-02 — About Agency

- **CMS key:** `AboutPage` — official Schema.org type name.
- **Schema.org document node:** [`AboutPage`](https://schema.org/AboutPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Agency or practice background and approach.
- **Structured-data field profile:** AboutPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="AboutPage">
```

##### 07-03 — Contact / Inquiry

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public contact or lead information page.
- **Structured-data field profile:** ContactPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="ContactPage">
```

##### 07-04 — Services Index

- **CMS key:** `services-index` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Listing of offered services.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="services-index">
```

##### 07-05 — Individual Service

- **CMS key:** `Service` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Service`](https://schema.org/Service).
- **Graph relationship:** WebPage.mainEntity → Service.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Page explaining one professional service.
- **Structured-data field profile:** Service: name, description, provider, areaServed, serviceType when evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="Service">
```

##### 07-06 — Specialty / Practice Area

- **CMS key:** `practice-area` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Service`](https://schema.org/Service).
- **Graph relationship:** WebPage.mainEntity → Service.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Specialty service or professional practice area.
- **Structured-data field profile:** Service: name, description, provider, areaServed, serviceType when evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="practice-area">
```

##### 07-07 — Industries Served

- **CMS key:** `industries-served` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Listing of industries served by the agency.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="industries-served">
```

##### 07-08 — Locations Served

- **CMS key:** `service-locations` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Published directory of places or service areas.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="service-locations">
```

##### 07-09 — Pricing / Packages

- **CMS key:** `service-pricing` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Service`](https://schema.org/Service).
- **Graph relationship:** WebPage.mainEntity → Service.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public explanation of fees or service packages, without invented Offer data.
- **Structured-data field profile:** Service: name, description, provider, areaServed, serviceType when evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="service-pricing">
```

#### People, work and credibility

##### 07-10 — Team Directory

- **CMS key:** `team-directory` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Directory of practitioners or consultants.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="team-directory">
```

##### 07-11 — Practitioner Profile

- **CMS key:** `ProfilePage` — official Schema.org type name.
- **Schema.org document node:** [`ProfilePage`](https://schema.org/ProfilePage); **primary entity:** [`Person`](https://schema.org/Person).
- **Graph relationship:** ProfilePage.mainEntity → Person.
- **Exact OG:** `<meta property="og:type" content="profile">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One named individual consultant or practitioner.
- **Structured-data field profile:** Person: name, url; image, sameAs, description only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="ProfilePage">
```

##### 07-12 — Portfolio / Work Index

- **CMS key:** `work-index` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Collection of agency project work.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="work-index">
```

##### 07-13 — Client Case Study

- **CMS key:** `agency-case-study` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Article explaining one client engagement and outcomes.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="agency-case-study">
```

##### 07-14 — Client Testimonial

- **CMS key:** `client-testimonial` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Review`](https://schema.org/Review).
- **Graph relationship:** WebPage.mainEntity → Review.
  - `page.mainEntity → Review`: **one**; The page genuinely centers on the mapped entity.
  - `Review.itemReviewed → actual_reviewed_entity`: **one**; Only an actually reviewed product, service, creative work, etc.; its type is sourced from the content, never guessed.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Genuine client testimonial on a dedicated public page.
- **Structured-data field profile:** Review: itemReviewed, author, reviewBody, reviewRating only for real published review.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="client-testimonial">
```

##### 07-15 — Award / Recognition

- **CMS key:** `agency-award` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public page about one agency recognition or award.
- **Structured-data field profile:** WebPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="agency-award">
```

#### Helpful content and events

##### 07-16 — Agency Blog Post

- **CMS key:** `BlogPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`BlogPosting`](https://schema.org/BlogPosting).
- **Graph relationship:** WebPage.mainEntity → BlogPosting.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Company-authored blog entry.
- **Structured-data field profile:** BlogPosting: headline, author, datePublished; modified date and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="BlogPosting">
```

##### 07-17 — Professional Article

- **CMS key:** `Article` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Educational or thought-leadership article.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="Article">
```

##### 07-18 — How-to Guide

- **CMS key:** `HowTo` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`HowTo`](https://schema.org/HowTo).
- **Graph relationship:** WebPage.mainEntity → HowTo.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Explicit procedural guide written for clients.
- **Structured-data field profile:** HowTo: name, step containing actual HowToStep/HowToDirection content, never invented steps.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="HowTo">
```

##### 07-19 — FAQ Page

- **CMS key:** `FAQPage` — official Schema.org type name.
- **Schema.org document node:** [`FAQPage`](https://schema.org/FAQPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one_or_more**; Only actual FAQ items visibly present.
  - `Question.acceptedAnswer → Answer`: **one_per_answered_question**; Only real publisher-provided accepted answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Answers to frequently asked agency questions.
- **Structured-data field profile:** FAQPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="FAQPage">
```

##### 07-20 — Consultation Information

- **CMS key:** `consultation-info` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Service`](https://schema.org/Service).
- **Graph relationship:** WebPage.mainEntity → Service.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Information about consultation service, not a private booking or payment form.
- **Structured-data field profile:** Service: name, description, provider, areaServed, serviceType when evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="consultation-info">
```

##### 07-21 — Workshop / Training Event

- **CMS key:** `EducationEvent` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`EducationEvent`](https://schema.org/EducationEvent).
- **Graph relationship:** WebPage.mainEntity → EducationEvent.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One real scheduled educational workshop or training event.
- **Structured-data field profile:** EducationEvent: name, startDate, location/virtualLocation, organizer when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="EducationEvent">
```

### Category 08 — Education / E-learning (`data-cms-website="education"`)

**Status:** Proposed candidate page types; select/reject explicitly before implementation. **Metadata template:** independent category snapshot, not linked to another category.

#### Education platform and discovery

##### 08-01 — Education Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Main public landing page for an educational site.
- **Structured-data field profile:** WebSite: name, url; publisher only if real and configured.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="homepage">
```

##### 08-02 — Learning Catalog

- **CMS key:** `learning-catalog` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Central index of public learning offerings.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="learning-catalog">
```

##### 08-03 — Subject Category

- **CMS key:** `subject-category` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Collection of learning resources grouped by subject.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="subject-category">
```

##### 08-04 — Course Directory

- **CMS key:** `course-directory` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public list of available courses.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="course-directory">
```

##### 08-05 — Learning Path

- **CMS key:** `learning-path` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Sequenced selection of courses or lessons, not a Course itself.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="learning-path">
```

##### 08-06 — Instructor Directory

- **CMS key:** `instructor-directory` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public directory of educator profiles.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="instructor-directory">
```

##### 08-07 — About Platform

- **CMS key:** `AboutPage` — official Schema.org type name.
- **Schema.org document node:** [`AboutPage`](https://schema.org/AboutPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Information about educational publisher or platform.
- **Structured-data field profile:** AboutPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="AboutPage">
```

##### 08-08 — Contact

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public contact or admissions information page.
- **Structured-data field profile:** ContactPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="ContactPage">
```

#### Courses, lessons and resources

##### 08-09 — Course Detail

- **CMS key:** `Course` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Course`](https://schema.org/Course).
- **Graph relationship:** ItemPage.mainEntity → Course.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single conceptual course description, independent of dated occurrence.
- **Structured-data field profile:** Course: name, description, provider, courseCode, hasCourseInstance when actual.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="Course">
```

##### 08-10 — Course Offering / Session

- **CMS key:** `CourseInstance` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`CourseInstance`](https://schema.org/CourseInstance).
- **Graph relationship:** ItemPage.mainEntity → CourseInstance.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One scheduled or mode-specific offering of a Course.
- **Structured-data field profile:** CourseInstance: courseMode, courseSchedule, location and course only when specified.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="CourseInstance">
```

##### 08-11 — Educational Program

- **CMS key:** `EducationalOccupationalProgram` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`EducationalOccupationalProgram`](https://schema.org/EducationalOccupationalProgram).
- **Graph relationship:** ItemPage.mainEntity → EducationalOccupationalProgram.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Long-term organized educational or professional program.
- **Structured-data field profile:** EducationalOccupationalProgram: name, provider, educationalProgramMode when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="EducationalOccupationalProgram">
```

##### 08-12 — Lesson / Learning Resource

- **CMS key:** `LearningResource` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`LearningResource`](https://schema.org/LearningResource).
- **Graph relationship:** WebPage.mainEntity → LearningResource.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One standalone lesson with substantial educational material.
- **Structured-data field profile:** LearningResource: name, learningResourceType, educationalLevel, teaches only if real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="LearningResource">
```

##### 08-13 — Lesson Module

- **CMS key:** `lesson-module` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Ordered sequence of lessons within a learning module.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="lesson-module">
```

##### 08-14 — Tutorial / How-to

- **CMS key:** `HowTo` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`HowTo`](https://schema.org/HowTo).
- **Graph relationship:** WebPage.mainEntity → HowTo.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Step-by-step instructional process with explicit steps.
- **Structured-data field profile:** HowTo: name, step containing actual HowToStep/HowToDirection content, never invented steps.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="HowTo">
```

##### 08-15 — Technical Lesson Article

- **CMS key:** `TechArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`TechArticle`](https://schema.org/TechArticle).
- **Graph relationship:** WebPage.mainEntity → TechArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Technical explanation rather than a step-by-step HowTo.
- **Structured-data field profile:** TechArticle: headline, author, datePublished; dependencies and proficiencyLevel only if evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="TechArticle">
```

##### 08-16 — Study Guide

- **CMS key:** `study-guide` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`LearningResource`](https://schema.org/LearningResource).
- **Graph relationship:** WebPage.mainEntity → LearningResource.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Study or revision guide as an educational resource.
- **Structured-data field profile:** LearningResource: name, learningResourceType, educationalLevel, teaches only if real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="study-guide">
```

##### 08-17 — Quiz

- **CMS key:** `Quiz` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Quiz`](https://schema.org/Quiz).
- **Graph relationship:** WebPage.mainEntity → Quiz.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Published quiz assessment as its own resource.
- **Structured-data field profile:** Quiz: about, educationalLevel and questions only when represented by real content.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="Quiz">
```

##### 08-18 — Assignment / Worksheet

- **CMS key:** `education-worksheet` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`LearningResource`](https://schema.org/LearningResource).
- **Graph relationship:** WebPage.mainEntity → LearningResource.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public worksheet or assignment instructions.
- **Structured-data field profile:** LearningResource: name, learningResourceType, educationalLevel, teaches only if real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="education-worksheet">
```

##### 08-19 — Video Lesson

- **CMS key:** `education-video` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`VideoObject`](https://schema.org/VideoObject).
- **Graph relationship:** WebPage.mainEntity → VideoObject.
- **Exact OG:** `<meta property="og:type" content="video.other">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single instructional video as primary content.
- **Structured-data field profile:** VideoObject: name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="education-video">
```

##### 08-20 — Book / Textbook Detail

- **CMS key:** `Book` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Book`](https://schema.org/Book).
- **Graph relationship:** ItemPage.mainEntity → Book.
- **Exact OG:** `<meta property="og:type" content="book">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Information page about a published book or textbook.
- **Structured-data field profile:** Book: name, author, isbn, publisher, bookFormat only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="Book">
```

#### Learning community and publishing

##### 08-21 — Instructor Profile

- **CMS key:** `ProfilePage` — official Schema.org type name.
- **Schema.org document node:** [`ProfilePage`](https://schema.org/ProfilePage); **primary entity:** [`Person`](https://schema.org/Person).
- **Graph relationship:** ProfilePage.mainEntity → Person.
- **Exact OG:** `<meta property="og:type" content="profile">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One public educator or teacher profile.
- **Structured-data field profile:** Person: name, url; image, sameAs, description only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="ProfilePage">
```

##### 08-22 — Education Article

- **CMS key:** `Article` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Educational article separate from course material.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="Article">
```

##### 08-23 — Education Blog Post

- **CMS key:** `BlogPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`BlogPosting`](https://schema.org/BlogPosting).
- **Graph relationship:** WebPage.mainEntity → BlogPosting.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Institution or learning-platform blog post.
- **Structured-data field profile:** BlogPosting: headline, author, datePublished; modified date and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="BlogPosting">
```

##### 08-24 — Research Article

- **CMS key:** `ScholarlyArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`ScholarlyArticle`](https://schema.org/ScholarlyArticle).
- **Graph relationship:** WebPage.mainEntity → ScholarlyArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Scholarly publication or research article.
- **Structured-data field profile:** ScholarlyArticle: headline, author, datePublished, identifier when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="ScholarlyArticle">
```

##### 08-25 — FAQ Page

- **CMS key:** `FAQPage` — official Schema.org type name.
- **Schema.org document node:** [`FAQPage`](https://schema.org/FAQPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one_or_more**; Only actual FAQ items visibly present.
  - `Question.acceptedAnswer → Answer`: **one_per_answered_question**; Only real publisher-provided accepted answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Site-authored questions and answers.
- **Structured-data field profile:** FAQPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="FAQPage">
```

##### 08-26 — Q&A Page

- **CMS key:** `QAPage` — official Schema.org type name.
- **Schema.org document node:** [`QAPage`](https://schema.org/QAPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** QAPage.mainEntity → Question; Question.acceptedAnswer/suggestedAnswer → real Answer objects.
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one**; One actual central user/community question.
  - `Question.acceptedAnswer → Answer`: **zero_or_one**; Only where a real answer is formally accepted.
  - `Question.suggestedAnswer → Answer`: **zero_or_more**; Only real community answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One question with community/user answers.
- **Structured-data field profile:** QAPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="QAPage">
```

##### 08-27 — Webinar / Workshop

- **CMS key:** `EducationEvent` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`EducationEvent`](https://schema.org/EducationEvent).
- **Graph relationship:** WebPage.mainEntity → EducationEvent.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One scheduled educational workshop or webinar.
- **Structured-data field profile:** EducationEvent: name, startDate, location/virtualLocation, organizer when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="EducationEvent">
```

##### 08-28 — Resources Library

- **CMS key:** `education-resources` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Curated listing of learning resources.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="education-resources">
```

### Category 09 — Software / SaaS (`data-cms-website="software"`)

**Status:** Proposed candidate page types; select/reject explicitly before implementation. **Metadata template:** independent category snapshot, not linked to another category.

#### Product and company pages

##### 09-01 — Software Website Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Homepage of a software company or SaaS product.
- **Structured-data field profile:** WebSite: name, url; publisher only if real and configured.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="homepage">
```

##### 09-02 — Product Overview

- **CMS key:** `software-overview` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`SoftwareApplication`](https://schema.org/SoftwareApplication).
- **Graph relationship:** WebPage.mainEntity → SoftwareApplication.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Landing page describing the main software product.
- **Structured-data field profile:** SoftwareApplication: name, applicationCategory, operatingSystem, offers only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-overview">
```

##### 09-03 — Web App Details

- **CMS key:** `WebApplication` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`WebApplication`](https://schema.org/WebApplication).
- **Graph relationship:** ItemPage.mainEntity → WebApplication.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Product page for a specific web application.
- **Structured-data field profile:** WebApplication: name, browserRequirements, applicationCategory, offers only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="WebApplication">
```

##### 09-04 — Mobile App Details

- **CMS key:** `MobileApplication` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`MobileApplication`](https://schema.org/MobileApplication).
- **Graph relationship:** ItemPage.mainEntity → MobileApplication.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Product page for a specific mobile application.
- **Structured-data field profile:** MobileApplication: name, operatingSystem, downloadUrl, offers only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="MobileApplication">
```

##### 09-05 — Software Application Details

- **CMS key:** `SoftwareApplication` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`SoftwareApplication`](https://schema.org/SoftwareApplication).
- **Graph relationship:** ItemPage.mainEntity → SoftwareApplication.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Product detail for a software application with no more specific subtype.
- **Structured-data field profile:** SoftwareApplication: name, applicationCategory, operatingSystem, offers only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="SoftwareApplication">
```

##### 09-06 — Features Overview

- **CMS key:** `software-features` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** List of product features.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-features">
```

##### 09-07 — Single Feature

- **CMS key:** `software-feature` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`SoftwareApplication`](https://schema.org/SoftwareApplication).
- **Graph relationship:** WebPage.mainEntity → SoftwareApplication.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public explanation of one capability of the software.
- **Structured-data field profile:** SoftwareApplication: name, applicationCategory, operatingSystem, offers only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-feature">
```

##### 09-08 — Pricing Plans

- **CMS key:** `software-pricing` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`SoftwareApplication`](https://schema.org/SoftwareApplication).
- **Graph relationship:** WebPage.mainEntity → SoftwareApplication.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public SaaS pricing overview; prices and offers only if real.
- **Structured-data field profile:** SoftwareApplication: name, applicationCategory, operatingSystem, offers only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-pricing">
```

##### 09-09 — Integration Directory

- **CMS key:** `software-integrations` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Collection of supported integrations.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-integrations">
```

##### 09-10 — Integration Detail

- **CMS key:** `integration-detail` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`SoftwareApplication`](https://schema.org/SoftwareApplication).
- **Graph relationship:** WebPage.mainEntity → SoftwareApplication.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Page about one integration of the software product.
- **Structured-data field profile:** SoftwareApplication: name, applicationCategory, operatingSystem, offers only when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="integration-detail">
```

##### 09-11 — About Company

- **CMS key:** `AboutPage` — official Schema.org type name.
- **Schema.org document node:** [`AboutPage`](https://schema.org/AboutPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** About the software publisher.
- **Structured-data field profile:** AboutPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="AboutPage">
```

##### 09-12 — Contact

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public company contact page.
- **Structured-data field profile:** ContactPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="ContactPage">
```

#### Technical help and releases

##### 09-13 — Documentation Hub

- **CMS key:** `software-docs` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Index of software documentation.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-docs">
```

##### 09-14 — API Reference

- **CMS key:** `APIReference` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`APIReference`](https://schema.org/APIReference).
- **Graph relationship:** WebPage.mainEntity → APIReference.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** API endpoint or technical interface reference.
- **Structured-data field profile:** APIReference: name, description, programmingLanguage, targetPlatform only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="APIReference">
```

##### 09-15 — Developer Guide

- **CMS key:** `software-developer-guide` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`TechArticle`](https://schema.org/TechArticle).
- **Graph relationship:** WebPage.mainEntity → TechArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Instructions for integrating or extending software.
- **Structured-data field profile:** TechArticle: headline, author, datePublished; dependencies and proficiencyLevel only if evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-developer-guide">
```

##### 09-16 — Technical Article

- **CMS key:** `TechArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`TechArticle`](https://schema.org/TechArticle).
- **Graph relationship:** WebPage.mainEntity → TechArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Explanation of technical behavior or design.
- **Structured-data field profile:** TechArticle: headline, author, datePublished; dependencies and proficiencyLevel only if evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="TechArticle">
```

##### 09-17 — How-to Tutorial

- **CMS key:** `HowTo` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`HowTo`](https://schema.org/HowTo).
- **Graph relationship:** WebPage.mainEntity → HowTo.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Step-by-step procedural tutorial.
- **Structured-data field profile:** HowTo: name, step containing actual HowToStep/HowToDirection content, never invented steps.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="HowTo">
```

##### 09-18 — Release Notes

- **CMS key:** `software-release-notes` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`TechArticle`](https://schema.org/TechArticle).
- **Graph relationship:** WebPage.mainEntity → TechArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Published explanation of changes in one release.
- **Structured-data field profile:** TechArticle: headline, author, datePublished; dependencies and proficiencyLevel only if evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-release-notes">
```

##### 09-19 — Changelog

- **CMS key:** `software-changelog` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Chronological list of product changes.
- **Structured-data field profile:** WebPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-changelog">
```

##### 09-20 — Open Source Code Project

- **CMS key:** `SoftwareSourceCode` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`SoftwareSourceCode`](https://schema.org/SoftwareSourceCode).
- **Graph relationship:** WebPage.mainEntity → SoftwareSourceCode.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public overview of a software source-code project.
- **Structured-data field profile:** SoftwareSourceCode: codeRepository, programmingLanguage, runtimePlatform only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="SoftwareSourceCode">
```

##### 09-21 — Knowledge Base

- **CMS key:** `software-help` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Published product support knowledge base.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-help">
```

##### 09-22 — FAQ Page

- **CMS key:** `FAQPage` — official Schema.org type name.
- **Schema.org document node:** [`FAQPage`](https://schema.org/FAQPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one_or_more**; Only actual FAQ items visibly present.
  - `Question.acceptedAnswer → Answer`: **one_per_answered_question**; Only real publisher-provided accepted answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Publisher-authored questions and answers.
- **Structured-data field profile:** FAQPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="FAQPage">
```

##### 09-23 — Security / Trust Information

- **CMS key:** `software-security` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public product security and trust information.
- **Structured-data field profile:** WebPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-security">
```

#### Publishing and use cases

##### 09-24 — Customer Case Study

- **CMS key:** `software-case-study` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Written case study about a customer or use case.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-case-study">
```

##### 09-25 — Software Comparison

- **CMS key:** `software-comparison` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Comparison of multiple software options as a collection.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-comparison">
```

##### 09-26 — Product Blog Post

- **CMS key:** `BlogPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`BlogPosting`](https://schema.org/BlogPosting).
- **Graph relationship:** WebPage.mainEntity → BlogPosting.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Published software company blog post.
- **Structured-data field profile:** BlogPosting: headline, author, datePublished; modified date and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="BlogPosting">
```

### Category 10 — Community / Forum (`data-cms-website="community"`)

**Status:** Proposed candidate page types; select/reject explicitly before implementation. **Metadata template:** independent category snapshot, not linked to another category.

#### Community navigation

##### 10-01 — Community Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Primary public homepage of a forum or community.
- **Structured-data field profile:** WebSite: name, url; publisher only if real and configured.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="homepage">
```

##### 10-02 — Forum Main Page

- **CMS key:** `forum-main` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Top-level public discussion forum directory.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="forum-main">
```

##### 10-03 — Forum Category

- **CMS key:** `forum-category` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Collection of forum threads under a topic/category.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="forum-category">
```

##### 10-04 — Topic / Thread

- **CMS key:** `DiscussionForumPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`DiscussionForumPosting`](https://schema.org/DiscussionForumPosting).
- **Graph relationship:** WebPage.mainEntity → DiscussionForumPosting.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One main publicly readable forum thread initiating discussion.
- **Structured-data field profile:** DiscussionForumPosting: headline, text, author, datePublished; comments when published.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="DiscussionForumPosting">
```

##### 10-05 — Question Thread

- **CMS key:** `community-question` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`QAPage`](https://schema.org/QAPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** QAPage.mainEntity → Question; Question.acceptedAnswer/suggestedAnswer → real Answer objects.
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one**; One actual central user/community question.
  - `Question.acceptedAnswer → Answer`: **zero_or_one**; Only where a real answer is formally accepted.
  - `Question.suggestedAnswer → Answer`: **zero_or_more**; Only real community answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Thread focused on a question with one or more answers.
- **Structured-data field profile:** Question: name, text, acceptedAnswer/suggestedAnswer only when visible and true.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-question">
```

##### 10-06 — Public Member Directory

- **CMS key:** `member-directory` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public index of community member profiles.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="member-directory">
```

##### 10-07 — Tag / Topic Directory

- **CMS key:** `community-tags` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Index of topics or tags in a community.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-tags">
```

##### 10-08 — About Community

- **CMS key:** `AboutPage` — official Schema.org type name.
- **Schema.org document node:** [`AboutPage`](https://schema.org/AboutPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Information explaining the community's purpose.
- **Structured-data field profile:** AboutPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="AboutPage">
```

##### 10-09 — Contact / Moderation

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public contact with community staff.
- **Structured-data field profile:** ContactPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="ContactPage">
```

#### Members, participation and editorial

##### 10-10 — Member Profile

- **CMS key:** `ProfilePage` — official Schema.org type name.
- **Schema.org document node:** [`ProfilePage`](https://schema.org/ProfilePage); **primary entity:** [`Person`](https://schema.org/Person).
- **Graph relationship:** ProfilePage.mainEntity → Person.
- **Exact OG:** `<meta property="og:type" content="profile">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public profile about a single individual member.
- **Structured-data field profile:** Person: name, url; image, sameAs, description only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="ProfilePage">
```

##### 10-11 — Moderator Profile

- **CMS key:** `moderator-profile` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`ProfilePage`](https://schema.org/ProfilePage); **primary entity:** [`Person`](https://schema.org/Person).
- **Graph relationship:** ProfilePage.mainEntity → Person.
- **Exact OG:** `<meta property="og:type" content="profile">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public personal profile of a named moderator.
- **Structured-data field profile:** Person: name, url; image, sameAs, description only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="moderator-profile">
```

##### 10-12 — Q&A Page

- **CMS key:** `QAPage` — official Schema.org type name.
- **Schema.org document node:** [`QAPage`](https://schema.org/QAPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** QAPage.mainEntity → Question; Question.acceptedAnswer/suggestedAnswer → real Answer objects.
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one**; One actual central user/community question.
  - `Question.acceptedAnswer → Answer`: **zero_or_one**; Only where a real answer is formally accepted.
  - `Question.suggestedAnswer → Answer`: **zero_or_more**; Only real community answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Standalone question and accepted or suggested answers.
- **Structured-data field profile:** Question: name, text, acceptedAnswer/suggestedAnswer only when visible and true.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="QAPage">
```

##### 10-13 — Discussion Announcement

- **CMS key:** `community-announcement` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Publisher-authored community announcement rather than a user thread.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-announcement">
```

##### 10-14 — Community Blog Post

- **CMS key:** `BlogPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`BlogPosting`](https://schema.org/BlogPosting).
- **Graph relationship:** WebPage.mainEntity → BlogPosting.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Community editorial blog article.
- **Structured-data field profile:** BlogPosting: headline, author, datePublished; modified date and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="BlogPosting">
```

##### 10-15 — Guide / Tutorial

- **CMS key:** `HowTo` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`HowTo`](https://schema.org/HowTo).
- **Graph relationship:** WebPage.mainEntity → HowTo.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Stepwise community resource or procedural guide.
- **Structured-data field profile:** HowTo: name, step containing actual HowToStep/HowToDirection content, never invented steps.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="HowTo">
```

##### 10-16 — FAQ Page

- **CMS key:** `FAQPage` — official Schema.org type name.
- **Schema.org document node:** [`FAQPage`](https://schema.org/FAQPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one_or_more**; Only actual FAQ items visibly present.
  - `Question.acceptedAnswer → Answer`: **one_per_answered_question**; Only real publisher-provided accepted answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Official publisher-provided answers to recurring questions.
- **Structured-data field profile:** FAQPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="FAQPage">
```

##### 10-17 — Community Guidelines

- **CMS key:** `community-guidelines` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public behavior rules and posting guidelines.
- **Structured-data field profile:** WebPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-guidelines">
```

##### 10-18 — Community Rules

- **CMS key:** `community-rules` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public forum rules page separate from general guidelines.
- **Structured-data field profile:** WebPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-rules">
```

#### Events and resources

##### 10-19 — Community Event

- **CMS key:** `Event` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Event`](https://schema.org/Event).
- **Graph relationship:** WebPage.mainEntity → Event.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One real upcoming or past community event.
- **Structured-data field profile:** Event: name, startDate, location, eventStatus, organizer when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="Event">
```

##### 10-20 — Resource Directory

- **CMS key:** `community-resources` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Curated community links or learning materials.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-resources">
```

##### 10-21 — Public Poll Page

- **CMS key:** `community-poll` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public informational page for a poll, without fabricating Question schema.
- **Structured-data field profile:** WebPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-poll">
```

### Category 11 — Entertainment / Media (`data-cms-website="entertainment"`)

**Status:** Proposed candidate page types; select/reject explicitly before implementation. **Metadata template:** independent category snapshot, not linked to another category.

#### Entertainment catalog and identity

##### 11-01 — Entertainment Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Main public homepage of an entertainment/media site.
- **Structured-data field profile:** WebSite: name, url; publisher only if real and configured.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="homepage">
```

##### 11-02 — Media Catalog

- **CMS key:** `media-catalog` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Index of media titles, shows, tracks or creators.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="media-catalog">
```

##### 11-03 — Genre / Category

- **CMS key:** `media-genre` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Listing of media grouped by genre.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="media-genre">
```

##### 11-04 — Actor / Creator Profile

- **CMS key:** `ProfilePage` — official Schema.org type name.
- **Schema.org document node:** [`ProfilePage`](https://schema.org/ProfilePage); **primary entity:** [`Person`](https://schema.org/Person).
- **Graph relationship:** ProfilePage.mainEntity → Person.
- **Exact OG:** `<meta property="og:type" content="profile">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Page profiling one individual actor or content creator.
- **Structured-data field profile:** Person: name, url; image, sameAs, description only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="ProfilePage">
```

##### 11-05 — Music Artist Page

- **CMS key:** `MusicGroup` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`MusicGroup`](https://schema.org/MusicGroup).
- **Graph relationship:** WebPage.mainEntity → MusicGroup.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public page for a band or music group rather than an individual profile.
- **Structured-data field profile:** MusicGroup: name, member, genre when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="MusicGroup">
```

##### 11-06 — About Media Site

- **CMS key:** `AboutPage` — official Schema.org type name.
- **Schema.org document node:** [`AboutPage`](https://schema.org/AboutPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Information about the entertainment publisher.
- **Structured-data field profile:** AboutPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="AboutPage">
```

##### 11-07 — Contact

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public contact and media enquiries.
- **Structured-data field profile:** ContactPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="ContactPage">
```

#### Movies, shows and videos

##### 11-08 — Movie Detail

- **CMS key:** `Movie` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Movie`](https://schema.org/Movie).
- **Graph relationship:** ItemPage.mainEntity → Movie.
- **Exact OG:** `<meta property="og:type" content="video.movie">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single film detail page.
- **Structured-data field profile:** Movie: name, director, actor, duration, datePublished when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="Movie">
```

##### 11-09 — TV Show Detail

- **CMS key:** `TVSeries` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`TVSeries`](https://schema.org/TVSeries).
- **Graph relationship:** ItemPage.mainEntity → TVSeries.
- **Exact OG:** `<meta property="og:type" content="video.tv_show">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single television show or series detail.
- **Structured-data field profile:** TVSeries: name, numberOfSeasons, actor, productionCompany when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="TVSeries">
```

##### 11-10 — TV Season Detail

- **CMS key:** `TVSeason` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`TVSeason`](https://schema.org/TVSeason).
- **Graph relationship:** ItemPage.mainEntity → TVSeason.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One season within a television series.
- **Structured-data field profile:** TVSeason: seasonNumber, partOfSeries, episode when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="TVSeason">
```

##### 11-11 — TV Episode Detail

- **CMS key:** `TVEpisode` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`TVEpisode`](https://schema.org/TVEpisode).
- **Graph relationship:** ItemPage.mainEntity → TVEpisode.
- **Exact OG:** `<meta property="og:type" content="video.episode">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single episode belonging to a TV series.
- **Structured-data field profile:** TVEpisode: episodeNumber, partOfSeason, partOfSeries, name when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="TVEpisode">
```

##### 11-12 — Video Content

- **CMS key:** `media-video` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`VideoObject`](https://schema.org/VideoObject).
- **Graph relationship:** WebPage.mainEntity → VideoObject.
- **Exact OG:** `<meta property="og:type" content="video.other">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One standalone playable video as main subject.
- **Structured-data field profile:** VideoObject: name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="media-video">
```

##### 11-13 — Video Gallery

- **CMS key:** `VideoGallery` — official Schema.org type name.
- **Schema.org document node:** [`VideoGallery`](https://schema.org/VideoGallery); **primary entity:** none required.
- **Graph relationship:** VideoGallery.hasPart → VideoObject[] (only visible media, no forced singular mainEntity).
- **Supporting schema nodes:** `VideoObject`; only according to the conditions below.
  - `page.hasPart → VideoObject`: **zero_or_more**; Only media truly contained or listed in this gallery.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Gallery listing multiple video items.
- **Structured-data field profile:** VideoObject: name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="VideoGallery">
```

##### 11-14 — Image Gallery

- **CMS key:** `ImageGallery` — official Schema.org type name.
- **Schema.org document node:** [`ImageGallery`](https://schema.org/ImageGallery); **primary entity:** none required.
- **Graph relationship:** ImageGallery.hasPart → ImageObject[] (only visible media, no forced singular mainEntity).
- **Supporting schema nodes:** `ImageObject`; only according to the conditions below.
  - `page.hasPart → ImageObject`: **zero_or_more**; Only media truly contained or listed in this gallery.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Gallery of entertainment images.
- **Structured-data field profile:** ImageObject: contentUrl or url, caption, creator when actually available.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="ImageGallery">
```

##### 11-15 — Trailer / Teaser

- **CMS key:** `media-trailer` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`VideoObject`](https://schema.org/VideoObject).
- **Graph relationship:** WebPage.mainEntity → VideoObject.
- **Exact OG:** `<meta property="og:type" content="video.other">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One playable film or series trailer rather than full Movie detail.
- **Structured-data field profile:** VideoObject: name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="media-trailer">
```

#### Music, podcasts and audio

##### 11-16 — Music Track

- **CMS key:** `MusicRecording` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`MusicRecording`](https://schema.org/MusicRecording).
- **Graph relationship:** ItemPage.mainEntity → MusicRecording.
- **Exact OG:** `<meta property="og:type" content="music.song">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single published audio track or song.
- **Structured-data field profile:** MusicRecording: name, byArtist, duration, inAlbum when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="MusicRecording">
```

##### 11-17 — Music Album

- **CMS key:** `MusicAlbum` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`MusicAlbum`](https://schema.org/MusicAlbum).
- **Graph relationship:** ItemPage.mainEntity → MusicAlbum.
- **Exact OG:** `<meta property="og:type" content="music.album">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One published music album.
- **Structured-data field profile:** MusicAlbum: name, byArtist, track, albumReleaseType when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="MusicAlbum">
```

##### 11-18 — Music Playlist

- **CMS key:** `MusicPlaylist` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`MusicPlaylist`](https://schema.org/MusicPlaylist).
- **Graph relationship:** ItemPage.mainEntity → MusicPlaylist.
- **Exact OG:** `<meta property="og:type" content="music.playlist">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Curated playlist of tracks.
- **Structured-data field profile:** MusicPlaylist: name, track, numTracks when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="MusicPlaylist">
```

##### 11-19 — Podcast Series

- **CMS key:** `PodcastSeries` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`PodcastSeries`](https://schema.org/PodcastSeries).
- **Graph relationship:** ItemPage.mainEntity → PodcastSeries.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Top-level page about a podcast series.
- **Structured-data field profile:** PodcastSeries: name, description, url; episodes only when available.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="PodcastSeries">
```

##### 11-20 — Podcast Episode

- **CMS key:** `PodcastEpisode` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`PodcastEpisode`](https://schema.org/PodcastEpisode).
- **Graph relationship:** ItemPage.mainEntity → PodcastEpisode.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One episode of a podcast series.
- **Structured-data field profile:** PodcastEpisode: name, episodeNumber, partOfSeries and audio when accurate.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="PodcastEpisode">
```

##### 11-21 — Audio Content

- **CMS key:** `AudioObject` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`AudioObject`](https://schema.org/AudioObject).
- **Graph relationship:** ItemPage.mainEntity → AudioObject.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Audio file or work not otherwise a song or podcast episode.
- **Structured-data field profile:** AudioObject: name, description, contentUrl/encodingFormat when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="AudioObject">
```

#### Media publishing and events

##### 11-22 — Entertainment News

- **CMS key:** `NewsArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`NewsArticle`](https://schema.org/NewsArticle).
- **Graph relationship:** WebPage.mainEntity → NewsArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** News report about entertainment.
- **Structured-data field profile:** NewsArticle: headline, author, datePublished, dateModified, publisher and image when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="NewsArticle">
```

##### 11-23 — Review

- **CMS key:** `Review` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Review`](https://schema.org/Review).
- **Graph relationship:** WebPage.mainEntity → Review.
  - `page.mainEntity → Review`: **one**; The page genuinely centers on the mapped entity.
  - `Review.itemReviewed → actual_reviewed_entity`: **one**; Only an actually reviewed product, service, creative work, etc.; its type is sourced from the content, never guessed.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Published review of a media work.
- **Structured-data field profile:** Review: itemReviewed, author, reviewBody, reviewRating only for real published review.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="Review">
```

##### 11-24 — Feature Article

- **CMS key:** `Article` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Entertainment feature story or interview.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="Article">
```

##### 11-25 — Entertainment Event

- **CMS key:** `Event` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Event`](https://schema.org/Event).
- **Graph relationship:** WebPage.mainEntity → Event.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Real scheduled concert, performance or entertainment event.
- **Structured-data field profile:** Event: name, startDate, location, eventStatus, organizer when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="Event">
```

### Category 12 — Travel / Tourism (`data-cms-website="travel"`)

**Status:** Proposed candidate page types; select/reject explicitly before implementation. **Metadata template:** independent category snapshot, not linked to another category.

#### Travel portal and directories

##### 12-01 — Travel Homepage

- **CMS key:** `homepage` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`WebSite`](https://schema.org/WebSite).
- **Graph relationship:** WebPage.mainEntity → WebSite.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Main public homepage for travel website.
- **Structured-data field profile:** WebSite: name, url; publisher only if real and configured.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="homepage">
```

##### 12-02 — Destinations Directory

- **CMS key:** `travel-destinations` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Browse multiple destinations in a directory.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-destinations">
```

##### 12-03 — Destination Detail

- **CMS key:** `TouristDestination` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`TouristDestination`](https://schema.org/TouristDestination).
- **Graph relationship:** ItemPage.mainEntity → TouristDestination.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single defined tourist destination such as a city or region.
- **Structured-data field profile:** TouristDestination: name, description, geo and touristType when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="TouristDestination">
```

##### 12-04 — Attraction Detail

- **CMS key:** `TouristAttraction` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`TouristAttraction`](https://schema.org/TouristAttraction).
- **Graph relationship:** ItemPage.mainEntity → TouristAttraction.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One named tourist attraction or point of interest.
- **Structured-data field profile:** TouristAttraction: name, description, geo/address when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="TouristAttraction">
```

##### 12-05 — Travel Guides Index

- **CMS key:** `travel-guides` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Index of destination or advice travel guides.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-guides">
```

##### 12-06 — Trip Itineraries Index

- **CMS key:** `travel-itineraries` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Listing of curated travel itineraries.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-itineraries">
```

##### 12-07 — Hotel Directory

- **CMS key:** `travel-hotels` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public list of hotels or accommodation providers.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-hotels">
```

##### 12-08 — Restaurant Directory

- **CMS key:** `travel-restaurants` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`CollectionPage`](https://schema.org/CollectionPage); **primary entity:** [`ItemList`](https://schema.org/ItemList).
- **Graph relationship:** CollectionPage.mainEntity → ItemList.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public directory of travel dining options.
- **Structured-data field profile:** ItemList: itemListElement array of ListItem(position, url/name) reflecting actual visible listing.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-restaurants">
```

##### 12-09 — About Travel Site

- **CMS key:** `AboutPage` — official Schema.org type name.
- **Schema.org document node:** [`AboutPage`](https://schema.org/AboutPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** About the travel publisher or travel business.
- **Structured-data field profile:** AboutPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="AboutPage">
```

##### 12-10 — Contact

- **CMS key:** `ContactPage` — official Schema.org type name.
- **Schema.org document node:** [`ContactPage`](https://schema.org/ContactPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public contact information for the website.
- **Structured-data field profile:** ContactPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="ContactPage">
```

#### Trips, lodging and services

##### 12-11 — Tourist Itinerary

- **CMS key:** `TouristTrip` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`TouristTrip`](https://schema.org/TouristTrip).
- **Graph relationship:** ItemPage.mainEntity → TouristTrip.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** An itinerary of visits to multiple points of interest.
- **Structured-data field profile:** TouristTrip: name, itinerary with real stops; touristType when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="TouristTrip">
```

##### 12-12 — Trip Detail

- **CMS key:** `Trip` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Trip`](https://schema.org/Trip).
- **Graph relationship:** ItemPage.mainEntity → Trip.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One trip that is not specifically a TouristTrip.
- **Structured-data field profile:** Trip: name, itinerary when defined.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Trip">
```

##### 12-13 — Tour / Travel Service

- **CMS key:** `Service` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Service`](https://schema.org/Service).
- **Graph relationship:** ItemPage.mainEntity → Service.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One offered travel service described publicly.
- **Structured-data field profile:** Service: name, description, provider, areaServed, serviceType when evidenced.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Service">
```

##### 12-14 — Travel Package

- **CMS key:** `travel-package` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`TouristTrip`](https://schema.org/TouristTrip).
- **Graph relationship:** ItemPage.mainEntity → TouristTrip.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Organized tourist trip/package; price/Offer only if actually present.
- **Structured-data field profile:** TouristTrip: name, itinerary with real stops; touristType when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-package">
```

##### 12-15 — Hotel Detail

- **CMS key:** `Hotel` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Hotel`](https://schema.org/Hotel).
- **Graph relationship:** ItemPage.mainEntity → Hotel.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One specific hotel property.
- **Structured-data field profile:** Hotel: name, address, checkinTime/checkoutTime when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Hotel">
```

##### 12-16 — Accommodation Detail

- **CMS key:** `Accommodation` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Accommodation`](https://schema.org/Accommodation).
- **Graph relationship:** ItemPage.mainEntity → Accommodation.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Individual accommodation unit rather than hotel operator.
- **Structured-data field profile:** Accommodation: name, description, numberOfRooms/amenityFeature if accurate.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Accommodation">
```

##### 12-17 — Restaurant Detail

- **CMS key:** `Restaurant` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Restaurant`](https://schema.org/Restaurant).
- **Graph relationship:** ItemPage.mainEntity → Restaurant.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** One restaurant visited or listed in travel guide.
- **Structured-data field profile:** Restaurant: name, servesCuisine, menu and address when accurate.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Restaurant">
```

##### 12-18 — Flight Information

- **CMS key:** `Flight` — official Schema.org type name.
- **Schema.org document node:** [`ItemPage`](https://schema.org/ItemPage); **primary entity:** [`Flight`](https://schema.org/Flight).
- **Graph relationship:** ItemPage.mainEntity → Flight.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** A particular flight description (not a live flight status promise).
- **Structured-data field profile:** Flight: flightNumber, departureAirport, arrivalAirport, departureTime when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Flight">
```

##### 12-19 — Event / Activity

- **CMS key:** `Event` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Event`](https://schema.org/Event).
- **Graph relationship:** WebPage.mainEntity → Event.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Real dated tourist activity or destination event.
- **Structured-data field profile:** Event: name, startDate, location, eventStatus, organizer when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Event">
```

#### Travel stories and practical resources

##### 12-20 — Destination Guide Article

- **CMS key:** `travel-destination-guide` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Article`](https://schema.org/Article).
- **Graph relationship:** WebPage.mainEntity → Article.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Written editorial guide to visiting a destination.
- **Structured-data field profile:** Article: headline, author, datePublished, dateModified, description; publisher and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-destination-guide">
```

##### 12-21 — Travel Blog Post

- **CMS key:** `BlogPosting` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`BlogPosting`](https://schema.org/BlogPosting).
- **Graph relationship:** WebPage.mainEntity → BlogPosting.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Personal or publisher travel blog entry.
- **Structured-data field profile:** BlogPosting: headline, author, datePublished; modified date and image only when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="BlogPosting">
```

##### 12-22 — Travel News

- **CMS key:** `NewsArticle` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`NewsArticle`](https://schema.org/NewsArticle).
- **Graph relationship:** WebPage.mainEntity → NewsArticle.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** News reporting about travel and tourism.
- **Structured-data field profile:** NewsArticle: headline, author, datePublished, dateModified, publisher and image when known.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="NewsArticle">
```

##### 12-23 — Travel Tutorial

- **CMS key:** `HowTo` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`HowTo`](https://schema.org/HowTo).
- **Graph relationship:** WebPage.mainEntity → HowTo.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Step-by-step travel process or planning tutorial.
- **Structured-data field profile:** HowTo: name, step containing actual HowToStep/HowToDirection content, never invented steps.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="HowTo">
```

##### 12-24 — Travel Review

- **CMS key:** `Review` — official Schema.org type name.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`Review`](https://schema.org/Review).
- **Graph relationship:** WebPage.mainEntity → Review.
  - `page.mainEntity → Review`: **one**; The page genuinely centers on the mapped entity.
  - `Review.itemReviewed → actual_reviewed_entity`: **one**; Only an actually reviewed product, service, creative work, etc.; its type is sourced from the content, never guessed.
- **Exact OG:** `<meta property="og:type" content="article">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Published editorial review of a travel experience or venue.
- **Structured-data field profile:** Review: itemReviewed, author, reviewBody, reviewRating only for real published review.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Review">
```

##### 12-25 — Travel Image Gallery

- **CMS key:** `ImageGallery` — official Schema.org type name.
- **Schema.org document node:** [`ImageGallery`](https://schema.org/ImageGallery); **primary entity:** none required.
- **Graph relationship:** ImageGallery.hasPart → ImageObject[] (only visible media, no forced singular mainEntity).
- **Supporting schema nodes:** `ImageObject`; only according to the conditions below.
  - `page.hasPart → ImageObject`: **zero_or_more**; Only media truly contained or listed in this gallery.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Gallery of travel photos.
- **Structured-data field profile:** ImageObject: contentUrl or url, caption, creator when actually available.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="ImageGallery">
```

##### 12-26 — Travel Video

- **CMS key:** `travel-video` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** [`VideoObject`](https://schema.org/VideoObject).
- **Graph relationship:** WebPage.mainEntity → VideoObject.
- **Exact OG:** `<meta property="og:type" content="video.other">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Single video of a destination or travel experience.
- **Structured-data field profile:** VideoObject: name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl when real.
- **Mapping notes:** The HTML page node and its primary content entity are distinct; use the mapped official types, not the CMS key as @type.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-video">
```

##### 12-27 — FAQ Page

- **CMS key:** `FAQPage` — official Schema.org type name.
- **Schema.org document node:** [`FAQPage`](https://schema.org/FAQPage); **primary entity:** [`Question`](https://schema.org/Question).
- **Graph relationship:** FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **Supporting schema nodes:** `Answer`; only according to the conditions below.
  - `page.mainEntity → Question`: **one_or_more**; Only actual FAQ items visibly present.
  - `Question.acceptedAnswer → Answer`: **one_per_answered_question**; Only real publisher-provided accepted answers.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Travel FAQs authored by the site.
- **Structured-data field profile:** FAQPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="FAQPage">
```

##### 12-28 — Booking Information

- **CMS key:** `travel-booking-info` — CMS-managed classification key; not a Schema.org class.
- **Schema.org document node:** [`WebPage`](https://schema.org/WebPage); **primary entity:** none required.
- **Graph relationship:** No mandatory mainEntity link.
- **Exact OG:** `<meta property="og:type" content="website">` (only if missing and subsequently approved for injection; never overwrite existing).
- **Choose for:** Public explanation of bookings, not a booking checkout or private reservation.
- **Structured-data field profile:** WebPage: name, description, url and any real page-specific references.
- **Mapping notes:** The page node is the primary schema representation; do not manufacture a separate content entity.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-booking-info">
```

## 5. Deterministic validation, compatibility, and migration rules for Tasks 16–19

| Check | Required behavior |
|---|---|
| One opening HTML tag | Human merges attributes; never inject a second `<html>` or rewrite `lang` |
| Eligibility | Only exact `data-cms-seo="true"` is eligible; absent/false/malformed stops injection |
| Website category | Must be one of exactly the 12 registered values and approved for injection |
| Page type | Match exactly one key **within the declared website category**, case-sensitive; unknown key stops with error |
| Duplicate/conflicting attributes | Report and block until a human resolves them; no first-wins selection |
| Known page vs metadata | Compare applicability by exact (`website`, `type`) registry; do not guess from filenames |
| Legacy page markers | `data-seo`, `data-page-type` are legacy; do not auto-recognize or rewrite |
| OG type | Read mapped OG only; existing OG remains untouched, mismatches visible |
| Schema graph | Use exact page and entity nodes, with `mainEntity` link when defined; no duplicate `@id` |
| Status of unapproved pages | Proposed Category 02–12 leaves are display/planning candidates only until explicitly approved |
| Incomplete JSON-LD catalog | Do not silently create missing typed property structures; mark unavailable pending approval |
| Draft/commit | All actual metadata writes enter the established Source Control review workflow |

### 5.1 Exact task boundaries

- **Task 15:** Read-only category → page-type → snippet sidebar; store independent category metadata template snapshots; freeze identifiers and schemas in category registries. No auto insertion of CMS markers.
- **Task 16:** Scan HTML in selected repository and branch; require the three exact human-declared attributes; permit the owner to save eligible file selections. Scanner does not add CMS markers.
- **Task 17 (revised proposal):** Validate manual category/type mapping. The old automatic `data-page-type` injection stage is superseded and must not survive in new specifications. Any necessary schema-property preparation is a separate approved later step.
- **Task 18:** Scan applicable approved fields for each exact category + page type, classify complete/partial/missing, preserve existing values and structures.
- **Task 19:** Prepare only missing approved placeholders; review diffs through shared Source Control before explicit commit. No writing actual values, no unsupported schema-field guessing.

## 6. Acceptance checklist for the planning artifact

- [x] Exact 12 website categories selected by owner and their `data-cms-website` keys.
- [x] All 28 Category 01 Blog v2 leaves retained with matching keys and mappings.
- [x] Categories 02–12 given individually nested groups and per-leaf copyable snippets as **proposals**.
- [x] Every leaf has a CMS key, Schema.org page node, optional main entity, exact OG type and selection rule.
- [x] Plain Markdown and machine-readable JSON represent the same generated registry; validation checks run on generation.
- [ ] Owner handpicks/approves each Category 02–12 page-type list and mappings.
- [ ] Existing README / roadmap updated later only with explicit owner approval.
- [ ] Implementation and browser verification performed in separate authorized phase.

## 7. Authoritative research references

- Schema.org official class hierarchy: https://schema.org/docs/full.html
- Schema.org `WebPage`: https://schema.org/WebPage (distinguishes page from main content entity)
- Schema.org news-type guidance: https://schema.org/docs/news.html
- Schema.org `Course`: https://schema.org/Course; `SoftwareApplication`: https://schema.org/SoftwareApplication; `TouristTrip`: https://schema.org/TouristTrip
- The Open Graph protocol: https://ogp.me/ (exact `og:type` vocabulary)
- Google structured-data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies (structured data ≠ rich-result guarantee)
- Existing Luxraj CMS Category 01 v2 planning source: `Luxraj_CMS_Task15_Category01_Blog_Boilerplate_Registry_v2.json` and matching Markdown specification.

