# Luxraj CMS — Complete SEO Metadata Placeholder Matrix

**Task scope:** future Metadata Injector metadata planning for the exact 12 website categories and 294 page-type boilerplates in the v3 registry.  **Status:** planning proposal. **Date:** 2026-11-21.

> This document settles the proposed *mapping* of named placeholders to page roles, not how insertion, merging, or commit operations will work. No repository, application, or Supabase settings were changed.

## 1. Source-of-truth, hierarchy and matching

**Input registry:** `Luxraj_CMS_Task15_All_12_Website_Categories_Boilerplate_Registry_v3.json`. SHA-256: `5423609beb288eb3c7f173035365f9bc43209cbd42c1015c6dcf64217e596f31`. Do not replace any of the manually chosen boilerplate identifiers when implementing these mappings.

`Metadata Injector → Website Type → [website category] → Page Type → [page type] → Boilerplate → Copy`.

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="BlogPosting">
```

The CMS reads all three manually added markers. The `data-cms-website` value selects an independent category configuration; `data-cms-seo-type` selects a registered definition *within* that category. `data-cms-seo="true"` gates eligibility. An invalid combination is an error, never a fallback or guessed type. The marker is **not automatically inserted**.

## 2. Approved Blog catalog preserved (11 core, 25 OG, 6 X and all S01–S40)

The original README approved **11 core metadata entries**, **25 Open Graph properties** (8 core, 7 image, 6 article and 4 profile), **6 X/Twitter fields**, and **40 Schema.org catalog entries S01–S40**. Those are independent category template assets. We do not discard or silently disable entries when a particular page does not use them; per-page applicability is tracked separately.

### 2A — Core metadata — 11 owner-approved definitions
| ID | Field | Placeholder / value | Applicability |
|---|---|---|---|
| `core.page_id` | Permanent Page ID | `{{PAGE_ID}}` | needs_separate_decision: Universal per-page identifier. Exact HTML meta-tag name remains undecided in original README. |
| `core.seo_title` | SEO title | `{{SEO_TITLE}}` | baseline: Use page-specific title, preserve any existing title. |
| `core.seo_description` | Meta description | `{{SEO_DESCRIPTION}}` | baseline: Page summary; never invent content. |
| `core.canonical_url` | Canonical URL | `{{CANONICAL_URL}}` | baseline: Use appropriate absolute canonical; do not infer from file path. |
| `core.html_lang` | Page language | `lang` | conditional: Preserve existing lang; README default en only when absent. |
| `core.charset` | Character encoding | `UTF-8` | conditional: Preserve existing encoding. |
| `core.robots_directives` | Robots directives | `{{ROBOTS_DIRECTIVES}}` | conditional: No automatic noindex/index rule; value is a later control. |
| `core.googlebot_directives` | Googlebot directives | `{{GOOGLEBOT_DIRECTIVES}}` | conditional: No guessed directives. |
| `core.google_site_verification` | Google site verification | `{{GOOGLE_SITE_VERIFICATION}}` | conditional: Only when verification is actually needed/authorized. |
| `core.hreflang_code` | Language alternates | `{{HREFLANG_CODE}} / {{HREFLANG_URL}}` | conditional: Repeat for real translated/locale versions only. |
| `core.rss_feed_url` | RSS feed discovery | `{{RSS_FEED_TITLE}} / {{RSS_FEED_URL}}` | conditional: Only for a real feed. |

**Pending original decision:** the exact HTML `<meta>` name for the permanent Page ID was never approved in the README. The `{{PAGE_ID}}` token and identity semantics remain locked; the tag name is explicitly unresolved, not guessed.

### 2B — Open Graph — all 25 owner-approved properties
| Group | Property | Placeholder / behavior | Condition |
|---|---|---|---|
| core | `og:title` | `{{OG_TITLE}}` | baseline |
| core | `og:type` | `<derived from cms page type mapping>` | Use exact registry og_type, not schema type; preserve existing values. |
| core | `og:url` | `{{OG_URL}}` | baseline |
| core | `og:description` | `{{OG_DESCRIPTION}}` | baseline |
| core | `og:site_name` | `{{OG_SITE_NAME}}` | conditional |
| core | `og:locale` | `{{OG_LOCALE}}` | conditional |
| core | `og:locale:alternate` | `{{OG_ALTERNATE_LOCALE}}` | Only real alternative locales. |
| core | `og:determiner` | `{{OG_DETERMINER}}` | Only if used; approved optional. |
| image | `og:image` | `{{OG_IMAGE}}` | Use a real representative image. |
| image | `og:image:url` | `{{OG_IMAGE_URL}}` | Official alias for og:image; must not create duplicate inconsistent images. |
| image | `og:image:secure_url` | `{{OG_IMAGE_SECURE_URL}}` | Only when alternate HTTPS image URL is real. |
| image | `og:image:type` | `{{OG_IMAGE_TYPE}}` | Only when image MIME type known. |
| image | `og:image:width` | `{{OG_IMAGE_WIDTH}}` | Only if known. |
| image | `og:image:height` | `{{OG_IMAGE_HEIGHT}}` | Only if known. |
| image | `og:image:alt` | `{{OG_IMAGE_ALT}}` | Actual descriptive alt text. |
| article | `article:published_time` | `{{ARTICLE_PUBLISHED_TIME}}` | Only for article OG type and real publication timestamp. |
| article | `article:modified_time` | `{{ARTICLE_MODIFIED_TIME}}` | Only if actual modification timestamp exists. |
| article | `article:expiration_time` | `{{ARTICLE_EXPIRATION_TIME}}` | Only if article has an expiry. |
| article | `article:author` | `{{ARTICLE_AUTHOR}}` | Real author profile URLs; array-capable. |
| article | `article:section` | `{{ARTICLE_SECTION}}` | Only if editorial section exists. |
| article | `article:tag` | `{{ARTICLE_TAG}}` | Only real tags. |
| profile | `profile:first_name` | `{{PROFILE_FIRST_NAME}}` | Only personal profile; do not infer names. |
| profile | `profile:last_name` | `{{PROFILE_LAST_NAME}}` | Only if available for a person. |
| profile | `profile:username` | `{{PROFILE_USERNAME}}` | Only real account username. |
| profile | `profile:gender` | `{{PROFILE_GENDER}}` | Optional and sensitive; NEVER infer; only explicitly supplied where appropriate. |

**Per-page OG selection:** `core` + `image` are available for all types; the `article:*` group is applicable to `og:type=article`; the `profile:*` group to personal `og:type=profile`. The full 25-property Blog catalog remains retained for future category customization even when a particular group is not applicable. `og:image:url` is an official alias of `og:image`, not a reason to create conflicting images.

### 2C — X/Twitter — all six owner-approved definitions
| Tag | Placeholder | Condition |
|---|---|---|
| `twitter:card` | `{{TWITTER_CARD_TYPE}}` | Keep placeholder, never hardcode card type. Must be supported card value when populated. |
| `twitter:title` | `{{TWITTER_TITLE}}` | Only descriptive actual title. |
| `twitter:description` | `{{TWITTER_DESCRIPTION}}` | Only actual summary. |
| `twitter:image` | `{{TWITTER_IMAGE_URL}}` | Use real image URL, not automatically guessed. |
| `twitter:image:alt` | `{{TWITTER_IMAGE_ALT}}` | Use actual image description. |
| `twitter:site` | `{{TWITTER_SITE}}` | Only if website has an official X account. |

The X card value remains `{{TWITTER_CARD_TYPE}}` rather than a hardcoded `summary_large_image`. Platform-specific metadata is conditional on actual content; the six approved slots remain available in category templates.

### 2D — Additional OG vertical fields for book, movie, video, and music
These are **researched extensions**, not part of the locked Blog 25 OG properties. They are applicable only to the matching official `og:type`.
| OG type | Extra properties |
|---|---|
| `book` | `book:author`, `book:isbn`, `book:release_date`, `book:tag` |
| `video.movie` | `video:actor`, `video:actor:role`, `video:director`, `video:writer`, `video:duration`, `video:release_date`, `video:tag` |
| `video.episode` | `video:actor`, `video:actor:role`, `video:director`, `video:writer`, `video:duration`, `video:release_date`, `video:tag`, `video:series` |
| `video.tv_show` | `video:actor`, `video:actor:role`, `video:director`, `video:writer`, `video:duration`, `video:release_date`, `video:tag` |
| `video.other` | `video:actor`, `video:director`, `video:duration`, `video:release_date`, `video:tag` |
| `music.song` | `music:duration`, `music:album`, `music:album:disc`, `music:album:track`, `music:musician` |
| `music.album` | `music:song`, `music:song:disc`, `music:song:track`, `music:musician`, `music:release_date` |
| `music.playlist` | `music:song`, `music:song:disc`, `music:song:track`, `music:creator` |

### 2E — Approved Schema.org S01–S40 preservation
The original README **S01–S40** catalog remains the authority. It groups website/general pages (S01–S07), articles/publishing (S08–S14), authors/profiles (S15–S18), media (S19–S23), specialist content (S24–S34), and advanced capabilities (S35–S40). This new research adds explicit page/entity property maps without rewriting those original approvals. Any new specialized fields outside existing S01–S40 are proposals, not silently authorized injection fields.

### 2F — Advanced Schema.org capability fields (S35–S40)
These were approved as capability groups, not automatically emitted objects. The exact researched candidate fields are:
| Capability | Exact field paths and placeholders | When applicable |
|---|---|---|
| S35_relationships — Content and entity relationships | `WebPage.isPartOf.@id → {{SCHEMA_WEBSITE_ID}}`, `WebPage.about.@id → {{SCHEMA_ABOUT_ENTITY_ID}}`, `CreativeWork.hasPart[].@id → {{SCHEMA_RELATED_PART_ID}}`, `CreativeWork.isPartOf.@id → {{SCHEMA_PARENT_ENTITY_ID}}`, `CreativeWork.sameAs[] → {{SCHEMA_CANONICAL_ENTITY_SAMEAS}}` | Only real related entities/references with resolvable IDs |
| S36_references — Article references | `Article.citation[] → {{SCHEMA_ARTICLE_CITATION_URL}}`, `Article.mentions[].@id → {{SCHEMA_ARTICLE_MENTION_ID}}`, `Article.isBasedOn[] → {{SCHEMA_ARTICLE_SOURCE_URL}}` | Only sources actually mentioned/cited in content |
| S37_paywall — Paywalled content | `WebPage.isAccessibleForFree → {{SCHEMA_IS_ACCESSIBLE_FREE}}`, `WebPage.hasPart[].@type → WebPageElement`, `WebPage.hasPart[].isAccessibleForFree → {{SCHEMA_PAYWALL_PART_FREE}}`, `WebPage.hasPart[].cssSelector → {{SCHEMA_PAYWALL_SELECTOR}}` | Only for real restricted content; no fabricated paywall or default false |
| S38_editorial — Editorial authority | `Article.editor[].@id → {{SCHEMA_EDITOR_ID}}`, `Article.publisher.@id → {{SCHEMA_PUBLISHER_ID}}`, `Article.accountablePerson.@id → {{SCHEMA_ACCOUNTABLE_PERSON_ID}}` | Only real editors/publishers/accountable persons |
| S39_speakable — Speakable metadata | `WebPage.speakable.@type → SpeakableSpecification`, `WebPage.speakable.cssSelector[] → {{SCHEMA_SPEAKABLE_SELECTOR}}` | Only if actual speakable text regions exist; not a Google guarantee |
| S40_site_search — Site-search action | `WebSite.potentialAction.@type → SearchAction`, `SearchAction.target.urlTemplate → {{SCHEMA_SITE_SEARCH_URL_TEMPLATE}}`, `SearchAction.query-input → {{SCHEMA_SITE_SEARCH_INPUT}}` | Only if functional on-site search is present; Google sitelinks search box discontinued |

## 3. Data-model conventions (critical for correct future implementation)

- The **page node** is a `WebPage` or the specific page subtype from the registry, e.g. `ItemPage`, `CollectionPage`, `FAQPage`. Do not create a duplicate `WebPage` node when the chosen subtype already inherits it.
- The **content entity** is the `mainEntity` where appropriate, e.g. Product, Article, Course, Person, Event. It is **not always** the page node itself.
- The registered `data-cms-seo-type` key may be custom (`book-review`), but `@type` values must stay official Schema.org classes. The JSON contains both explicit types.
- A permanent `{{PAGE_ID}}` identifies this HTML page only; Schema.org `@id` must be distinct canonical-URL-based IRIs for distinct graph entities. Do not assign the same `@id` to Page, Product, Author, Organization, etc.
- `{{SCHEMA_*}}` tokens represent **future metadata values**, not actual facts. Fields with dates/prices/ratings/URLs/identities require real data and correct value types. `[]` in property path means a repeatable array; `.@id` means a graph relation.
- OG `book`, `video.*`, `music.*` extra properties belong to their matching exact Open Graph verticals. Social OG types are **not** interchangeable with Schema.org `@type`.
- Only the Blog page-type list was handpicked; the other 266 definitions remain proposed until owner review. Keep this approval distinction in future tasks.
- No automatic boilerplate insertion, no source modification, no values populated, and no injection algorithm is decided here.

## 4. Reusable Schema.org property profiles (reference dictionary)
Each profile below is a named, explicit mapping of Schema.org property paths and placeholder keys. Every one of the 294 page entries later selects the profiles appropriate to its page and main content entity; the JSON also carries **fully resolved property arrays for every page**.

### `WebPage`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `WebPage.@id` | `{{SCHEMA_WEBPAGE_ID}}` | `url` | `derived_from_canonical_no_new_page_id` |
| `WebPage.mainEntity.@id` | `{{SCHEMA_MAIN_ENTITY_ID}}` | `id_ref` | `when_registry_main_entity_exists` |
| `WebPage.url` | `{{CANONICAL_URL}}` | `url` | `when_true_and_visible` |
| `WebPage.name` | `{{SCHEMA_WEBPAGE_NAME}}` | `string` | `when_true_and_visible` |
| `WebPage.description` | `{{SCHEMA_WEBPAGE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `WebPage.inLanguage` | `{{SCHEMA_WEBPAGE_LANGUAGE}}` | `bcp47` | `when_true_and_visible` |
| `WebPage.identifier` | `{{PAGE_ID}}` | `string` | `same_permanent_page_id` |
| `WebPage.isPartOf.@id` | `{{SCHEMA_WEBSITE_ID}}` | `id_ref` | `when_site_node_exists` |
| `WebPage.primaryImageOfPage.@id` | `{{SCHEMA_PRIMARY_IMAGE_ID}}` | `id_ref` | `when_real_image_exists` |
| `WebPage.about.@id` | `{{SCHEMA_ABOUT_ENTITY_ID}}` | `id_ref` | `when_real_topic_entity` |
| `WebPage.breadcrumb.@id` | `{{SCHEMA_BREADCRUMB_ID}}` | `id_ref` | `when_real_breadcrumbs` |
| `WebPage.dateModified` | `{{SCHEMA_WEBPAGE_MODIFIED}}` | `datetime` | `when_real_timestamp` |
| `WebPage.datePublished` | `{{SCHEMA_WEBPAGE_PUBLISHED}}` | `datetime` | `when_real_timestamp` |

### `AboutPage`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `AboutPage.@type` | `AboutPage` | `schema_type` | `fixed_from_registry` |
| `AboutPage.hasPart.@id` | `{{SCHEMA_PAGE_PART_ID}}` | `id_ref` | `when_real_related_page_nodes` |

### `ContactPage`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `ContactPage.@type` | `ContactPage` | `schema_type` | `fixed_from_registry` |
| `ContactPage.hasPart.@id` | `{{SCHEMA_PAGE_PART_ID}}` | `id_ref` | `when_real_related_page_nodes` |

### `ProfilePage`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `ProfilePage.@type` | `ProfilePage` | `schema_type` | `fixed_from_registry` |
| `ProfilePage.hasPart.@id` | `{{SCHEMA_PAGE_PART_ID}}` | `id_ref` | `when_real_related_page_nodes` |

### `CollectionPage`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `CollectionPage.@type` | `CollectionPage` | `schema_type` | `fixed_from_registry` |
| `CollectionPage.hasPart.@id` | `{{SCHEMA_PAGE_PART_ID}}` | `id_ref` | `when_real_related_page_nodes` |

### `ItemPage`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `ItemPage.@type` | `ItemPage` | `schema_type` | `fixed_from_registry` |
| `ItemPage.hasPart.@id` | `{{SCHEMA_PAGE_PART_ID}}` | `id_ref` | `when_real_related_page_nodes` |

### `FAQPage`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `FAQPage.@type` | `FAQPage` | `schema_type` | `fixed_from_registry` |
| `FAQPage.hasPart.@id` | `{{SCHEMA_PAGE_PART_ID}}` | `id_ref` | `when_real_related_page_nodes` |

### `QAPage`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `QAPage.@type` | `QAPage` | `schema_type` | `fixed_from_registry` |
| `QAPage.hasPart.@id` | `{{SCHEMA_PAGE_PART_ID}}` | `id_ref` | `when_real_related_page_nodes` |

### `ImageGallery`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `ImageGallery.@type` | `ImageGallery` | `schema_type` | `fixed_from_registry` |
| `ImageGallery.hasPart.@id` | `{{SCHEMA_PAGE_PART_ID}}` | `id_ref` | `when_real_related_page_nodes` |

### `VideoGallery`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `VideoGallery.@type` | `VideoGallery` | `schema_type` | `fixed_from_registry` |
| `VideoGallery.hasPart.@id` | `{{SCHEMA_PAGE_PART_ID}}` | `id_ref` | `when_real_related_page_nodes` |

### `WebSite`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `WebSite.@id` | `{{SCHEMA_WEBSITE_ID}}` | `url` | `derived_from_canonical_site_url` |
| `WebSite.url` | `{{SCHEMA_WEBSITE_URL}}` | `url` | `when_true_and_visible` |
| `WebSite.name` | `{{SCHEMA_WEBSITE_NAME}}` | `string` | `when_true_and_visible` |
| `WebSite.description` | `{{SCHEMA_WEBSITE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `WebSite.inLanguage` | `{{SCHEMA_WEBSITE_LANGUAGE}}` | `bcp47` | `when_true_and_visible` |
| `WebSite.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `when_real_publisher_exists` |
| `WebSite.potentialAction.@id` | `{{SCHEMA_SITE_SEARCH_ACTION_ID}}` | `id_ref` | `only_if_actual_site_search_exists_no_google_rich_result` |

### `Blog`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Blog.@id` | `{{SCHEMA_BLOG_ID}}` | `url` | `when_true_and_visible` |
| `Blog.name` | `{{SCHEMA_BLOG_NAME}}` | `string` | `when_true_and_visible` |
| `Blog.description` | `{{SCHEMA_BLOG_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Blog.url` | `{{SCHEMA_BLOG_URL}}` | `url` | `when_true_and_visible` |
| `Blog.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `when_real_publisher_exists` |
| `Blog.blogPost.@id` | `{{SCHEMA_BLOG_POST_ID}}` | `id_ref` | `when_actual_post_link` |

### `ItemList`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `ItemList.@id` | `{{SCHEMA_ITEMLIST_ID}}` | `url` | `when_true_and_visible` |
| `ItemList.name` | `{{SCHEMA_LIST_NAME}}` | `string` | `when_true_and_visible` |
| `ItemList.numberOfItems` | `{{SCHEMA_ITEM_COUNT}}` | `integer` | `only_if_actual_count` |
| `ItemList.itemListElement[].position` | `{{SCHEMA_LIST_POSITION}}` | `integer` | `only_real_items` |
| `ItemList.itemListElement[].name` | `{{SCHEMA_LIST_ITEM_NAME}}` | `string` | `only_real_items` |
| `ItemList.itemListElement[].url` | `{{SCHEMA_LIST_ITEM_URL}}` | `url` | `only_real_items` |

### `Organization`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Organization.@id` | `{{SCHEMA_ORGANIZATION_ID}}` | `url` | `when_true_and_visible` |
| `Organization.name` | `{{SCHEMA_ORGANIZATION_NAME}}` | `string` | `when_true_and_visible` |
| `Organization.url` | `{{SCHEMA_ORGANIZATION_URL}}` | `url` | `when_true_and_visible` |
| `Organization.logo` | `{{SCHEMA_ORGANIZATION_LOGO}}` | `url` | `if_real` |
| `Organization.description` | `{{SCHEMA_ORGANIZATION_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Organization.sameAs[]` | `{{SCHEMA_ORGANIZATION_SOCIAL_URL}}` | `url_array` | `real_official_profiles_only` |
| `Organization.email` | `{{SCHEMA_ORGANIZATION_EMAIL}}` | `email` | `if_public` |
| `Organization.telephone` | `{{SCHEMA_ORGANIZATION_TELEPHONE}}` | `phone` | `if_public` |

### `Person`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Person.@id` | `{{SCHEMA_PERSON_ID}}` | `url` | `when_true_and_visible` |
| `Person.name` | `{{SCHEMA_PERSON_NAME}}` | `string` | `when_true_and_visible` |
| `Person.url` | `{{SCHEMA_PERSON_URL}}` | `url` | `when_true_and_visible` |
| `Person.image` | `{{SCHEMA_PERSON_IMAGE}}` | `url` | `if_real` |
| `Person.description` | `{{SCHEMA_PERSON_BIO}}` | `string` | `when_true_and_visible` |
| `Person.sameAs[]` | `{{SCHEMA_PERSON_SAMEAS}}` | `url_array` | `real_profiles_only` |
| `Person.jobTitle` | `{{SCHEMA_PERSON_JOB_TITLE}}` | `string` | `if_real` |
| `Person.worksFor.@id` | `{{SCHEMA_PERSON_ORG_ID}}` | `id_ref` | `if_real_employer` |

### `Article`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Article.@id` | `{{SCHEMA_ARTICLE_ID}}` | `url` | `when_true_and_visible` |
| `Article.headline` | `{{SCHEMA_ARTICLE_HEADLINE}}` | `string` | `when_true_and_visible` |
| `Article.description` | `{{SCHEMA_ARTICLE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Article.image[]` | `{{SCHEMA_ARTICLE_IMAGE}}` | `url_array` | `real_images_only` |
| `Article.author[].@id` | `{{SCHEMA_ARTICLE_AUTHOR_ID}}` | `id_ref` | `real_authors_only` |
| `Article.datePublished` | `{{SCHEMA_ARTICLE_PUBLISHED}}` | `datetime` | `real_date_only` |
| `Article.dateModified` | `{{SCHEMA_ARTICLE_MODIFIED}}` | `datetime` | `real_date_only` |
| `Article.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `real_publisher_only` |
| `Article.articleBody` | `{{SCHEMA_ARTICLE_BODY}}` | `string` | `if_full_body_available` |
| `Article.articleSection` | `{{SCHEMA_ARTICLE_SECTION}}` | `string` | `if_real` |
| `Article.keywords[]` | `{{SCHEMA_ARTICLE_KEYWORDS}}` | `array` | `if_real` |
| `Article.mainEntityOfPage.@id` | `{{SCHEMA_WEBPAGE_ID}}` | `id_ref` | `link_page_node` |

### `BlogPosting`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `BlogPosting.headline` | `{{SCHEMA_ARTICLE_HEADLINE}}` | `string` | `when_true_and_visible` |
| `BlogPosting.description` | `{{SCHEMA_ARTICLE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `BlogPosting.image[]` | `{{SCHEMA_ARTICLE_IMAGE}}` | `url_array` | `real_images_only` |
| `BlogPosting.author[].@id` | `{{SCHEMA_ARTICLE_AUTHOR_ID}}` | `id_ref` | `real_author_only` |
| `BlogPosting.datePublished` | `{{SCHEMA_ARTICLE_PUBLISHED}}` | `datetime` | `real_date_only` |
| `BlogPosting.dateModified` | `{{SCHEMA_ARTICLE_MODIFIED}}` | `datetime` | `real_date_only` |
| `BlogPosting.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `real_publisher_only` |
| `BlogPosting.articleSection` | `{{SCHEMA_ARTICLE_SECTION}}` | `string` | `if_real` |
| `BlogPosting.mainEntityOfPage.@id` | `{{SCHEMA_WEBPAGE_ID}}` | `id_ref` | `link_page_node` |

### `NewsArticle`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `NewsArticle.headline` | `{{SCHEMA_ARTICLE_HEADLINE}}` | `string` | `when_true_and_visible` |
| `NewsArticle.description` | `{{SCHEMA_ARTICLE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `NewsArticle.image[]` | `{{SCHEMA_ARTICLE_IMAGE}}` | `url_array` | `real_images_only` |
| `NewsArticle.author[].@id` | `{{SCHEMA_ARTICLE_AUTHOR_ID}}` | `id_ref` | `real_author_only` |
| `NewsArticle.datePublished` | `{{SCHEMA_ARTICLE_PUBLISHED}}` | `datetime` | `real_date_only` |
| `NewsArticle.dateModified` | `{{SCHEMA_ARTICLE_MODIFIED}}` | `datetime` | `real_date_only` |
| `NewsArticle.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `real_publisher_only` |
| `NewsArticle.articleSection` | `{{SCHEMA_ARTICLE_SECTION}}` | `string` | `if_real` |
| `NewsArticle.mainEntityOfPage.@id` | `{{SCHEMA_WEBPAGE_ID}}` | `id_ref` | `link_page_node` |

### `OpinionNewsArticle`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `OpinionNewsArticle.headline` | `{{SCHEMA_ARTICLE_HEADLINE}}` | `string` | `when_true_and_visible` |
| `OpinionNewsArticle.description` | `{{SCHEMA_ARTICLE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `OpinionNewsArticle.image[]` | `{{SCHEMA_ARTICLE_IMAGE}}` | `url_array` | `real_images_only` |
| `OpinionNewsArticle.author[].@id` | `{{SCHEMA_ARTICLE_AUTHOR_ID}}` | `id_ref` | `real_author_only` |
| `OpinionNewsArticle.datePublished` | `{{SCHEMA_ARTICLE_PUBLISHED}}` | `datetime` | `real_date_only` |
| `OpinionNewsArticle.dateModified` | `{{SCHEMA_ARTICLE_MODIFIED}}` | `datetime` | `real_date_only` |
| `OpinionNewsArticle.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `real_publisher_only` |
| `OpinionNewsArticle.articleSection` | `{{SCHEMA_ARTICLE_SECTION}}` | `string` | `if_real` |
| `OpinionNewsArticle.mainEntityOfPage.@id` | `{{SCHEMA_WEBPAGE_ID}}` | `id_ref` | `link_page_node` |

### `AnalysisNewsArticle`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `AnalysisNewsArticle.headline` | `{{SCHEMA_ARTICLE_HEADLINE}}` | `string` | `when_true_and_visible` |
| `AnalysisNewsArticle.description` | `{{SCHEMA_ARTICLE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `AnalysisNewsArticle.image[]` | `{{SCHEMA_ARTICLE_IMAGE}}` | `url_array` | `real_images_only` |
| `AnalysisNewsArticle.author[].@id` | `{{SCHEMA_ARTICLE_AUTHOR_ID}}` | `id_ref` | `real_author_only` |
| `AnalysisNewsArticle.datePublished` | `{{SCHEMA_ARTICLE_PUBLISHED}}` | `datetime` | `real_date_only` |
| `AnalysisNewsArticle.dateModified` | `{{SCHEMA_ARTICLE_MODIFIED}}` | `datetime` | `real_date_only` |
| `AnalysisNewsArticle.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `real_publisher_only` |
| `AnalysisNewsArticle.articleSection` | `{{SCHEMA_ARTICLE_SECTION}}` | `string` | `if_real` |
| `AnalysisNewsArticle.mainEntityOfPage.@id` | `{{SCHEMA_WEBPAGE_ID}}` | `id_ref` | `link_page_node` |

### `ReportageNewsArticle`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `ReportageNewsArticle.headline` | `{{SCHEMA_ARTICLE_HEADLINE}}` | `string` | `when_true_and_visible` |
| `ReportageNewsArticle.description` | `{{SCHEMA_ARTICLE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `ReportageNewsArticle.image[]` | `{{SCHEMA_ARTICLE_IMAGE}}` | `url_array` | `real_images_only` |
| `ReportageNewsArticle.author[].@id` | `{{SCHEMA_ARTICLE_AUTHOR_ID}}` | `id_ref` | `real_author_only` |
| `ReportageNewsArticle.datePublished` | `{{SCHEMA_ARTICLE_PUBLISHED}}` | `datetime` | `real_date_only` |
| `ReportageNewsArticle.dateModified` | `{{SCHEMA_ARTICLE_MODIFIED}}` | `datetime` | `real_date_only` |
| `ReportageNewsArticle.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `real_publisher_only` |
| `ReportageNewsArticle.articleSection` | `{{SCHEMA_ARTICLE_SECTION}}` | `string` | `if_real` |
| `ReportageNewsArticle.mainEntityOfPage.@id` | `{{SCHEMA_WEBPAGE_ID}}` | `id_ref` | `link_page_node` |

### `BackgroundNewsArticle`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `BackgroundNewsArticle.headline` | `{{SCHEMA_ARTICLE_HEADLINE}}` | `string` | `when_true_and_visible` |
| `BackgroundNewsArticle.description` | `{{SCHEMA_ARTICLE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `BackgroundNewsArticle.image[]` | `{{SCHEMA_ARTICLE_IMAGE}}` | `url_array` | `real_images_only` |
| `BackgroundNewsArticle.author[].@id` | `{{SCHEMA_ARTICLE_AUTHOR_ID}}` | `id_ref` | `real_author_only` |
| `BackgroundNewsArticle.datePublished` | `{{SCHEMA_ARTICLE_PUBLISHED}}` | `datetime` | `real_date_only` |
| `BackgroundNewsArticle.dateModified` | `{{SCHEMA_ARTICLE_MODIFIED}}` | `datetime` | `real_date_only` |
| `BackgroundNewsArticle.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `real_publisher_only` |
| `BackgroundNewsArticle.articleSection` | `{{SCHEMA_ARTICLE_SECTION}}` | `string` | `if_real` |
| `BackgroundNewsArticle.mainEntityOfPage.@id` | `{{SCHEMA_WEBPAGE_ID}}` | `id_ref` | `link_page_node` |

### `ScholarlyArticle`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `ScholarlyArticle.headline` | `{{SCHEMA_ARTICLE_HEADLINE}}` | `string` | `when_true_and_visible` |
| `ScholarlyArticle.description` | `{{SCHEMA_ARTICLE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `ScholarlyArticle.image[]` | `{{SCHEMA_ARTICLE_IMAGE}}` | `url_array` | `real_images_only` |
| `ScholarlyArticle.author[].@id` | `{{SCHEMA_ARTICLE_AUTHOR_ID}}` | `id_ref` | `real_author_only` |
| `ScholarlyArticle.datePublished` | `{{SCHEMA_ARTICLE_PUBLISHED}}` | `datetime` | `real_date_only` |
| `ScholarlyArticle.dateModified` | `{{SCHEMA_ARTICLE_MODIFIED}}` | `datetime` | `real_date_only` |
| `ScholarlyArticle.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `real_publisher_only` |
| `ScholarlyArticle.articleSection` | `{{SCHEMA_ARTICLE_SECTION}}` | `string` | `if_real` |
| `ScholarlyArticle.mainEntityOfPage.@id` | `{{SCHEMA_WEBPAGE_ID}}` | `id_ref` | `link_page_node` |

### `TechArticle`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `TechArticle.headline` | `{{SCHEMA_ARTICLE_HEADLINE}}` | `string` | `when_true_and_visible` |
| `TechArticle.description` | `{{SCHEMA_ARTICLE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `TechArticle.author[].@id` | `{{SCHEMA_ARTICLE_AUTHOR_ID}}` | `id_ref` | `real_authors` |
| `TechArticle.datePublished` | `{{SCHEMA_ARTICLE_PUBLISHED}}` | `datetime` | `real_date` |
| `TechArticle.dateModified` | `{{SCHEMA_ARTICLE_MODIFIED}}` | `datetime` | `real_date` |
| `TechArticle.dependencies` | `{{SCHEMA_TECH_DEPENDENCIES}}` | `string` | `if_real` |
| `TechArticle.proficiencyLevel` | `{{SCHEMA_TECH_LEVEL}}` | `string` | `if_real` |
| `TechArticle.mainEntityOfPage.@id` | `{{SCHEMA_WEBPAGE_ID}}` | `id_ref` | `link_page_node` |

### `LiveBlogPosting`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `LiveBlogPosting.headline` | `{{SCHEMA_ARTICLE_HEADLINE}}` | `string` | `when_true_and_visible` |
| `LiveBlogPosting.description` | `{{SCHEMA_ARTICLE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `LiveBlogPosting.coverageStartTime` | `{{SCHEMA_LIVE_START}}` | `datetime` | `real_live_coverage` |
| `LiveBlogPosting.coverageEndTime` | `{{SCHEMA_LIVE_END}}` | `datetime` | `if_finished` |
| `LiveBlogPosting.liveBlogUpdate[].@id` | `{{SCHEMA_LIVE_UPDATE_ID}}` | `id_ref` | `real_updates_only` |
| `LiveBlogPosting.author[].@id` | `{{SCHEMA_ARTICLE_AUTHOR_ID}}` | `id_ref` | `real_authors` |
| `LiveBlogPosting.datePublished` | `{{SCHEMA_ARTICLE_PUBLISHED}}` | `datetime` | `real_date` |
| `LiveBlogPosting.mainEntityOfPage.@id` | `{{SCHEMA_WEBPAGE_ID}}` | `id_ref` | `link_page_node` |

### `ClaimReview`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `ClaimReview.claimReviewed` | `{{SCHEMA_CLAIM_TEXT}}` | `string` | `real_claim_only` |
| `ClaimReview.itemReviewed.@id` | `{{SCHEMA_CLAIM_ID}}` | `id_ref` | `real_claim_node` |
| `ClaimReview.reviewRating.ratingValue` | `{{SCHEMA_CLAIM_RATING}}` | `number` | `must_be_actual_rating` |
| `ClaimReview.author.@id` | `{{SCHEMA_CLAIM_REVIEWER_ID}}` | `id_ref` | `real_author` |
| `ClaimReview.datePublished` | `{{SCHEMA_CLAIM_REVIEW_DATE}}` | `datetime` | `real_date` |
| `ClaimReview.url` | `{{SCHEMA_CLAIM_REVIEW_URL}}` | `url` | `real_page_url` |

### `HowTo`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `HowTo.name` | `{{SCHEMA_HOWTO_NAME}}` | `string` | `when_true_and_visible` |
| `HowTo.description` | `{{SCHEMA_HOWTO_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `HowTo.step[].name` | `{{SCHEMA_HOWTO_STEP_NAME}}` | `string` | `real_steps_only` |
| `HowTo.step[].text` | `{{SCHEMA_HOWTO_STEP_TEXT}}` | `string` | `real_steps_only` |
| `HowTo.step[].url` | `{{SCHEMA_HOWTO_STEP_URL}}` | `url` | `if_real` |
| `HowTo.totalTime` | `{{SCHEMA_HOWTO_TOTAL_TIME}}` | `duration` | `if_real` |
| `HowTo.tool[].name` | `{{SCHEMA_HOWTO_TOOL}}` | `string` | `if_real` |
| `HowTo.supply[].name` | `{{SCHEMA_HOWTO_SUPPLY}}` | `string` | `if_real` |

### `Review`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Review.@id` | `{{SCHEMA_REVIEW_ID}}` | `url` | `when_true_and_visible` |
| `Review.name` | `{{SCHEMA_REVIEW_TITLE}}` | `string` | `when_true_and_visible` |
| `Review.reviewBody` | `{{SCHEMA_REVIEW_BODY}}` | `string` | `when_true_and_visible` |
| `Review.author.@id` | `{{SCHEMA_REVIEW_AUTHOR_ID}}` | `id_ref` | `real_author` |
| `Review.datePublished` | `{{SCHEMA_REVIEW_DATE}}` | `datetime` | `real_date` |
| `Review.itemReviewed.@id` | `{{SCHEMA_REVIEW_SUBJECT_ID}}` | `id_ref` | `real_subject_type_must_be_known` |
| `Review.reviewRating.ratingValue` | `{{SCHEMA_REVIEW_RATING}}` | `number` | `only_real_explicit_rating` |
| `Review.reviewRating.bestRating` | `{{SCHEMA_REVIEW_BEST_RATING}}` | `number` | `if_rating_scale_known` |

### `Book`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Book.@id` | `{{SCHEMA_BOOK_ID}}` | `url` | `when_true_and_visible` |
| `Book.name` | `{{SCHEMA_BOOK_TITLE}}` | `string` | `when_true_and_visible` |
| `Book.description` | `{{SCHEMA_BOOK_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Book.author[].@id` | `{{SCHEMA_BOOK_AUTHOR_ID}}` | `id_ref` | `real_author` |
| `Book.isbn` | `{{SCHEMA_BOOK_ISBN}}` | `string` | `if_real` |
| `Book.bookFormat` | `{{SCHEMA_BOOK_FORMAT}}` | `schema_enum` | `if_real` |
| `Book.inLanguage` | `{{SCHEMA_BOOK_LANGUAGE}}` | `bcp47` | `if_known` |
| `Book.numberOfPages` | `{{SCHEMA_BOOK_PAGES}}` | `integer` | `if_known` |
| `Book.datePublished` | `{{SCHEMA_BOOK_PUBLICATION_DATE}}` | `date` | `if_known` |
| `Book.publisher.@id` | `{{SCHEMA_BOOK_PUBLISHER_ID}}` | `id_ref` | `if_real` |

### `Question`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Question.name` | `{{SCHEMA_QUESTION_TITLE}}` | `string` | `when_true_and_visible` |
| `Question.text` | `{{SCHEMA_QUESTION_TEXT}}` | `string` | `when_true_and_visible` |
| `Question.answerCount` | `{{SCHEMA_ANSWER_COUNT}}` | `integer` | `actual_count_only` |
| `Question.acceptedAnswer.text` | `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}` | `string` | `actual_accepted_answer_only` |
| `Question.suggestedAnswer[].text` | `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}` | `string` | `actual_answers_only` |
| `Question.author.@id` | `{{SCHEMA_QUESTION_AUTHOR_ID}}` | `id_ref` | `if_real` |

### `VideoObject`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `VideoObject.@id` | `{{SCHEMA_VIDEO_ID}}` | `url` | `when_true_and_visible` |
| `VideoObject.name` | `{{SCHEMA_VIDEO_NAME}}` | `string` | `when_true_and_visible` |
| `VideoObject.description` | `{{SCHEMA_VIDEO_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `VideoObject.thumbnailUrl[]` | `{{SCHEMA_VIDEO_THUMBNAIL_URL}}` | `url_array` | `actual_valid_thumbnail` |
| `VideoObject.uploadDate` | `{{SCHEMA_VIDEO_UPLOAD_DATE}}` | `datetime` | `actual_date` |
| `VideoObject.duration` | `{{SCHEMA_VIDEO_DURATION}}` | `duration` | `if_real` |
| `VideoObject.contentUrl` | `{{SCHEMA_VIDEO_CONTENT_URL}}` | `url` | `if_real` |
| `VideoObject.embedUrl` | `{{SCHEMA_VIDEO_EMBED_URL}}` | `url` | `if_real` |
| `VideoObject.hasPart[].@id` | `{{SCHEMA_VIDEO_CLIP_ID}}` | `id_ref` | `if_real_clips` |
| `VideoObject.inLanguage` | `{{SCHEMA_VIDEO_LANGUAGE}}` | `bcp47` | `if_known` |

### `ImageObject`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `ImageObject.@id` | `{{SCHEMA_IMAGE_ID}}` | `url` | `when_true_and_visible` |
| `ImageObject.contentUrl` | `{{SCHEMA_IMAGE_URL}}` | `url` | `when_true_and_visible` |
| `ImageObject.thumbnailUrl` | `{{SCHEMA_IMAGE_THUMBNAIL_URL}}` | `url` | `if_real` |
| `ImageObject.caption` | `{{SCHEMA_IMAGE_CAPTION}}` | `string` | `when_true_and_visible` |
| `ImageObject.width` | `{{SCHEMA_IMAGE_WIDTH}}` | `integer` | `if_real` |
| `ImageObject.height` | `{{SCHEMA_IMAGE_HEIGHT}}` | `integer` | `if_real` |
| `ImageObject.creator.@id` | `{{SCHEMA_IMAGE_CREATOR_ID}}` | `id_ref` | `if_real` |
| `ImageObject.license` | `{{SCHEMA_IMAGE_LICENSE_URL}}` | `url` | `if_real` |
| `ImageObject.creditText` | `{{SCHEMA_IMAGE_CREDIT}}` | `string` | `if_real` |
| `ImageObject.acquireLicensePage` | `{{SCHEMA_IMAGE_LICENSE_PAGE}}` | `url` | `if_real` |

### `AudioObject`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `AudioObject.@id` | `{{SCHEMA_AUDIO_ID}}` | `url` | `when_true_and_visible` |
| `AudioObject.name` | `{{SCHEMA_AUDIO_NAME}}` | `string` | `when_true_and_visible` |
| `AudioObject.description` | `{{SCHEMA_AUDIO_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `AudioObject.contentUrl` | `{{SCHEMA_AUDIO_URL}}` | `url` | `if_real` |
| `AudioObject.embedUrl` | `{{SCHEMA_AUDIO_EMBED_URL}}` | `url` | `if_real` |
| `AudioObject.encodingFormat` | `{{SCHEMA_AUDIO_MIME}}` | `string` | `if_real` |
| `AudioObject.duration` | `{{SCHEMA_AUDIO_DURATION}}` | `duration` | `if_real` |
| `AudioObject.uploadDate` | `{{SCHEMA_AUDIO_UPLOAD_DATE}}` | `datetime` | `if_real` |

### `PodcastEpisode`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `PodcastEpisode.@id` | `{{SCHEMA_EPISODE_ID}}` | `url` | `when_true_and_visible` |
| `PodcastEpisode.name` | `{{SCHEMA_EPISODE_NAME}}` | `string` | `when_true_and_visible` |
| `PodcastEpisode.description` | `{{SCHEMA_EPISODE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `PodcastEpisode.datePublished` | `{{SCHEMA_EPISODE_DATE}}` | `datetime` | `actual_date` |
| `PodcastEpisode.episodeNumber` | `{{SCHEMA_EPISODE_NUMBER}}` | `integer` | `if_real` |
| `PodcastEpisode.partOfSeries.@id` | `{{SCHEMA_PODCAST_SERIES_ID}}` | `id_ref` | `if_real` |
| `PodcastEpisode.associatedMedia.@id` | `{{SCHEMA_AUDIO_ID}}` | `id_ref` | `real_audio_object_only` |

### `PodcastSeries`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `PodcastSeries.@id` | `{{SCHEMA_PODCAST_SERIES_ID}}` | `url` | `when_true_and_visible` |
| `PodcastSeries.name` | `{{SCHEMA_PODCAST_SERIES_NAME}}` | `string` | `when_true_and_visible` |
| `PodcastSeries.description` | `{{SCHEMA_PODCAST_SERIES_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `PodcastSeries.webFeed` | `{{SCHEMA_PODCAST_RSS_URL}}` | `url` | `real_feed_only` |
| `PodcastSeries.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `if_real` |
| `PodcastSeries.episode[].@id` | `{{SCHEMA_EPISODE_ID}}` | `id_ref` | `if_real` |

### `Event`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Event.@id` | `{{SCHEMA_EVENT_ID}}` | `url` | `when_true_and_visible` |
| `Event.name` | `{{SCHEMA_EVENT_NAME}}` | `string` | `when_true_and_visible` |
| `Event.description` | `{{SCHEMA_EVENT_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Event.startDate` | `{{SCHEMA_EVENT_START}}` | `datetime` | `real_start_date` |
| `Event.endDate` | `{{SCHEMA_EVENT_END}}` | `datetime` | `if_real` |
| `Event.eventStatus` | `{{SCHEMA_EVENT_STATUS}}` | `schema_enum` | `if_real` |
| `Event.eventAttendanceMode` | `{{SCHEMA_EVENT_ATTENDANCE_MODE}}` | `schema_enum` | `if_real` |
| `Event.location.@id` | `{{SCHEMA_EVENT_LOCATION_ID}}` | `id_ref` | `real_location` |
| `Event.organizer.@id` | `{{SCHEMA_EVENT_ORGANIZER_ID}}` | `id_ref` | `real_organizer` |
| `Event.offers[].@id` | `{{SCHEMA_EVENT_OFFER_ID}}` | `id_ref` | `real_ticket_offer_only` |
| `Event.performer[].@id` | `{{SCHEMA_EVENT_PERFORMER_ID}}` | `id_ref` | `if_real` |
| `Event.image[]` | `{{SCHEMA_EVENT_IMAGE}}` | `url_array` | `if_real` |

### `EducationEvent`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `EducationEvent.@id` | `{{SCHEMA_EVENT_ID}}` | `url` | `when_true_and_visible` |
| `EducationEvent.name` | `{{SCHEMA_EVENT_NAME}}` | `string` | `when_true_and_visible` |
| `EducationEvent.description` | `{{SCHEMA_EVENT_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `EducationEvent.startDate` | `{{SCHEMA_EVENT_START}}` | `datetime` | `real_date` |
| `EducationEvent.endDate` | `{{SCHEMA_EVENT_END}}` | `datetime` | `if_real` |
| `EducationEvent.location.@id` | `{{SCHEMA_EVENT_LOCATION_ID}}` | `id_ref` | `if_real` |
| `EducationEvent.organizer.@id` | `{{SCHEMA_EVENT_ORGANIZER_ID}}` | `id_ref` | `if_real` |
| `EducationEvent.offers[].@id` | `{{SCHEMA_EVENT_OFFER_ID}}` | `id_ref` | `if_real` |

### `BreadcrumbList`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `BreadcrumbList.@id` | `{{SCHEMA_BREADCRUMB_ID}}` | `url` | `when_true_and_visible` |
| `BreadcrumbList.itemListElement[].position` | `{{SCHEMA_BREADCRUMB_POSITION}}` | `integer` | `real_crumbs_only` |
| `BreadcrumbList.itemListElement[].name` | `{{SCHEMA_BREADCRUMB_NAME}}` | `string` | `real_crumbs_only` |
| `BreadcrumbList.itemListElement[].item` | `{{SCHEMA_BREADCRUMB_URL}}` | `url` | `real_crumbs_only` |

### `Service`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Service.@id` | `{{SCHEMA_SERVICE_ID}}` | `url` | `when_true_and_visible` |
| `Service.name` | `{{SCHEMA_SERVICE_NAME}}` | `string` | `when_true_and_visible` |
| `Service.description` | `{{SCHEMA_SERVICE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Service.serviceType` | `{{SCHEMA_SERVICE_TYPE}}` | `string` | `if_real` |
| `Service.provider.@id` | `{{SCHEMA_SERVICE_PROVIDER_ID}}` | `id_ref` | `real_provider` |
| `Service.areaServed[]` | `{{SCHEMA_SERVICE_AREA_SERVED}}` | `string_array` | `actual_areas` |
| `Service.offers[].@id` | `{{SCHEMA_SERVICE_OFFER_ID}}` | `id_ref` | `real_offer_only` |
| `Service.availableChannel` | `{{SCHEMA_SERVICE_CHANNEL}}` | `string` | `if_real` |

### `Offer`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Offer.@id` | `{{SCHEMA_OFFER_ID}}` | `url` | `when_true_and_visible` |
| `Offer.url` | `{{SCHEMA_OFFER_URL}}` | `url` | `real_offer_link` |
| `Offer.price` | `{{SCHEMA_OFFER_PRICE}}` | `number` | `actual_price_only` |
| `Offer.priceCurrency` | `{{SCHEMA_OFFER_CURRENCY}}` | `iso4217` | `if_price_present` |
| `Offer.availability` | `{{SCHEMA_OFFER_AVAILABILITY}}` | `schema_url` | `actual_availability_only` |
| `Offer.priceValidUntil` | `{{SCHEMA_OFFER_PRICE_VALID_UNTIL}}` | `date` | `if_real` |
| `Offer.seller.@id` | `{{SCHEMA_SELLER_ID}}` | `id_ref` | `actual_seller` |
| `Offer.itemOffered.@id` | `{{SCHEMA_OFFER_ITEM_ID}}` | `id_ref` | `real_item` |

### `Product`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Product.@id` | `{{SCHEMA_PRODUCT_ID}}` | `url` | `when_true_and_visible` |
| `Product.name` | `{{SCHEMA_PRODUCT_NAME}}` | `string` | `when_true_and_visible` |
| `Product.description` | `{{SCHEMA_PRODUCT_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Product.image[]` | `{{SCHEMA_PRODUCT_IMAGE}}` | `url_array` | `if_real` |
| `Product.sku` | `{{SCHEMA_PRODUCT_SKU}}` | `string` | `if_real` |
| `Product.gtin` | `{{SCHEMA_PRODUCT_GTIN}}` | `string` | `if_real` |
| `Product.brand.name` | `{{SCHEMA_PRODUCT_BRAND}}` | `string` | `if_real` |
| `Product.offers[].@id` | `{{SCHEMA_OFFER_ID}}` | `id_ref` | `real_offer_only` |
| `Product.aggregateRating.ratingValue` | `{{SCHEMA_PRODUCT_RATING}}` | `number` | `actual_external_or_permitted_reviews_only` |
| `Product.review[].@id` | `{{SCHEMA_REVIEW_ID}}` | `id_ref` | `actual_reviews_only` |

### `ProductGroup`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `ProductGroup.@id` | `{{SCHEMA_PRODUCT_GROUP_ID}}` | `url` | `when_true_and_visible` |
| `ProductGroup.name` | `{{SCHEMA_PRODUCT_GROUP_NAME}}` | `string` | `when_true_and_visible` |
| `ProductGroup.description` | `{{SCHEMA_PRODUCT_GROUP_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `ProductGroup.productGroupID` | `{{SCHEMA_PRODUCT_GROUP_KEY}}` | `string` | `real_group_identifier` |
| `ProductGroup.variesBy[]` | `{{SCHEMA_VARIANT_DIMENSION}}` | `url_array` | `actual_variant_dimensions` |
| `ProductGroup.hasVariant[].@id` | `{{SCHEMA_PRODUCT_VARIANT_ID}}` | `id_ref` | `actual_variants_only` |
| `ProductGroup.brand.name` | `{{SCHEMA_PRODUCT_BRAND}}` | `string` | `if_real` |

### `Store`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Store.@id` | `{{SCHEMA_STORE_ID}}` | `url` | `when_true_and_visible` |
| `Store.name` | `{{SCHEMA_STORE_NAME}}` | `string` | `when_true_and_visible` |
| `Store.description` | `{{SCHEMA_STORE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Store.url` | `{{SCHEMA_STORE_URL}}` | `url` | `when_true_and_visible` |
| `Store.telephone` | `{{SCHEMA_STORE_PHONE}}` | `string` | `if_public` |
| `Store.address.streetAddress` | `{{SCHEMA_ADDRESS_STREET}}` | `string` | `if_real` |
| `Store.address.addressLocality` | `{{SCHEMA_ADDRESS_CITY}}` | `string` | `if_real` |
| `Store.address.addressRegion` | `{{SCHEMA_ADDRESS_REGION}}` | `string` | `if_real` |
| `Store.address.postalCode` | `{{SCHEMA_ADDRESS_POSTAL}}` | `string` | `if_real` |
| `Store.address.addressCountry` | `{{SCHEMA_ADDRESS_COUNTRY}}` | `string` | `if_real` |
| `Store.geo.latitude` | `{{SCHEMA_GEO_LAT}}` | `number` | `if_real` |
| `Store.geo.longitude` | `{{SCHEMA_GEO_LON}}` | `number` | `if_real` |
| `Store.openingHoursSpecification[].opens` | `{{SCHEMA_OPENS}}` | `string` | `actual_hours_only` |
| `Store.openingHoursSpecification[].closes` | `{{SCHEMA_CLOSES}}` | `string` | `actual_hours_only` |

### `Place`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Place.@id` | `{{SCHEMA_PLACE_ID}}` | `url` | `when_true_and_visible` |
| `Place.name` | `{{SCHEMA_PLACE_NAME}}` | `string` | `when_true_and_visible` |
| `Place.description` | `{{SCHEMA_PLACE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Place.address.streetAddress` | `{{SCHEMA_ADDRESS_STREET}}` | `string` | `if_real` |
| `Place.address.addressLocality` | `{{SCHEMA_ADDRESS_CITY}}` | `string` | `if_real` |
| `Place.address.addressCountry` | `{{SCHEMA_ADDRESS_COUNTRY}}` | `string` | `if_real` |
| `Place.geo.latitude` | `{{SCHEMA_GEO_LAT}}` | `number` | `if_real` |
| `Place.geo.longitude` | `{{SCHEMA_GEO_LON}}` | `number` | `if_real` |
| `Place.telephone` | `{{SCHEMA_PLACE_PHONE}}` | `string` | `if_real` |

### `JobPosting`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `JobPosting.@id` | `{{SCHEMA_JOB_ID}}` | `url` | `when_true_and_visible` |
| `JobPosting.title` | `{{SCHEMA_JOB_TITLE}}` | `string` | `when_true_and_visible` |
| `JobPosting.description` | `{{SCHEMA_JOB_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `JobPosting.datePosted` | `{{SCHEMA_JOB_POSTED}}` | `date` | `actual_date` |
| `JobPosting.validThrough` | `{{SCHEMA_JOB_VALID_THROUGH}}` | `datetime` | `if_real` |
| `JobPosting.employmentType` | `{{SCHEMA_JOB_EMPLOYMENT_TYPE}}` | `enum` | `real_type` |
| `JobPosting.hiringOrganization.@id` | `{{SCHEMA_HIRING_ORG_ID}}` | `id_ref` | `real_employer` |
| `JobPosting.jobLocation.@id` | `{{SCHEMA_JOB_LOCATION_ID}}` | `id_ref` | `real_location` |
| `JobPosting.jobLocationType` | `{{SCHEMA_JOB_LOCATION_TYPE}}` | `string` | `only_real_remote_jobs` |
| `JobPosting.baseSalary.value.value` | `{{SCHEMA_JOB_SALARY}}` | `number` | `actual_salary_only` |
| `JobPosting.baseSalary.currency` | `{{SCHEMA_JOB_SALARY_CURRENCY}}` | `iso4217` | `only_if_salary_present` |

### `Report`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Report.@id` | `{{SCHEMA_REPORT_ID}}` | `url` | `when_true_and_visible` |
| `Report.name` | `{{SCHEMA_REPORT_NAME}}` | `string` | `when_true_and_visible` |
| `Report.description` | `{{SCHEMA_REPORT_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Report.author[].@id` | `{{SCHEMA_REPORT_AUTHOR_ID}}` | `id_ref` | `real_authors` |
| `Report.datePublished` | `{{SCHEMA_REPORT_PUBLISHED}}` | `date` | `real_date` |
| `Report.publisher.@id` | `{{SCHEMA_PUBLISHER_ID}}` | `id_ref` | `real_publisher` |
| `Report.encoding[].contentUrl` | `{{SCHEMA_REPORT_FILE_URL}}` | `url` | `if_real` |

### `Course`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Course.@id` | `{{SCHEMA_COURSE_ID}}` | `url` | `when_true_and_visible` |
| `Course.name` | `{{SCHEMA_COURSE_NAME}}` | `string` | `when_true_and_visible` |
| `Course.description` | `{{SCHEMA_COURSE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Course.provider.@id` | `{{SCHEMA_COURSE_PROVIDER_ID}}` | `id_ref` | `real_provider` |
| `Course.courseCode` | `{{SCHEMA_COURSE_CODE}}` | `string` | `if_real` |
| `Course.educationalLevel` | `{{SCHEMA_COURSE_LEVEL}}` | `string` | `if_real` |
| `Course.about[]` | `{{SCHEMA_COURSE_SUBJECT}}` | `string_array` | `if_real` |
| `Course.hasCourseInstance[].@id` | `{{SCHEMA_COURSE_INSTANCE_ID}}` | `id_ref` | `actual_sessions_only` |

### `CourseInstance`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `CourseInstance.@id` | `{{SCHEMA_COURSE_INSTANCE_ID}}` | `url` | `when_true_and_visible` |
| `CourseInstance.name` | `{{SCHEMA_COURSE_INSTANCE_NAME}}` | `string` | `when_true_and_visible` |
| `CourseInstance.courseMode` | `{{SCHEMA_COURSE_MODE}}` | `string` | `actual_format` |
| `CourseInstance.startDate` | `{{SCHEMA_COURSE_START}}` | `datetime` | `actual_start` |
| `CourseInstance.endDate` | `{{SCHEMA_COURSE_END}}` | `datetime` | `actual_end` |
| `CourseInstance.instructor[].@id` | `{{SCHEMA_INSTRUCTOR_ID}}` | `id_ref` | `real_instructors` |
| `CourseInstance.location.@id` | `{{SCHEMA_COURSE_LOCATION_ID}}` | `id_ref` | `if_real` |
| `CourseInstance.offers[].@id` | `{{SCHEMA_COURSE_OFFER_ID}}` | `id_ref` | `real_offers_only` |
| `CourseInstance.courseWorkload` | `{{SCHEMA_COURSE_WORKLOAD}}` | `duration` | `if_real` |

### `EducationalOccupationalProgram`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `EducationalOccupationalProgram.@id` | `{{SCHEMA_PROGRAM_ID}}` | `url` | `when_true_and_visible` |
| `EducationalOccupationalProgram.name` | `{{SCHEMA_PROGRAM_NAME}}` | `string` | `when_true_and_visible` |
| `EducationalOccupationalProgram.description` | `{{SCHEMA_PROGRAM_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `EducationalOccupationalProgram.provider.@id` | `{{SCHEMA_PROGRAM_PROVIDER_ID}}` | `id_ref` | `real_provider` |
| `EducationalOccupationalProgram.educationalCredentialAwarded` | `{{SCHEMA_PROGRAM_CREDENTIAL}}` | `string` | `if_real` |
| `EducationalOccupationalProgram.timeToComplete` | `{{SCHEMA_PROGRAM_DURATION}}` | `duration` | `if_real` |
| `EducationalOccupationalProgram.programType` | `{{SCHEMA_PROGRAM_TYPE}}` | `string` | `if_real` |
| `EducationalOccupationalProgram.occupationalCategory` | `{{SCHEMA_PROGRAM_OCCUPATION}}` | `string` | `if_real` |

### `LearningResource`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `LearningResource.@id` | `{{SCHEMA_LEARNING_RESOURCE_ID}}` | `url` | `when_true_and_visible` |
| `LearningResource.name` | `{{SCHEMA_LEARNING_RESOURCE_NAME}}` | `string` | `when_true_and_visible` |
| `LearningResource.description` | `{{SCHEMA_LEARNING_RESOURCE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `LearningResource.learningResourceType` | `{{SCHEMA_LEARNING_RESOURCE_TYPE}}` | `string` | `if_real` |
| `LearningResource.educationalLevel` | `{{SCHEMA_LEARNING_LEVEL}}` | `string` | `if_real` |
| `LearningResource.teaches[]` | `{{SCHEMA_LEARNING_TEACHES}}` | `string_array` | `if_real` |
| `LearningResource.assesses[]` | `{{SCHEMA_LEARNING_ASSESSES}}` | `string_array` | `if_real` |
| `LearningResource.timeRequired` | `{{SCHEMA_LEARNING_TIME}}` | `duration` | `if_real` |
| `LearningResource.isPartOf.@id` | `{{SCHEMA_COURSE_ID}}` | `id_ref` | `when_part_of_course` |

### `Quiz`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Quiz.@id` | `{{SCHEMA_QUIZ_ID}}` | `url` | `when_true_and_visible` |
| `Quiz.name` | `{{SCHEMA_QUIZ_NAME}}` | `string` | `when_true_and_visible` |
| `Quiz.description` | `{{SCHEMA_QUIZ_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Quiz.about[]` | `{{SCHEMA_QUIZ_TOPIC}}` | `string_array` | `if_real` |
| `Quiz.hasPart[].name` | `{{SCHEMA_QUIZ_QUESTION}}` | `string` | `real_questions_only` |
| `Quiz.hasPart[].acceptedAnswer.text` | `{{SCHEMA_QUIZ_ANSWER}}` | `string` | `real_answer_only` |
| `Quiz.educationalLevel` | `{{SCHEMA_QUIZ_LEVEL}}` | `string` | `if_real` |

### `SoftwareApplication`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `SoftwareApplication.@id` | `{{SCHEMA_APP_ID}}` | `url` | `when_true_and_visible` |
| `SoftwareApplication.name` | `{{SCHEMA_APP_NAME}}` | `string` | `when_true_and_visible` |
| `SoftwareApplication.description` | `{{SCHEMA_APP_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `SoftwareApplication.applicationCategory` | `{{SCHEMA_APP_CATEGORY}}` | `string` | `if_real` |
| `SoftwareApplication.operatingSystem` | `{{SCHEMA_APP_OS}}` | `string` | `if_real` |
| `SoftwareApplication.softwareVersion` | `{{SCHEMA_APP_VERSION}}` | `string` | `if_real` |
| `SoftwareApplication.screenshot[]` | `{{SCHEMA_APP_SCREENSHOT}}` | `url_array` | `real_screenshots_only` |
| `SoftwareApplication.downloadUrl` | `{{SCHEMA_APP_DOWNLOAD_URL}}` | `url` | `if_real` |
| `SoftwareApplication.offers[].@id` | `{{SCHEMA_APP_OFFER_ID}}` | `id_ref` | `real_offer_only` |
| `SoftwareApplication.aggregateRating.ratingValue` | `{{SCHEMA_APP_RATING}}` | `number` | `real_rating_only` |

### `WebApplication`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `WebApplication.@id` | `{{SCHEMA_APP_ID}}` | `url` | `when_true_and_visible` |
| `WebApplication.name` | `{{SCHEMA_APP_NAME}}` | `string` | `when_true_and_visible` |
| `WebApplication.description` | `{{SCHEMA_APP_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `WebApplication.applicationCategory` | `{{SCHEMA_APP_CATEGORY}}` | `string` | `if_real` |
| `WebApplication.operatingSystem` | `{{SCHEMA_APP_OS}}` | `string` | `if_real` |
| `WebApplication.browserRequirements` | `{{SCHEMA_APP_BROWSER_REQUIREMENTS}}` | `string` | `if_real` |
| `WebApplication.screenshot[]` | `{{SCHEMA_APP_SCREENSHOT}}` | `url_array` | `if_real` |
| `WebApplication.offers[].@id` | `{{SCHEMA_APP_OFFER_ID}}` | `id_ref` | `real_offer_only` |

### `MobileApplication`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `MobileApplication.@id` | `{{SCHEMA_APP_ID}}` | `url` | `when_true_and_visible` |
| `MobileApplication.name` | `{{SCHEMA_APP_NAME}}` | `string` | `when_true_and_visible` |
| `MobileApplication.description` | `{{SCHEMA_APP_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `MobileApplication.applicationCategory` | `{{SCHEMA_APP_CATEGORY}}` | `string` | `if_real` |
| `MobileApplication.operatingSystem` | `{{SCHEMA_APP_OS}}` | `string` | `if_real` |
| `MobileApplication.downloadUrl` | `{{SCHEMA_APP_DOWNLOAD_URL}}` | `url` | `if_real` |
| `MobileApplication.screenshot[]` | `{{SCHEMA_APP_SCREENSHOT}}` | `url_array` | `if_real` |
| `MobileApplication.offers[].@id` | `{{SCHEMA_APP_OFFER_ID}}` | `id_ref` | `real_offer_only` |

### `SoftwareSourceCode`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `SoftwareSourceCode.@id` | `{{SCHEMA_CODE_ID}}` | `url` | `when_true_and_visible` |
| `SoftwareSourceCode.name` | `{{SCHEMA_CODE_NAME}}` | `string` | `when_true_and_visible` |
| `SoftwareSourceCode.description` | `{{SCHEMA_CODE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `SoftwareSourceCode.codeRepository` | `{{SCHEMA_CODE_REPOSITORY}}` | `url` | `real_repository_only` |
| `SoftwareSourceCode.programmingLanguage[]` | `{{SCHEMA_CODE_LANGUAGE}}` | `string_array` | `if_real` |
| `SoftwareSourceCode.runtimePlatform` | `{{SCHEMA_CODE_RUNTIME}}` | `string` | `if_real` |
| `SoftwareSourceCode.license` | `{{SCHEMA_CODE_LICENSE}}` | `url` | `if_real` |
| `SoftwareSourceCode.targetProduct.@id` | `{{SCHEMA_APP_ID}}` | `id_ref` | `if_real` |

### `APIReference`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `APIReference.headline` | `{{SCHEMA_API_HEADLINE}}` | `string` | `when_true_and_visible` |
| `APIReference.description` | `{{SCHEMA_API_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `APIReference.programmingModel` | `{{SCHEMA_API_PROGRAMMING_MODEL}}` | `string` | `if_real` |
| `APIReference.targetPlatform` | `{{SCHEMA_API_TARGET_PLATFORM}}` | `string` | `if_real` |
| `APIReference.author[].@id` | `{{SCHEMA_ARTICLE_AUTHOR_ID}}` | `id_ref` | `real_author` |
| `APIReference.dateModified` | `{{SCHEMA_ARTICLE_MODIFIED}}` | `datetime` | `real_update` |

### `DefinedTermSet`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `DefinedTermSet.@id` | `{{SCHEMA_GLOSSARY_ID}}` | `url` | `when_true_and_visible` |
| `DefinedTermSet.name` | `{{SCHEMA_GLOSSARY_NAME}}` | `string` | `when_true_and_visible` |
| `DefinedTermSet.description` | `{{SCHEMA_GLOSSARY_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `DefinedTermSet.hasDefinedTerm[].@id` | `{{SCHEMA_DEFINED_TERM_ID}}` | `id_ref` | `real_defined_terms_only` |

### `DefinedTerm`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `DefinedTerm.@id` | `{{SCHEMA_DEFINED_TERM_ID}}` | `url` | `when_true_and_visible` |
| `DefinedTerm.name` | `{{SCHEMA_DEFINED_TERM_NAME}}` | `string` | `when_true_and_visible` |
| `DefinedTerm.description` | `{{SCHEMA_DEFINED_TERM_DEFINITION}}` | `string` | `when_true_and_visible` |
| `DefinedTerm.termCode` | `{{SCHEMA_DEFINED_TERM_CODE}}` | `string` | `if_real` |
| `DefinedTerm.inDefinedTermSet.@id` | `{{SCHEMA_GLOSSARY_ID}}` | `id_ref` | `when_real_set_exists` |

### `CreativeWork`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `CreativeWork.@id` | `{{SCHEMA_WORK_ID}}` | `url` | `when_true_and_visible` |
| `CreativeWork.name` | `{{SCHEMA_WORK_NAME}}` | `string` | `when_true_and_visible` |
| `CreativeWork.description` | `{{SCHEMA_WORK_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `CreativeWork.creator[].@id` | `{{SCHEMA_WORK_CREATOR_ID}}` | `id_ref` | `if_real` |
| `CreativeWork.dateCreated` | `{{SCHEMA_WORK_CREATED}}` | `date` | `if_real` |
| `CreativeWork.image[]` | `{{SCHEMA_WORK_IMAGE}}` | `url_array` | `if_real` |
| `CreativeWork.license` | `{{SCHEMA_WORK_LICENSE}}` | `url` | `if_real` |
| `CreativeWork.keywords[]` | `{{SCHEMA_WORK_KEYWORDS}}` | `string_array` | `if_real` |

### `VisualArtwork`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `VisualArtwork.@id` | `{{SCHEMA_ARTWORK_ID}}` | `url` | `when_true_and_visible` |
| `VisualArtwork.name` | `{{SCHEMA_ARTWORK_NAME}}` | `string` | `when_true_and_visible` |
| `VisualArtwork.description` | `{{SCHEMA_ARTWORK_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `VisualArtwork.creator.@id` | `{{SCHEMA_ARTWORK_CREATOR_ID}}` | `id_ref` | `if_real` |
| `VisualArtwork.artform` | `{{SCHEMA_ARTWORK_FORM}}` | `string` | `if_real` |
| `VisualArtwork.artMedium` | `{{SCHEMA_ARTWORK_MEDIUM}}` | `string` | `if_real` |
| `VisualArtwork.image[]` | `{{SCHEMA_ARTWORK_IMAGES}}` | `url_array` | `if_real` |
| `VisualArtwork.dateCreated` | `{{SCHEMA_ARTWORK_DATE}}` | `date` | `if_real` |

### `Photograph`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Photograph.@id` | `{{SCHEMA_PHOTOGRAPH_ID}}` | `url` | `when_true_and_visible` |
| `Photograph.name` | `{{SCHEMA_PHOTOGRAPH_TITLE}}` | `string` | `when_true_and_visible` |
| `Photograph.description` | `{{SCHEMA_PHOTOGRAPH_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Photograph.creator.@id` | `{{SCHEMA_PHOTOGRAPH_CREATOR_ID}}` | `id_ref` | `if_real` |
| `Photograph.image` | `{{SCHEMA_PHOTOGRAPH_IMAGE}}` | `url` | `if_real` |
| `Photograph.dateCreated` | `{{SCHEMA_PHOTOGRAPH_DATE}}` | `date` | `if_real` |
| `Photograph.license` | `{{SCHEMA_PHOTOGRAPH_LICENSE}}` | `url` | `if_real` |

### `DiscussionForumPosting`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `DiscussionForumPosting.@id` | `{{SCHEMA_FORUM_POST_ID}}` | `url` | `when_true_and_visible` |
| `DiscussionForumPosting.headline` | `{{SCHEMA_FORUM_HEADLINE}}` | `string` | `when_true_and_visible` |
| `DiscussionForumPosting.text` | `{{SCHEMA_FORUM_BODY}}` | `string` | `when_true_and_visible` |
| `DiscussionForumPosting.author.@id` | `{{SCHEMA_FORUM_AUTHOR_ID}}` | `id_ref` | `real_author` |
| `DiscussionForumPosting.datePublished` | `{{SCHEMA_FORUM_DATE}}` | `datetime` | `real_date` |
| `DiscussionForumPosting.dateModified` | `{{SCHEMA_FORUM_MODIFIED}}` | `datetime` | `real_date` |
| `DiscussionForumPosting.comment[].@id` | `{{SCHEMA_FORUM_COMMENT_ID}}` | `id_ref` | `real_comments_only` |
| `DiscussionForumPosting.interactionStatistic.userInteractionCount` | `{{SCHEMA_FORUM_INTERACTION_COUNT}}` | `integer` | `real_count_only` |
| `DiscussionForumPosting.isPartOf.@id` | `{{SCHEMA_FORUM_PARENT_ID}}` | `id_ref` | `if_real` |

### `MusicGroup`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `MusicGroup.@id` | `{{SCHEMA_MUSIC_GROUP_ID}}` | `url` | `when_true_and_visible` |
| `MusicGroup.name` | `{{SCHEMA_MUSIC_GROUP_NAME}}` | `string` | `when_true_and_visible` |
| `MusicGroup.description` | `{{SCHEMA_MUSIC_GROUP_BIO}}` | `string` | `when_true_and_visible` |
| `MusicGroup.image[]` | `{{SCHEMA_MUSIC_GROUP_IMAGE}}` | `url_array` | `if_real` |
| `MusicGroup.member[].@id` | `{{SCHEMA_MUSIC_MEMBER_ID}}` | `id_ref` | `actual_members_only` |
| `MusicGroup.genre[]` | `{{SCHEMA_MUSIC_GENRE}}` | `string_array` | `if_real` |
| `MusicGroup.album[].@id` | `{{SCHEMA_MUSIC_ALBUM_ID}}` | `id_ref` | `real_albums_only` |

### `Movie`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Movie.@id` | `{{SCHEMA_MOVIE_ID}}` | `url` | `when_true_and_visible` |
| `Movie.name` | `{{SCHEMA_MOVIE_NAME}}` | `string` | `when_true_and_visible` |
| `Movie.description` | `{{SCHEMA_MOVIE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Movie.datePublished` | `{{SCHEMA_MOVIE_RELEASE_DATE}}` | `date` | `real_date` |
| `Movie.duration` | `{{SCHEMA_MOVIE_DURATION}}` | `duration` | `if_real` |
| `Movie.director[].@id` | `{{SCHEMA_MOVIE_DIRECTOR_ID}}` | `id_ref` | `if_real` |
| `Movie.actor[].@id` | `{{SCHEMA_MOVIE_ACTOR_ID}}` | `id_ref` | `if_real` |
| `Movie.genre[]` | `{{SCHEMA_MOVIE_GENRE}}` | `string_array` | `if_real` |
| `Movie.trailer.@id` | `{{SCHEMA_MOVIE_TRAILER_ID}}` | `id_ref` | `real_trailer_only` |
| `Movie.contentRating` | `{{SCHEMA_MOVIE_CONTENT_RATING}}` | `string` | `if_real` |

### `TVSeries`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `TVSeries.@id` | `{{SCHEMA_TV_SERIES_ID}}` | `url` | `when_true_and_visible` |
| `TVSeries.name` | `{{SCHEMA_TV_SERIES_NAME}}` | `string` | `when_true_and_visible` |
| `TVSeries.description` | `{{SCHEMA_TV_SERIES_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `TVSeries.numberOfSeasons` | `{{SCHEMA_TV_SEASONS}}` | `integer` | `real_count` |
| `TVSeries.containsSeason[].@id` | `{{SCHEMA_TV_SEASON_ID}}` | `id_ref` | `if_real` |
| `TVSeries.actor[].@id` | `{{SCHEMA_TV_ACTOR_ID}}` | `id_ref` | `if_real` |
| `TVSeries.genre[]` | `{{SCHEMA_TV_GENRE}}` | `string_array` | `if_real` |

### `TVSeason`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `TVSeason.@id` | `{{SCHEMA_TV_SEASON_ID}}` | `url` | `when_true_and_visible` |
| `TVSeason.name` | `{{SCHEMA_TV_SEASON_NAME}}` | `string` | `when_true_and_visible` |
| `TVSeason.seasonNumber` | `{{SCHEMA_TV_SEASON_NUMBER}}` | `integer` | `real_number` |
| `TVSeason.partOfSeries.@id` | `{{SCHEMA_TV_SERIES_ID}}` | `id_ref` | `real_parent` |
| `TVSeason.episode[].@id` | `{{SCHEMA_TV_EPISODE_ID}}` | `id_ref` | `real_episodes` |

### `TVEpisode`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `TVEpisode.@id` | `{{SCHEMA_TV_EPISODE_ID}}` | `url` | `when_true_and_visible` |
| `TVEpisode.name` | `{{SCHEMA_TV_EPISODE_NAME}}` | `string` | `when_true_and_visible` |
| `TVEpisode.description` | `{{SCHEMA_TV_EPISODE_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `TVEpisode.episodeNumber` | `{{SCHEMA_TV_EPISODE_NUMBER}}` | `integer` | `real_number` |
| `TVEpisode.partOfSeason.@id` | `{{SCHEMA_TV_SEASON_ID}}` | `id_ref` | `real_parent` |
| `TVEpisode.partOfSeries.@id` | `{{SCHEMA_TV_SERIES_ID}}` | `id_ref` | `real_parent` |
| `TVEpisode.datePublished` | `{{SCHEMA_TV_EPISODE_DATE}}` | `date` | `if_real` |

### `MusicRecording`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `MusicRecording.@id` | `{{SCHEMA_TRACK_ID}}` | `url` | `when_true_and_visible` |
| `MusicRecording.name` | `{{SCHEMA_TRACK_NAME}}` | `string` | `when_true_and_visible` |
| `MusicRecording.byArtist.@id` | `{{SCHEMA_MUSIC_GROUP_ID}}` | `id_ref` | `real_artist` |
| `MusicRecording.duration` | `{{SCHEMA_TRACK_DURATION}}` | `duration` | `if_real` |
| `MusicRecording.inAlbum.@id` | `{{SCHEMA_MUSIC_ALBUM_ID}}` | `id_ref` | `if_real` |
| `MusicRecording.datePublished` | `{{SCHEMA_TRACK_DATE}}` | `date` | `if_real` |
| `MusicRecording.isrcCode` | `{{SCHEMA_TRACK_ISRC}}` | `string` | `if_real` |

### `MusicAlbum`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `MusicAlbum.@id` | `{{SCHEMA_MUSIC_ALBUM_ID}}` | `url` | `when_true_and_visible` |
| `MusicAlbum.name` | `{{SCHEMA_MUSIC_ALBUM_NAME}}` | `string` | `when_true_and_visible` |
| `MusicAlbum.byArtist.@id` | `{{SCHEMA_MUSIC_GROUP_ID}}` | `id_ref` | `real_artist` |
| `MusicAlbum.datePublished` | `{{SCHEMA_MUSIC_ALBUM_DATE}}` | `date` | `if_real` |
| `MusicAlbum.numTracks` | `{{SCHEMA_MUSIC_NUM_TRACKS}}` | `integer` | `real_count` |
| `MusicAlbum.track[].@id` | `{{SCHEMA_TRACK_ID}}` | `id_ref` | `real_tracks_only` |
| `MusicAlbum.genre[]` | `{{SCHEMA_MUSIC_GENRE}}` | `string_array` | `if_real` |

### `MusicPlaylist`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `MusicPlaylist.@id` | `{{SCHEMA_PLAYLIST_ID}}` | `url` | `when_true_and_visible` |
| `MusicPlaylist.name` | `{{SCHEMA_PLAYLIST_NAME}}` | `string` | `when_true_and_visible` |
| `MusicPlaylist.description` | `{{SCHEMA_PLAYLIST_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `MusicPlaylist.creator.@id` | `{{SCHEMA_PLAYLIST_CREATOR_ID}}` | `id_ref` | `if_real` |
| `MusicPlaylist.numTracks` | `{{SCHEMA_PLAYLIST_NUM_TRACKS}}` | `integer` | `real_count` |
| `MusicPlaylist.track[].@id` | `{{SCHEMA_TRACK_ID}}` | `id_ref` | `real_tracks_only` |

### `TouristDestination`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `TouristDestination.@id` | `{{SCHEMA_DESTINATION_ID}}` | `url` | `when_true_and_visible` |
| `TouristDestination.name` | `{{SCHEMA_DESTINATION_NAME}}` | `string` | `when_true_and_visible` |
| `TouristDestination.description` | `{{SCHEMA_DESTINATION_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `TouristDestination.image[]` | `{{SCHEMA_DESTINATION_IMAGE}}` | `url_array` | `real_images` |
| `TouristDestination.geo.latitude` | `{{SCHEMA_DESTINATION_LAT}}` | `number` | `if_real` |
| `TouristDestination.geo.longitude` | `{{SCHEMA_DESTINATION_LON}}` | `number` | `if_real` |
| `TouristDestination.containsPlace[].@id` | `{{SCHEMA_DESTINATION_PLACE_ID}}` | `id_ref` | `real_places_only` |
| `TouristDestination.touristType` | `{{SCHEMA_DESTINATION_TOURIST_TYPE}}` | `string` | `if_supported_by_content` |

### `TouristAttraction`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `TouristAttraction.@id` | `{{SCHEMA_ATTRACTION_ID}}` | `url` | `when_true_and_visible` |
| `TouristAttraction.name` | `{{SCHEMA_ATTRACTION_NAME}}` | `string` | `when_true_and_visible` |
| `TouristAttraction.description` | `{{SCHEMA_ATTRACTION_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `TouristAttraction.image[]` | `{{SCHEMA_ATTRACTION_IMAGE}}` | `url_array` | `if_real` |
| `TouristAttraction.address.addressLocality` | `{{SCHEMA_ADDRESS_CITY}}` | `string` | `if_real` |
| `TouristAttraction.geo.latitude` | `{{SCHEMA_GEO_LAT}}` | `number` | `if_real` |
| `TouristAttraction.geo.longitude` | `{{SCHEMA_GEO_LON}}` | `number` | `if_real` |
| `TouristAttraction.isAccessibleForFree` | `{{SCHEMA_ATTRACTION_FREE}}` | `boolean` | `if_known` |

### `Trip`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Trip.@id` | `{{SCHEMA_TRIP_ID}}` | `url` | `when_true_and_visible` |
| `Trip.name` | `{{SCHEMA_TRIP_NAME}}` | `string` | `when_true_and_visible` |
| `Trip.description` | `{{SCHEMA_TRIP_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Trip.itinerary[].@id` | `{{SCHEMA_TRIP_STOP_ID}}` | `id_ref` | `real_stops_only` |
| `Trip.provider.@id` | `{{SCHEMA_TRIP_PROVIDER_ID}}` | `id_ref` | `if_real` |
| `Trip.departureTime` | `{{SCHEMA_TRIP_DEPARTURE}}` | `datetime` | `if_real` |
| `Trip.arrivalTime` | `{{SCHEMA_TRIP_ARRIVAL}}` | `datetime` | `if_real` |

### `TouristTrip`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `TouristTrip.@id` | `{{SCHEMA_TRIP_ID}}` | `url` | `when_true_and_visible` |
| `TouristTrip.name` | `{{SCHEMA_TRIP_NAME}}` | `string` | `when_true_and_visible` |
| `TouristTrip.description` | `{{SCHEMA_TRIP_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `TouristTrip.itinerary[].@id` | `{{SCHEMA_TRIP_STOP_ID}}` | `id_ref` | `real_stops_only` |
| `TouristTrip.provider.@id` | `{{SCHEMA_TRIP_PROVIDER_ID}}` | `id_ref` | `if_real` |
| `TouristTrip.touristType` | `{{SCHEMA_TRIP_TOURIST_TYPE}}` | `string` | `if_real` |
| `TouristTrip.departureTime` | `{{SCHEMA_TRIP_DEPARTURE}}` | `datetime` | `if_real` |
| `TouristTrip.arrivalTime` | `{{SCHEMA_TRIP_ARRIVAL}}` | `datetime` | `if_real` |

### `Hotel`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Hotel.@id` | `{{SCHEMA_HOTEL_ID}}` | `url` | `when_true_and_visible` |
| `Hotel.name` | `{{SCHEMA_HOTEL_NAME}}` | `string` | `when_true_and_visible` |
| `Hotel.description` | `{{SCHEMA_HOTEL_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Hotel.image[]` | `{{SCHEMA_HOTEL_IMAGES}}` | `url_array` | `real_images` |
| `Hotel.address.streetAddress` | `{{SCHEMA_ADDRESS_STREET}}` | `string` | `if_real` |
| `Hotel.address.addressLocality` | `{{SCHEMA_ADDRESS_CITY}}` | `string` | `if_real` |
| `Hotel.address.addressCountry` | `{{SCHEMA_ADDRESS_COUNTRY}}` | `string` | `if_real` |
| `Hotel.telephone` | `{{SCHEMA_HOTEL_PHONE}}` | `string` | `if_public` |
| `Hotel.starRating.ratingValue` | `{{SCHEMA_HOTEL_STARS}}` | `number` | `verified_rating_only` |
| `Hotel.amenityFeature[].name` | `{{SCHEMA_HOTEL_AMENITY}}` | `string` | `actual_amenities_only` |
| `Hotel.checkinTime` | `{{SCHEMA_HOTEL_CHECKIN}}` | `string` | `if_real` |
| `Hotel.checkoutTime` | `{{SCHEMA_HOTEL_CHECKOUT}}` | `string` | `if_real` |

### `Accommodation`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Accommodation.@id` | `{{SCHEMA_ACCOMMODATION_ID}}` | `url` | `when_true_and_visible` |
| `Accommodation.name` | `{{SCHEMA_ACCOMMODATION_NAME}}` | `string` | `when_true_and_visible` |
| `Accommodation.description` | `{{SCHEMA_ACCOMMODATION_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Accommodation.floorSize.value` | `{{SCHEMA_ACCOMMODATION_SIZE}}` | `number` | `if_real` |
| `Accommodation.floorSize.unitCode` | `{{SCHEMA_ACCOMMODATION_SIZE_UNIT}}` | `string` | `if_real` |
| `Accommodation.numberOfRooms` | `{{SCHEMA_ACCOMMODATION_ROOMS}}` | `integer` | `if_real` |
| `Accommodation.amenityFeature[].name` | `{{SCHEMA_ACCOMMODATION_AMENITY}}` | `string` | `if_real` |
| `Accommodation.occupancy.value` | `{{SCHEMA_ACCOMMODATION_OCCUPANCY}}` | `integer` | `if_real` |

### `Restaurant`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Restaurant.@id` | `{{SCHEMA_RESTAURANT_ID}}` | `url` | `when_true_and_visible` |
| `Restaurant.name` | `{{SCHEMA_RESTAURANT_NAME}}` | `string` | `when_true_and_visible` |
| `Restaurant.description` | `{{SCHEMA_RESTAURANT_DESCRIPTION}}` | `string` | `when_true_and_visible` |
| `Restaurant.servesCuisine[]` | `{{SCHEMA_RESTAURANT_CUISINE}}` | `string_array` | `if_real` |
| `Restaurant.hasMenu` | `{{SCHEMA_RESTAURANT_MENU}}` | `url` | `if_real` |
| `Restaurant.acceptsReservations` | `{{SCHEMA_RESTAURANT_RESERVATIONS}}` | `boolean_or_url` | `if_real` |
| `Restaurant.telephone` | `{{SCHEMA_RESTAURANT_PHONE}}` | `string` | `if_public` |
| `Restaurant.address.streetAddress` | `{{SCHEMA_ADDRESS_STREET}}` | `string` | `if_real` |
| `Restaurant.address.addressLocality` | `{{SCHEMA_ADDRESS_CITY}}` | `string` | `if_real` |
| `Restaurant.openingHoursSpecification[].opens` | `{{SCHEMA_OPENS}}` | `string` | `actual_hours_only` |
| `Restaurant.openingHoursSpecification[].closes` | `{{SCHEMA_CLOSES}}` | `string` | `actual_hours_only` |

### `Flight`
| Schema.org property path | Placeholder / fixed value | Data kind | Condition |
|---|---|---|---|
| `Flight.@id` | `{{SCHEMA_FLIGHT_ID}}` | `url` | `when_true_and_visible` |
| `Flight.flightNumber` | `{{SCHEMA_FLIGHT_NUMBER}}` | `string` | `if_real` |
| `Flight.airline.@id` | `{{SCHEMA_AIRLINE_ID}}` | `id_ref` | `if_real` |
| `Flight.departureAirport.@id` | `{{SCHEMA_DEPARTURE_AIRPORT_ID}}` | `id_ref` | `real_airport` |
| `Flight.arrivalAirport.@id` | `{{SCHEMA_ARRIVAL_AIRPORT_ID}}` | `id_ref` | `real_airport` |
| `Flight.departureTime` | `{{SCHEMA_FLIGHT_DEPARTURE}}` | `datetime` | `if_real` |
| `Flight.arrivalTime` | `{{SCHEMA_FLIGHT_ARRIVAL}}` | `datetime` | `if_real` |
| `Flight.aircraft` | `{{SCHEMA_FLIGHT_AIRCRAFT}}` | `string` | `if_real` |

## 5. Per-page resolved mapping — all 294 distinct boilerplates
For each entry, **Core 11** and **X 6** refer to the full approved catalog in §2; `OG` specifies exact applicable IDs, and OG vertical extensions appear where appropriate. Page and main-entity fields point to the complete named property profiles in §4, with their exact token names. This avoids maintaining 294 divergent copies of a single property definition in prose; the JSON contains per-entry resolved arrays.

### 01 — Blog & Publishing (`blog`) — 28 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 01-01 | Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 01-02 | Blog Main Page | `Blog` | `WebPage` | `Blog` | `website` | `WebPage` + `Blog` |
| 01-03 | Category Page | `blog-category` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 01-04 | Tag Page | `blog-tag` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 01-05 | Archive Page | `blog-archive` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 01-06 | About Page | `AboutPage` | `AboutPage` | `none` | `website` | `WebPage` + `AboutPage` |
| 01-07 | Contact Page | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |
| 01-08 | Author Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` | `WebPage` + `ProfilePage` + `Person` |
| 01-09 | General / Static Page | `WebPage` | `WebPage` | `none` | `website` | `WebPage` |
| 01-10 | General Article | `Article` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 01-11 | Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` | `WebPage` + `BlogPosting` |
| 01-12 | Technical Article | `TechArticle` | `WebPage` | `TechArticle` | `article` | `WebPage` + `TechArticle` |
| 01-13 | News Article | `NewsArticle` | `WebPage` | `NewsArticle` | `article` | `WebPage` + `NewsArticle` |
| 01-14A | General Opinion / Editorial | `opinion-editorial` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 01-14B | News Opinion / Editorial | `OpinionNewsArticle` | `WebPage` | `OpinionNewsArticle` | `article` | `WebPage` + `OpinionNewsArticle` |
| 01-15 | Live Blog | `LiveBlogPosting` | `WebPage` | `LiveBlogPosting` | `article` | `WebPage` + `LiveBlogPosting` |
| 01-16 | Tutorial / How-to | `HowTo` | `WebPage` | `HowTo` | `article` | `WebPage` + `HowTo` |
| 01-17 | Review | `Review` | `WebPage` | `Review` | `article` | `WebPage` + `Review` |
| 01-18 | Book Information / Details | `Book` | `WebPage` | `Book` | `book` | `WebPage` + `Book` |
| 01-19 | Book Review | `book-review` | `WebPage` | `Review` | `article` | `WebPage` + `Review` + `Book` |
| 01-20 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` | `WebPage` + `FAQPage` + `Question` |
| 01-21 | Q&A Page | `QAPage` | `QAPage` | `Question` | `website` | `WebPage` + `QAPage` + `Question` |
| 01-22 | Image Gallery | `ImageGallery` | `ImageGallery` | `none` | `website` | `WebPage` + `ImageGallery` |
| 01-23 | Video Gallery | `VideoGallery` | `VideoGallery` | `none` | `website` | `WebPage` + `VideoGallery` |
| 01-24 | Video Content Page | `video-page` | `WebPage` | `VideoObject` | `video.other` | `WebPage` + `VideoObject` |
| 01-25 | Podcast Episode | `PodcastEpisode` | `WebPage` | `PodcastEpisode` | `website` | `WebPage` + `PodcastEpisode` |
| 01-26A | Event Details | `event-detail` | `WebPage` | `Event` | `website` | `WebPage` + `Event` |
| 01-26B | Event Announcement | `event-announcement` | `WebPage` | `Article` | `article` | `WebPage` + `Article` + `Event` (conditional) |

#### 01-01 — Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite; WebPage.isPartOf → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-02 — Blog Main Page (`Blog`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="Blog">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Blog`; OG `og:type=website`; relationship: WebPage.mainEntity → Blog; Blog.isPartOf → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Blog`: `Blog.@id` → `{{SCHEMA_BLOG_ID}}`, `Blog.name` → `{{SCHEMA_BLOG_NAME}}`, `Blog.description` → `{{SCHEMA_BLOG_DESCRIPTION}}`, `Blog.url` → `{{SCHEMA_BLOG_URL}}`, `Blog.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Blog.blogPost.@id` → `{{SCHEMA_BLOG_POST_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-03 — Category Page (`blog-category`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="blog-category">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-04 — Tag Page (`blog-tag`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="blog-tag">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-05 — Archive Page (`blog-archive`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="blog-archive">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-06 — About Page (`AboutPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="AboutPage">
```

- **Mappings:** page `@type=AboutPage`; main entity `@type=none`; OG `og:type=website`; relationship: AboutPage.about → existing configured Person or Organization, only if actually described.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `AboutPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `AboutPage.@type` → `AboutPage`, `AboutPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-07 — Contact Page (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: ContactPage.about → existing configured publishing identity, only if present.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-08 — Author Profile (`ProfilePage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="ProfilePage">
```

- **Mappings:** page `@type=ProfilePage`; main entity `@type=Person`; OG `og:type=profile`; relationship: ProfilePage.mainEntity → Person.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ProfilePage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ProfilePage.@type` → `ProfilePage`, `ProfilePage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Person`: `Person.@id` → `{{SCHEMA_PERSON_ID}}`, `Person.name` → `{{SCHEMA_PERSON_NAME}}`, `Person.url` → `{{SCHEMA_PERSON_URL}}`, `Person.image` → `{{SCHEMA_PERSON_IMAGE}}`, `Person.description` → `{{SCHEMA_PERSON_BIO}}`, `Person.sameAs[]` → `{{SCHEMA_PERSON_SAMEAS}}`, `Person.jobTitle` → `{{SCHEMA_PERSON_JOB_TITLE}}`, `Person.worksFor.@id` → `{{SCHEMA_PERSON_ORG_ID}}`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-09 — General / Static Page (`WebPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="WebPage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No forced mainEntity.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-10 — General Article (`Article`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="Article">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article; Article.mainEntityOfPage → WebPage.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-11 — Blog Post (`BlogPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="BlogPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=BlogPosting`; OG `og:type=article`; relationship: WebPage.mainEntity → BlogPosting; BlogPosting.isPartOf → Blog (if Blog configured).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `BlogPosting`: `BlogPosting.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `BlogPosting.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `BlogPosting.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `BlogPosting.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `BlogPosting.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `BlogPosting.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `BlogPosting.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `BlogPosting.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `BlogPosting.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-12 — Technical Article (`TechArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="TechArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=TechArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → TechArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `TechArticle`: `TechArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `TechArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `TechArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `TechArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `TechArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `TechArticle.dependencies` → `{{SCHEMA_TECH_DEPENDENCIES}}`, `TechArticle.proficiencyLevel` → `{{SCHEMA_TECH_LEVEL}}`, `TechArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `BreadcrumbList_if_breadcrumbs_exist`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-13 — News Article (`NewsArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="NewsArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=NewsArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → NewsArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `NewsArticle`: `NewsArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `NewsArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `NewsArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `NewsArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `NewsArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `NewsArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `NewsArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `NewsArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `NewsArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `ImageObject_if_images_exist`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-14A — General Opinion / Editorial (`opinion-editorial`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="opinion-editorial">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Special guardrail:** General editorial maps to Article; OpinionNewsArticle is reserved for news-specific editorials.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-14B — News Opinion / Editorial (`OpinionNewsArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="OpinionNewsArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=OpinionNewsArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → OpinionNewsArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `OpinionNewsArticle`: `OpinionNewsArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `OpinionNewsArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `OpinionNewsArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `OpinionNewsArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `OpinionNewsArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `OpinionNewsArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `OpinionNewsArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `OpinionNewsArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `OpinionNewsArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Special guardrail:** News opinion maps to OpinionNewsArticle. Do not reclassify general editorials automatically.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-15 — Live Blog (`LiveBlogPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="LiveBlogPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=LiveBlogPosting`; OG `og:type=article`; relationship: WebPage.mainEntity → LiveBlogPosting; LiveBlogPosting.liveBlogUpdate → BlogPosting updates (when present).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `LiveBlogPosting`: `LiveBlogPosting.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `LiveBlogPosting.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `LiveBlogPosting.coverageStartTime` → `{{SCHEMA_LIVE_START}}`, `LiveBlogPosting.coverageEndTime` → `{{SCHEMA_LIVE_END}}`, `LiveBlogPosting.liveBlogUpdate[].@id` → `{{SCHEMA_LIVE_UPDATE_ID}}`, `LiveBlogPosting.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `LiveBlogPosting.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `LiveBlogPosting.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-16 — Tutorial / How-to (`HowTo`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="HowTo">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=HowTo`; OG `og:type=article`; relationship: WebPage.mainEntity → HowTo; HowTo.step → HowToStep when actual steps exist.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `HowTo`: `HowTo.name` → `{{SCHEMA_HOWTO_NAME}}`, `HowTo.description` → `{{SCHEMA_HOWTO_DESCRIPTION}}`, `HowTo.step[].name` → `{{SCHEMA_HOWTO_STEP_NAME}}`, `HowTo.step[].text` → `{{SCHEMA_HOWTO_STEP_TEXT}}`, `HowTo.step[].url` → `{{SCHEMA_HOWTO_STEP_URL}}`, `HowTo.totalTime` → `{{SCHEMA_HOWTO_TOTAL_TIME}}`, `HowTo.tool[].name` → `{{SCHEMA_HOWTO_TOOL}}`, `HowTo.supply[].name` → `{{SCHEMA_HOWTO_SUPPLY}}`.
- **Special guardrail:** Schema.org vocabulary remains valid even though Google feature support is limited/retired. Do not claim rich-result guarantee.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-17 — Review (`Review`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="Review">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Review`; OG `og:type=article`; relationship: WebPage.mainEntity → Review; Review.itemReviewed → existing reviewed Thing.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Review`: `Review.@id` → `{{SCHEMA_REVIEW_ID}}`, `Review.name` → `{{SCHEMA_REVIEW_TITLE}}`, `Review.reviewBody` → `{{SCHEMA_REVIEW_BODY}}`, `Review.author.@id` → `{{SCHEMA_REVIEW_AUTHOR_ID}}`, `Review.datePublished` → `{{SCHEMA_REVIEW_DATE}}`, `Review.itemReviewed.@id` → `{{SCHEMA_REVIEW_SUBJECT_ID}}`, `Review.reviewRating.ratingValue` → `{{SCHEMA_REVIEW_RATING}}`, `Review.reviewRating.bestRating` → `{{SCHEMA_REVIEW_BEST_RATING}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `reviewed_item_entity_must_match_topic`.
- **Special guardrail:** Review.itemReviewed requires a real, correctly typed target; do not assume it is the publishing website.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-18 — Book Information / Details (`Book`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="Book">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Book`; OG `og:type=book`; relationship: WebPage.mainEntity → Book.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `book:author` → `{{OG_BOOK_AUTHOR}}`, `book:isbn` → `{{OG_BOOK_ISBN}}`, `book:release_date` → `{{OG_BOOK_RELEASE_DATE}}`, `book:tag` → `{{OG_BOOK_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Book`: `Book.@id` → `{{SCHEMA_BOOK_ID}}`, `Book.name` → `{{SCHEMA_BOOK_TITLE}}`, `Book.description` → `{{SCHEMA_BOOK_DESCRIPTION}}`, `Book.author[].@id` → `{{SCHEMA_BOOK_AUTHOR_ID}}`, `Book.isbn` → `{{SCHEMA_BOOK_ISBN}}`, `Book.bookFormat` → `{{SCHEMA_BOOK_FORMAT}}`, `Book.inLanguage` → `{{SCHEMA_BOOK_LANGUAGE}}`, `Book.numberOfPages` → `{{SCHEMA_BOOK_PAGES}}`, `Book.datePublished` → `{{SCHEMA_BOOK_PUBLICATION_DATE}}`, `Book.publisher.@id` → `{{SCHEMA_BOOK_PUBLISHER_ID}}`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-19 — Book Review (`book-review`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="book-review">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Review`; OG `og:type=article`; relationship: WebPage.mainEntity → Review; Review.itemReviewed → Book.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Review`: `Review.@id` → `{{SCHEMA_REVIEW_ID}}`, `Review.name` → `{{SCHEMA_REVIEW_TITLE}}`, `Review.reviewBody` → `{{SCHEMA_REVIEW_BODY}}`, `Review.author.@id` → `{{SCHEMA_REVIEW_AUTHOR_ID}}`, `Review.datePublished` → `{{SCHEMA_REVIEW_DATE}}`, `Review.itemReviewed.@id` → `{{SCHEMA_REVIEW_SUBJECT_ID}}`, `Review.reviewRating.ratingValue` → `{{SCHEMA_REVIEW_RATING}}`, `Review.reviewRating.bestRating` → `{{SCHEMA_REVIEW_BEST_RATING}}`.
  - reviewed_subject `Book`: `Book.@id` → `{{SCHEMA_BOOK_ID}}`, `Book.name` → `{{SCHEMA_BOOK_TITLE}}`, `Book.description` → `{{SCHEMA_BOOK_DESCRIPTION}}`, `Book.author[].@id` → `{{SCHEMA_BOOK_AUTHOR_ID}}`, `Book.isbn` → `{{SCHEMA_BOOK_ISBN}}`, `Book.bookFormat` → `{{SCHEMA_BOOK_FORMAT}}`, `Book.inLanguage` → `{{SCHEMA_BOOK_LANGUAGE}}`, `Book.numberOfPages` → `{{SCHEMA_BOOK_PAGES}}`, `Book.datePublished` → `{{SCHEMA_BOOK_PUBLICATION_DATE}}`, `Book.publisher.@id` → `{{SCHEMA_BOOK_PUBLISHER_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `reviewed_item_entity_must_match_topic`.
- **Special guardrail:** Review.itemReviewed must reference an actual Book. Book OG subtype belongs to book details, not the book-review article. Review.itemReviewed requires a real, correctly typed target; do not assume it is the publishing website.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-20 — FAQ Page (`FAQPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="FAQPage">
```

- **Mappings:** page `@type=FAQPage`; main entity `@type=Question`; OG `og:type=website`; relationship: FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `FAQPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `FAQPage.@type` → `FAQPage`, `FAQPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`, `FAQPage.mainEntity[].@id` → `{{SCHEMA_FAQ_QUESTION_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** FAQPage has multiple actual Question/Answer entries; a single Question is only a repeatable pattern. Google FAQ rich results are restricted.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-21 — Q&A Page (`QAPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="QAPage">
```

- **Mappings:** page `@type=QAPage`; main entity `@type=Question`; OG `og:type=website`; relationship: QAPage.mainEntity → Question; Question.acceptedAnswer/suggestedAnswer → real Answer objects.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `QAPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `QAPage.@type` → `QAPage`, `QAPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** QAPage is a single question with its genuine answers, not an editorial FAQ list.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-22 — Image Gallery (`ImageGallery`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="ImageGallery">
```

- **Mappings:** page `@type=ImageGallery`; main entity `@type=none`; OG `og:type=website`; relationship: ImageGallery.hasPart → ImageObject[] (only visible media, no forced singular mainEntity).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ImageGallery`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ImageGallery.@type` → `ImageGallery`, `ImageGallery.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - optional_gallery_items `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-23 — Video Gallery (`VideoGallery`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="VideoGallery">
```

- **Mappings:** page `@type=VideoGallery`; main entity `@type=none`; OG `og:type=website`; relationship: VideoGallery.hasPart → VideoObject[] (only visible media, no forced singular mainEntity).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `VideoGallery`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `VideoGallery.@type` → `VideoGallery`, `VideoGallery.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - optional_gallery_items `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-24 — Video Content Page (`video-page`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="video-page">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=VideoObject`; OG `og:type=video.other`; relationship: WebPage.mainEntity → VideoObject.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `video:actor` → `{{OG_VIDEO_ACTOR}}`, `video:director` → `{{OG_VIDEO_DIRECTOR}}`, `video:duration` → `{{OG_VIDEO_DURATION_SECONDS}}`, `video:release_date` → `{{OG_VIDEO_RELEASE_DATE}}`, `video:tag` → `{{OG_VIDEO_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `VideoObject`: `VideoObject.@id` → `{{SCHEMA_VIDEO_ID}}`, `VideoObject.name` → `{{SCHEMA_VIDEO_NAME}}`, `VideoObject.description` → `{{SCHEMA_VIDEO_DESCRIPTION}}`, `VideoObject.thumbnailUrl[]` → `{{SCHEMA_VIDEO_THUMBNAIL_URL}}`, `VideoObject.uploadDate` → `{{SCHEMA_VIDEO_UPLOAD_DATE}}`, `VideoObject.duration` → `{{SCHEMA_VIDEO_DURATION}}`, `VideoObject.contentUrl` → `{{SCHEMA_VIDEO_CONTENT_URL}}`, `VideoObject.embedUrl` → `{{SCHEMA_VIDEO_EMBED_URL}}`, `VideoObject.hasPart[].@id` → `{{SCHEMA_VIDEO_CLIP_ID}}`, `VideoObject.inLanguage` → `{{SCHEMA_VIDEO_LANGUAGE}}`.
- **Associated nodes (only if real):** `ImageObject_if_actual_thumbnail`, `Clip_if_actual_chapters`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-25 — Podcast Episode (`PodcastEpisode`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="PodcastEpisode">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=PodcastEpisode`; OG `og:type=website`; relationship: WebPage.mainEntity → PodcastEpisode; PodcastEpisode.associatedMedia → AudioObject; partOfSeries → PodcastSeries if identified.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `PodcastEpisode`: `PodcastEpisode.@id` → `{{SCHEMA_EPISODE_ID}}`, `PodcastEpisode.name` → `{{SCHEMA_EPISODE_NAME}}`, `PodcastEpisode.description` → `{{SCHEMA_EPISODE_DESCRIPTION}}`, `PodcastEpisode.datePublished` → `{{SCHEMA_EPISODE_DATE}}`, `PodcastEpisode.episodeNumber` → `{{SCHEMA_EPISODE_NUMBER}}`, `PodcastEpisode.partOfSeries.@id` → `{{SCHEMA_PODCAST_SERIES_ID}}`, `PodcastEpisode.associatedMedia.@id` → `{{SCHEMA_AUDIO_ID}}`.
- **Associated nodes (only if real):** `AudioObject_if_actual_audio`, `PodcastSeries_if_real`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-26A — Event Details (`event-detail`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="event-detail">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Event`; OG `og:type=website`; relationship: WebPage.mainEntity → Event.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Event`: `Event.@id` → `{{SCHEMA_EVENT_ID}}`, `Event.name` → `{{SCHEMA_EVENT_NAME}}`, `Event.description` → `{{SCHEMA_EVENT_DESCRIPTION}}`, `Event.startDate` → `{{SCHEMA_EVENT_START}}`, `Event.endDate` → `{{SCHEMA_EVENT_END}}`, `Event.eventStatus` → `{{SCHEMA_EVENT_STATUS}}`, `Event.eventAttendanceMode` → `{{SCHEMA_EVENT_ATTENDANCE_MODE}}`, `Event.location.@id` → `{{SCHEMA_EVENT_LOCATION_ID}}`, `Event.organizer.@id` → `{{SCHEMA_EVENT_ORGANIZER_ID}}`, `Event.offers[].@id` → `{{SCHEMA_EVENT_OFFER_ID}}`, `Event.performer[].@id` → `{{SCHEMA_EVENT_PERFORMER_ID}}`, `Event.image[]` → `{{SCHEMA_EVENT_IMAGE}}`.
- **Associated nodes (only if real):** `Place_or_VirtualLocation_if_real`, `Organization_if_real`, `Offer_if_tickets_exist`.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

#### 01-26B — Event Announcement (`event-announcement`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="blog"
      data-cms-seo-type="event-announcement">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article; Article.about → Event only if that event is modeled.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
  - announced_event_if_real `Event`: `Event.@id` → `{{SCHEMA_EVENT_ID}}`, `Event.name` → `{{SCHEMA_EVENT_NAME}}`, `Event.description` → `{{SCHEMA_EVENT_DESCRIPTION}}`, `Event.startDate` → `{{SCHEMA_EVENT_START}}`, `Event.endDate` → `{{SCHEMA_EVENT_END}}`, `Event.eventStatus` → `{{SCHEMA_EVENT_STATUS}}`, `Event.eventAttendanceMode` → `{{SCHEMA_EVENT_ATTENDANCE_MODE}}`, `Event.location.@id` → `{{SCHEMA_EVENT_LOCATION_ID}}`, `Event.organizer.@id` → `{{SCHEMA_EVENT_ORGANIZER_ID}}`, `Event.offers[].@id` → `{{SCHEMA_EVENT_OFFER_ID}}`, `Event.performer[].@id` → `{{SCHEMA_EVENT_PERFORMER_ID}}`, `Event.image[]` → `{{SCHEMA_EVENT_IMAGE}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Special guardrail:** Event announcement is an Article about an Event. Add Event graph node only if genuine event details appear.
- **Registry approval:** Blog owner-selected. No injection mechanics approved.

### 02 — News & Magazine (`news`) — 25 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 02-01 | Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 02-02 | News Main Page | `news-main` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 02-03 | Section / Category Page | `news-section` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 02-04 | Topic / Tag Page | `news-topic` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 02-05 | Date Archive | `news-archive` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 02-06 | About Publication | `AboutPage` | `AboutPage` | `none` | `website` | `WebPage` + `AboutPage` |
| 02-07 | Contact / News Tips | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |
| 02-08 | Reporter Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` | `WebPage` + `ProfilePage` + `Person` |
| 02-09 | General Information Page | `WebPage` | `WebPage` | `none` | `website` | `WebPage` |
| 02-10 | Standard News Article | `NewsArticle` | `WebPage` | `NewsArticle` | `article` | `WebPage` + `NewsArticle` |
| 02-11 | Breaking News Article | `breaking-news` | `WebPage` | `NewsArticle` | `article` | `WebPage` + `NewsArticle` |
| 02-12 | News Analysis | `AnalysisNewsArticle` | `WebPage` | `AnalysisNewsArticle` | `article` | `WebPage` + `AnalysisNewsArticle` |
| 02-13 | News Reportage | `ReportageNewsArticle` | `WebPage` | `ReportageNewsArticle` | `article` | `WebPage` + `ReportageNewsArticle` |
| 02-14 | Background / Explainer News | `BackgroundNewsArticle` | `WebPage` | `BackgroundNewsArticle` | `article` | `WebPage` + `BackgroundNewsArticle` |
| 02-15 | Opinion News Article | `OpinionNewsArticle` | `WebPage` | `OpinionNewsArticle` | `article` | `WebPage` + `OpinionNewsArticle` |
| 02-16 | General Editorial | `news-editorial` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 02-17 | Fact Check | `ClaimReview` | `WebPage` | `ClaimReview` | `article` | `WebPage` + `ClaimReview` |
| 02-18 | Live News Blog | `LiveBlogPosting` | `WebPage` | `LiveBlogPosting` | `article` | `WebPage` + `LiveBlogPosting` |
| 02-19 | Feature Article | `Article` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 02-20 | Interview Article | `news-interview` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 02-21 | Photo Gallery | `ImageGallery` | `ImageGallery` | `none` | `website` | `WebPage` + `ImageGallery` |
| 02-22 | Video Report | `news-video` | `WebPage` | `VideoObject` | `video.other` | `WebPage` + `VideoObject` |
| 02-23 | Video Gallery | `VideoGallery` | `VideoGallery` | `none` | `website` | `WebPage` + `VideoGallery` |
| 02-24 | Podcast Episode | `PodcastEpisode` | `WebPage` | `PodcastEpisode` | `website` | `WebPage` + `PodcastEpisode` |
| 02-25 | News Event Details | `news-event` | `WebPage` | `Event` | `website` | `WebPage` + `Event` |

#### 02-01 — Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-02 — News Main Page (`news-main`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-main">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-03 — Section / Category Page (`news-section`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-section">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-04 — Topic / Tag Page (`news-topic`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-topic">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-05 — Date Archive (`news-archive`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-archive">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-06 — About Publication (`AboutPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="AboutPage">
```

- **Mappings:** page `@type=AboutPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `AboutPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `AboutPage.@type` → `AboutPage`, `AboutPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-07 — Contact / News Tips (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-08 — Reporter Profile (`ProfilePage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="ProfilePage">
```

- **Mappings:** page `@type=ProfilePage`; main entity `@type=Person`; OG `og:type=profile`; relationship: ProfilePage.mainEntity → Person.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ProfilePage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ProfilePage.@type` → `ProfilePage`, `ProfilePage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Person`: `Person.@id` → `{{SCHEMA_PERSON_ID}}`, `Person.name` → `{{SCHEMA_PERSON_NAME}}`, `Person.url` → `{{SCHEMA_PERSON_URL}}`, `Person.image` → `{{SCHEMA_PERSON_IMAGE}}`, `Person.description` → `{{SCHEMA_PERSON_BIO}}`, `Person.sameAs[]` → `{{SCHEMA_PERSON_SAMEAS}}`, `Person.jobTitle` → `{{SCHEMA_PERSON_JOB_TITLE}}`, `Person.worksFor.@id` → `{{SCHEMA_PERSON_ORG_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-09 — General Information Page (`WebPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="WebPage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-10 — Standard News Article (`NewsArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="NewsArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=NewsArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → NewsArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `NewsArticle`: `NewsArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `NewsArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `NewsArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `NewsArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `NewsArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `NewsArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `NewsArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `NewsArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `NewsArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-11 — Breaking News Article (`breaking-news`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="breaking-news">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=NewsArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → NewsArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `NewsArticle`: `NewsArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `NewsArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `NewsArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `NewsArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `NewsArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `NewsArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `NewsArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `NewsArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `NewsArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `ImageObject_if_images_exist`.
- **Special guardrail:** Breaking news has NewsArticle schema; breaking status alone is not a new Schema.org class.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-12 — News Analysis (`AnalysisNewsArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="AnalysisNewsArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=AnalysisNewsArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → AnalysisNewsArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `AnalysisNewsArticle`: `AnalysisNewsArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `AnalysisNewsArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `AnalysisNewsArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `AnalysisNewsArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `AnalysisNewsArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `AnalysisNewsArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `AnalysisNewsArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `AnalysisNewsArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `AnalysisNewsArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-13 — News Reportage (`ReportageNewsArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="ReportageNewsArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=ReportageNewsArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → ReportageNewsArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `ReportageNewsArticle`: `ReportageNewsArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `ReportageNewsArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `ReportageNewsArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `ReportageNewsArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `ReportageNewsArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `ReportageNewsArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `ReportageNewsArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `ReportageNewsArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `ReportageNewsArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-14 — Background / Explainer News (`BackgroundNewsArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="BackgroundNewsArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=BackgroundNewsArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → BackgroundNewsArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `BackgroundNewsArticle`: `BackgroundNewsArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `BackgroundNewsArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `BackgroundNewsArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `BackgroundNewsArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `BackgroundNewsArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `BackgroundNewsArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `BackgroundNewsArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `BackgroundNewsArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `BackgroundNewsArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-15 — Opinion News Article (`OpinionNewsArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="OpinionNewsArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=OpinionNewsArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → OpinionNewsArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `OpinionNewsArticle`: `OpinionNewsArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `OpinionNewsArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `OpinionNewsArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `OpinionNewsArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `OpinionNewsArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `OpinionNewsArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `OpinionNewsArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `OpinionNewsArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `OpinionNewsArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-16 — General Editorial (`news-editorial`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-editorial">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-17 — Fact Check (`ClaimReview`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="ClaimReview">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=ClaimReview`; OG `og:type=article`; relationship: WebPage.mainEntity → ClaimReview.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `ClaimReview`: `ClaimReview.claimReviewed` → `{{SCHEMA_CLAIM_TEXT}}`, `ClaimReview.itemReviewed.@id` → `{{SCHEMA_CLAIM_ID}}`, `ClaimReview.reviewRating.ratingValue` → `{{SCHEMA_CLAIM_RATING}}`, `ClaimReview.author.@id` → `{{SCHEMA_CLAIM_REVIEWER_ID}}`, `ClaimReview.datePublished` → `{{SCHEMA_CLAIM_REVIEW_DATE}}`, `ClaimReview.url` → `{{SCHEMA_CLAIM_REVIEW_URL}}`.
- **Special guardrail:** ClaimReview exists in Schema.org; Google retired fact-check rich result support; do not promise eligibility. Schema.org vocabulary remains valid even though Google feature support is limited/retired. Do not claim rich-result guarantee.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-18 — Live News Blog (`LiveBlogPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="LiveBlogPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=LiveBlogPosting`; OG `og:type=article`; relationship: WebPage.mainEntity → LiveBlogPosting.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `LiveBlogPosting`: `LiveBlogPosting.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `LiveBlogPosting.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `LiveBlogPosting.coverageStartTime` → `{{SCHEMA_LIVE_START}}`, `LiveBlogPosting.coverageEndTime` → `{{SCHEMA_LIVE_END}}`, `LiveBlogPosting.liveBlogUpdate[].@id` → `{{SCHEMA_LIVE_UPDATE_ID}}`, `LiveBlogPosting.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `LiveBlogPosting.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `LiveBlogPosting.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-19 — Feature Article (`Article`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="Article">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-20 — Interview Article (`news-interview`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-interview">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-21 — Photo Gallery (`ImageGallery`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="ImageGallery">
```

- **Mappings:** page `@type=ImageGallery`; main entity `@type=none`; OG `og:type=website`; relationship: ImageGallery.hasPart → ImageObject[] (only visible media, no forced singular mainEntity).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ImageGallery`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ImageGallery.@type` → `ImageGallery`, `ImageGallery.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - optional_gallery_items `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-22 — Video Report (`news-video`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-video">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=VideoObject`; OG `og:type=video.other`; relationship: WebPage.mainEntity → VideoObject.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `video:actor` → `{{OG_VIDEO_ACTOR}}`, `video:director` → `{{OG_VIDEO_DIRECTOR}}`, `video:duration` → `{{OG_VIDEO_DURATION_SECONDS}}`, `video:release_date` → `{{OG_VIDEO_RELEASE_DATE}}`, `video:tag` → `{{OG_VIDEO_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `VideoObject`: `VideoObject.@id` → `{{SCHEMA_VIDEO_ID}}`, `VideoObject.name` → `{{SCHEMA_VIDEO_NAME}}`, `VideoObject.description` → `{{SCHEMA_VIDEO_DESCRIPTION}}`, `VideoObject.thumbnailUrl[]` → `{{SCHEMA_VIDEO_THUMBNAIL_URL}}`, `VideoObject.uploadDate` → `{{SCHEMA_VIDEO_UPLOAD_DATE}}`, `VideoObject.duration` → `{{SCHEMA_VIDEO_DURATION}}`, `VideoObject.contentUrl` → `{{SCHEMA_VIDEO_CONTENT_URL}}`, `VideoObject.embedUrl` → `{{SCHEMA_VIDEO_EMBED_URL}}`, `VideoObject.hasPart[].@id` → `{{SCHEMA_VIDEO_CLIP_ID}}`, `VideoObject.inLanguage` → `{{SCHEMA_VIDEO_LANGUAGE}}`.
- **Associated nodes (only if real):** `ImageObject_if_actual_thumbnail`, `Clip_if_actual_chapters`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-23 — Video Gallery (`VideoGallery`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="VideoGallery">
```

- **Mappings:** page `@type=VideoGallery`; main entity `@type=none`; OG `og:type=website`; relationship: VideoGallery.hasPart → VideoObject[] (only visible media, no forced singular mainEntity).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `VideoGallery`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `VideoGallery.@type` → `VideoGallery`, `VideoGallery.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - optional_gallery_items `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-24 — Podcast Episode (`PodcastEpisode`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="PodcastEpisode">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=PodcastEpisode`; OG `og:type=website`; relationship: WebPage.mainEntity → PodcastEpisode.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `PodcastEpisode`: `PodcastEpisode.@id` → `{{SCHEMA_EPISODE_ID}}`, `PodcastEpisode.name` → `{{SCHEMA_EPISODE_NAME}}`, `PodcastEpisode.description` → `{{SCHEMA_EPISODE_DESCRIPTION}}`, `PodcastEpisode.datePublished` → `{{SCHEMA_EPISODE_DATE}}`, `PodcastEpisode.episodeNumber` → `{{SCHEMA_EPISODE_NUMBER}}`, `PodcastEpisode.partOfSeries.@id` → `{{SCHEMA_PODCAST_SERIES_ID}}`, `PodcastEpisode.associatedMedia.@id` → `{{SCHEMA_AUDIO_ID}}`.
- **Associated nodes (only if real):** `AudioObject_if_actual_audio`, `PodcastSeries_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 02-25 — News Event Details (`news-event`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="news"
      data-cms-seo-type="news-event">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Event`; OG `og:type=website`; relationship: WebPage.mainEntity → Event.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Event`: `Event.@id` → `{{SCHEMA_EVENT_ID}}`, `Event.name` → `{{SCHEMA_EVENT_NAME}}`, `Event.description` → `{{SCHEMA_EVENT_DESCRIPTION}}`, `Event.startDate` → `{{SCHEMA_EVENT_START}}`, `Event.endDate` → `{{SCHEMA_EVENT_END}}`, `Event.eventStatus` → `{{SCHEMA_EVENT_STATUS}}`, `Event.eventAttendanceMode` → `{{SCHEMA_EVENT_ATTENDANCE_MODE}}`, `Event.location.@id` → `{{SCHEMA_EVENT_LOCATION_ID}}`, `Event.organizer.@id` → `{{SCHEMA_EVENT_ORGANIZER_ID}}`, `Event.offers[].@id` → `{{SCHEMA_EVENT_OFFER_ID}}`, `Event.performer[].@id` → `{{SCHEMA_EVENT_PERFORMER_ID}}`, `Event.image[]` → `{{SCHEMA_EVENT_IMAGE}}`.
- **Associated nodes (only if real):** `Place_or_VirtualLocation_if_real`, `Organization_if_real`, `Offer_if_tickets_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

### 03 — Personal Portfolio (`portfolio`) — 22 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 03-01 | Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 03-02 | Personal Profile / About | `ProfilePage` | `ProfilePage` | `Person` | `profile` | `WebPage` + `ProfilePage` + `Person` |
| 03-03 | Professional Biography | `portfolio-bio` | `ProfilePage` | `Person` | `profile` | `WebPage` + `ProfilePage` + `Person` |
| 03-04 | Resume / CV Page | `portfolio-resume` | `WebPage` | `Person` | `profile` | `WebPage` + `Person` |
| 03-05 | Contact | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |
| 03-06 | Services Overview | `portfolio-services` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 03-07 | Individual Service | `Service` | `WebPage` | `Service` | `website` | `WebPage` + `Service` |
| 03-08 | FAQ | `FAQPage` | `FAQPage` | `Question` | `website` | `WebPage` + `FAQPage` + `Question` |
| 03-09 | Projects Index | `portfolio-projects` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 03-10 | Project Detail | `portfolio-project` | `WebPage` | `CreativeWork` | `website` | `WebPage` + `CreativeWork` |
| 03-11 | Case Study | `portfolio-case-study` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 03-12 | Visual Artwork | `VisualArtwork` | `WebPage` | `VisualArtwork` | `website` | `WebPage` + `VisualArtwork` |
| 03-13 | Photography Work | `Photograph` | `WebPage` | `Photograph` | `website` | `WebPage` + `Photograph` |
| 03-14 | Image Gallery | `ImageGallery` | `ImageGallery` | `none` | `website` | `WebPage` + `ImageGallery` |
| 03-15 | Video Showreel | `portfolio-showreel` | `WebPage` | `VideoObject` | `video.other` | `WebPage` + `VideoObject` |
| 03-16 | Software Project | `SoftwareSourceCode` | `WebPage` | `SoftwareSourceCode` | `website` | `WebPage` + `SoftwareSourceCode` |
| 03-17 | Writing Sample | `Article` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 03-18 | Creative Work Collection | `CollectionPage` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 03-19 | Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` | `WebPage` + `BlogPosting` |
| 03-20 | Client Testimonial / Review | `portfolio-review` | `WebPage` | `Review` | `website` | `WebPage` + `Review` |
| 03-21 | Event / Speaking Engagement | `Event` | `WebPage` | `Event` | `website` | `WebPage` + `Event` |
| 03-22 | Press / Media Feature | `portfolio-press` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |

#### 03-01 — Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-02 — Personal Profile / About (`ProfilePage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="ProfilePage">
```

- **Mappings:** page `@type=ProfilePage`; main entity `@type=Person`; OG `og:type=profile`; relationship: ProfilePage.mainEntity → Person.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ProfilePage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ProfilePage.@type` → `ProfilePage`, `ProfilePage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Person`: `Person.@id` → `{{SCHEMA_PERSON_ID}}`, `Person.name` → `{{SCHEMA_PERSON_NAME}}`, `Person.url` → `{{SCHEMA_PERSON_URL}}`, `Person.image` → `{{SCHEMA_PERSON_IMAGE}}`, `Person.description` → `{{SCHEMA_PERSON_BIO}}`, `Person.sameAs[]` → `{{SCHEMA_PERSON_SAMEAS}}`, `Person.jobTitle` → `{{SCHEMA_PERSON_JOB_TITLE}}`, `Person.worksFor.@id` → `{{SCHEMA_PERSON_ORG_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-03 — Professional Biography (`portfolio-bio`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-bio">
```

- **Mappings:** page `@type=ProfilePage`; main entity `@type=Person`; OG `og:type=profile`; relationship: ProfilePage.mainEntity → Person.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ProfilePage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ProfilePage.@type` → `ProfilePage`, `ProfilePage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Person`: `Person.@id` → `{{SCHEMA_PERSON_ID}}`, `Person.name` → `{{SCHEMA_PERSON_NAME}}`, `Person.url` → `{{SCHEMA_PERSON_URL}}`, `Person.image` → `{{SCHEMA_PERSON_IMAGE}}`, `Person.description` → `{{SCHEMA_PERSON_BIO}}`, `Person.sameAs[]` → `{{SCHEMA_PERSON_SAMEAS}}`, `Person.jobTitle` → `{{SCHEMA_PERSON_JOB_TITLE}}`, `Person.worksFor.@id` → `{{SCHEMA_PERSON_ORG_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-04 — Resume / CV Page (`portfolio-resume`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-resume">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Person`; OG `og:type=profile`; relationship: WebPage.mainEntity → Person.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Person`: `Person.@id` → `{{SCHEMA_PERSON_ID}}`, `Person.name` → `{{SCHEMA_PERSON_NAME}}`, `Person.url` → `{{SCHEMA_PERSON_URL}}`, `Person.image` → `{{SCHEMA_PERSON_IMAGE}}`, `Person.description` → `{{SCHEMA_PERSON_BIO}}`, `Person.sameAs[]` → `{{SCHEMA_PERSON_SAMEAS}}`, `Person.jobTitle` → `{{SCHEMA_PERSON_JOB_TITLE}}`, `Person.worksFor.@id` → `{{SCHEMA_PERSON_ORG_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-05 — Contact (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-06 — Services Overview (`portfolio-services`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-services">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-07 — Individual Service (`Service`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="Service">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Service`; OG `og:type=website`; relationship: WebPage.mainEntity → Service.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Service`: `Service.@id` → `{{SCHEMA_SERVICE_ID}}`, `Service.name` → `{{SCHEMA_SERVICE_NAME}}`, `Service.description` → `{{SCHEMA_SERVICE_DESCRIPTION}}`, `Service.serviceType` → `{{SCHEMA_SERVICE_TYPE}}`, `Service.provider.@id` → `{{SCHEMA_SERVICE_PROVIDER_ID}}`, `Service.areaServed[]` → `{{SCHEMA_SERVICE_AREA_SERVED}}`, `Service.offers[].@id` → `{{SCHEMA_SERVICE_OFFER_ID}}`, `Service.availableChannel` → `{{SCHEMA_SERVICE_CHANNEL}}`.
- **Associated nodes (only if real):** `Organization_or_Person_for_provider_if_real`, `Offer_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-08 — FAQ (`FAQPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="FAQPage">
```

- **Mappings:** page `@type=FAQPage`; main entity `@type=Question`; OG `og:type=website`; relationship: FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `FAQPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `FAQPage.@type` → `FAQPage`, `FAQPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`, `FAQPage.mainEntity[].@id` → `{{SCHEMA_FAQ_QUESTION_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** FAQPage has multiple actual Question/Answer entries; a single Question is only a repeatable pattern. Google FAQ rich results are restricted.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-09 — Projects Index (`portfolio-projects`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-projects">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-10 — Project Detail (`portfolio-project`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-project">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=CreativeWork`; OG `og:type=website`; relationship: WebPage.mainEntity → CreativeWork.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `CreativeWork`: `CreativeWork.@id` → `{{SCHEMA_WORK_ID}}`, `CreativeWork.name` → `{{SCHEMA_WORK_NAME}}`, `CreativeWork.description` → `{{SCHEMA_WORK_DESCRIPTION}}`, `CreativeWork.creator[].@id` → `{{SCHEMA_WORK_CREATOR_ID}}`, `CreativeWork.dateCreated` → `{{SCHEMA_WORK_CREATED}}`, `CreativeWork.image[]` → `{{SCHEMA_WORK_IMAGE}}`, `CreativeWork.license` → `{{SCHEMA_WORK_LICENSE}}`, `CreativeWork.keywords[]` → `{{SCHEMA_WORK_KEYWORDS}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-11 — Case Study (`portfolio-case-study`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-case-study">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-12 — Visual Artwork (`VisualArtwork`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="VisualArtwork">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=VisualArtwork`; OG `og:type=website`; relationship: WebPage.mainEntity → VisualArtwork.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `VisualArtwork`: `VisualArtwork.@id` → `{{SCHEMA_ARTWORK_ID}}`, `VisualArtwork.name` → `{{SCHEMA_ARTWORK_NAME}}`, `VisualArtwork.description` → `{{SCHEMA_ARTWORK_DESCRIPTION}}`, `VisualArtwork.creator.@id` → `{{SCHEMA_ARTWORK_CREATOR_ID}}`, `VisualArtwork.artform` → `{{SCHEMA_ARTWORK_FORM}}`, `VisualArtwork.artMedium` → `{{SCHEMA_ARTWORK_MEDIUM}}`, `VisualArtwork.image[]` → `{{SCHEMA_ARTWORK_IMAGES}}`, `VisualArtwork.dateCreated` → `{{SCHEMA_ARTWORK_DATE}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-13 — Photography Work (`Photograph`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="Photograph">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Photograph`; OG `og:type=website`; relationship: WebPage.mainEntity → Photograph.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Photograph`: `Photograph.@id` → `{{SCHEMA_PHOTOGRAPH_ID}}`, `Photograph.name` → `{{SCHEMA_PHOTOGRAPH_TITLE}}`, `Photograph.description` → `{{SCHEMA_PHOTOGRAPH_DESCRIPTION}}`, `Photograph.creator.@id` → `{{SCHEMA_PHOTOGRAPH_CREATOR_ID}}`, `Photograph.image` → `{{SCHEMA_PHOTOGRAPH_IMAGE}}`, `Photograph.dateCreated` → `{{SCHEMA_PHOTOGRAPH_DATE}}`, `Photograph.license` → `{{SCHEMA_PHOTOGRAPH_LICENSE}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-14 — Image Gallery (`ImageGallery`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="ImageGallery">
```

- **Mappings:** page `@type=ImageGallery`; main entity `@type=none`; OG `og:type=website`; relationship: ImageGallery.hasPart → ImageObject[] (only visible media, no forced singular mainEntity).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ImageGallery`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ImageGallery.@type` → `ImageGallery`, `ImageGallery.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - optional_gallery_items `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-15 — Video Showreel (`portfolio-showreel`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-showreel">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=VideoObject`; OG `og:type=video.other`; relationship: WebPage.mainEntity → VideoObject.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `video:actor` → `{{OG_VIDEO_ACTOR}}`, `video:director` → `{{OG_VIDEO_DIRECTOR}}`, `video:duration` → `{{OG_VIDEO_DURATION_SECONDS}}`, `video:release_date` → `{{OG_VIDEO_RELEASE_DATE}}`, `video:tag` → `{{OG_VIDEO_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `VideoObject`: `VideoObject.@id` → `{{SCHEMA_VIDEO_ID}}`, `VideoObject.name` → `{{SCHEMA_VIDEO_NAME}}`, `VideoObject.description` → `{{SCHEMA_VIDEO_DESCRIPTION}}`, `VideoObject.thumbnailUrl[]` → `{{SCHEMA_VIDEO_THUMBNAIL_URL}}`, `VideoObject.uploadDate` → `{{SCHEMA_VIDEO_UPLOAD_DATE}}`, `VideoObject.duration` → `{{SCHEMA_VIDEO_DURATION}}`, `VideoObject.contentUrl` → `{{SCHEMA_VIDEO_CONTENT_URL}}`, `VideoObject.embedUrl` → `{{SCHEMA_VIDEO_EMBED_URL}}`, `VideoObject.hasPart[].@id` → `{{SCHEMA_VIDEO_CLIP_ID}}`, `VideoObject.inLanguage` → `{{SCHEMA_VIDEO_LANGUAGE}}`.
- **Associated nodes (only if real):** `ImageObject_if_actual_thumbnail`, `Clip_if_actual_chapters`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-16 — Software Project (`SoftwareSourceCode`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="SoftwareSourceCode">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=SoftwareSourceCode`; OG `og:type=website`; relationship: WebPage.mainEntity → SoftwareSourceCode.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `SoftwareSourceCode`: `SoftwareSourceCode.@id` → `{{SCHEMA_CODE_ID}}`, `SoftwareSourceCode.name` → `{{SCHEMA_CODE_NAME}}`, `SoftwareSourceCode.description` → `{{SCHEMA_CODE_DESCRIPTION}}`, `SoftwareSourceCode.codeRepository` → `{{SCHEMA_CODE_REPOSITORY}}`, `SoftwareSourceCode.programmingLanguage[]` → `{{SCHEMA_CODE_LANGUAGE}}`, `SoftwareSourceCode.runtimePlatform` → `{{SCHEMA_CODE_RUNTIME}}`, `SoftwareSourceCode.license` → `{{SCHEMA_CODE_LICENSE}}`, `SoftwareSourceCode.targetProduct.@id` → `{{SCHEMA_APP_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-17 — Writing Sample (`Article`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="Article">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-18 — Creative Work Collection (`CollectionPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="CollectionPage">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-19 — Blog Post (`BlogPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="BlogPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=BlogPosting`; OG `og:type=article`; relationship: WebPage.mainEntity → BlogPosting.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `BlogPosting`: `BlogPosting.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `BlogPosting.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `BlogPosting.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `BlogPosting.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `BlogPosting.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `BlogPosting.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `BlogPosting.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `BlogPosting.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `BlogPosting.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-20 — Client Testimonial / Review (`portfolio-review`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-review">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Review`; OG `og:type=website`; relationship: WebPage.mainEntity → Review.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Review`: `Review.@id` → `{{SCHEMA_REVIEW_ID}}`, `Review.name` → `{{SCHEMA_REVIEW_TITLE}}`, `Review.reviewBody` → `{{SCHEMA_REVIEW_BODY}}`, `Review.author.@id` → `{{SCHEMA_REVIEW_AUTHOR_ID}}`, `Review.datePublished` → `{{SCHEMA_REVIEW_DATE}}`, `Review.itemReviewed.@id` → `{{SCHEMA_REVIEW_SUBJECT_ID}}`, `Review.reviewRating.ratingValue` → `{{SCHEMA_REVIEW_RATING}}`, `Review.reviewRating.bestRating` → `{{SCHEMA_REVIEW_BEST_RATING}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `reviewed_item_entity_must_match_topic`.
- **Special guardrail:** Review.itemReviewed requires a real, correctly typed target; do not assume it is the publishing website.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-21 — Event / Speaking Engagement (`Event`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="Event">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Event`; OG `og:type=website`; relationship: WebPage.mainEntity → Event.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Event`: `Event.@id` → `{{SCHEMA_EVENT_ID}}`, `Event.name` → `{{SCHEMA_EVENT_NAME}}`, `Event.description` → `{{SCHEMA_EVENT_DESCRIPTION}}`, `Event.startDate` → `{{SCHEMA_EVENT_START}}`, `Event.endDate` → `{{SCHEMA_EVENT_END}}`, `Event.eventStatus` → `{{SCHEMA_EVENT_STATUS}}`, `Event.eventAttendanceMode` → `{{SCHEMA_EVENT_ATTENDANCE_MODE}}`, `Event.location.@id` → `{{SCHEMA_EVENT_LOCATION_ID}}`, `Event.organizer.@id` → `{{SCHEMA_EVENT_ORGANIZER_ID}}`, `Event.offers[].@id` → `{{SCHEMA_EVENT_OFFER_ID}}`, `Event.performer[].@id` → `{{SCHEMA_EVENT_PERFORMER_ID}}`, `Event.image[]` → `{{SCHEMA_EVENT_IMAGE}}`.
- **Associated nodes (only if real):** `Place_or_VirtualLocation_if_real`, `Organization_if_real`, `Offer_if_tickets_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 03-22 — Press / Media Feature (`portfolio-press`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="portfolio"
      data-cms-seo-type="portfolio-press">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

### 04 — Documentation & Knowledge Base (`documentation`) — 22 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 04-01 | Documentation Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 04-02 | Documentation Index | `docs-index` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 04-03 | Documentation Category | `docs-category` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 04-04 | Version Index | `docs-version` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 04-05 | Knowledge Base Landing | `knowledge-base` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 04-06 | Glossary Index | `DefinedTermSet` | `WebPage` | `DefinedTermSet` | `website` | `WebPage` + `DefinedTermSet` |
| 04-07 | Glossary Term | `DefinedTerm` | `WebPage` | `DefinedTerm` | `website` | `WebPage` + `DefinedTerm` |
| 04-08 | API Reference | `APIReference` | `WebPage` | `APIReference` | `article` | `WebPage` + `APIReference` |
| 04-09 | Technical Article | `TechArticle` | `WebPage` | `TechArticle` | `article` | `WebPage` + `TechArticle` |
| 04-10 | Developer Guide | `docs-developer-guide` | `WebPage` | `TechArticle` | `article` | `WebPage` + `TechArticle` |
| 04-11 | Tutorial / How-to | `HowTo` | `WebPage` | `HowTo` | `article` | `WebPage` + `HowTo` |
| 04-12 | Troubleshooting Guide | `docs-troubleshooting` | `WebPage` | `TechArticle` | `article` | `WebPage` + `TechArticle` |
| 04-13 | Configuration Reference | `docs-configuration` | `WebPage` | `TechArticle` | `article` | `WebPage` + `TechArticle` |
| 04-14 | Code Example | `SoftwareSourceCode` | `WebPage` | `SoftwareSourceCode` | `website` | `WebPage` + `SoftwareSourceCode` |
| 04-15 | Release Notes | `docs-release-notes` | `WebPage` | `TechArticle` | `article` | `WebPage` + `TechArticle` |
| 04-16 | Changelog | `docs-changelog` | `WebPage` | `WebPage` | `website` | `WebPage` |
| 04-17 | Software Documentation Page | `docs-software-page` | `WebPage` | `SoftwareApplication` | `website` | `WebPage` + `SoftwareApplication` |
| 04-18 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` | `WebPage` + `FAQPage` + `Question` |
| 04-19 | Community Q&A | `QAPage` | `QAPage` | `Question` | `website` | `WebPage` + `QAPage` + `Question` |
| 04-20 | Video Tutorial | `docs-video` | `WebPage` | `VideoObject` | `video.other` | `WebPage` + `VideoObject` |
| 04-21 | Support Article | `docs-support-article` | `WebPage` | `TechArticle` | `article` | `WebPage` + `TechArticle` |
| 04-22 | Contact / Support | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |

#### 04-01 — Documentation Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-02 — Documentation Index (`docs-index`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-index">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-03 — Documentation Category (`docs-category`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-category">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-04 — Version Index (`docs-version`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-version">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-05 — Knowledge Base Landing (`knowledge-base`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="knowledge-base">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-06 — Glossary Index (`DefinedTermSet`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="DefinedTermSet">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=DefinedTermSet`; OG `og:type=website`; relationship: WebPage.mainEntity → DefinedTermSet.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `DefinedTermSet`: `DefinedTermSet.@id` → `{{SCHEMA_GLOSSARY_ID}}`, `DefinedTermSet.name` → `{{SCHEMA_GLOSSARY_NAME}}`, `DefinedTermSet.description` → `{{SCHEMA_GLOSSARY_DESCRIPTION}}`, `DefinedTermSet.hasDefinedTerm[].@id` → `{{SCHEMA_DEFINED_TERM_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-07 — Glossary Term (`DefinedTerm`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="DefinedTerm">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=DefinedTerm`; OG `og:type=website`; relationship: WebPage.mainEntity → DefinedTerm.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `DefinedTerm`: `DefinedTerm.@id` → `{{SCHEMA_DEFINED_TERM_ID}}`, `DefinedTerm.name` → `{{SCHEMA_DEFINED_TERM_NAME}}`, `DefinedTerm.description` → `{{SCHEMA_DEFINED_TERM_DEFINITION}}`, `DefinedTerm.termCode` → `{{SCHEMA_DEFINED_TERM_CODE}}`, `DefinedTerm.inDefinedTermSet.@id` → `{{SCHEMA_GLOSSARY_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-08 — API Reference (`APIReference`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="APIReference">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=APIReference`; OG `og:type=article`; relationship: WebPage.mainEntity → APIReference.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `APIReference`: `APIReference.headline` → `{{SCHEMA_API_HEADLINE}}`, `APIReference.description` → `{{SCHEMA_API_DESCRIPTION}}`, `APIReference.programmingModel` → `{{SCHEMA_API_PROGRAMMING_MODEL}}`, `APIReference.targetPlatform` → `{{SCHEMA_API_TARGET_PLATFORM}}`, `APIReference.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `APIReference.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-09 — Technical Article (`TechArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="TechArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=TechArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → TechArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `TechArticle`: `TechArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `TechArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `TechArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `TechArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `TechArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `TechArticle.dependencies` → `{{SCHEMA_TECH_DEPENDENCIES}}`, `TechArticle.proficiencyLevel` → `{{SCHEMA_TECH_LEVEL}}`, `TechArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `BreadcrumbList_if_breadcrumbs_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-10 — Developer Guide (`docs-developer-guide`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-developer-guide">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=TechArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → TechArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `TechArticle`: `TechArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `TechArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `TechArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `TechArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `TechArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `TechArticle.dependencies` → `{{SCHEMA_TECH_DEPENDENCIES}}`, `TechArticle.proficiencyLevel` → `{{SCHEMA_TECH_LEVEL}}`, `TechArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `BreadcrumbList_if_breadcrumbs_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-11 — Tutorial / How-to (`HowTo`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="HowTo">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=HowTo`; OG `og:type=article`; relationship: WebPage.mainEntity → HowTo.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `HowTo`: `HowTo.name` → `{{SCHEMA_HOWTO_NAME}}`, `HowTo.description` → `{{SCHEMA_HOWTO_DESCRIPTION}}`, `HowTo.step[].name` → `{{SCHEMA_HOWTO_STEP_NAME}}`, `HowTo.step[].text` → `{{SCHEMA_HOWTO_STEP_TEXT}}`, `HowTo.step[].url` → `{{SCHEMA_HOWTO_STEP_URL}}`, `HowTo.totalTime` → `{{SCHEMA_HOWTO_TOTAL_TIME}}`, `HowTo.tool[].name` → `{{SCHEMA_HOWTO_TOOL}}`, `HowTo.supply[].name` → `{{SCHEMA_HOWTO_SUPPLY}}`.
- **Special guardrail:** Schema.org vocabulary remains valid even though Google feature support is limited/retired. Do not claim rich-result guarantee.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-12 — Troubleshooting Guide (`docs-troubleshooting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-troubleshooting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=TechArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → TechArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `TechArticle`: `TechArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `TechArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `TechArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `TechArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `TechArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `TechArticle.dependencies` → `{{SCHEMA_TECH_DEPENDENCIES}}`, `TechArticle.proficiencyLevel` → `{{SCHEMA_TECH_LEVEL}}`, `TechArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `BreadcrumbList_if_breadcrumbs_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-13 — Configuration Reference (`docs-configuration`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-configuration">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=TechArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → TechArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `TechArticle`: `TechArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `TechArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `TechArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `TechArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `TechArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `TechArticle.dependencies` → `{{SCHEMA_TECH_DEPENDENCIES}}`, `TechArticle.proficiencyLevel` → `{{SCHEMA_TECH_LEVEL}}`, `TechArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `BreadcrumbList_if_breadcrumbs_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-14 — Code Example (`SoftwareSourceCode`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="SoftwareSourceCode">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=SoftwareSourceCode`; OG `og:type=website`; relationship: WebPage.mainEntity → SoftwareSourceCode.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `SoftwareSourceCode`: `SoftwareSourceCode.@id` → `{{SCHEMA_CODE_ID}}`, `SoftwareSourceCode.name` → `{{SCHEMA_CODE_NAME}}`, `SoftwareSourceCode.description` → `{{SCHEMA_CODE_DESCRIPTION}}`, `SoftwareSourceCode.codeRepository` → `{{SCHEMA_CODE_REPOSITORY}}`, `SoftwareSourceCode.programmingLanguage[]` → `{{SCHEMA_CODE_LANGUAGE}}`, `SoftwareSourceCode.runtimePlatform` → `{{SCHEMA_CODE_RUNTIME}}`, `SoftwareSourceCode.license` → `{{SCHEMA_CODE_LICENSE}}`, `SoftwareSourceCode.targetProduct.@id` → `{{SCHEMA_APP_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-15 — Release Notes (`docs-release-notes`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-release-notes">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=TechArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → TechArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `TechArticle`: `TechArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `TechArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `TechArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `TechArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `TechArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `TechArticle.dependencies` → `{{SCHEMA_TECH_DEPENDENCIES}}`, `TechArticle.proficiencyLevel` → `{{SCHEMA_TECH_LEVEL}}`, `TechArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `BreadcrumbList_if_breadcrumbs_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-16 — Changelog (`docs-changelog`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-changelog">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebPage`; OG `og:type=website`; relationship: WebPage.mainEntity → WebPage.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Special guardrail:** Existing registry has WebPage as its own mainEntity; avoid self-link and treat as no independent entity node unless changed by owner.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-17 — Software Documentation Page (`docs-software-page`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-software-page">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=SoftwareApplication`; OG `og:type=website`; relationship: WebPage.mainEntity → SoftwareApplication.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `SoftwareApplication`: `SoftwareApplication.@id` → `{{SCHEMA_APP_ID}}`, `SoftwareApplication.name` → `{{SCHEMA_APP_NAME}}`, `SoftwareApplication.description` → `{{SCHEMA_APP_DESCRIPTION}}`, `SoftwareApplication.applicationCategory` → `{{SCHEMA_APP_CATEGORY}}`, `SoftwareApplication.operatingSystem` → `{{SCHEMA_APP_OS}}`, `SoftwareApplication.softwareVersion` → `{{SCHEMA_APP_VERSION}}`, `SoftwareApplication.screenshot[]` → `{{SCHEMA_APP_SCREENSHOT}}`, `SoftwareApplication.downloadUrl` → `{{SCHEMA_APP_DOWNLOAD_URL}}`, `SoftwareApplication.offers[].@id` → `{{SCHEMA_APP_OFFER_ID}}`, `SoftwareApplication.aggregateRating.ratingValue` → `{{SCHEMA_APP_RATING}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-18 — FAQ Page (`FAQPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="FAQPage">
```

- **Mappings:** page `@type=FAQPage`; main entity `@type=Question`; OG `og:type=website`; relationship: FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `FAQPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `FAQPage.@type` → `FAQPage`, `FAQPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`, `FAQPage.mainEntity[].@id` → `{{SCHEMA_FAQ_QUESTION_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** FAQPage has multiple actual Question/Answer entries; a single Question is only a repeatable pattern. Google FAQ rich results are restricted.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-19 — Community Q&A (`QAPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="QAPage">
```

- **Mappings:** page `@type=QAPage`; main entity `@type=Question`; OG `og:type=website`; relationship: QAPage.mainEntity → Question; Question.acceptedAnswer/suggestedAnswer → real Answer objects.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `QAPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `QAPage.@type` → `QAPage`, `QAPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** QAPage is a single question with its genuine answers, not an editorial FAQ list.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-20 — Video Tutorial (`docs-video`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-video">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=VideoObject`; OG `og:type=video.other`; relationship: WebPage.mainEntity → VideoObject.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `video:actor` → `{{OG_VIDEO_ACTOR}}`, `video:director` → `{{OG_VIDEO_DIRECTOR}}`, `video:duration` → `{{OG_VIDEO_DURATION_SECONDS}}`, `video:release_date` → `{{OG_VIDEO_RELEASE_DATE}}`, `video:tag` → `{{OG_VIDEO_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `VideoObject`: `VideoObject.@id` → `{{SCHEMA_VIDEO_ID}}`, `VideoObject.name` → `{{SCHEMA_VIDEO_NAME}}`, `VideoObject.description` → `{{SCHEMA_VIDEO_DESCRIPTION}}`, `VideoObject.thumbnailUrl[]` → `{{SCHEMA_VIDEO_THUMBNAIL_URL}}`, `VideoObject.uploadDate` → `{{SCHEMA_VIDEO_UPLOAD_DATE}}`, `VideoObject.duration` → `{{SCHEMA_VIDEO_DURATION}}`, `VideoObject.contentUrl` → `{{SCHEMA_VIDEO_CONTENT_URL}}`, `VideoObject.embedUrl` → `{{SCHEMA_VIDEO_EMBED_URL}}`, `VideoObject.hasPart[].@id` → `{{SCHEMA_VIDEO_CLIP_ID}}`, `VideoObject.inLanguage` → `{{SCHEMA_VIDEO_LANGUAGE}}`.
- **Associated nodes (only if real):** `ImageObject_if_actual_thumbnail`, `Clip_if_actual_chapters`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-21 — Support Article (`docs-support-article`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="docs-support-article">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=TechArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → TechArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `TechArticle`: `TechArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `TechArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `TechArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `TechArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `TechArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `TechArticle.dependencies` → `{{SCHEMA_TECH_DEPENDENCIES}}`, `TechArticle.proficiencyLevel` → `{{SCHEMA_TECH_LEVEL}}`, `TechArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `BreadcrumbList_if_breadcrumbs_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 04-22 — Contact / Support (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="documentation"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

### 05 — E-commerce / Online Store (`ecommerce`) — 24 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 05-01 | Store Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 05-02 | Shop Main Page | `storefront` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 05-03 | Product Category | `product-category` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 05-04 | Product Collection | `product-collection` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 05-05 | Brand Landing Page | `brand-page` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 05-06 | New Arrivals Listing | `new-arrivals` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 05-07 | Sale / Promotions Page | `store-promotions` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 05-08 | Product Detail | `Product` | `ItemPage` | `Product` | `website` | `WebPage` + `ItemPage` + `Product` |
| 05-09 | Product Group / Variants | `ProductGroup` | `ItemPage` | `ProductGroup` | `website` | `WebPage` + `ItemPage` + `ProductGroup` |
| 05-10 | Specific Product Variant | `product-variant` | `ItemPage` | `Product` | `website` | `WebPage` + `ItemPage` + `Product` |
| 05-11 | Digital Product | `digital-product` | `ItemPage` | `Product` | `website` | `WebPage` + `ItemPage` + `Product` |
| 05-12 | Software Product | `SoftwareApplication` | `ItemPage` | `SoftwareApplication` | `website` | `WebPage` + `ItemPage` + `SoftwareApplication` |
| 05-13 | Service Offering | `Service` | `ItemPage` | `Service` | `website` | `WebPage` + `ItemPage` + `Service` |
| 05-14 | Individual Offer Page | `Offer` | `ItemPage` | `Offer` | `website` | `WebPage` + `ItemPage` + `Offer` |
| 05-15 | Product Comparison | `product-comparison` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 05-16 | Buying Guide | `store-buying-guide` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 05-17 | Product Review Article | `store-product-review` | `WebPage` | `Review` | `article` | `WebPage` + `Review` |
| 05-18 | Product FAQ | `FAQPage` | `FAQPage` | `Question` | `website` | `WebPage` + `FAQPage` + `Question` |
| 05-19 | About Store | `AboutPage` | `AboutPage` | `none` | `website` | `WebPage` + `AboutPage` |
| 05-20 | Contact Store | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |
| 05-21 | Store Location | `Store` | `WebPage` | `Store` | `website` | `WebPage` + `Store` |
| 05-22 | Store Locator | `store-locator` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 05-23 | Shipping Policy | `shipping-policy` | `WebPage` | `none` | `website` | `WebPage` |
| 05-24 | Returns Policy | `returns-policy` | `WebPage` | `none` | `website` | `WebPage` |

#### 05-01 — Store Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-02 — Shop Main Page (`storefront`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="storefront">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-03 — Product Category (`product-category`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="product-category">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-04 — Product Collection (`product-collection`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="product-collection">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-05 — Brand Landing Page (`brand-page`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="brand-page">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-06 — New Arrivals Listing (`new-arrivals`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="new-arrivals">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-07 — Sale / Promotions Page (`store-promotions`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="store-promotions">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-08 — Product Detail (`Product`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="Product">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Product`; OG `og:type=website`; relationship: ItemPage.mainEntity → Product.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Product`: `Product.@id` → `{{SCHEMA_PRODUCT_ID}}`, `Product.name` → `{{SCHEMA_PRODUCT_NAME}}`, `Product.description` → `{{SCHEMA_PRODUCT_DESCRIPTION}}`, `Product.image[]` → `{{SCHEMA_PRODUCT_IMAGE}}`, `Product.sku` → `{{SCHEMA_PRODUCT_SKU}}`, `Product.gtin` → `{{SCHEMA_PRODUCT_GTIN}}`, `Product.brand.name` → `{{SCHEMA_PRODUCT_BRAND}}`, `Product.offers[].@id` → `{{SCHEMA_OFFER_ID}}`, `Product.aggregateRating.ratingValue` → `{{SCHEMA_PRODUCT_RATING}}`, `Product.review[].@id` → `{{SCHEMA_REVIEW_ID}}`.
- **Associated nodes (only if real):** `Offer_if_real`, `Review_if_real`, `AggregateRating_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-09 — Product Group / Variants (`ProductGroup`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="ProductGroup">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=ProductGroup`; OG `og:type=website`; relationship: ItemPage.mainEntity → ProductGroup.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ProductGroup`: `ProductGroup.@id` → `{{SCHEMA_PRODUCT_GROUP_ID}}`, `ProductGroup.name` → `{{SCHEMA_PRODUCT_GROUP_NAME}}`, `ProductGroup.description` → `{{SCHEMA_PRODUCT_GROUP_DESCRIPTION}}`, `ProductGroup.productGroupID` → `{{SCHEMA_PRODUCT_GROUP_KEY}}`, `ProductGroup.variesBy[]` → `{{SCHEMA_VARIANT_DIMENSION}}`, `ProductGroup.hasVariant[].@id` → `{{SCHEMA_PRODUCT_VARIANT_ID}}`, `ProductGroup.brand.name` → `{{SCHEMA_PRODUCT_BRAND}}`.
- **Special guardrail:** ProductGroup needs genuine variants; do not manufacture variants or prices.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-10 — Specific Product Variant (`product-variant`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="product-variant">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Product`; OG `og:type=website`; relationship: ItemPage.mainEntity → Product.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Product`: `Product.@id` → `{{SCHEMA_PRODUCT_ID}}`, `Product.name` → `{{SCHEMA_PRODUCT_NAME}}`, `Product.description` → `{{SCHEMA_PRODUCT_DESCRIPTION}}`, `Product.image[]` → `{{SCHEMA_PRODUCT_IMAGE}}`, `Product.sku` → `{{SCHEMA_PRODUCT_SKU}}`, `Product.gtin` → `{{SCHEMA_PRODUCT_GTIN}}`, `Product.brand.name` → `{{SCHEMA_PRODUCT_BRAND}}`, `Product.offers[].@id` → `{{SCHEMA_OFFER_ID}}`, `Product.aggregateRating.ratingValue` → `{{SCHEMA_PRODUCT_RATING}}`, `Product.review[].@id` → `{{SCHEMA_REVIEW_ID}}`.
- **Associated nodes (only if real):** `Offer_if_real`, `Review_if_real`, `AggregateRating_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-11 — Digital Product (`digital-product`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="digital-product">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Product`; OG `og:type=website`; relationship: ItemPage.mainEntity → Product.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Product`: `Product.@id` → `{{SCHEMA_PRODUCT_ID}}`, `Product.name` → `{{SCHEMA_PRODUCT_NAME}}`, `Product.description` → `{{SCHEMA_PRODUCT_DESCRIPTION}}`, `Product.image[]` → `{{SCHEMA_PRODUCT_IMAGE}}`, `Product.sku` → `{{SCHEMA_PRODUCT_SKU}}`, `Product.gtin` → `{{SCHEMA_PRODUCT_GTIN}}`, `Product.brand.name` → `{{SCHEMA_PRODUCT_BRAND}}`, `Product.offers[].@id` → `{{SCHEMA_OFFER_ID}}`, `Product.aggregateRating.ratingValue` → `{{SCHEMA_PRODUCT_RATING}}`, `Product.review[].@id` → `{{SCHEMA_REVIEW_ID}}`.
- **Associated nodes (only if real):** `Offer_if_real`, `Review_if_real`, `AggregateRating_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-12 — Software Product (`SoftwareApplication`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="SoftwareApplication">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=SoftwareApplication`; OG `og:type=website`; relationship: ItemPage.mainEntity → SoftwareApplication.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `SoftwareApplication`: `SoftwareApplication.@id` → `{{SCHEMA_APP_ID}}`, `SoftwareApplication.name` → `{{SCHEMA_APP_NAME}}`, `SoftwareApplication.description` → `{{SCHEMA_APP_DESCRIPTION}}`, `SoftwareApplication.applicationCategory` → `{{SCHEMA_APP_CATEGORY}}`, `SoftwareApplication.operatingSystem` → `{{SCHEMA_APP_OS}}`, `SoftwareApplication.softwareVersion` → `{{SCHEMA_APP_VERSION}}`, `SoftwareApplication.screenshot[]` → `{{SCHEMA_APP_SCREENSHOT}}`, `SoftwareApplication.downloadUrl` → `{{SCHEMA_APP_DOWNLOAD_URL}}`, `SoftwareApplication.offers[].@id` → `{{SCHEMA_APP_OFFER_ID}}`, `SoftwareApplication.aggregateRating.ratingValue` → `{{SCHEMA_APP_RATING}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-13 — Service Offering (`Service`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="Service">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Service`; OG `og:type=website`; relationship: ItemPage.mainEntity → Service.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Service`: `Service.@id` → `{{SCHEMA_SERVICE_ID}}`, `Service.name` → `{{SCHEMA_SERVICE_NAME}}`, `Service.description` → `{{SCHEMA_SERVICE_DESCRIPTION}}`, `Service.serviceType` → `{{SCHEMA_SERVICE_TYPE}}`, `Service.provider.@id` → `{{SCHEMA_SERVICE_PROVIDER_ID}}`, `Service.areaServed[]` → `{{SCHEMA_SERVICE_AREA_SERVED}}`, `Service.offers[].@id` → `{{SCHEMA_SERVICE_OFFER_ID}}`, `Service.availableChannel` → `{{SCHEMA_SERVICE_CHANNEL}}`.
- **Associated nodes (only if real):** `Organization_or_Person_for_provider_if_real`, `Offer_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-14 — Individual Offer Page (`Offer`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="Offer">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Offer`; OG `og:type=website`; relationship: ItemPage.mainEntity → Offer.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Offer`: `Offer.@id` → `{{SCHEMA_OFFER_ID}}`, `Offer.url` → `{{SCHEMA_OFFER_URL}}`, `Offer.price` → `{{SCHEMA_OFFER_PRICE}}`, `Offer.priceCurrency` → `{{SCHEMA_OFFER_CURRENCY}}`, `Offer.availability` → `{{SCHEMA_OFFER_AVAILABILITY}}`, `Offer.priceValidUntil` → `{{SCHEMA_OFFER_PRICE_VALID_UNTIL}}`, `Offer.seller.@id` → `{{SCHEMA_SELLER_ID}}`, `Offer.itemOffered.@id` → `{{SCHEMA_OFFER_ITEM_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-15 — Product Comparison (`product-comparison`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="product-comparison">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-16 — Buying Guide (`store-buying-guide`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="store-buying-guide">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-17 — Product Review Article (`store-product-review`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="store-product-review">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Review`; OG `og:type=article`; relationship: WebPage.mainEntity → Review.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Review`: `Review.@id` → `{{SCHEMA_REVIEW_ID}}`, `Review.name` → `{{SCHEMA_REVIEW_TITLE}}`, `Review.reviewBody` → `{{SCHEMA_REVIEW_BODY}}`, `Review.author.@id` → `{{SCHEMA_REVIEW_AUTHOR_ID}}`, `Review.datePublished` → `{{SCHEMA_REVIEW_DATE}}`, `Review.itemReviewed.@id` → `{{SCHEMA_REVIEW_SUBJECT_ID}}`, `Review.reviewRating.ratingValue` → `{{SCHEMA_REVIEW_RATING}}`, `Review.reviewRating.bestRating` → `{{SCHEMA_REVIEW_BEST_RATING}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `reviewed_item_entity_must_match_topic`.
- **Special guardrail:** Review.itemReviewed requires a real, correctly typed target; do not assume it is the publishing website.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-18 — Product FAQ (`FAQPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="FAQPage">
```

- **Mappings:** page `@type=FAQPage`; main entity `@type=Question`; OG `og:type=website`; relationship: FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `FAQPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `FAQPage.@type` → `FAQPage`, `FAQPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`, `FAQPage.mainEntity[].@id` → `{{SCHEMA_FAQ_QUESTION_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** FAQPage has multiple actual Question/Answer entries; a single Question is only a repeatable pattern. Google FAQ rich results are restricted.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-19 — About Store (`AboutPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="AboutPage">
```

- **Mappings:** page `@type=AboutPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `AboutPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `AboutPage.@type` → `AboutPage`, `AboutPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-20 — Contact Store (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-21 — Store Location (`Store`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="Store">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Store`; OG `og:type=website`; relationship: WebPage.mainEntity → Store.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Store`: `Store.@id` → `{{SCHEMA_STORE_ID}}`, `Store.name` → `{{SCHEMA_STORE_NAME}}`, `Store.description` → `{{SCHEMA_STORE_DESCRIPTION}}`, `Store.url` → `{{SCHEMA_STORE_URL}}`, `Store.telephone` → `{{SCHEMA_STORE_PHONE}}`, `Store.address.streetAddress` → `{{SCHEMA_ADDRESS_STREET}}`, `Store.address.addressLocality` → `{{SCHEMA_ADDRESS_CITY}}`, `Store.address.addressRegion` → `{{SCHEMA_ADDRESS_REGION}}`, `Store.address.postalCode` → `{{SCHEMA_ADDRESS_POSTAL}}`, `Store.address.addressCountry` → `{{SCHEMA_ADDRESS_COUNTRY}}`, `Store.geo.latitude` → `{{SCHEMA_GEO_LAT}}`, `Store.geo.longitude` → `{{SCHEMA_GEO_LON}}`, `Store.openingHoursSpecification[].opens` → `{{SCHEMA_OPENS}}`, `Store.openingHoursSpecification[].closes` → `{{SCHEMA_CLOSES}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-22 — Store Locator (`store-locator`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="store-locator">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-23 — Shipping Policy (`shipping-policy`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="shipping-policy">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Special guardrail:** Shipping Policy is a WebPage; do not fabricate MerchantReturnPolicy or OfferShippingDetails from text that is not on page.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 05-24 — Returns Policy (`returns-policy`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="ecommerce"
      data-cms-seo-type="returns-policy">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Special guardrail:** Returns Policy is a WebPage; possible MerchantReturnPolicy association requires actual published policy and separate approval.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

### 06 — Business / Corporate (`business`) — 24 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 06-01 | Corporate Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 06-02 | About Company | `AboutPage` | `AboutPage` | `none` | `website` | `WebPage` + `AboutPage` |
| 06-03 | Contact Company | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |
| 06-04 | Company Locations | `business-locations` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 06-05 | Individual Office Location | `business-location` | `WebPage` | `Place` | `website` | `WebPage` + `Place` |
| 06-06 | Leadership / Team Directory | `leadership-directory` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 06-07 | Executive Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` | `WebPage` + `ProfilePage` + `Person` |
| 06-08 | Company Divisions | `business-divisions` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 06-09 | Services Overview | `business-services` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 06-10 | Service Detail | `Service` | `WebPage` | `Service` | `website` | `WebPage` + `Service` |
| 06-11 | Product Detail | `Product` | `ItemPage` | `Product` | `website` | `WebPage` + `ItemPage` + `Product` |
| 06-12 | Solution Detail | `business-solution` | `WebPage` | `Service` | `website` | `WebPage` + `Service` |
| 06-13 | Industry Solution Page | `business-industry` | `WebPage` | `Service` | `website` | `WebPage` + `Service` |
| 06-14 | Customer Case Study | `business-case-study` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 06-15 | Partners Directory | `business-partners` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 06-16 | FAQ | `FAQPage` | `FAQPage` | `Question` | `website` | `WebPage` + `FAQPage` + `Question` |
| 06-17 | Newsroom | `business-newsroom` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 06-18 | Press Release | `business-press-release` | `WebPage` | `NewsArticle` | `article` | `WebPage` + `NewsArticle` |
| 06-19 | Corporate Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` | `WebPage` + `BlogPosting` |
| 06-20 | Job Openings | `business-careers` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 06-21 | Job Posting | `JobPosting` | `WebPage` | `JobPosting` | `website` | `WebPage` + `JobPosting` |
| 06-22 | Corporate Event | `Event` | `WebPage` | `Event` | `website` | `WebPage` + `Event` |
| 06-23 | Annual Report | `Report` | `WebPage` | `Report` | `website` | `WebPage` + `Report` |
| 06-24 | Investor Relations | `investor-relations` | `WebPage` | `none` | `website` | `WebPage` |

#### 06-01 — Corporate Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-02 — About Company (`AboutPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="AboutPage">
```

- **Mappings:** page `@type=AboutPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `AboutPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `AboutPage.@type` → `AboutPage`, `AboutPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-03 — Contact Company (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-04 — Company Locations (`business-locations`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-locations">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-05 — Individual Office Location (`business-location`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-location">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Place`; OG `og:type=website`; relationship: WebPage.mainEntity → Place.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Place`: `Place.@id` → `{{SCHEMA_PLACE_ID}}`, `Place.name` → `{{SCHEMA_PLACE_NAME}}`, `Place.description` → `{{SCHEMA_PLACE_DESCRIPTION}}`, `Place.address.streetAddress` → `{{SCHEMA_ADDRESS_STREET}}`, `Place.address.addressLocality` → `{{SCHEMA_ADDRESS_CITY}}`, `Place.address.addressCountry` → `{{SCHEMA_ADDRESS_COUNTRY}}`, `Place.geo.latitude` → `{{SCHEMA_GEO_LAT}}`, `Place.geo.longitude` → `{{SCHEMA_GEO_LON}}`, `Place.telephone` → `{{SCHEMA_PLACE_PHONE}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-06 — Leadership / Team Directory (`leadership-directory`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="leadership-directory">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-07 — Executive Profile (`ProfilePage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="ProfilePage">
```

- **Mappings:** page `@type=ProfilePage`; main entity `@type=Person`; OG `og:type=profile`; relationship: ProfilePage.mainEntity → Person.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ProfilePage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ProfilePage.@type` → `ProfilePage`, `ProfilePage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Person`: `Person.@id` → `{{SCHEMA_PERSON_ID}}`, `Person.name` → `{{SCHEMA_PERSON_NAME}}`, `Person.url` → `{{SCHEMA_PERSON_URL}}`, `Person.image` → `{{SCHEMA_PERSON_IMAGE}}`, `Person.description` → `{{SCHEMA_PERSON_BIO}}`, `Person.sameAs[]` → `{{SCHEMA_PERSON_SAMEAS}}`, `Person.jobTitle` → `{{SCHEMA_PERSON_JOB_TITLE}}`, `Person.worksFor.@id` → `{{SCHEMA_PERSON_ORG_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-08 — Company Divisions (`business-divisions`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-divisions">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-09 — Services Overview (`business-services`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-services">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-10 — Service Detail (`Service`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="Service">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Service`; OG `og:type=website`; relationship: WebPage.mainEntity → Service.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Service`: `Service.@id` → `{{SCHEMA_SERVICE_ID}}`, `Service.name` → `{{SCHEMA_SERVICE_NAME}}`, `Service.description` → `{{SCHEMA_SERVICE_DESCRIPTION}}`, `Service.serviceType` → `{{SCHEMA_SERVICE_TYPE}}`, `Service.provider.@id` → `{{SCHEMA_SERVICE_PROVIDER_ID}}`, `Service.areaServed[]` → `{{SCHEMA_SERVICE_AREA_SERVED}}`, `Service.offers[].@id` → `{{SCHEMA_SERVICE_OFFER_ID}}`, `Service.availableChannel` → `{{SCHEMA_SERVICE_CHANNEL}}`.
- **Associated nodes (only if real):** `Organization_or_Person_for_provider_if_real`, `Offer_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-11 — Product Detail (`Product`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="Product">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Product`; OG `og:type=website`; relationship: ItemPage.mainEntity → Product.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Product`: `Product.@id` → `{{SCHEMA_PRODUCT_ID}}`, `Product.name` → `{{SCHEMA_PRODUCT_NAME}}`, `Product.description` → `{{SCHEMA_PRODUCT_DESCRIPTION}}`, `Product.image[]` → `{{SCHEMA_PRODUCT_IMAGE}}`, `Product.sku` → `{{SCHEMA_PRODUCT_SKU}}`, `Product.gtin` → `{{SCHEMA_PRODUCT_GTIN}}`, `Product.brand.name` → `{{SCHEMA_PRODUCT_BRAND}}`, `Product.offers[].@id` → `{{SCHEMA_OFFER_ID}}`, `Product.aggregateRating.ratingValue` → `{{SCHEMA_PRODUCT_RATING}}`, `Product.review[].@id` → `{{SCHEMA_REVIEW_ID}}`.
- **Associated nodes (only if real):** `Offer_if_real`, `Review_if_real`, `AggregateRating_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-12 — Solution Detail (`business-solution`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-solution">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Service`; OG `og:type=website`; relationship: WebPage.mainEntity → Service.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Service`: `Service.@id` → `{{SCHEMA_SERVICE_ID}}`, `Service.name` → `{{SCHEMA_SERVICE_NAME}}`, `Service.description` → `{{SCHEMA_SERVICE_DESCRIPTION}}`, `Service.serviceType` → `{{SCHEMA_SERVICE_TYPE}}`, `Service.provider.@id` → `{{SCHEMA_SERVICE_PROVIDER_ID}}`, `Service.areaServed[]` → `{{SCHEMA_SERVICE_AREA_SERVED}}`, `Service.offers[].@id` → `{{SCHEMA_SERVICE_OFFER_ID}}`, `Service.availableChannel` → `{{SCHEMA_SERVICE_CHANNEL}}`.
- **Associated nodes (only if real):** `Organization_or_Person_for_provider_if_real`, `Offer_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-13 — Industry Solution Page (`business-industry`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-industry">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Service`; OG `og:type=website`; relationship: WebPage.mainEntity → Service.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Service`: `Service.@id` → `{{SCHEMA_SERVICE_ID}}`, `Service.name` → `{{SCHEMA_SERVICE_NAME}}`, `Service.description` → `{{SCHEMA_SERVICE_DESCRIPTION}}`, `Service.serviceType` → `{{SCHEMA_SERVICE_TYPE}}`, `Service.provider.@id` → `{{SCHEMA_SERVICE_PROVIDER_ID}}`, `Service.areaServed[]` → `{{SCHEMA_SERVICE_AREA_SERVED}}`, `Service.offers[].@id` → `{{SCHEMA_SERVICE_OFFER_ID}}`, `Service.availableChannel` → `{{SCHEMA_SERVICE_CHANNEL}}`.
- **Associated nodes (only if real):** `Organization_or_Person_for_provider_if_real`, `Offer_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-14 — Customer Case Study (`business-case-study`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-case-study">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-15 — Partners Directory (`business-partners`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-partners">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-16 — FAQ (`FAQPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="FAQPage">
```

- **Mappings:** page `@type=FAQPage`; main entity `@type=Question`; OG `og:type=website`; relationship: FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `FAQPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `FAQPage.@type` → `FAQPage`, `FAQPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`, `FAQPage.mainEntity[].@id` → `{{SCHEMA_FAQ_QUESTION_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** FAQPage has multiple actual Question/Answer entries; a single Question is only a repeatable pattern. Google FAQ rich results are restricted.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-17 — Newsroom (`business-newsroom`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-newsroom">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-18 — Press Release (`business-press-release`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-press-release">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=NewsArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → NewsArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `NewsArticle`: `NewsArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `NewsArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `NewsArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `NewsArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `NewsArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `NewsArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `NewsArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `NewsArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `NewsArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-19 — Corporate Blog Post (`BlogPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="BlogPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=BlogPosting`; OG `og:type=article`; relationship: WebPage.mainEntity → BlogPosting.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `BlogPosting`: `BlogPosting.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `BlogPosting.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `BlogPosting.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `BlogPosting.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `BlogPosting.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `BlogPosting.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `BlogPosting.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `BlogPosting.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `BlogPosting.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-20 — Job Openings (`business-careers`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="business-careers">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-21 — Job Posting (`JobPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="JobPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=JobPosting`; OG `og:type=website`; relationship: WebPage.mainEntity → JobPosting.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `JobPosting`: `JobPosting.@id` → `{{SCHEMA_JOB_ID}}`, `JobPosting.title` → `{{SCHEMA_JOB_TITLE}}`, `JobPosting.description` → `{{SCHEMA_JOB_DESCRIPTION}}`, `JobPosting.datePosted` → `{{SCHEMA_JOB_POSTED}}`, `JobPosting.validThrough` → `{{SCHEMA_JOB_VALID_THROUGH}}`, `JobPosting.employmentType` → `{{SCHEMA_JOB_EMPLOYMENT_TYPE}}`, `JobPosting.hiringOrganization.@id` → `{{SCHEMA_HIRING_ORG_ID}}`, `JobPosting.jobLocation.@id` → `{{SCHEMA_JOB_LOCATION_ID}}`, `JobPosting.jobLocationType` → `{{SCHEMA_JOB_LOCATION_TYPE}}`, `JobPosting.baseSalary.value.value` → `{{SCHEMA_JOB_SALARY}}`, `JobPosting.baseSalary.currency` → `{{SCHEMA_JOB_SALARY_CURRENCY}}`.
- **Associated nodes (only if real):** `Organization_for_employer_if_real`, `Place_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-22 — Corporate Event (`Event`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="Event">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Event`; OG `og:type=website`; relationship: WebPage.mainEntity → Event.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Event`: `Event.@id` → `{{SCHEMA_EVENT_ID}}`, `Event.name` → `{{SCHEMA_EVENT_NAME}}`, `Event.description` → `{{SCHEMA_EVENT_DESCRIPTION}}`, `Event.startDate` → `{{SCHEMA_EVENT_START}}`, `Event.endDate` → `{{SCHEMA_EVENT_END}}`, `Event.eventStatus` → `{{SCHEMA_EVENT_STATUS}}`, `Event.eventAttendanceMode` → `{{SCHEMA_EVENT_ATTENDANCE_MODE}}`, `Event.location.@id` → `{{SCHEMA_EVENT_LOCATION_ID}}`, `Event.organizer.@id` → `{{SCHEMA_EVENT_ORGANIZER_ID}}`, `Event.offers[].@id` → `{{SCHEMA_EVENT_OFFER_ID}}`, `Event.performer[].@id` → `{{SCHEMA_EVENT_PERFORMER_ID}}`, `Event.image[]` → `{{SCHEMA_EVENT_IMAGE}}`.
- **Associated nodes (only if real):** `Place_or_VirtualLocation_if_real`, `Organization_if_real`, `Offer_if_tickets_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-23 — Annual Report (`Report`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="Report">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Report`; OG `og:type=website`; relationship: WebPage.mainEntity → Report.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Report`: `Report.@id` → `{{SCHEMA_REPORT_ID}}`, `Report.name` → `{{SCHEMA_REPORT_NAME}}`, `Report.description` → `{{SCHEMA_REPORT_DESCRIPTION}}`, `Report.author[].@id` → `{{SCHEMA_REPORT_AUTHOR_ID}}`, `Report.datePublished` → `{{SCHEMA_REPORT_PUBLISHED}}`, `Report.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Report.encoding[].contentUrl` → `{{SCHEMA_REPORT_FILE_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 06-24 — Investor Relations (`investor-relations`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="business"
      data-cms-seo-type="investor-relations">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

### 07 — Professional Services / Agency (`services`) — 21 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 07-01 | Agency Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 07-02 | About Agency | `AboutPage` | `AboutPage` | `none` | `website` | `WebPage` + `AboutPage` |
| 07-03 | Contact / Inquiry | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |
| 07-04 | Services Index | `services-index` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 07-05 | Individual Service | `Service` | `WebPage` | `Service` | `website` | `WebPage` + `Service` |
| 07-06 | Specialty / Practice Area | `practice-area` | `WebPage` | `Service` | `website` | `WebPage` + `Service` |
| 07-07 | Industries Served | `industries-served` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 07-08 | Locations Served | `service-locations` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 07-09 | Pricing / Packages | `service-pricing` | `WebPage` | `Service` | `website` | `WebPage` + `Service` |
| 07-10 | Team Directory | `team-directory` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 07-11 | Practitioner Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` | `WebPage` + `ProfilePage` + `Person` |
| 07-12 | Portfolio / Work Index | `work-index` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 07-13 | Client Case Study | `agency-case-study` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 07-14 | Client Testimonial | `client-testimonial` | `WebPage` | `Review` | `website` | `WebPage` + `Review` |
| 07-15 | Award / Recognition | `agency-award` | `WebPage` | `none` | `website` | `WebPage` |
| 07-16 | Agency Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` | `WebPage` + `BlogPosting` |
| 07-17 | Professional Article | `Article` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 07-18 | How-to Guide | `HowTo` | `WebPage` | `HowTo` | `article` | `WebPage` + `HowTo` |
| 07-19 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` | `WebPage` + `FAQPage` + `Question` |
| 07-20 | Consultation Information | `consultation-info` | `WebPage` | `Service` | `website` | `WebPage` + `Service` |
| 07-21 | Workshop / Training Event | `EducationEvent` | `WebPage` | `EducationEvent` | `website` | `WebPage` + `EducationEvent` |

#### 07-01 — Agency Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-02 — About Agency (`AboutPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="AboutPage">
```

- **Mappings:** page `@type=AboutPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `AboutPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `AboutPage.@type` → `AboutPage`, `AboutPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-03 — Contact / Inquiry (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-04 — Services Index (`services-index`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="services-index">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-05 — Individual Service (`Service`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="Service">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Service`; OG `og:type=website`; relationship: WebPage.mainEntity → Service.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Service`: `Service.@id` → `{{SCHEMA_SERVICE_ID}}`, `Service.name` → `{{SCHEMA_SERVICE_NAME}}`, `Service.description` → `{{SCHEMA_SERVICE_DESCRIPTION}}`, `Service.serviceType` → `{{SCHEMA_SERVICE_TYPE}}`, `Service.provider.@id` → `{{SCHEMA_SERVICE_PROVIDER_ID}}`, `Service.areaServed[]` → `{{SCHEMA_SERVICE_AREA_SERVED}}`, `Service.offers[].@id` → `{{SCHEMA_SERVICE_OFFER_ID}}`, `Service.availableChannel` → `{{SCHEMA_SERVICE_CHANNEL}}`.
- **Associated nodes (only if real):** `Organization_or_Person_for_provider_if_real`, `Offer_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-06 — Specialty / Practice Area (`practice-area`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="practice-area">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Service`; OG `og:type=website`; relationship: WebPage.mainEntity → Service.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Service`: `Service.@id` → `{{SCHEMA_SERVICE_ID}}`, `Service.name` → `{{SCHEMA_SERVICE_NAME}}`, `Service.description` → `{{SCHEMA_SERVICE_DESCRIPTION}}`, `Service.serviceType` → `{{SCHEMA_SERVICE_TYPE}}`, `Service.provider.@id` → `{{SCHEMA_SERVICE_PROVIDER_ID}}`, `Service.areaServed[]` → `{{SCHEMA_SERVICE_AREA_SERVED}}`, `Service.offers[].@id` → `{{SCHEMA_SERVICE_OFFER_ID}}`, `Service.availableChannel` → `{{SCHEMA_SERVICE_CHANNEL}}`.
- **Associated nodes (only if real):** `Organization_or_Person_for_provider_if_real`, `Offer_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-07 — Industries Served (`industries-served`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="industries-served">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-08 — Locations Served (`service-locations`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="service-locations">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-09 — Pricing / Packages (`service-pricing`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="service-pricing">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Service`; OG `og:type=website`; relationship: WebPage.mainEntity → Service.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Service`: `Service.@id` → `{{SCHEMA_SERVICE_ID}}`, `Service.name` → `{{SCHEMA_SERVICE_NAME}}`, `Service.description` → `{{SCHEMA_SERVICE_DESCRIPTION}}`, `Service.serviceType` → `{{SCHEMA_SERVICE_TYPE}}`, `Service.provider.@id` → `{{SCHEMA_SERVICE_PROVIDER_ID}}`, `Service.areaServed[]` → `{{SCHEMA_SERVICE_AREA_SERVED}}`, `Service.offers[].@id` → `{{SCHEMA_SERVICE_OFFER_ID}}`, `Service.availableChannel` → `{{SCHEMA_SERVICE_CHANNEL}}`.
- **Associated nodes (only if real):** `Organization_or_Person_for_provider_if_real`, `Offer_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-10 — Team Directory (`team-directory`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="team-directory">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-11 — Practitioner Profile (`ProfilePage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="ProfilePage">
```

- **Mappings:** page `@type=ProfilePage`; main entity `@type=Person`; OG `og:type=profile`; relationship: ProfilePage.mainEntity → Person.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ProfilePage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ProfilePage.@type` → `ProfilePage`, `ProfilePage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Person`: `Person.@id` → `{{SCHEMA_PERSON_ID}}`, `Person.name` → `{{SCHEMA_PERSON_NAME}}`, `Person.url` → `{{SCHEMA_PERSON_URL}}`, `Person.image` → `{{SCHEMA_PERSON_IMAGE}}`, `Person.description` → `{{SCHEMA_PERSON_BIO}}`, `Person.sameAs[]` → `{{SCHEMA_PERSON_SAMEAS}}`, `Person.jobTitle` → `{{SCHEMA_PERSON_JOB_TITLE}}`, `Person.worksFor.@id` → `{{SCHEMA_PERSON_ORG_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-12 — Portfolio / Work Index (`work-index`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="work-index">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-13 — Client Case Study (`agency-case-study`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="agency-case-study">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-14 — Client Testimonial (`client-testimonial`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="client-testimonial">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Review`; OG `og:type=website`; relationship: WebPage.mainEntity → Review.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Review`: `Review.@id` → `{{SCHEMA_REVIEW_ID}}`, `Review.name` → `{{SCHEMA_REVIEW_TITLE}}`, `Review.reviewBody` → `{{SCHEMA_REVIEW_BODY}}`, `Review.author.@id` → `{{SCHEMA_REVIEW_AUTHOR_ID}}`, `Review.datePublished` → `{{SCHEMA_REVIEW_DATE}}`, `Review.itemReviewed.@id` → `{{SCHEMA_REVIEW_SUBJECT_ID}}`, `Review.reviewRating.ratingValue` → `{{SCHEMA_REVIEW_RATING}}`, `Review.reviewRating.bestRating` → `{{SCHEMA_REVIEW_BEST_RATING}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `reviewed_item_entity_must_match_topic`.
- **Special guardrail:** Review.itemReviewed requires a real, correctly typed target; do not assume it is the publishing website.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-15 — Award / Recognition (`agency-award`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="agency-award">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-16 — Agency Blog Post (`BlogPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="BlogPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=BlogPosting`; OG `og:type=article`; relationship: WebPage.mainEntity → BlogPosting.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `BlogPosting`: `BlogPosting.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `BlogPosting.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `BlogPosting.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `BlogPosting.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `BlogPosting.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `BlogPosting.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `BlogPosting.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `BlogPosting.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `BlogPosting.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-17 — Professional Article (`Article`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="Article">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-18 — How-to Guide (`HowTo`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="HowTo">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=HowTo`; OG `og:type=article`; relationship: WebPage.mainEntity → HowTo.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `HowTo`: `HowTo.name` → `{{SCHEMA_HOWTO_NAME}}`, `HowTo.description` → `{{SCHEMA_HOWTO_DESCRIPTION}}`, `HowTo.step[].name` → `{{SCHEMA_HOWTO_STEP_NAME}}`, `HowTo.step[].text` → `{{SCHEMA_HOWTO_STEP_TEXT}}`, `HowTo.step[].url` → `{{SCHEMA_HOWTO_STEP_URL}}`, `HowTo.totalTime` → `{{SCHEMA_HOWTO_TOTAL_TIME}}`, `HowTo.tool[].name` → `{{SCHEMA_HOWTO_TOOL}}`, `HowTo.supply[].name` → `{{SCHEMA_HOWTO_SUPPLY}}`.
- **Special guardrail:** Schema.org vocabulary remains valid even though Google feature support is limited/retired. Do not claim rich-result guarantee.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-19 — FAQ Page (`FAQPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="FAQPage">
```

- **Mappings:** page `@type=FAQPage`; main entity `@type=Question`; OG `og:type=website`; relationship: FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `FAQPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `FAQPage.@type` → `FAQPage`, `FAQPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`, `FAQPage.mainEntity[].@id` → `{{SCHEMA_FAQ_QUESTION_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** FAQPage has multiple actual Question/Answer entries; a single Question is only a repeatable pattern. Google FAQ rich results are restricted.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-20 — Consultation Information (`consultation-info`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="consultation-info">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Service`; OG `og:type=website`; relationship: WebPage.mainEntity → Service.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Service`: `Service.@id` → `{{SCHEMA_SERVICE_ID}}`, `Service.name` → `{{SCHEMA_SERVICE_NAME}}`, `Service.description` → `{{SCHEMA_SERVICE_DESCRIPTION}}`, `Service.serviceType` → `{{SCHEMA_SERVICE_TYPE}}`, `Service.provider.@id` → `{{SCHEMA_SERVICE_PROVIDER_ID}}`, `Service.areaServed[]` → `{{SCHEMA_SERVICE_AREA_SERVED}}`, `Service.offers[].@id` → `{{SCHEMA_SERVICE_OFFER_ID}}`, `Service.availableChannel` → `{{SCHEMA_SERVICE_CHANNEL}}`.
- **Associated nodes (only if real):** `Organization_or_Person_for_provider_if_real`, `Offer_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 07-21 — Workshop / Training Event (`EducationEvent`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="services"
      data-cms-seo-type="EducationEvent">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=EducationEvent`; OG `og:type=website`; relationship: WebPage.mainEntity → EducationEvent.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `EducationEvent`: `EducationEvent.@id` → `{{SCHEMA_EVENT_ID}}`, `EducationEvent.name` → `{{SCHEMA_EVENT_NAME}}`, `EducationEvent.description` → `{{SCHEMA_EVENT_DESCRIPTION}}`, `EducationEvent.startDate` → `{{SCHEMA_EVENT_START}}`, `EducationEvent.endDate` → `{{SCHEMA_EVENT_END}}`, `EducationEvent.location.@id` → `{{SCHEMA_EVENT_LOCATION_ID}}`, `EducationEvent.organizer.@id` → `{{SCHEMA_EVENT_ORGANIZER_ID}}`, `EducationEvent.offers[].@id` → `{{SCHEMA_EVENT_OFFER_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

### 08 — Education / E-learning (`education`) — 28 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 08-01 | Education Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 08-02 | Learning Catalog | `learning-catalog` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 08-03 | Subject Category | `subject-category` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 08-04 | Course Directory | `course-directory` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 08-05 | Learning Path | `learning-path` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 08-06 | Instructor Directory | `instructor-directory` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 08-07 | About Platform | `AboutPage` | `AboutPage` | `none` | `website` | `WebPage` + `AboutPage` |
| 08-08 | Contact | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |
| 08-09 | Course Detail | `Course` | `ItemPage` | `Course` | `website` | `WebPage` + `ItemPage` + `Course` |
| 08-10 | Course Offering / Session | `CourseInstance` | `ItemPage` | `CourseInstance` | `website` | `WebPage` + `ItemPage` + `CourseInstance` |
| 08-11 | Educational Program | `EducationalOccupationalProgram` | `ItemPage` | `EducationalOccupationalProgram` | `website` | `WebPage` + `ItemPage` + `EducationalOccupationalProgram` |
| 08-12 | Lesson / Learning Resource | `LearningResource` | `WebPage` | `LearningResource` | `website` | `WebPage` + `LearningResource` |
| 08-13 | Lesson Module | `lesson-module` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 08-14 | Tutorial / How-to | `HowTo` | `WebPage` | `HowTo` | `article` | `WebPage` + `HowTo` |
| 08-15 | Technical Lesson Article | `TechArticle` | `WebPage` | `TechArticle` | `article` | `WebPage` + `TechArticle` |
| 08-16 | Study Guide | `study-guide` | `WebPage` | `LearningResource` | `website` | `WebPage` + `LearningResource` |
| 08-17 | Quiz | `Quiz` | `WebPage` | `Quiz` | `website` | `WebPage` + `Quiz` |
| 08-18 | Assignment / Worksheet | `education-worksheet` | `WebPage` | `LearningResource` | `website` | `WebPage` + `LearningResource` |
| 08-19 | Video Lesson | `education-video` | `WebPage` | `VideoObject` | `video.other` | `WebPage` + `VideoObject` |
| 08-20 | Book / Textbook Detail | `Book` | `ItemPage` | `Book` | `book` | `WebPage` + `ItemPage` + `Book` |
| 08-21 | Instructor Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` | `WebPage` + `ProfilePage` + `Person` |
| 08-22 | Education Article | `Article` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 08-23 | Education Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` | `WebPage` + `BlogPosting` |
| 08-24 | Research Article | `ScholarlyArticle` | `WebPage` | `ScholarlyArticle` | `article` | `WebPage` + `ScholarlyArticle` |
| 08-25 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` | `WebPage` + `FAQPage` + `Question` |
| 08-26 | Q&A Page | `QAPage` | `QAPage` | `Question` | `website` | `WebPage` + `QAPage` + `Question` |
| 08-27 | Webinar / Workshop | `EducationEvent` | `WebPage` | `EducationEvent` | `website` | `WebPage` + `EducationEvent` |
| 08-28 | Resources Library | `education-resources` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |

#### 08-01 — Education Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-02 — Learning Catalog (`learning-catalog`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="learning-catalog">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-03 — Subject Category (`subject-category`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="subject-category">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-04 — Course Directory (`course-directory`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="course-directory">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-05 — Learning Path (`learning-path`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="learning-path">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-06 — Instructor Directory (`instructor-directory`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="instructor-directory">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-07 — About Platform (`AboutPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="AboutPage">
```

- **Mappings:** page `@type=AboutPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `AboutPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `AboutPage.@type` → `AboutPage`, `AboutPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-08 — Contact (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-09 — Course Detail (`Course`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="Course">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Course`; OG `og:type=website`; relationship: ItemPage.mainEntity → Course.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Course`: `Course.@id` → `{{SCHEMA_COURSE_ID}}`, `Course.name` → `{{SCHEMA_COURSE_NAME}}`, `Course.description` → `{{SCHEMA_COURSE_DESCRIPTION}}`, `Course.provider.@id` → `{{SCHEMA_COURSE_PROVIDER_ID}}`, `Course.courseCode` → `{{SCHEMA_COURSE_CODE}}`, `Course.educationalLevel` → `{{SCHEMA_COURSE_LEVEL}}`, `Course.about[]` → `{{SCHEMA_COURSE_SUBJECT}}`, `Course.hasCourseInstance[].@id` → `{{SCHEMA_COURSE_INSTANCE_ID}}`.
- **Associated nodes (only if real):** `CourseInstance_if_real`, `Organization_or_Person_for_provider`.
- **Special guardrail:** Course is a curriculum entity; do not equate it to arbitrary article or one-off lesson.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-10 — Course Offering / Session (`CourseInstance`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="CourseInstance">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=CourseInstance`; OG `og:type=website`; relationship: ItemPage.mainEntity → CourseInstance.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `CourseInstance`: `CourseInstance.@id` → `{{SCHEMA_COURSE_INSTANCE_ID}}`, `CourseInstance.name` → `{{SCHEMA_COURSE_INSTANCE_NAME}}`, `CourseInstance.courseMode` → `{{SCHEMA_COURSE_MODE}}`, `CourseInstance.startDate` → `{{SCHEMA_COURSE_START}}`, `CourseInstance.endDate` → `{{SCHEMA_COURSE_END}}`, `CourseInstance.instructor[].@id` → `{{SCHEMA_INSTRUCTOR_ID}}`, `CourseInstance.location.@id` → `{{SCHEMA_COURSE_LOCATION_ID}}`, `CourseInstance.offers[].@id` → `{{SCHEMA_COURSE_OFFER_ID}}`, `CourseInstance.courseWorkload` → `{{SCHEMA_COURSE_WORKLOAD}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-11 — Educational Program (`EducationalOccupationalProgram`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="EducationalOccupationalProgram">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=EducationalOccupationalProgram`; OG `og:type=website`; relationship: ItemPage.mainEntity → EducationalOccupationalProgram.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `EducationalOccupationalProgram`: `EducationalOccupationalProgram.@id` → `{{SCHEMA_PROGRAM_ID}}`, `EducationalOccupationalProgram.name` → `{{SCHEMA_PROGRAM_NAME}}`, `EducationalOccupationalProgram.description` → `{{SCHEMA_PROGRAM_DESCRIPTION}}`, `EducationalOccupationalProgram.provider.@id` → `{{SCHEMA_PROGRAM_PROVIDER_ID}}`, `EducationalOccupationalProgram.educationalCredentialAwarded` → `{{SCHEMA_PROGRAM_CREDENTIAL}}`, `EducationalOccupationalProgram.timeToComplete` → `{{SCHEMA_PROGRAM_DURATION}}`, `EducationalOccupationalProgram.programType` → `{{SCHEMA_PROGRAM_TYPE}}`, `EducationalOccupationalProgram.occupationalCategory` → `{{SCHEMA_PROGRAM_OCCUPATION}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-12 — Lesson / Learning Resource (`LearningResource`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="LearningResource">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=LearningResource`; OG `og:type=website`; relationship: WebPage.mainEntity → LearningResource.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `LearningResource`: `LearningResource.@id` → `{{SCHEMA_LEARNING_RESOURCE_ID}}`, `LearningResource.name` → `{{SCHEMA_LEARNING_RESOURCE_NAME}}`, `LearningResource.description` → `{{SCHEMA_LEARNING_RESOURCE_DESCRIPTION}}`, `LearningResource.learningResourceType` → `{{SCHEMA_LEARNING_RESOURCE_TYPE}}`, `LearningResource.educationalLevel` → `{{SCHEMA_LEARNING_LEVEL}}`, `LearningResource.teaches[]` → `{{SCHEMA_LEARNING_TEACHES}}`, `LearningResource.assesses[]` → `{{SCHEMA_LEARNING_ASSESSES}}`, `LearningResource.timeRequired` → `{{SCHEMA_LEARNING_TIME}}`, `LearningResource.isPartOf.@id` → `{{SCHEMA_COURSE_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-13 — Lesson Module (`lesson-module`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="lesson-module">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-14 — Tutorial / How-to (`HowTo`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="HowTo">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=HowTo`; OG `og:type=article`; relationship: WebPage.mainEntity → HowTo.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `HowTo`: `HowTo.name` → `{{SCHEMA_HOWTO_NAME}}`, `HowTo.description` → `{{SCHEMA_HOWTO_DESCRIPTION}}`, `HowTo.step[].name` → `{{SCHEMA_HOWTO_STEP_NAME}}`, `HowTo.step[].text` → `{{SCHEMA_HOWTO_STEP_TEXT}}`, `HowTo.step[].url` → `{{SCHEMA_HOWTO_STEP_URL}}`, `HowTo.totalTime` → `{{SCHEMA_HOWTO_TOTAL_TIME}}`, `HowTo.tool[].name` → `{{SCHEMA_HOWTO_TOOL}}`, `HowTo.supply[].name` → `{{SCHEMA_HOWTO_SUPPLY}}`.
- **Special guardrail:** Schema.org vocabulary remains valid even though Google feature support is limited/retired. Do not claim rich-result guarantee.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-15 — Technical Lesson Article (`TechArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="TechArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=TechArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → TechArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `TechArticle`: `TechArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `TechArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `TechArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `TechArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `TechArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `TechArticle.dependencies` → `{{SCHEMA_TECH_DEPENDENCIES}}`, `TechArticle.proficiencyLevel` → `{{SCHEMA_TECH_LEVEL}}`, `TechArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `BreadcrumbList_if_breadcrumbs_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-16 — Study Guide (`study-guide`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="study-guide">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=LearningResource`; OG `og:type=website`; relationship: WebPage.mainEntity → LearningResource.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `LearningResource`: `LearningResource.@id` → `{{SCHEMA_LEARNING_RESOURCE_ID}}`, `LearningResource.name` → `{{SCHEMA_LEARNING_RESOURCE_NAME}}`, `LearningResource.description` → `{{SCHEMA_LEARNING_RESOURCE_DESCRIPTION}}`, `LearningResource.learningResourceType` → `{{SCHEMA_LEARNING_RESOURCE_TYPE}}`, `LearningResource.educationalLevel` → `{{SCHEMA_LEARNING_LEVEL}}`, `LearningResource.teaches[]` → `{{SCHEMA_LEARNING_TEACHES}}`, `LearningResource.assesses[]` → `{{SCHEMA_LEARNING_ASSESSES}}`, `LearningResource.timeRequired` → `{{SCHEMA_LEARNING_TIME}}`, `LearningResource.isPartOf.@id` → `{{SCHEMA_COURSE_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-17 — Quiz (`Quiz`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="Quiz">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Quiz`; OG `og:type=website`; relationship: WebPage.mainEntity → Quiz.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Quiz`: `Quiz.@id` → `{{SCHEMA_QUIZ_ID}}`, `Quiz.name` → `{{SCHEMA_QUIZ_NAME}}`, `Quiz.description` → `{{SCHEMA_QUIZ_DESCRIPTION}}`, `Quiz.about[]` → `{{SCHEMA_QUIZ_TOPIC}}`, `Quiz.hasPart[].name` → `{{SCHEMA_QUIZ_QUESTION}}`, `Quiz.hasPart[].acceptedAnswer.text` → `{{SCHEMA_QUIZ_ANSWER}}`, `Quiz.educationalLevel` → `{{SCHEMA_QUIZ_LEVEL}}`.
- **Special guardrail:** Quiz questions/answers must be real. Never add fictional scores.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-18 — Assignment / Worksheet (`education-worksheet`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="education-worksheet">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=LearningResource`; OG `og:type=website`; relationship: WebPage.mainEntity → LearningResource.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `LearningResource`: `LearningResource.@id` → `{{SCHEMA_LEARNING_RESOURCE_ID}}`, `LearningResource.name` → `{{SCHEMA_LEARNING_RESOURCE_NAME}}`, `LearningResource.description` → `{{SCHEMA_LEARNING_RESOURCE_DESCRIPTION}}`, `LearningResource.learningResourceType` → `{{SCHEMA_LEARNING_RESOURCE_TYPE}}`, `LearningResource.educationalLevel` → `{{SCHEMA_LEARNING_LEVEL}}`, `LearningResource.teaches[]` → `{{SCHEMA_LEARNING_TEACHES}}`, `LearningResource.assesses[]` → `{{SCHEMA_LEARNING_ASSESSES}}`, `LearningResource.timeRequired` → `{{SCHEMA_LEARNING_TIME}}`, `LearningResource.isPartOf.@id` → `{{SCHEMA_COURSE_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-19 — Video Lesson (`education-video`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="education-video">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=VideoObject`; OG `og:type=video.other`; relationship: WebPage.mainEntity → VideoObject.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `video:actor` → `{{OG_VIDEO_ACTOR}}`, `video:director` → `{{OG_VIDEO_DIRECTOR}}`, `video:duration` → `{{OG_VIDEO_DURATION_SECONDS}}`, `video:release_date` → `{{OG_VIDEO_RELEASE_DATE}}`, `video:tag` → `{{OG_VIDEO_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `VideoObject`: `VideoObject.@id` → `{{SCHEMA_VIDEO_ID}}`, `VideoObject.name` → `{{SCHEMA_VIDEO_NAME}}`, `VideoObject.description` → `{{SCHEMA_VIDEO_DESCRIPTION}}`, `VideoObject.thumbnailUrl[]` → `{{SCHEMA_VIDEO_THUMBNAIL_URL}}`, `VideoObject.uploadDate` → `{{SCHEMA_VIDEO_UPLOAD_DATE}}`, `VideoObject.duration` → `{{SCHEMA_VIDEO_DURATION}}`, `VideoObject.contentUrl` → `{{SCHEMA_VIDEO_CONTENT_URL}}`, `VideoObject.embedUrl` → `{{SCHEMA_VIDEO_EMBED_URL}}`, `VideoObject.hasPart[].@id` → `{{SCHEMA_VIDEO_CLIP_ID}}`, `VideoObject.inLanguage` → `{{SCHEMA_VIDEO_LANGUAGE}}`.
- **Associated nodes (only if real):** `ImageObject_if_actual_thumbnail`, `Clip_if_actual_chapters`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-20 — Book / Textbook Detail (`Book`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="Book">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Book`; OG `og:type=book`; relationship: ItemPage.mainEntity → Book.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `book:author` → `{{OG_BOOK_AUTHOR}}`, `book:isbn` → `{{OG_BOOK_ISBN}}`, `book:release_date` → `{{OG_BOOK_RELEASE_DATE}}`, `book:tag` → `{{OG_BOOK_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Book`: `Book.@id` → `{{SCHEMA_BOOK_ID}}`, `Book.name` → `{{SCHEMA_BOOK_TITLE}}`, `Book.description` → `{{SCHEMA_BOOK_DESCRIPTION}}`, `Book.author[].@id` → `{{SCHEMA_BOOK_AUTHOR_ID}}`, `Book.isbn` → `{{SCHEMA_BOOK_ISBN}}`, `Book.bookFormat` → `{{SCHEMA_BOOK_FORMAT}}`, `Book.inLanguage` → `{{SCHEMA_BOOK_LANGUAGE}}`, `Book.numberOfPages` → `{{SCHEMA_BOOK_PAGES}}`, `Book.datePublished` → `{{SCHEMA_BOOK_PUBLICATION_DATE}}`, `Book.publisher.@id` → `{{SCHEMA_BOOK_PUBLISHER_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-21 — Instructor Profile (`ProfilePage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="ProfilePage">
```

- **Mappings:** page `@type=ProfilePage`; main entity `@type=Person`; OG `og:type=profile`; relationship: ProfilePage.mainEntity → Person.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ProfilePage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ProfilePage.@type` → `ProfilePage`, `ProfilePage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Person`: `Person.@id` → `{{SCHEMA_PERSON_ID}}`, `Person.name` → `{{SCHEMA_PERSON_NAME}}`, `Person.url` → `{{SCHEMA_PERSON_URL}}`, `Person.image` → `{{SCHEMA_PERSON_IMAGE}}`, `Person.description` → `{{SCHEMA_PERSON_BIO}}`, `Person.sameAs[]` → `{{SCHEMA_PERSON_SAMEAS}}`, `Person.jobTitle` → `{{SCHEMA_PERSON_JOB_TITLE}}`, `Person.worksFor.@id` → `{{SCHEMA_PERSON_ORG_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-22 — Education Article (`Article`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="Article">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-23 — Education Blog Post (`BlogPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="BlogPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=BlogPosting`; OG `og:type=article`; relationship: WebPage.mainEntity → BlogPosting.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `BlogPosting`: `BlogPosting.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `BlogPosting.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `BlogPosting.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `BlogPosting.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `BlogPosting.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `BlogPosting.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `BlogPosting.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `BlogPosting.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `BlogPosting.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-24 — Research Article (`ScholarlyArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="ScholarlyArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=ScholarlyArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → ScholarlyArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `ScholarlyArticle`: `ScholarlyArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `ScholarlyArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `ScholarlyArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `ScholarlyArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `ScholarlyArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `ScholarlyArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `ScholarlyArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `ScholarlyArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `ScholarlyArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-25 — FAQ Page (`FAQPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="FAQPage">
```

- **Mappings:** page `@type=FAQPage`; main entity `@type=Question`; OG `og:type=website`; relationship: FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `FAQPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `FAQPage.@type` → `FAQPage`, `FAQPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`, `FAQPage.mainEntity[].@id` → `{{SCHEMA_FAQ_QUESTION_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** FAQPage has multiple actual Question/Answer entries; a single Question is only a repeatable pattern. Google FAQ rich results are restricted.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-26 — Q&A Page (`QAPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="QAPage">
```

- **Mappings:** page `@type=QAPage`; main entity `@type=Question`; OG `og:type=website`; relationship: QAPage.mainEntity → Question; Question.acceptedAnswer/suggestedAnswer → real Answer objects.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `QAPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `QAPage.@type` → `QAPage`, `QAPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** QAPage is a single question with its genuine answers, not an editorial FAQ list.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-27 — Webinar / Workshop (`EducationEvent`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="EducationEvent">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=EducationEvent`; OG `og:type=website`; relationship: WebPage.mainEntity → EducationEvent.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `EducationEvent`: `EducationEvent.@id` → `{{SCHEMA_EVENT_ID}}`, `EducationEvent.name` → `{{SCHEMA_EVENT_NAME}}`, `EducationEvent.description` → `{{SCHEMA_EVENT_DESCRIPTION}}`, `EducationEvent.startDate` → `{{SCHEMA_EVENT_START}}`, `EducationEvent.endDate` → `{{SCHEMA_EVENT_END}}`, `EducationEvent.location.@id` → `{{SCHEMA_EVENT_LOCATION_ID}}`, `EducationEvent.organizer.@id` → `{{SCHEMA_EVENT_ORGANIZER_ID}}`, `EducationEvent.offers[].@id` → `{{SCHEMA_EVENT_OFFER_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 08-28 — Resources Library (`education-resources`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="education"
      data-cms-seo-type="education-resources">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

### 09 — Software / SaaS (`software`) — 26 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 09-01 | Software Website Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 09-02 | Product Overview | `software-overview` | `WebPage` | `SoftwareApplication` | `website` | `WebPage` + `SoftwareApplication` |
| 09-03 | Web App Details | `WebApplication` | `ItemPage` | `WebApplication` | `website` | `WebPage` + `ItemPage` + `WebApplication` |
| 09-04 | Mobile App Details | `MobileApplication` | `ItemPage` | `MobileApplication` | `website` | `WebPage` + `ItemPage` + `MobileApplication` |
| 09-05 | Software Application Details | `SoftwareApplication` | `ItemPage` | `SoftwareApplication` | `website` | `WebPage` + `ItemPage` + `SoftwareApplication` |
| 09-06 | Features Overview | `software-features` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 09-07 | Single Feature | `software-feature` | `WebPage` | `SoftwareApplication` | `website` | `WebPage` + `SoftwareApplication` |
| 09-08 | Pricing Plans | `software-pricing` | `WebPage` | `SoftwareApplication` | `website` | `WebPage` + `SoftwareApplication` |
| 09-09 | Integration Directory | `software-integrations` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 09-10 | Integration Detail | `integration-detail` | `WebPage` | `SoftwareApplication` | `website` | `WebPage` + `SoftwareApplication` |
| 09-11 | About Company | `AboutPage` | `AboutPage` | `none` | `website` | `WebPage` + `AboutPage` |
| 09-12 | Contact | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |
| 09-13 | Documentation Hub | `software-docs` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 09-14 | API Reference | `APIReference` | `WebPage` | `APIReference` | `article` | `WebPage` + `APIReference` |
| 09-15 | Developer Guide | `software-developer-guide` | `WebPage` | `TechArticle` | `article` | `WebPage` + `TechArticle` |
| 09-16 | Technical Article | `TechArticle` | `WebPage` | `TechArticle` | `article` | `WebPage` + `TechArticle` |
| 09-17 | How-to Tutorial | `HowTo` | `WebPage` | `HowTo` | `article` | `WebPage` + `HowTo` |
| 09-18 | Release Notes | `software-release-notes` | `WebPage` | `TechArticle` | `article` | `WebPage` + `TechArticle` |
| 09-19 | Changelog | `software-changelog` | `WebPage` | `none` | `website` | `WebPage` |
| 09-20 | Open Source Code Project | `SoftwareSourceCode` | `WebPage` | `SoftwareSourceCode` | `website` | `WebPage` + `SoftwareSourceCode` |
| 09-21 | Knowledge Base | `software-help` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 09-22 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` | `WebPage` + `FAQPage` + `Question` |
| 09-23 | Security / Trust Information | `software-security` | `WebPage` | `none` | `website` | `WebPage` |
| 09-24 | Customer Case Study | `software-case-study` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 09-25 | Software Comparison | `software-comparison` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 09-26 | Product Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` | `WebPage` + `BlogPosting` |

#### 09-01 — Software Website Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-02 — Product Overview (`software-overview`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-overview">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=SoftwareApplication`; OG `og:type=website`; relationship: WebPage.mainEntity → SoftwareApplication.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `SoftwareApplication`: `SoftwareApplication.@id` → `{{SCHEMA_APP_ID}}`, `SoftwareApplication.name` → `{{SCHEMA_APP_NAME}}`, `SoftwareApplication.description` → `{{SCHEMA_APP_DESCRIPTION}}`, `SoftwareApplication.applicationCategory` → `{{SCHEMA_APP_CATEGORY}}`, `SoftwareApplication.operatingSystem` → `{{SCHEMA_APP_OS}}`, `SoftwareApplication.softwareVersion` → `{{SCHEMA_APP_VERSION}}`, `SoftwareApplication.screenshot[]` → `{{SCHEMA_APP_SCREENSHOT}}`, `SoftwareApplication.downloadUrl` → `{{SCHEMA_APP_DOWNLOAD_URL}}`, `SoftwareApplication.offers[].@id` → `{{SCHEMA_APP_OFFER_ID}}`, `SoftwareApplication.aggregateRating.ratingValue` → `{{SCHEMA_APP_RATING}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-03 — Web App Details (`WebApplication`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="WebApplication">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=WebApplication`; OG `og:type=website`; relationship: ItemPage.mainEntity → WebApplication.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `WebApplication`: `WebApplication.@id` → `{{SCHEMA_APP_ID}}`, `WebApplication.name` → `{{SCHEMA_APP_NAME}}`, `WebApplication.description` → `{{SCHEMA_APP_DESCRIPTION}}`, `WebApplication.applicationCategory` → `{{SCHEMA_APP_CATEGORY}}`, `WebApplication.operatingSystem` → `{{SCHEMA_APP_OS}}`, `WebApplication.browserRequirements` → `{{SCHEMA_APP_BROWSER_REQUIREMENTS}}`, `WebApplication.screenshot[]` → `{{SCHEMA_APP_SCREENSHOT}}`, `WebApplication.offers[].@id` → `{{SCHEMA_APP_OFFER_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-04 — Mobile App Details (`MobileApplication`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="MobileApplication">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=MobileApplication`; OG `og:type=website`; relationship: ItemPage.mainEntity → MobileApplication.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `MobileApplication`: `MobileApplication.@id` → `{{SCHEMA_APP_ID}}`, `MobileApplication.name` → `{{SCHEMA_APP_NAME}}`, `MobileApplication.description` → `{{SCHEMA_APP_DESCRIPTION}}`, `MobileApplication.applicationCategory` → `{{SCHEMA_APP_CATEGORY}}`, `MobileApplication.operatingSystem` → `{{SCHEMA_APP_OS}}`, `MobileApplication.downloadUrl` → `{{SCHEMA_APP_DOWNLOAD_URL}}`, `MobileApplication.screenshot[]` → `{{SCHEMA_APP_SCREENSHOT}}`, `MobileApplication.offers[].@id` → `{{SCHEMA_APP_OFFER_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-05 — Software Application Details (`SoftwareApplication`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="SoftwareApplication">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=SoftwareApplication`; OG `og:type=website`; relationship: ItemPage.mainEntity → SoftwareApplication.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `SoftwareApplication`: `SoftwareApplication.@id` → `{{SCHEMA_APP_ID}}`, `SoftwareApplication.name` → `{{SCHEMA_APP_NAME}}`, `SoftwareApplication.description` → `{{SCHEMA_APP_DESCRIPTION}}`, `SoftwareApplication.applicationCategory` → `{{SCHEMA_APP_CATEGORY}}`, `SoftwareApplication.operatingSystem` → `{{SCHEMA_APP_OS}}`, `SoftwareApplication.softwareVersion` → `{{SCHEMA_APP_VERSION}}`, `SoftwareApplication.screenshot[]` → `{{SCHEMA_APP_SCREENSHOT}}`, `SoftwareApplication.downloadUrl` → `{{SCHEMA_APP_DOWNLOAD_URL}}`, `SoftwareApplication.offers[].@id` → `{{SCHEMA_APP_OFFER_ID}}`, `SoftwareApplication.aggregateRating.ratingValue` → `{{SCHEMA_APP_RATING}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-06 — Features Overview (`software-features`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-features">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-07 — Single Feature (`software-feature`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-feature">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=SoftwareApplication`; OG `og:type=website`; relationship: WebPage.mainEntity → SoftwareApplication.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `SoftwareApplication`: `SoftwareApplication.@id` → `{{SCHEMA_APP_ID}}`, `SoftwareApplication.name` → `{{SCHEMA_APP_NAME}}`, `SoftwareApplication.description` → `{{SCHEMA_APP_DESCRIPTION}}`, `SoftwareApplication.applicationCategory` → `{{SCHEMA_APP_CATEGORY}}`, `SoftwareApplication.operatingSystem` → `{{SCHEMA_APP_OS}}`, `SoftwareApplication.softwareVersion` → `{{SCHEMA_APP_VERSION}}`, `SoftwareApplication.screenshot[]` → `{{SCHEMA_APP_SCREENSHOT}}`, `SoftwareApplication.downloadUrl` → `{{SCHEMA_APP_DOWNLOAD_URL}}`, `SoftwareApplication.offers[].@id` → `{{SCHEMA_APP_OFFER_ID}}`, `SoftwareApplication.aggregateRating.ratingValue` → `{{SCHEMA_APP_RATING}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-08 — Pricing Plans (`software-pricing`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-pricing">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=SoftwareApplication`; OG `og:type=website`; relationship: WebPage.mainEntity → SoftwareApplication.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `SoftwareApplication`: `SoftwareApplication.@id` → `{{SCHEMA_APP_ID}}`, `SoftwareApplication.name` → `{{SCHEMA_APP_NAME}}`, `SoftwareApplication.description` → `{{SCHEMA_APP_DESCRIPTION}}`, `SoftwareApplication.applicationCategory` → `{{SCHEMA_APP_CATEGORY}}`, `SoftwareApplication.operatingSystem` → `{{SCHEMA_APP_OS}}`, `SoftwareApplication.softwareVersion` → `{{SCHEMA_APP_VERSION}}`, `SoftwareApplication.screenshot[]` → `{{SCHEMA_APP_SCREENSHOT}}`, `SoftwareApplication.downloadUrl` → `{{SCHEMA_APP_DOWNLOAD_URL}}`, `SoftwareApplication.offers[].@id` → `{{SCHEMA_APP_OFFER_ID}}`, `SoftwareApplication.aggregateRating.ratingValue` → `{{SCHEMA_APP_RATING}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-09 — Integration Directory (`software-integrations`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-integrations">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-10 — Integration Detail (`integration-detail`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="integration-detail">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=SoftwareApplication`; OG `og:type=website`; relationship: WebPage.mainEntity → SoftwareApplication.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `SoftwareApplication`: `SoftwareApplication.@id` → `{{SCHEMA_APP_ID}}`, `SoftwareApplication.name` → `{{SCHEMA_APP_NAME}}`, `SoftwareApplication.description` → `{{SCHEMA_APP_DESCRIPTION}}`, `SoftwareApplication.applicationCategory` → `{{SCHEMA_APP_CATEGORY}}`, `SoftwareApplication.operatingSystem` → `{{SCHEMA_APP_OS}}`, `SoftwareApplication.softwareVersion` → `{{SCHEMA_APP_VERSION}}`, `SoftwareApplication.screenshot[]` → `{{SCHEMA_APP_SCREENSHOT}}`, `SoftwareApplication.downloadUrl` → `{{SCHEMA_APP_DOWNLOAD_URL}}`, `SoftwareApplication.offers[].@id` → `{{SCHEMA_APP_OFFER_ID}}`, `SoftwareApplication.aggregateRating.ratingValue` → `{{SCHEMA_APP_RATING}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-11 — About Company (`AboutPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="AboutPage">
```

- **Mappings:** page `@type=AboutPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `AboutPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `AboutPage.@type` → `AboutPage`, `AboutPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-12 — Contact (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-13 — Documentation Hub (`software-docs`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-docs">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-14 — API Reference (`APIReference`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="APIReference">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=APIReference`; OG `og:type=article`; relationship: WebPage.mainEntity → APIReference.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `APIReference`: `APIReference.headline` → `{{SCHEMA_API_HEADLINE}}`, `APIReference.description` → `{{SCHEMA_API_DESCRIPTION}}`, `APIReference.programmingModel` → `{{SCHEMA_API_PROGRAMMING_MODEL}}`, `APIReference.targetPlatform` → `{{SCHEMA_API_TARGET_PLATFORM}}`, `APIReference.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `APIReference.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-15 — Developer Guide (`software-developer-guide`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-developer-guide">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=TechArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → TechArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `TechArticle`: `TechArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `TechArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `TechArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `TechArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `TechArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `TechArticle.dependencies` → `{{SCHEMA_TECH_DEPENDENCIES}}`, `TechArticle.proficiencyLevel` → `{{SCHEMA_TECH_LEVEL}}`, `TechArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `BreadcrumbList_if_breadcrumbs_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-16 — Technical Article (`TechArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="TechArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=TechArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → TechArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `TechArticle`: `TechArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `TechArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `TechArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `TechArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `TechArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `TechArticle.dependencies` → `{{SCHEMA_TECH_DEPENDENCIES}}`, `TechArticle.proficiencyLevel` → `{{SCHEMA_TECH_LEVEL}}`, `TechArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `BreadcrumbList_if_breadcrumbs_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-17 — How-to Tutorial (`HowTo`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="HowTo">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=HowTo`; OG `og:type=article`; relationship: WebPage.mainEntity → HowTo.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `HowTo`: `HowTo.name` → `{{SCHEMA_HOWTO_NAME}}`, `HowTo.description` → `{{SCHEMA_HOWTO_DESCRIPTION}}`, `HowTo.step[].name` → `{{SCHEMA_HOWTO_STEP_NAME}}`, `HowTo.step[].text` → `{{SCHEMA_HOWTO_STEP_TEXT}}`, `HowTo.step[].url` → `{{SCHEMA_HOWTO_STEP_URL}}`, `HowTo.totalTime` → `{{SCHEMA_HOWTO_TOTAL_TIME}}`, `HowTo.tool[].name` → `{{SCHEMA_HOWTO_TOOL}}`, `HowTo.supply[].name` → `{{SCHEMA_HOWTO_SUPPLY}}`.
- **Special guardrail:** Schema.org vocabulary remains valid even though Google feature support is limited/retired. Do not claim rich-result guarantee.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-18 — Release Notes (`software-release-notes`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-release-notes">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=TechArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → TechArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `TechArticle`: `TechArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `TechArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `TechArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `TechArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `TechArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `TechArticle.dependencies` → `{{SCHEMA_TECH_DEPENDENCIES}}`, `TechArticle.proficiencyLevel` → `{{SCHEMA_TECH_LEVEL}}`, `TechArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `BreadcrumbList_if_breadcrumbs_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-19 — Changelog (`software-changelog`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-changelog">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-20 — Open Source Code Project (`SoftwareSourceCode`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="SoftwareSourceCode">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=SoftwareSourceCode`; OG `og:type=website`; relationship: WebPage.mainEntity → SoftwareSourceCode.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `SoftwareSourceCode`: `SoftwareSourceCode.@id` → `{{SCHEMA_CODE_ID}}`, `SoftwareSourceCode.name` → `{{SCHEMA_CODE_NAME}}`, `SoftwareSourceCode.description` → `{{SCHEMA_CODE_DESCRIPTION}}`, `SoftwareSourceCode.codeRepository` → `{{SCHEMA_CODE_REPOSITORY}}`, `SoftwareSourceCode.programmingLanguage[]` → `{{SCHEMA_CODE_LANGUAGE}}`, `SoftwareSourceCode.runtimePlatform` → `{{SCHEMA_CODE_RUNTIME}}`, `SoftwareSourceCode.license` → `{{SCHEMA_CODE_LICENSE}}`, `SoftwareSourceCode.targetProduct.@id` → `{{SCHEMA_APP_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-21 — Knowledge Base (`software-help`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-help">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-22 — FAQ Page (`FAQPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="FAQPage">
```

- **Mappings:** page `@type=FAQPage`; main entity `@type=Question`; OG `og:type=website`; relationship: FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `FAQPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `FAQPage.@type` → `FAQPage`, `FAQPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`, `FAQPage.mainEntity[].@id` → `{{SCHEMA_FAQ_QUESTION_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** FAQPage has multiple actual Question/Answer entries; a single Question is only a repeatable pattern. Google FAQ rich results are restricted.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-23 — Security / Trust Information (`software-security`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-security">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-24 — Customer Case Study (`software-case-study`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-case-study">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-25 — Software Comparison (`software-comparison`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="software-comparison">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 09-26 — Product Blog Post (`BlogPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="software"
      data-cms-seo-type="BlogPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=BlogPosting`; OG `og:type=article`; relationship: WebPage.mainEntity → BlogPosting.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `BlogPosting`: `BlogPosting.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `BlogPosting.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `BlogPosting.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `BlogPosting.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `BlogPosting.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `BlogPosting.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `BlogPosting.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `BlogPosting.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `BlogPosting.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

### 10 — Community / Forum (`community`) — 21 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 10-01 | Community Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 10-02 | Forum Main Page | `forum-main` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 10-03 | Forum Category | `forum-category` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 10-04 | Topic / Thread | `DiscussionForumPosting` | `WebPage` | `DiscussionForumPosting` | `article` | `WebPage` + `DiscussionForumPosting` |
| 10-05 | Question Thread | `community-question` | `QAPage` | `Question` | `website` | `WebPage` + `QAPage` + `Question` |
| 10-06 | Public Member Directory | `member-directory` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 10-07 | Tag / Topic Directory | `community-tags` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 10-08 | About Community | `AboutPage` | `AboutPage` | `none` | `website` | `WebPage` + `AboutPage` |
| 10-09 | Contact / Moderation | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |
| 10-10 | Member Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` | `WebPage` + `ProfilePage` + `Person` |
| 10-11 | Moderator Profile | `moderator-profile` | `ProfilePage` | `Person` | `profile` | `WebPage` + `ProfilePage` + `Person` |
| 10-12 | Q&A Page | `QAPage` | `QAPage` | `Question` | `website` | `WebPage` + `QAPage` + `Question` |
| 10-13 | Discussion Announcement | `community-announcement` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 10-14 | Community Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` | `WebPage` + `BlogPosting` |
| 10-15 | Guide / Tutorial | `HowTo` | `WebPage` | `HowTo` | `article` | `WebPage` + `HowTo` |
| 10-16 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` | `WebPage` + `FAQPage` + `Question` |
| 10-17 | Community Guidelines | `community-guidelines` | `WebPage` | `none` | `website` | `WebPage` |
| 10-18 | Community Rules | `community-rules` | `WebPage` | `none` | `website` | `WebPage` |
| 10-19 | Community Event | `Event` | `WebPage` | `Event` | `website` | `WebPage` + `Event` |
| 10-20 | Resource Directory | `community-resources` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 10-21 | Public Poll Page | `community-poll` | `WebPage` | `none` | `website` | `WebPage` |

#### 10-01 — Community Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-02 — Forum Main Page (`forum-main`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="forum-main">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-03 — Forum Category (`forum-category`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="forum-category">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-04 — Topic / Thread (`DiscussionForumPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="DiscussionForumPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=DiscussionForumPosting`; OG `og:type=article`; relationship: WebPage.mainEntity → DiscussionForumPosting.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `DiscussionForumPosting`: `DiscussionForumPosting.@id` → `{{SCHEMA_FORUM_POST_ID}}`, `DiscussionForumPosting.headline` → `{{SCHEMA_FORUM_HEADLINE}}`, `DiscussionForumPosting.text` → `{{SCHEMA_FORUM_BODY}}`, `DiscussionForumPosting.author.@id` → `{{SCHEMA_FORUM_AUTHOR_ID}}`, `DiscussionForumPosting.datePublished` → `{{SCHEMA_FORUM_DATE}}`, `DiscussionForumPosting.dateModified` → `{{SCHEMA_FORUM_MODIFIED}}`, `DiscussionForumPosting.comment[].@id` → `{{SCHEMA_FORUM_COMMENT_ID}}`, `DiscussionForumPosting.interactionStatistic.userInteractionCount` → `{{SCHEMA_FORUM_INTERACTION_COUNT}}`, `DiscussionForumPosting.isPartOf.@id` → `{{SCHEMA_FORUM_PARENT_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-05 — Question Thread (`community-question`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-question">
```

- **Mappings:** page `@type=QAPage`; main entity `@type=Question`; OG `og:type=website`; relationship: QAPage.mainEntity → Question; Question.acceptedAnswer/suggestedAnswer → real Answer objects.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `QAPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `QAPage.@type` → `QAPage`, `QAPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** QAPage must reflect a genuine user question with accepted/suggested answers; do not create answers. QAPage is a single question with its genuine answers, not an editorial FAQ list.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-06 — Public Member Directory (`member-directory`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="member-directory">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-07 — Tag / Topic Directory (`community-tags`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-tags">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-08 — About Community (`AboutPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="AboutPage">
```

- **Mappings:** page `@type=AboutPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `AboutPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `AboutPage.@type` → `AboutPage`, `AboutPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-09 — Contact / Moderation (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-10 — Member Profile (`ProfilePage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="ProfilePage">
```

- **Mappings:** page `@type=ProfilePage`; main entity `@type=Person`; OG `og:type=profile`; relationship: ProfilePage.mainEntity → Person.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ProfilePage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ProfilePage.@type` → `ProfilePage`, `ProfilePage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Person`: `Person.@id` → `{{SCHEMA_PERSON_ID}}`, `Person.name` → `{{SCHEMA_PERSON_NAME}}`, `Person.url` → `{{SCHEMA_PERSON_URL}}`, `Person.image` → `{{SCHEMA_PERSON_IMAGE}}`, `Person.description` → `{{SCHEMA_PERSON_BIO}}`, `Person.sameAs[]` → `{{SCHEMA_PERSON_SAMEAS}}`, `Person.jobTitle` → `{{SCHEMA_PERSON_JOB_TITLE}}`, `Person.worksFor.@id` → `{{SCHEMA_PERSON_ORG_ID}}`.
- **Special guardrail:** ProfilePage mapping is valid for a real public person profile. Never infer identity-sensitive fields.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-11 — Moderator Profile (`moderator-profile`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="moderator-profile">
```

- **Mappings:** page `@type=ProfilePage`; main entity `@type=Person`; OG `og:type=profile`; relationship: ProfilePage.mainEntity → Person.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ProfilePage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ProfilePage.@type` → `ProfilePage`, `ProfilePage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Person`: `Person.@id` → `{{SCHEMA_PERSON_ID}}`, `Person.name` → `{{SCHEMA_PERSON_NAME}}`, `Person.url` → `{{SCHEMA_PERSON_URL}}`, `Person.image` → `{{SCHEMA_PERSON_IMAGE}}`, `Person.description` → `{{SCHEMA_PERSON_BIO}}`, `Person.sameAs[]` → `{{SCHEMA_PERSON_SAMEAS}}`, `Person.jobTitle` → `{{SCHEMA_PERSON_JOB_TITLE}}`, `Person.worksFor.@id` → `{{SCHEMA_PERSON_ORG_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-12 — Q&A Page (`QAPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="QAPage">
```

- **Mappings:** page `@type=QAPage`; main entity `@type=Question`; OG `og:type=website`; relationship: QAPage.mainEntity → Question; Question.acceptedAnswer/suggestedAnswer → real Answer objects.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `QAPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `QAPage.@type` → `QAPage`, `QAPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** QAPage is a single question with its genuine answers, not an editorial FAQ list.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-13 — Discussion Announcement (`community-announcement`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-announcement">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-14 — Community Blog Post (`BlogPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="BlogPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=BlogPosting`; OG `og:type=article`; relationship: WebPage.mainEntity → BlogPosting.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `BlogPosting`: `BlogPosting.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `BlogPosting.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `BlogPosting.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `BlogPosting.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `BlogPosting.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `BlogPosting.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `BlogPosting.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `BlogPosting.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `BlogPosting.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-15 — Guide / Tutorial (`HowTo`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="HowTo">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=HowTo`; OG `og:type=article`; relationship: WebPage.mainEntity → HowTo.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `HowTo`: `HowTo.name` → `{{SCHEMA_HOWTO_NAME}}`, `HowTo.description` → `{{SCHEMA_HOWTO_DESCRIPTION}}`, `HowTo.step[].name` → `{{SCHEMA_HOWTO_STEP_NAME}}`, `HowTo.step[].text` → `{{SCHEMA_HOWTO_STEP_TEXT}}`, `HowTo.step[].url` → `{{SCHEMA_HOWTO_STEP_URL}}`, `HowTo.totalTime` → `{{SCHEMA_HOWTO_TOTAL_TIME}}`, `HowTo.tool[].name` → `{{SCHEMA_HOWTO_TOOL}}`, `HowTo.supply[].name` → `{{SCHEMA_HOWTO_SUPPLY}}`.
- **Special guardrail:** Schema.org vocabulary remains valid even though Google feature support is limited/retired. Do not claim rich-result guarantee.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-16 — FAQ Page (`FAQPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="FAQPage">
```

- **Mappings:** page `@type=FAQPage`; main entity `@type=Question`; OG `og:type=website`; relationship: FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `FAQPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `FAQPage.@type` → `FAQPage`, `FAQPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`, `FAQPage.mainEntity[].@id` → `{{SCHEMA_FAQ_QUESTION_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** FAQPage has multiple actual Question/Answer entries; a single Question is only a repeatable pattern. Google FAQ rich results are restricted.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-17 — Community Guidelines (`community-guidelines`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-guidelines">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-18 — Community Rules (`community-rules`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-rules">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-19 — Community Event (`Event`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="Event">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Event`; OG `og:type=website`; relationship: WebPage.mainEntity → Event.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Event`: `Event.@id` → `{{SCHEMA_EVENT_ID}}`, `Event.name` → `{{SCHEMA_EVENT_NAME}}`, `Event.description` → `{{SCHEMA_EVENT_DESCRIPTION}}`, `Event.startDate` → `{{SCHEMA_EVENT_START}}`, `Event.endDate` → `{{SCHEMA_EVENT_END}}`, `Event.eventStatus` → `{{SCHEMA_EVENT_STATUS}}`, `Event.eventAttendanceMode` → `{{SCHEMA_EVENT_ATTENDANCE_MODE}}`, `Event.location.@id` → `{{SCHEMA_EVENT_LOCATION_ID}}`, `Event.organizer.@id` → `{{SCHEMA_EVENT_ORGANIZER_ID}}`, `Event.offers[].@id` → `{{SCHEMA_EVENT_OFFER_ID}}`, `Event.performer[].@id` → `{{SCHEMA_EVENT_PERFORMER_ID}}`, `Event.image[]` → `{{SCHEMA_EVENT_IMAGE}}`.
- **Associated nodes (only if real):** `Place_or_VirtualLocation_if_real`, `Organization_if_real`, `Offer_if_tickets_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-20 — Resource Directory (`community-resources`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-resources">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 10-21 — Public Poll Page (`community-poll`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="community"
      data-cms-seo-type="community-poll">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

### 11 — Entertainment / Media (`entertainment`) — 25 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 11-01 | Entertainment Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 11-02 | Media Catalog | `media-catalog` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 11-03 | Genre / Category | `media-genre` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 11-04 | Actor / Creator Profile | `ProfilePage` | `ProfilePage` | `Person` | `profile` | `WebPage` + `ProfilePage` + `Person` |
| 11-05 | Music Artist Page | `MusicGroup` | `WebPage` | `MusicGroup` | `website` | `WebPage` + `MusicGroup` |
| 11-06 | About Media Site | `AboutPage` | `AboutPage` | `none` | `website` | `WebPage` + `AboutPage` |
| 11-07 | Contact | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |
| 11-08 | Movie Detail | `Movie` | `ItemPage` | `Movie` | `video.movie` | `WebPage` + `ItemPage` + `Movie` |
| 11-09 | TV Show Detail | `TVSeries` | `ItemPage` | `TVSeries` | `video.tv_show` | `WebPage` + `ItemPage` + `TVSeries` |
| 11-10 | TV Season Detail | `TVSeason` | `ItemPage` | `TVSeason` | `website` | `WebPage` + `ItemPage` + `TVSeason` |
| 11-11 | TV Episode Detail | `TVEpisode` | `ItemPage` | `TVEpisode` | `video.episode` | `WebPage` + `ItemPage` + `TVEpisode` |
| 11-12 | Video Content | `media-video` | `WebPage` | `VideoObject` | `video.other` | `WebPage` + `VideoObject` |
| 11-13 | Video Gallery | `VideoGallery` | `VideoGallery` | `none` | `website` | `WebPage` + `VideoGallery` |
| 11-14 | Image Gallery | `ImageGallery` | `ImageGallery` | `none` | `website` | `WebPage` + `ImageGallery` |
| 11-15 | Trailer / Teaser | `media-trailer` | `WebPage` | `VideoObject` | `video.other` | `WebPage` + `VideoObject` |
| 11-16 | Music Track | `MusicRecording` | `ItemPage` | `MusicRecording` | `music.song` | `WebPage` + `ItemPage` + `MusicRecording` |
| 11-17 | Music Album | `MusicAlbum` | `ItemPage` | `MusicAlbum` | `music.album` | `WebPage` + `ItemPage` + `MusicAlbum` |
| 11-18 | Music Playlist | `MusicPlaylist` | `ItemPage` | `MusicPlaylist` | `music.playlist` | `WebPage` + `ItemPage` + `MusicPlaylist` |
| 11-19 | Podcast Series | `PodcastSeries` | `ItemPage` | `PodcastSeries` | `website` | `WebPage` + `ItemPage` + `PodcastSeries` |
| 11-20 | Podcast Episode | `PodcastEpisode` | `ItemPage` | `PodcastEpisode` | `website` | `WebPage` + `ItemPage` + `PodcastEpisode` |
| 11-21 | Audio Content | `AudioObject` | `ItemPage` | `AudioObject` | `website` | `WebPage` + `ItemPage` + `AudioObject` |
| 11-22 | Entertainment News | `NewsArticle` | `WebPage` | `NewsArticle` | `article` | `WebPage` + `NewsArticle` |
| 11-23 | Review | `Review` | `WebPage` | `Review` | `article` | `WebPage` + `Review` |
| 11-24 | Feature Article | `Article` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 11-25 | Entertainment Event | `Event` | `WebPage` | `Event` | `website` | `WebPage` + `Event` |

#### 11-01 — Entertainment Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-02 — Media Catalog (`media-catalog`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="media-catalog">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-03 — Genre / Category (`media-genre`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="media-genre">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-04 — Actor / Creator Profile (`ProfilePage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="ProfilePage">
```

- **Mappings:** page `@type=ProfilePage`; main entity `@type=Person`; OG `og:type=profile`; relationship: ProfilePage.mainEntity → Person.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `profile:first_name`, `profile:last_name`, `profile:username`, `profile:gender`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ProfilePage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ProfilePage.@type` → `ProfilePage`, `ProfilePage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Person`: `Person.@id` → `{{SCHEMA_PERSON_ID}}`, `Person.name` → `{{SCHEMA_PERSON_NAME}}`, `Person.url` → `{{SCHEMA_PERSON_URL}}`, `Person.image` → `{{SCHEMA_PERSON_IMAGE}}`, `Person.description` → `{{SCHEMA_PERSON_BIO}}`, `Person.sameAs[]` → `{{SCHEMA_PERSON_SAMEAS}}`, `Person.jobTitle` → `{{SCHEMA_PERSON_JOB_TITLE}}`, `Person.worksFor.@id` → `{{SCHEMA_PERSON_ORG_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-05 — Music Artist Page (`MusicGroup`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="MusicGroup">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=MusicGroup`; OG `og:type=website`; relationship: WebPage.mainEntity → MusicGroup.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `MusicGroup`: `MusicGroup.@id` → `{{SCHEMA_MUSIC_GROUP_ID}}`, `MusicGroup.name` → `{{SCHEMA_MUSIC_GROUP_NAME}}`, `MusicGroup.description` → `{{SCHEMA_MUSIC_GROUP_BIO}}`, `MusicGroup.image[]` → `{{SCHEMA_MUSIC_GROUP_IMAGE}}`, `MusicGroup.member[].@id` → `{{SCHEMA_MUSIC_MEMBER_ID}}`, `MusicGroup.genre[]` → `{{SCHEMA_MUSIC_GENRE}}`, `MusicGroup.album[].@id` → `{{SCHEMA_MUSIC_ALBUM_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-06 — About Media Site (`AboutPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="AboutPage">
```

- **Mappings:** page `@type=AboutPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `AboutPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `AboutPage.@type` → `AboutPage`, `AboutPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-07 — Contact (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-08 — Movie Detail (`Movie`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="Movie">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Movie`; OG `og:type=video.movie`; relationship: ItemPage.mainEntity → Movie.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `video:actor` → `{{OG_VIDEO_ACTOR}}`, `video:actor:role` → `{{OG_VIDEO_ACTOR_ROLE}}`, `video:director` → `{{OG_VIDEO_DIRECTOR}}`, `video:writer` → `{{OG_VIDEO_WRITER}}`, `video:duration` → `{{OG_VIDEO_DURATION_SECONDS}}`, `video:release_date` → `{{OG_VIDEO_RELEASE_DATE}}`, `video:tag` → `{{OG_VIDEO_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Movie`: `Movie.@id` → `{{SCHEMA_MOVIE_ID}}`, `Movie.name` → `{{SCHEMA_MOVIE_NAME}}`, `Movie.description` → `{{SCHEMA_MOVIE_DESCRIPTION}}`, `Movie.datePublished` → `{{SCHEMA_MOVIE_RELEASE_DATE}}`, `Movie.duration` → `{{SCHEMA_MOVIE_DURATION}}`, `Movie.director[].@id` → `{{SCHEMA_MOVIE_DIRECTOR_ID}}`, `Movie.actor[].@id` → `{{SCHEMA_MOVIE_ACTOR_ID}}`, `Movie.genre[]` → `{{SCHEMA_MOVIE_GENRE}}`, `Movie.trailer.@id` → `{{SCHEMA_MOVIE_TRAILER_ID}}`, `Movie.contentRating` → `{{SCHEMA_MOVIE_CONTENT_RATING}}`.
- **Special guardrail:** Movie OG vertical permits video.movie; additional video: properties are separate optional extensions.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-09 — TV Show Detail (`TVSeries`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="TVSeries">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=TVSeries`; OG `og:type=video.tv_show`; relationship: ItemPage.mainEntity → TVSeries.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `video:actor` → `{{OG_VIDEO_ACTOR}}`, `video:actor:role` → `{{OG_VIDEO_ACTOR_ROLE}}`, `video:director` → `{{OG_VIDEO_DIRECTOR}}`, `video:writer` → `{{OG_VIDEO_WRITER}}`, `video:duration` → `{{OG_VIDEO_DURATION_SECONDS}}`, `video:release_date` → `{{OG_VIDEO_RELEASE_DATE}}`, `video:tag` → `{{OG_VIDEO_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `TVSeries`: `TVSeries.@id` → `{{SCHEMA_TV_SERIES_ID}}`, `TVSeries.name` → `{{SCHEMA_TV_SERIES_NAME}}`, `TVSeries.description` → `{{SCHEMA_TV_SERIES_DESCRIPTION}}`, `TVSeries.numberOfSeasons` → `{{SCHEMA_TV_SEASONS}}`, `TVSeries.containsSeason[].@id` → `{{SCHEMA_TV_SEASON_ID}}`, `TVSeries.actor[].@id` → `{{SCHEMA_TV_ACTOR_ID}}`, `TVSeries.genre[]` → `{{SCHEMA_TV_GENRE}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-10 — TV Season Detail (`TVSeason`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="TVSeason">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=TVSeason`; OG `og:type=website`; relationship: ItemPage.mainEntity → TVSeason.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `TVSeason`: `TVSeason.@id` → `{{SCHEMA_TV_SEASON_ID}}`, `TVSeason.name` → `{{SCHEMA_TV_SEASON_NAME}}`, `TVSeason.seasonNumber` → `{{SCHEMA_TV_SEASON_NUMBER}}`, `TVSeason.partOfSeries.@id` → `{{SCHEMA_TV_SERIES_ID}}`, `TVSeason.episode[].@id` → `{{SCHEMA_TV_EPISODE_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-11 — TV Episode Detail (`TVEpisode`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="TVEpisode">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=TVEpisode`; OG `og:type=video.episode`; relationship: ItemPage.mainEntity → TVEpisode.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `video:actor` → `{{OG_VIDEO_ACTOR}}`, `video:actor:role` → `{{OG_VIDEO_ACTOR_ROLE}}`, `video:director` → `{{OG_VIDEO_DIRECTOR}}`, `video:writer` → `{{OG_VIDEO_WRITER}}`, `video:duration` → `{{OG_VIDEO_DURATION_SECONDS}}`, `video:release_date` → `{{OG_VIDEO_RELEASE_DATE}}`, `video:tag` → `{{OG_VIDEO_TAG}}`, `video:series` → `{{OG_VIDEO_SERIES_URL}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `TVEpisode`: `TVEpisode.@id` → `{{SCHEMA_TV_EPISODE_ID}}`, `TVEpisode.name` → `{{SCHEMA_TV_EPISODE_NAME}}`, `TVEpisode.description` → `{{SCHEMA_TV_EPISODE_DESCRIPTION}}`, `TVEpisode.episodeNumber` → `{{SCHEMA_TV_EPISODE_NUMBER}}`, `TVEpisode.partOfSeason.@id` → `{{SCHEMA_TV_SEASON_ID}}`, `TVEpisode.partOfSeries.@id` → `{{SCHEMA_TV_SERIES_ID}}`, `TVEpisode.datePublished` → `{{SCHEMA_TV_EPISODE_DATE}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-12 — Video Content (`media-video`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="media-video">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=VideoObject`; OG `og:type=video.other`; relationship: WebPage.mainEntity → VideoObject.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `video:actor` → `{{OG_VIDEO_ACTOR}}`, `video:director` → `{{OG_VIDEO_DIRECTOR}}`, `video:duration` → `{{OG_VIDEO_DURATION_SECONDS}}`, `video:release_date` → `{{OG_VIDEO_RELEASE_DATE}}`, `video:tag` → `{{OG_VIDEO_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `VideoObject`: `VideoObject.@id` → `{{SCHEMA_VIDEO_ID}}`, `VideoObject.name` → `{{SCHEMA_VIDEO_NAME}}`, `VideoObject.description` → `{{SCHEMA_VIDEO_DESCRIPTION}}`, `VideoObject.thumbnailUrl[]` → `{{SCHEMA_VIDEO_THUMBNAIL_URL}}`, `VideoObject.uploadDate` → `{{SCHEMA_VIDEO_UPLOAD_DATE}}`, `VideoObject.duration` → `{{SCHEMA_VIDEO_DURATION}}`, `VideoObject.contentUrl` → `{{SCHEMA_VIDEO_CONTENT_URL}}`, `VideoObject.embedUrl` → `{{SCHEMA_VIDEO_EMBED_URL}}`, `VideoObject.hasPart[].@id` → `{{SCHEMA_VIDEO_CLIP_ID}}`, `VideoObject.inLanguage` → `{{SCHEMA_VIDEO_LANGUAGE}}`.
- **Associated nodes (only if real):** `ImageObject_if_actual_thumbnail`, `Clip_if_actual_chapters`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-13 — Video Gallery (`VideoGallery`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="VideoGallery">
```

- **Mappings:** page `@type=VideoGallery`; main entity `@type=none`; OG `og:type=website`; relationship: VideoGallery.hasPart → VideoObject[] (only visible media, no forced singular mainEntity).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `VideoGallery`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `VideoGallery.@type` → `VideoGallery`, `VideoGallery.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - optional_gallery_items `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-14 — Image Gallery (`ImageGallery`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="ImageGallery">
```

- **Mappings:** page `@type=ImageGallery`; main entity `@type=none`; OG `og:type=website`; relationship: ImageGallery.hasPart → ImageObject[] (only visible media, no forced singular mainEntity).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ImageGallery`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ImageGallery.@type` → `ImageGallery`, `ImageGallery.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - optional_gallery_items `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-15 — Trailer / Teaser (`media-trailer`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="media-trailer">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=VideoObject`; OG `og:type=video.other`; relationship: WebPage.mainEntity → VideoObject.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `video:actor` → `{{OG_VIDEO_ACTOR}}`, `video:director` → `{{OG_VIDEO_DIRECTOR}}`, `video:duration` → `{{OG_VIDEO_DURATION_SECONDS}}`, `video:release_date` → `{{OG_VIDEO_RELEASE_DATE}}`, `video:tag` → `{{OG_VIDEO_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `VideoObject`: `VideoObject.@id` → `{{SCHEMA_VIDEO_ID}}`, `VideoObject.name` → `{{SCHEMA_VIDEO_NAME}}`, `VideoObject.description` → `{{SCHEMA_VIDEO_DESCRIPTION}}`, `VideoObject.thumbnailUrl[]` → `{{SCHEMA_VIDEO_THUMBNAIL_URL}}`, `VideoObject.uploadDate` → `{{SCHEMA_VIDEO_UPLOAD_DATE}}`, `VideoObject.duration` → `{{SCHEMA_VIDEO_DURATION}}`, `VideoObject.contentUrl` → `{{SCHEMA_VIDEO_CONTENT_URL}}`, `VideoObject.embedUrl` → `{{SCHEMA_VIDEO_EMBED_URL}}`, `VideoObject.hasPart[].@id` → `{{SCHEMA_VIDEO_CLIP_ID}}`, `VideoObject.inLanguage` → `{{SCHEMA_VIDEO_LANGUAGE}}`.
- **Associated nodes (only if real):** `ImageObject_if_actual_thumbnail`, `Clip_if_actual_chapters`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-16 — Music Track (`MusicRecording`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="MusicRecording">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=MusicRecording`; OG `og:type=music.song`; relationship: ItemPage.mainEntity → MusicRecording.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `music:duration` → `{{OG_MUSIC_DURATION_SECONDS}}`, `music:album` → `{{OG_MUSIC_ALBUM_URL}}`, `music:album:disc` → `{{OG_MUSIC_DISC}}`, `music:album:track` → `{{OG_MUSIC_TRACK}}`, `music:musician` → `{{OG_MUSICIAN_URL}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `MusicRecording`: `MusicRecording.@id` → `{{SCHEMA_TRACK_ID}}`, `MusicRecording.name` → `{{SCHEMA_TRACK_NAME}}`, `MusicRecording.byArtist.@id` → `{{SCHEMA_MUSIC_GROUP_ID}}`, `MusicRecording.duration` → `{{SCHEMA_TRACK_DURATION}}`, `MusicRecording.inAlbum.@id` → `{{SCHEMA_MUSIC_ALBUM_ID}}`, `MusicRecording.datePublished` → `{{SCHEMA_TRACK_DATE}}`, `MusicRecording.isrcCode` → `{{SCHEMA_TRACK_ISRC}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-17 — Music Album (`MusicAlbum`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="MusicAlbum">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=MusicAlbum`; OG `og:type=music.album`; relationship: ItemPage.mainEntity → MusicAlbum.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `music:song` → `{{OG_MUSIC_SONG_URL}}`, `music:song:disc` → `{{OG_MUSIC_SONG_DISC}}`, `music:song:track` → `{{OG_MUSIC_SONG_TRACK}}`, `music:musician` → `{{OG_MUSICIAN_URL}}`, `music:release_date` → `{{OG_MUSIC_RELEASE_DATE}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `MusicAlbum`: `MusicAlbum.@id` → `{{SCHEMA_MUSIC_ALBUM_ID}}`, `MusicAlbum.name` → `{{SCHEMA_MUSIC_ALBUM_NAME}}`, `MusicAlbum.byArtist.@id` → `{{SCHEMA_MUSIC_GROUP_ID}}`, `MusicAlbum.datePublished` → `{{SCHEMA_MUSIC_ALBUM_DATE}}`, `MusicAlbum.numTracks` → `{{SCHEMA_MUSIC_NUM_TRACKS}}`, `MusicAlbum.track[].@id` → `{{SCHEMA_TRACK_ID}}`, `MusicAlbum.genre[]` → `{{SCHEMA_MUSIC_GENRE}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-18 — Music Playlist (`MusicPlaylist`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="MusicPlaylist">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=MusicPlaylist`; OG `og:type=music.playlist`; relationship: ItemPage.mainEntity → MusicPlaylist.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `music:song` → `{{OG_MUSIC_SONG_URL}}`, `music:song:disc` → `{{OG_MUSIC_SONG_DISC}}`, `music:song:track` → `{{OG_MUSIC_SONG_TRACK}}`, `music:creator` → `{{OG_MUSIC_CREATOR_URL}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `MusicPlaylist`: `MusicPlaylist.@id` → `{{SCHEMA_PLAYLIST_ID}}`, `MusicPlaylist.name` → `{{SCHEMA_PLAYLIST_NAME}}`, `MusicPlaylist.description` → `{{SCHEMA_PLAYLIST_DESCRIPTION}}`, `MusicPlaylist.creator.@id` → `{{SCHEMA_PLAYLIST_CREATOR_ID}}`, `MusicPlaylist.numTracks` → `{{SCHEMA_PLAYLIST_NUM_TRACKS}}`, `MusicPlaylist.track[].@id` → `{{SCHEMA_TRACK_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-19 — Podcast Series (`PodcastSeries`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="PodcastSeries">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=PodcastSeries`; OG `og:type=website`; relationship: ItemPage.mainEntity → PodcastSeries.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `PodcastSeries`: `PodcastSeries.@id` → `{{SCHEMA_PODCAST_SERIES_ID}}`, `PodcastSeries.name` → `{{SCHEMA_PODCAST_SERIES_NAME}}`, `PodcastSeries.description` → `{{SCHEMA_PODCAST_SERIES_DESCRIPTION}}`, `PodcastSeries.webFeed` → `{{SCHEMA_PODCAST_RSS_URL}}`, `PodcastSeries.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `PodcastSeries.episode[].@id` → `{{SCHEMA_EPISODE_ID}}`.
- **Special guardrail:** PodcastSeries schema is not an Open Graph music vertical. Use website OG type.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-20 — Podcast Episode (`PodcastEpisode`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="PodcastEpisode">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=PodcastEpisode`; OG `og:type=website`; relationship: ItemPage.mainEntity → PodcastEpisode.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `PodcastEpisode`: `PodcastEpisode.@id` → `{{SCHEMA_EPISODE_ID}}`, `PodcastEpisode.name` → `{{SCHEMA_EPISODE_NAME}}`, `PodcastEpisode.description` → `{{SCHEMA_EPISODE_DESCRIPTION}}`, `PodcastEpisode.datePublished` → `{{SCHEMA_EPISODE_DATE}}`, `PodcastEpisode.episodeNumber` → `{{SCHEMA_EPISODE_NUMBER}}`, `PodcastEpisode.partOfSeries.@id` → `{{SCHEMA_PODCAST_SERIES_ID}}`, `PodcastEpisode.associatedMedia.@id` → `{{SCHEMA_AUDIO_ID}}`.
- **Associated nodes (only if real):** `AudioObject_if_actual_audio`, `PodcastSeries_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-21 — Audio Content (`AudioObject`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="AudioObject">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=AudioObject`; OG `og:type=website`; relationship: ItemPage.mainEntity → AudioObject.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `AudioObject`: `AudioObject.@id` → `{{SCHEMA_AUDIO_ID}}`, `AudioObject.name` → `{{SCHEMA_AUDIO_NAME}}`, `AudioObject.description` → `{{SCHEMA_AUDIO_DESCRIPTION}}`, `AudioObject.contentUrl` → `{{SCHEMA_AUDIO_URL}}`, `AudioObject.embedUrl` → `{{SCHEMA_AUDIO_EMBED_URL}}`, `AudioObject.encodingFormat` → `{{SCHEMA_AUDIO_MIME}}`, `AudioObject.duration` → `{{SCHEMA_AUDIO_DURATION}}`, `AudioObject.uploadDate` → `{{SCHEMA_AUDIO_UPLOAD_DATE}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-22 — Entertainment News (`NewsArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="NewsArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=NewsArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → NewsArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `NewsArticle`: `NewsArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `NewsArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `NewsArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `NewsArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `NewsArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `NewsArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `NewsArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `NewsArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `NewsArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-23 — Review (`Review`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="Review">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Review`; OG `og:type=article`; relationship: WebPage.mainEntity → Review.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Review`: `Review.@id` → `{{SCHEMA_REVIEW_ID}}`, `Review.name` → `{{SCHEMA_REVIEW_TITLE}}`, `Review.reviewBody` → `{{SCHEMA_REVIEW_BODY}}`, `Review.author.@id` → `{{SCHEMA_REVIEW_AUTHOR_ID}}`, `Review.datePublished` → `{{SCHEMA_REVIEW_DATE}}`, `Review.itemReviewed.@id` → `{{SCHEMA_REVIEW_SUBJECT_ID}}`, `Review.reviewRating.ratingValue` → `{{SCHEMA_REVIEW_RATING}}`, `Review.reviewRating.bestRating` → `{{SCHEMA_REVIEW_BEST_RATING}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `reviewed_item_entity_must_match_topic`.
- **Special guardrail:** Review.itemReviewed requires a real, correctly typed target; do not assume it is the publishing website.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-24 — Feature Article (`Article`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="Article">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 11-25 — Entertainment Event (`Event`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="entertainment"
      data-cms-seo-type="Event">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Event`; OG `og:type=website`; relationship: WebPage.mainEntity → Event.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Event`: `Event.@id` → `{{SCHEMA_EVENT_ID}}`, `Event.name` → `{{SCHEMA_EVENT_NAME}}`, `Event.description` → `{{SCHEMA_EVENT_DESCRIPTION}}`, `Event.startDate` → `{{SCHEMA_EVENT_START}}`, `Event.endDate` → `{{SCHEMA_EVENT_END}}`, `Event.eventStatus` → `{{SCHEMA_EVENT_STATUS}}`, `Event.eventAttendanceMode` → `{{SCHEMA_EVENT_ATTENDANCE_MODE}}`, `Event.location.@id` → `{{SCHEMA_EVENT_LOCATION_ID}}`, `Event.organizer.@id` → `{{SCHEMA_EVENT_ORGANIZER_ID}}`, `Event.offers[].@id` → `{{SCHEMA_EVENT_OFFER_ID}}`, `Event.performer[].@id` → `{{SCHEMA_EVENT_PERFORMER_ID}}`, `Event.image[]` → `{{SCHEMA_EVENT_IMAGE}}`.
- **Associated nodes (only if real):** `Place_or_VirtualLocation_if_real`, `Organization_if_real`, `Offer_if_tickets_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

### 12 — Travel / Tourism (`travel`) — 28 page types
| ID | Page type | CMS key | Page schema | Entity | OG type | Property profiles |
|---|---|---|---|---|---|---|
| 12-01 | Travel Homepage | `homepage` | `WebPage` | `WebSite` | `website` | `WebPage` + `WebSite` |
| 12-02 | Destinations Directory | `travel-destinations` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 12-03 | Destination Detail | `TouristDestination` | `ItemPage` | `TouristDestination` | `website` | `WebPage` + `ItemPage` + `TouristDestination` |
| 12-04 | Attraction Detail | `TouristAttraction` | `ItemPage` | `TouristAttraction` | `website` | `WebPage` + `ItemPage` + `TouristAttraction` |
| 12-05 | Travel Guides Index | `travel-guides` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 12-06 | Trip Itineraries Index | `travel-itineraries` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 12-07 | Hotel Directory | `travel-hotels` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 12-08 | Restaurant Directory | `travel-restaurants` | `CollectionPage` | `ItemList` | `website` | `WebPage` + `CollectionPage` + `ItemList` |
| 12-09 | About Travel Site | `AboutPage` | `AboutPage` | `none` | `website` | `WebPage` + `AboutPage` |
| 12-10 | Contact | `ContactPage` | `ContactPage` | `none` | `website` | `WebPage` + `ContactPage` |
| 12-11 | Tourist Itinerary | `TouristTrip` | `ItemPage` | `TouristTrip` | `website` | `WebPage` + `ItemPage` + `TouristTrip` |
| 12-12 | Trip Detail | `Trip` | `ItemPage` | `Trip` | `website` | `WebPage` + `ItemPage` + `Trip` |
| 12-13 | Tour / Travel Service | `Service` | `ItemPage` | `Service` | `website` | `WebPage` + `ItemPage` + `Service` |
| 12-14 | Travel Package | `travel-package` | `ItemPage` | `TouristTrip` | `website` | `WebPage` + `ItemPage` + `TouristTrip` |
| 12-15 | Hotel Detail | `Hotel` | `ItemPage` | `Hotel` | `website` | `WebPage` + `ItemPage` + `Hotel` |
| 12-16 | Accommodation Detail | `Accommodation` | `ItemPage` | `Accommodation` | `website` | `WebPage` + `ItemPage` + `Accommodation` |
| 12-17 | Restaurant Detail | `Restaurant` | `ItemPage` | `Restaurant` | `website` | `WebPage` + `ItemPage` + `Restaurant` |
| 12-18 | Flight Information | `Flight` | `ItemPage` | `Flight` | `website` | `WebPage` + `ItemPage` + `Flight` |
| 12-19 | Event / Activity | `Event` | `WebPage` | `Event` | `website` | `WebPage` + `Event` |
| 12-20 | Destination Guide Article | `travel-destination-guide` | `WebPage` | `Article` | `article` | `WebPage` + `Article` |
| 12-21 | Travel Blog Post | `BlogPosting` | `WebPage` | `BlogPosting` | `article` | `WebPage` + `BlogPosting` |
| 12-22 | Travel News | `NewsArticle` | `WebPage` | `NewsArticle` | `article` | `WebPage` + `NewsArticle` |
| 12-23 | Travel Tutorial | `HowTo` | `WebPage` | `HowTo` | `article` | `WebPage` + `HowTo` |
| 12-24 | Travel Review | `Review` | `WebPage` | `Review` | `article` | `WebPage` + `Review` |
| 12-25 | Travel Image Gallery | `ImageGallery` | `ImageGallery` | `none` | `website` | `WebPage` + `ImageGallery` |
| 12-26 | Travel Video | `travel-video` | `WebPage` | `VideoObject` | `video.other` | `WebPage` + `VideoObject` |
| 12-27 | FAQ Page | `FAQPage` | `FAQPage` | `Question` | `website` | `WebPage` + `FAQPage` + `Question` |
| 12-28 | Booking Information | `travel-booking-info` | `WebPage` | `none` | `website` | `WebPage` |

#### 12-01 — Travel Homepage (`homepage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="homepage">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=WebSite`; OG `og:type=website`; relationship: WebPage.mainEntity → WebSite.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S40_site_search`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `WebSite`: `WebSite.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebSite.url` → `{{SCHEMA_WEBSITE_URL}}`, `WebSite.name` → `{{SCHEMA_WEBSITE_NAME}}`, `WebSite.description` → `{{SCHEMA_WEBSITE_DESCRIPTION}}`, `WebSite.inLanguage` → `{{SCHEMA_WEBSITE_LANGUAGE}}`, `WebSite.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `WebSite.potentialAction.@id` → `{{SCHEMA_SITE_SEARCH_ACTION_ID}}`.
- **Associated nodes (only if real):** `Organization_or_Person_if_verified`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-02 — Destinations Directory (`travel-destinations`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-destinations">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-03 — Destination Detail (`TouristDestination`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="TouristDestination">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=TouristDestination`; OG `og:type=website`; relationship: ItemPage.mainEntity → TouristDestination.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `TouristDestination`: `TouristDestination.@id` → `{{SCHEMA_DESTINATION_ID}}`, `TouristDestination.name` → `{{SCHEMA_DESTINATION_NAME}}`, `TouristDestination.description` → `{{SCHEMA_DESTINATION_DESCRIPTION}}`, `TouristDestination.image[]` → `{{SCHEMA_DESTINATION_IMAGE}}`, `TouristDestination.geo.latitude` → `{{SCHEMA_DESTINATION_LAT}}`, `TouristDestination.geo.longitude` → `{{SCHEMA_DESTINATION_LON}}`, `TouristDestination.containsPlace[].@id` → `{{SCHEMA_DESTINATION_PLACE_ID}}`, `TouristDestination.touristType` → `{{SCHEMA_DESTINATION_TOURIST_TYPE}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-04 — Attraction Detail (`TouristAttraction`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="TouristAttraction">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=TouristAttraction`; OG `og:type=website`; relationship: ItemPage.mainEntity → TouristAttraction.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `TouristAttraction`: `TouristAttraction.@id` → `{{SCHEMA_ATTRACTION_ID}}`, `TouristAttraction.name` → `{{SCHEMA_ATTRACTION_NAME}}`, `TouristAttraction.description` → `{{SCHEMA_ATTRACTION_DESCRIPTION}}`, `TouristAttraction.image[]` → `{{SCHEMA_ATTRACTION_IMAGE}}`, `TouristAttraction.address.addressLocality` → `{{SCHEMA_ADDRESS_CITY}}`, `TouristAttraction.geo.latitude` → `{{SCHEMA_GEO_LAT}}`, `TouristAttraction.geo.longitude` → `{{SCHEMA_GEO_LON}}`, `TouristAttraction.isAccessibleForFree` → `{{SCHEMA_ATTRACTION_FREE}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-05 — Travel Guides Index (`travel-guides`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-guides">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-06 — Trip Itineraries Index (`travel-itineraries`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-itineraries">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-07 — Hotel Directory (`travel-hotels`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-hotels">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-08 — Restaurant Directory (`travel-restaurants`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-restaurants">
```

- **Mappings:** page `@type=CollectionPage`; main entity `@type=ItemList`; OG `og:type=website`; relationship: CollectionPage.mainEntity → ItemList.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `CollectionPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `CollectionPage.@type` → `CollectionPage`, `CollectionPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-09 — About Travel Site (`AboutPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="AboutPage">
```

- **Mappings:** page `@type=AboutPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `AboutPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `AboutPage.@type` → `AboutPage`, `AboutPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-10 — Contact (`ContactPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="ContactPage">
```

- **Mappings:** page `@type=ContactPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ContactPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ContactPage.@type` → `ContactPage`, `ContactPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-11 — Tourist Itinerary (`TouristTrip`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="TouristTrip">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=TouristTrip`; OG `og:type=website`; relationship: ItemPage.mainEntity → TouristTrip.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `TouristTrip`: `TouristTrip.@id` → `{{SCHEMA_TRIP_ID}}`, `TouristTrip.name` → `{{SCHEMA_TRIP_NAME}}`, `TouristTrip.description` → `{{SCHEMA_TRIP_DESCRIPTION}}`, `TouristTrip.itinerary[].@id` → `{{SCHEMA_TRIP_STOP_ID}}`, `TouristTrip.provider.@id` → `{{SCHEMA_TRIP_PROVIDER_ID}}`, `TouristTrip.touristType` → `{{SCHEMA_TRIP_TOURIST_TYPE}}`, `TouristTrip.departureTime` → `{{SCHEMA_TRIP_DEPARTURE}}`, `TouristTrip.arrivalTime` → `{{SCHEMA_TRIP_ARRIVAL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-12 — Trip Detail (`Trip`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Trip">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Trip`; OG `og:type=website`; relationship: ItemPage.mainEntity → Trip.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Trip`: `Trip.@id` → `{{SCHEMA_TRIP_ID}}`, `Trip.name` → `{{SCHEMA_TRIP_NAME}}`, `Trip.description` → `{{SCHEMA_TRIP_DESCRIPTION}}`, `Trip.itinerary[].@id` → `{{SCHEMA_TRIP_STOP_ID}}`, `Trip.provider.@id` → `{{SCHEMA_TRIP_PROVIDER_ID}}`, `Trip.departureTime` → `{{SCHEMA_TRIP_DEPARTURE}}`, `Trip.arrivalTime` → `{{SCHEMA_TRIP_ARRIVAL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-13 — Tour / Travel Service (`Service`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Service">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Service`; OG `og:type=website`; relationship: ItemPage.mainEntity → Service.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Service`: `Service.@id` → `{{SCHEMA_SERVICE_ID}}`, `Service.name` → `{{SCHEMA_SERVICE_NAME}}`, `Service.description` → `{{SCHEMA_SERVICE_DESCRIPTION}}`, `Service.serviceType` → `{{SCHEMA_SERVICE_TYPE}}`, `Service.provider.@id` → `{{SCHEMA_SERVICE_PROVIDER_ID}}`, `Service.areaServed[]` → `{{SCHEMA_SERVICE_AREA_SERVED}}`, `Service.offers[].@id` → `{{SCHEMA_SERVICE_OFFER_ID}}`, `Service.availableChannel` → `{{SCHEMA_SERVICE_CHANNEL}}`.
- **Associated nodes (only if real):** `Organization_or_Person_for_provider_if_real`, `Offer_if_real`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-14 — Travel Package (`travel-package`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-package">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=TouristTrip`; OG `og:type=website`; relationship: ItemPage.mainEntity → TouristTrip.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `TouristTrip`: `TouristTrip.@id` → `{{SCHEMA_TRIP_ID}}`, `TouristTrip.name` → `{{SCHEMA_TRIP_NAME}}`, `TouristTrip.description` → `{{SCHEMA_TRIP_DESCRIPTION}}`, `TouristTrip.itinerary[].@id` → `{{SCHEMA_TRIP_STOP_ID}}`, `TouristTrip.provider.@id` → `{{SCHEMA_TRIP_PROVIDER_ID}}`, `TouristTrip.touristType` → `{{SCHEMA_TRIP_TOURIST_TYPE}}`, `TouristTrip.departureTime` → `{{SCHEMA_TRIP_DEPARTURE}}`, `TouristTrip.arrivalTime` → `{{SCHEMA_TRIP_ARRIVAL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-15 — Hotel Detail (`Hotel`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Hotel">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Hotel`; OG `og:type=website`; relationship: ItemPage.mainEntity → Hotel.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Hotel`: `Hotel.@id` → `{{SCHEMA_HOTEL_ID}}`, `Hotel.name` → `{{SCHEMA_HOTEL_NAME}}`, `Hotel.description` → `{{SCHEMA_HOTEL_DESCRIPTION}}`, `Hotel.image[]` → `{{SCHEMA_HOTEL_IMAGES}}`, `Hotel.address.streetAddress` → `{{SCHEMA_ADDRESS_STREET}}`, `Hotel.address.addressLocality` → `{{SCHEMA_ADDRESS_CITY}}`, `Hotel.address.addressCountry` → `{{SCHEMA_ADDRESS_COUNTRY}}`, `Hotel.telephone` → `{{SCHEMA_HOTEL_PHONE}}`, `Hotel.starRating.ratingValue` → `{{SCHEMA_HOTEL_STARS}}`, `Hotel.amenityFeature[].name` → `{{SCHEMA_HOTEL_AMENITY}}`, `Hotel.checkinTime` → `{{SCHEMA_HOTEL_CHECKIN}}`, `Hotel.checkoutTime` → `{{SCHEMA_HOTEL_CHECKOUT}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-16 — Accommodation Detail (`Accommodation`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Accommodation">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Accommodation`; OG `og:type=website`; relationship: ItemPage.mainEntity → Accommodation.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Accommodation`: `Accommodation.@id` → `{{SCHEMA_ACCOMMODATION_ID}}`, `Accommodation.name` → `{{SCHEMA_ACCOMMODATION_NAME}}`, `Accommodation.description` → `{{SCHEMA_ACCOMMODATION_DESCRIPTION}}`, `Accommodation.floorSize.value` → `{{SCHEMA_ACCOMMODATION_SIZE}}`, `Accommodation.floorSize.unitCode` → `{{SCHEMA_ACCOMMODATION_SIZE_UNIT}}`, `Accommodation.numberOfRooms` → `{{SCHEMA_ACCOMMODATION_ROOMS}}`, `Accommodation.amenityFeature[].name` → `{{SCHEMA_ACCOMMODATION_AMENITY}}`, `Accommodation.occupancy.value` → `{{SCHEMA_ACCOMMODATION_OCCUPANCY}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-17 — Restaurant Detail (`Restaurant`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Restaurant">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Restaurant`; OG `og:type=website`; relationship: ItemPage.mainEntity → Restaurant.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Restaurant`: `Restaurant.@id` → `{{SCHEMA_RESTAURANT_ID}}`, `Restaurant.name` → `{{SCHEMA_RESTAURANT_NAME}}`, `Restaurant.description` → `{{SCHEMA_RESTAURANT_DESCRIPTION}}`, `Restaurant.servesCuisine[]` → `{{SCHEMA_RESTAURANT_CUISINE}}`, `Restaurant.hasMenu` → `{{SCHEMA_RESTAURANT_MENU}}`, `Restaurant.acceptsReservations` → `{{SCHEMA_RESTAURANT_RESERVATIONS}}`, `Restaurant.telephone` → `{{SCHEMA_RESTAURANT_PHONE}}`, `Restaurant.address.streetAddress` → `{{SCHEMA_ADDRESS_STREET}}`, `Restaurant.address.addressLocality` → `{{SCHEMA_ADDRESS_CITY}}`, `Restaurant.openingHoursSpecification[].opens` → `{{SCHEMA_OPENS}}`, `Restaurant.openingHoursSpecification[].closes` → `{{SCHEMA_CLOSES}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-18 — Flight Information (`Flight`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Flight">
```

- **Mappings:** page `@type=ItemPage`; main entity `@type=Flight`; OG `og:type=website`; relationship: ItemPage.mainEntity → Flight.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ItemPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ItemPage.@type` → `ItemPage`, `ItemPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - main_entity `Flight`: `Flight.@id` → `{{SCHEMA_FLIGHT_ID}}`, `Flight.flightNumber` → `{{SCHEMA_FLIGHT_NUMBER}}`, `Flight.airline.@id` → `{{SCHEMA_AIRLINE_ID}}`, `Flight.departureAirport.@id` → `{{SCHEMA_DEPARTURE_AIRPORT_ID}}`, `Flight.arrivalAirport.@id` → `{{SCHEMA_ARRIVAL_AIRPORT_ID}}`, `Flight.departureTime` → `{{SCHEMA_FLIGHT_DEPARTURE}}`, `Flight.arrivalTime` → `{{SCHEMA_FLIGHT_ARRIVAL}}`, `Flight.aircraft` → `{{SCHEMA_FLIGHT_AIRCRAFT}}`.
- **Special guardrail:** Flight markup describes an actual flight; do not infer schedules or seat availability.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-19 — Event / Activity (`Event`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Event">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Event`; OG `og:type=website`; relationship: WebPage.mainEntity → Event.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Event`: `Event.@id` → `{{SCHEMA_EVENT_ID}}`, `Event.name` → `{{SCHEMA_EVENT_NAME}}`, `Event.description` → `{{SCHEMA_EVENT_DESCRIPTION}}`, `Event.startDate` → `{{SCHEMA_EVENT_START}}`, `Event.endDate` → `{{SCHEMA_EVENT_END}}`, `Event.eventStatus` → `{{SCHEMA_EVENT_STATUS}}`, `Event.eventAttendanceMode` → `{{SCHEMA_EVENT_ATTENDANCE_MODE}}`, `Event.location.@id` → `{{SCHEMA_EVENT_LOCATION_ID}}`, `Event.organizer.@id` → `{{SCHEMA_EVENT_ORGANIZER_ID}}`, `Event.offers[].@id` → `{{SCHEMA_EVENT_OFFER_ID}}`, `Event.performer[].@id` → `{{SCHEMA_EVENT_PERFORMER_ID}}`, `Event.image[]` → `{{SCHEMA_EVENT_IMAGE}}`.
- **Associated nodes (only if real):** `Place_or_VirtualLocation_if_real`, `Organization_if_real`, `Offer_if_tickets_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-20 — Destination Guide Article (`travel-destination-guide`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-destination-guide">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Article`; OG `og:type=article`; relationship: WebPage.mainEntity → Article.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Article`: `Article.@id` → `{{SCHEMA_ARTICLE_ID}}`, `Article.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `Article.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `Article.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `Article.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `Article.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `Article.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `Article.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `Article.articleBody` → `{{SCHEMA_ARTICLE_BODY}}`, `Article.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `Article.keywords[]` → `{{SCHEMA_ARTICLE_KEYWORDS}}`, `Article.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-21 — Travel Blog Post (`BlogPosting`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="BlogPosting">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=BlogPosting`; OG `og:type=article`; relationship: WebPage.mainEntity → BlogPosting.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `BlogPosting`: `BlogPosting.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `BlogPosting.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `BlogPosting.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `BlogPosting.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `BlogPosting.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `BlogPosting.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `BlogPosting.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `BlogPosting.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `BlogPosting.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `BreadcrumbList_if_breadcrumbs_exist`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-22 — Travel News (`NewsArticle`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="NewsArticle">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=NewsArticle`; OG `og:type=article`; relationship: WebPage.mainEntity → NewsArticle.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`, `S36_references`, `S38_editorial`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `NewsArticle`: `NewsArticle.headline` → `{{SCHEMA_ARTICLE_HEADLINE}}`, `NewsArticle.description` → `{{SCHEMA_ARTICLE_DESCRIPTION}}`, `NewsArticle.image[]` → `{{SCHEMA_ARTICLE_IMAGE}}`, `NewsArticle.author[].@id` → `{{SCHEMA_ARTICLE_AUTHOR_ID}}`, `NewsArticle.datePublished` → `{{SCHEMA_ARTICLE_PUBLISHED}}`, `NewsArticle.dateModified` → `{{SCHEMA_ARTICLE_MODIFIED}}`, `NewsArticle.publisher.@id` → `{{SCHEMA_PUBLISHER_ID}}`, `NewsArticle.articleSection` → `{{SCHEMA_ARTICLE_SECTION}}`, `NewsArticle.mainEntityOfPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `Organization_for_publisher_if_real`, `ImageObject_if_images_exist`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-23 — Travel Tutorial (`HowTo`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="HowTo">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=HowTo`; OG `og:type=article`; relationship: WebPage.mainEntity → HowTo.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `HowTo`: `HowTo.name` → `{{SCHEMA_HOWTO_NAME}}`, `HowTo.description` → `{{SCHEMA_HOWTO_DESCRIPTION}}`, `HowTo.step[].name` → `{{SCHEMA_HOWTO_STEP_NAME}}`, `HowTo.step[].text` → `{{SCHEMA_HOWTO_STEP_TEXT}}`, `HowTo.step[].url` → `{{SCHEMA_HOWTO_STEP_URL}}`, `HowTo.totalTime` → `{{SCHEMA_HOWTO_TOTAL_TIME}}`, `HowTo.tool[].name` → `{{SCHEMA_HOWTO_TOOL}}`, `HowTo.supply[].name` → `{{SCHEMA_HOWTO_SUPPLY}}`.
- **Special guardrail:** Schema.org vocabulary remains valid even though Google feature support is limited/retired. Do not claim rich-result guarantee.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-24 — Travel Review (`Review`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="Review">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=Review`; OG `og:type=article`; relationship: WebPage.mainEntity → Review.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `article:published_time`, `article:modified_time`, `article:expiration_time`, `article:author`, `article:section`, `article:tag`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `Review`: `Review.@id` → `{{SCHEMA_REVIEW_ID}}`, `Review.name` → `{{SCHEMA_REVIEW_TITLE}}`, `Review.reviewBody` → `{{SCHEMA_REVIEW_BODY}}`, `Review.author.@id` → `{{SCHEMA_REVIEW_AUTHOR_ID}}`, `Review.datePublished` → `{{SCHEMA_REVIEW_DATE}}`, `Review.itemReviewed.@id` → `{{SCHEMA_REVIEW_SUBJECT_ID}}`, `Review.reviewRating.ratingValue` → `{{SCHEMA_REVIEW_RATING}}`, `Review.reviewRating.bestRating` → `{{SCHEMA_REVIEW_BEST_RATING}}`.
- **Associated nodes (only if real):** `Person_for_author_if_real`, `reviewed_item_entity_must_match_topic`.
- **Special guardrail:** Review.itemReviewed requires a real, correctly typed target; do not assume it is the publishing website.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-25 — Travel Image Gallery (`ImageGallery`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="ImageGallery">
```

- **Mappings:** page `@type=ImageGallery`; main entity `@type=none`; OG `og:type=website`; relationship: ImageGallery.hasPart → ImageObject[] (only visible media, no forced singular mainEntity).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `ImageGallery`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `ImageGallery.@type` → `ImageGallery`, `ImageGallery.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`.
  - optional_gallery_items `ItemList`: `ItemList.@id` → `{{SCHEMA_ITEMLIST_ID}}`, `ItemList.name` → `{{SCHEMA_LIST_NAME}}`, `ItemList.numberOfItems` → `{{SCHEMA_ITEM_COUNT}}`, `ItemList.itemListElement[].position` → `{{SCHEMA_LIST_POSITION}}`, `ItemList.itemListElement[].name` → `{{SCHEMA_LIST_ITEM_NAME}}`, `ItemList.itemListElement[].url` → `{{SCHEMA_LIST_ITEM_URL}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-26 — Travel Video (`travel-video`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-video">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=VideoObject`; OG `og:type=video.other`; relationship: WebPage.mainEntity → VideoObject.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **OG vertical extensions:** `video:actor` → `{{OG_VIDEO_ACTOR}}`, `video:director` → `{{OG_VIDEO_DIRECTOR}}`, `video:duration` → `{{OG_VIDEO_DURATION_SECONDS}}`, `video:release_date` → `{{OG_VIDEO_RELEASE_DATE}}`, `video:tag` → `{{OG_VIDEO_TAG}}`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
  - main_entity `VideoObject`: `VideoObject.@id` → `{{SCHEMA_VIDEO_ID}}`, `VideoObject.name` → `{{SCHEMA_VIDEO_NAME}}`, `VideoObject.description` → `{{SCHEMA_VIDEO_DESCRIPTION}}`, `VideoObject.thumbnailUrl[]` → `{{SCHEMA_VIDEO_THUMBNAIL_URL}}`, `VideoObject.uploadDate` → `{{SCHEMA_VIDEO_UPLOAD_DATE}}`, `VideoObject.duration` → `{{SCHEMA_VIDEO_DURATION}}`, `VideoObject.contentUrl` → `{{SCHEMA_VIDEO_CONTENT_URL}}`, `VideoObject.embedUrl` → `{{SCHEMA_VIDEO_EMBED_URL}}`, `VideoObject.hasPart[].@id` → `{{SCHEMA_VIDEO_CLIP_ID}}`, `VideoObject.inLanguage` → `{{SCHEMA_VIDEO_LANGUAGE}}`.
- **Associated nodes (only if real):** `ImageObject_if_actual_thumbnail`, `Clip_if_actual_chapters`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-27 — FAQ Page (`FAQPage`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="FAQPage">
```

- **Mappings:** page `@type=FAQPage`; main entity `@type=Question`; OG `og:type=website`; relationship: FAQPage.mainEntity → Question[]; Question.acceptedAnswer → Answer (real answered questions only).
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `FAQPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`, `FAQPage.@type` → `FAQPage`, `FAQPage.hasPart.@id` → `{{SCHEMA_PAGE_PART_ID}}`, `FAQPage.mainEntity[].@id` → `{{SCHEMA_FAQ_QUESTION_ID}}`.
  - main_entity `Question`: `Question.name` → `{{SCHEMA_QUESTION_TITLE}}`, `Question.text` → `{{SCHEMA_QUESTION_TEXT}}`, `Question.answerCount` → `{{SCHEMA_ANSWER_COUNT}}`, `Question.acceptedAnswer.text` → `{{SCHEMA_ACCEPTED_ANSWER_TEXT}}`, `Question.suggestedAnswer[].text` → `{{SCHEMA_SUGGESTED_ANSWER_TEXT}}`, `Question.author.@id` → `{{SCHEMA_QUESTION_AUTHOR_ID}}`.
- **Associated nodes (only if real):** `Answer_only_if_real`.
- **Special guardrail:** FAQPage has multiple actual Question/Answer entries; a single Question is only a repeatable pattern. Google FAQ rich results are restricted.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

#### 12-28 — Booking Information (`travel-booking-info`)

```html
<html lang="en"
      data-cms-seo="true"
      data-cms-website="travel"
      data-cms-seo-type="travel-booking-info">
```

- **Mappings:** page `@type=WebPage`; main entity `@type=none`; OG `og:type=website`; relationship: No mandatory mainEntity link.
- **General metadata:** all 11 approved core definition IDs (`core.*`) and all six X definition IDs (`twitter.*`) remain available. Actual applicable content must exist; no fake values.
- **OG properties:** `og:title`, `og:type`, `og:url`, `og:description`, `og:site_name`, `og:locale`, `og:locale:alternate`, `og:determiner`, `og:image`, `og:image:url`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`.
- **Advanced S35–S40 conditional capabilities:** `S35_relationships`, `S37_paywall`, `S39_speakable`.
- **Schema fields (exact property → token, grouped by graph role):**
  - page `WebPage`: `WebPage.@id` → `{{SCHEMA_WEBPAGE_ID}}`, `WebPage.mainEntity.@id` → `{{SCHEMA_MAIN_ENTITY_ID}}`, `WebPage.url` → `{{CANONICAL_URL}}`, `WebPage.name` → `{{SCHEMA_WEBPAGE_NAME}}`, `WebPage.description` → `{{SCHEMA_WEBPAGE_DESCRIPTION}}`, `WebPage.inLanguage` → `{{SCHEMA_WEBPAGE_LANGUAGE}}`, `WebPage.identifier` → `{{PAGE_ID}}`, `WebPage.isPartOf.@id` → `{{SCHEMA_WEBSITE_ID}}`, `WebPage.primaryImageOfPage.@id` → `{{SCHEMA_PRIMARY_IMAGE_ID}}`, `WebPage.about.@id` → `{{SCHEMA_ABOUT_ENTITY_ID}}`, `WebPage.breadcrumb.@id` → `{{SCHEMA_BREADCRUMB_ID}}`, `WebPage.dateModified` → `{{SCHEMA_WEBPAGE_MODIFIED}}`, `WebPage.datePublished` → `{{SCHEMA_WEBPAGE_PUBLISHED}}`.
- **Registry approval:** Proposed; not owner-selected yet. No injection mechanics approved.

## 6. Known limitations and deliberately reserved decisions

- How the injector discovers, matches, inserts and reuses existing placeholders or resolves conflicts.
- Exact PAGE_ID HTML meta-tag name, which is undecided in approved README.
- Actual placeholder values and SEO value-population workflow.
- How optional/conditional fields are presented and selected in UI.
- Any migrations or new injection behaviors beyond the 40 approved Blog Schema.org catalog entries.

**Standards and changing search features:** A valid Schema.org type or property is not a guarantee of Google rich results. Google retired the HowTo rich result, restricted FAQ rich results, retired the sitelinks search box, and removed some specialized result support; the original approved catalog stays available, but the UI must not promise search features that no longer exist. Avoid fabricated review ratings, prices, offers, job details, dates, claims, and user details.

**Mapping QA note:** This is a carefully enumerated *research candidate* property matrix. A future implementation review should validate the exact domain/range and runtime JSON-LD structure for each specialized property with Schema.org validator and the relevant search feature guides. This is **not** equivalent to independently validating 294 live pages.

## 7. Reference links (checked in research)

- [schema_hierarchy](https://schema.org/docs/full.html) — Official Schema.org vocabulary and page/entity types.
- [open_graph](https://ogp.me/) — Official Open Graph basic, article/profile/book, music and video vertical properties.
- [google_general](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) — Structured data content accuracy and quality requirements.
- [google_article](https://developers.google.com/search/docs/appearance/structured-data/article) — Article, blog and news recommendations.
- [google_product](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing) — Merchant Product and Offer field requirements where relevant.
- [google_product_variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants) — ProductGroup and variant relationships.
- [google_event](https://developers.google.com/search/docs/appearance/structured-data/event) — Event naming, dates, location and offers.
- [google_video](https://developers.google.com/search/docs/appearance/structured-data/video) — VideoObject thumbnail/upload and media properties.
- [google_course](https://developers.google.com/search/docs/appearance/structured-data/course) — Course descriptions and course list guidance.
- [google_education_qa](https://developers.google.com/search/docs/appearance/structured-data/education-qa) — Quiz and educational question markup.
- [google_job](https://developers.google.com/search/docs/appearance/structured-data/job-posting) — JobPosting metadata.
- [google_qapage](https://developers.google.com/search/docs/appearance/structured-data/qapage) — Question and answer markup.
- [google_org](https://developers.google.com/search/docs/appearance/structured-data/organization) — Organization identity fields.
- [google_local](https://developers.google.com/search/docs/appearance/structured-data/local-business) — LocalBusiness/Restaurant/Store fields.
- [google_review](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) — Review ratings and self-serving review warnings.
- [google_software](https://developers.google.com/search/docs/appearance/structured-data/software-app) — SoftwareApplication metadata.
- [google_discussion](https://developers.google.com/search/docs/appearance/structured-data/discussion-forum) — DiscussionForumPosting structure.
- [google_profile](https://developers.google.com/search/docs/appearance/structured-data/profile-page) — ProfilePage structure.
- [google_breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb) — BreadcrumbList elements.
- [google_changes](https://developers.google.com/search/blog/2025/06/simplifying-search-results) — Retired rich-result support for some types; schema remains valid.
- [google_faq_howto](https://developers.google.com/search/blog/2023/08/howto-faq-changes) — FAQ restrictions and HowTo rich-result retirement.
- [google_sitelinks](https://developers.google.com/search/blog/2024/10/sitelinks-search-box) — SearchAction is not a current Google sitelinks search box feature.
- [google_canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) — Canonical URL guidelines.
- [x_card_legacy](https://developer.x.com/en/docs/x-for-websites/cards/overview/markup) — Legacy card markup endpoint now redirects; six fields come from owner-approved README.

## 8. QA counts and import contract

- Categories: **12**; page types: **294**; unique `(website category, cms page type)` pairs: **294**.
- Original approved Blog catalog: **11 core + 25 OG + 6 X + S01–S40** retained.
- Explicit Schema.org property profiles: **78** distinct type profiles; each entry in the JSON contains resolved property arrays.
- Match `data-cms-website` + `data-cms-seo-type` **exactly**, with `data-cms-seo="true"`; never use guessed synonyms.
- For any field where facts cannot be verified, do not populate a value. This is a placeholder *catalog*, not executable injection instructions.
