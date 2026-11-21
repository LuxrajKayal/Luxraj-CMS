# Luxraj-CMS

Cloud-based CMS powered by Supabase and GitHub.

**Selected frontend architecture:** React + TypeScript + Vite, with modular feature boundaries, client-side routing, independent layouts, shared UI and controlled environment configuration. **Codex in VS Code** is the planned implementation path; all coding requires explicit phase approval.

> **Project status: Planning only.** This README records the requirements and ideas discussed with the project owner through November 19, 2026. It is not a claim that these features have been implemented or tested. Development proceeds phase by phase, only after explicit approval. Until then, the existing Luxraj Blog and older local CMS repositories remain untouched.

## 1. Product purpose and non-negotiable principles

Luxraj CMS is a **browser-first, multi-repository, branch-aware CMS** hosted as a public frontend (GitHub Pages is the initial testing target) with a secure Supabase backend. It should work from different devices without a local repository, local Git helper, or VS Code installation.

- **GitHub is the source of truth** for source code, branches, and actual commits.
- **Supabase handles** authentication, permissions, preferences, secure credential storage, and uncommitted CMS drafts/review requests.
- The CMS must be **repository-independent**. Do not hardcode Luxraj Blog folder structures, Page ID formats, metadata conventions (other than the explicitly agreed universal eligibility marker), or build pipeline assumptions into the engine.
- CMS actions must always be scoped to the **selected repository and branch**. Changes on one branch must not unintentionally affect another.
- Any tool that changes code must use the **same reviewable change workflow**. No unexpected automatic commits.
- Keep the interface practical. Plan first, implement an approved phase, and verify actual end-to-end behavior rather than equating a passing build with feature success.

## 2. Hosting and system responsibilities

| Component | Planned responsibility |
| --- | --- |
| Public GitHub Pages frontend | Login-first CMS interface, repository/branch workspace, code editor, diff viewer |
| Supabase Auth | Login, sessions, verified user identity |
| Supabase database | User roles/permissions, CMS repository registry, saved workspace preferences, drafts and reviews |
| Supabase backend secrets | GitHub App private key stored only for trusted backend code; installation identity and status live in protected Supabase database records |
| Supabase Edge Functions | Authenticate requests, authorize repository/branch actions, securely call GitHub |
| GitHub API | List authorized repositories and branches; read HTML/CSS/JS; create approved commits; read commit history |

A public frontend repository must never contain GitHub tokens, Supabase secret/service-role keys, decrypted credentials, or other private secrets. A frontend Supabase publishable key may be public when access controls are correctly configured.

**Important:** A GitHub API commit updates the remote branch directly. It does not require a separate local `git push`, and it does not update a user's local clone until they fetch/pull.

## 3. Login, roles, and first-time GitHub connection

### Login-first UI

- Before login, show **only the login page**: no dashboard, sidebar controls, repository names, or editor.
- One login page serves the Super Admin and future restricted users.
- Supabase verifies credentials. The backend determines the account role from protected authorization data, **not from a browser-provided role or a hardcoded email comparison**.
- Unauthorized/unapproved accounts do not enter the CMS. The dashboard appears only after a valid session and access check.
- Initial account onboarding is intended to be **invite-only**, not open public registration.

### Super Admin

- Exactly one primary Super Admin is planned initially: the project owner.
- Super Admin has overall CMS administration authority, including GitHub connection settings, repository management, branch selection, permissions, and approvals.
- Future authors/editors/other roles have restricted, explicitly assigned capabilities. Their exact capability matrix will be designed in a later phase.

### First-time GitHub App connection (Task 6 — approved)

**Approved method: GitHub App installation authorization, not a manually entered personal access token.** Supabase email/password remains the CMS login; connecting GitHub is a separate **Super Admin-only** privilege.

1. The Super Admin signs in to Luxraj CMS and a trusted backend check verifies their `super_admin` assignment.
2. If no verified GitHub App installation is linked, show a **Connect GitHub** action instead of a token-entry form.
3. The Admin approves installation of the Luxraj CMS GitHub App for their GitHub user or organization and chooses **selected repositories**. A protected Supabase Edge Function handles the setup callback, validates one-time anti-CSRF state, checks the currently authorized Super Admin, and verifies the actual installation and GitHub owner before linking it; never trust URL parameters alone.
4. Store installation ID, GitHub owner, connection status, and available repository scope in protected Supabase database records. Store the GitHub App private key only in protected Supabase Edge Function secrets, never in the browser or public source.
5. After successful verification, open the Dashboard. On later CMS logins or other devices, reuse the verified installation record: **do not require repeat GitHub authorization** while the installation remains valid. The backend mints **short-lived installation access tokens** when needed.
6. Only the Super Admin can manage **Settings → GitHub Connection**: view connected status/owner, inspect or manage repository scope, reconnect when necessary, and **Disconnect GitHub**.
7. On Disconnect, immediately stop CMS use of the installation, and use an authenticated GitHub App uninstall request to revoke GitHub-side access. If GitHub-side uninstall cannot be confirmed, clearly report that revocation is incomplete and offer the GitHub installation settings page rather than falsely showing full revocation.

**Security rules:**

- GitHub App linking, configuration changes, and disconnection are **Super Admin-only**, enforced by Supabase backend authorization, not just UI navigation.
- Apply least-privilege GitHub App permissions (repository Contents read/write for planned editing; Metadata read) and default to selected repositories. The installation's scope is authoritative; do not assume all repositories are accessible.
- Each future repository/branch operation must independently verify the CMS user's server-side permissions and the currently valid installation/repository scope; restricted users never manage the GitHub App connection.
- Never put the GitHub App private key, installation tokens, Supabase secret/service-role keys, or other credentials into frontend code, public environment files, browser storage, redirected URLs, API responses, or logs.
- Handle app uninstall/suspension, revoked permissions, and repository selection changes; require reconnection when an installation is invalid.
- The installation/setup callback must be served by a trusted backend endpoint compatible with GitHub Pages and the frontend's hash router.

## 4. Super Admin dashboard and navigation

Planned left sidebar:

1. **Dashboard** — current workspace summary and relevant connection status.
2. **Repositories** — discover, add/manage, and select CMS working repositories.
3. **Code Editor** — HTML/CSS/JS file browsing and editing.
4. **Source Control** — uncommitted changes, code diffs, commit history and file comparisons.
5. **Metadata Injector** — the staged HTML eligibility/placeholder workflow specified below.
6. **Users & Permissions** — future user invitations and repository/branch access assignments.
7. **Pending Reviews** — future author-submitted changes awaiting Super Admin approval.
8. **Settings** — GitHub connection and account/workspace settings.
9. **Logout**.

This is a **proposed navigation map**, not a promise to implement every section in the first phase.

## 5. Repositories, branches, and saved preferences

### Repository Selection

- Clicking **Repositories** in the sidebar opens a viewport listing the GitHub repositories accessible through the configured credential and/or added to the CMS.
- Super Admin chooses the working repository there; repository choice is **not a permanent part of first-time token initialization**.
- Super Admin can register/manage multiple repositories without reconnecting the token for each one (within token permissions).
- Supabase remembers the user's **last selected repository** and restores it across browser sessions and devices.
- Repository preferences are stored **per user**, not globally; other users must not overwrite the Super Admin's choice.
- An inaccessible, removed, or unauthorized saved repository must not be reopened automatically.

### Branch Selection

- Once a repository is chosen, show its available GitHub branches.
- Super Admin can select any authorized branch and work **directly against that remote branch**, without switching local Git checkouts.
- The selected repository and branch must be visible throughout editing, metadata operations, reviews, and commits.
- Supabase may remember the last selected branch for each repository and user, provided access is revalidated on return.
- Every save/commit operation must validate repository, branch, user authorization, and the expected source version. Never silently overwrite newer remote work.

### Future user access assignments

- From a selected repository's branch-management viewport, Super Admin can assign specific branches to other users.
- A restricted user should see and access **only explicitly authorized repositories and branches**.
- Hidden UI alone is not security: each backend file read, draft operation, and commit/review action must enforce repository/branch permissions.
- Full user invitation, editing-rights granularity, approval powers, and revocation rules are **later-phase designs**.

## 6. Code Editor and Source Control

The CMS should have a VS Code-style code inspection experience, **not necessarily a full embedded VS Code application**.

### Code Editor

- Use a browser editor such as **Monaco** for HTML, CSS, and JavaScript, with syntax highlighting and useful editing capabilities.
- Browse and open source files from the selected repository and branch.
- Support code-level inspection even when a user **does not intend to commit from the editor**.
- Manual code edits and changes prepared by automated CMS modules should enter a common reviewable draft/change system.

### Source Control and review

- **Before commit:** list modified files, show side-by-side or inline before/after code diffs, and allow the Super Admin to inspect proposed changes.
- **After commit:** list GitHub commit history for the selected branch, including commit metadata, changed files, and code-level diffs.
- Support file-level history/comparison so the Super Admin can check the exact lines changed by the Metadata Injector or another CMS tool.
- A commit created in the CMS is visible in GitHub history; commits made externally and pushed to GitHub also appear.
- Approved changes are committed directly to the **selected remote GitHub branch only**, respecting GitHub branch protection and concurrency constraints.
- Existing remote file versions/SHAs must be rechecked before committing stale drafts.

**Shared change workflow:** Prepare edit(s) → save draft/change set to Supabase → inspect changed files/diffs in Source Control → explicit authorized commit. GitHub remains unchanged until the commit is approved and successfully created.

### Tasks 13–14 — Source Control interface destination and behavior (implementation plan)

**Owner-selected UI direction:** Keep the existing Code Editor layout: repository file tree on the left, Monaco editor/diff in the center, and the existing independently collapsible **Source Control panel on the right**. Do **not** introduce another top-level module or redesign the editor. Use two views inside that right panel: **Changes** (Task 13) and **History** (Task 14). Keep existing draft review and the standalone Source Control route usable; prioritize the integrated Code Editor workflow.

#### Task 13 — Changes tab and explicit commit

- Retain the existing saved changed-file list and inline opening of the proposed Monaco diff in the **center editor area**. Unsaved browser buffers are not themselves GitHub commits; preserve them during diff review, switching tabs, success, and failure.
- Beneath the changed-file list, offer a **commit message** field and a **Review & Commit** action. Only explicitly reviewed/selected saved draft changes from the current repository and branch may be submitted; clearly list the files included. Do not imply that all unsaved buffers or drafts from other branches will be committed.
- The action must open a final **confirmation dialog** displaying the exact target repository, target branch, filenames, and commit message. **Cancel** makes no GitHub change. Never commit automatically on save, on tab switching, or by opening Source Control.
- A trusted Supabase Edge Function must verify the authenticated Super Admin, live GitHub App repository access, selected branch, expected original file/blob versions, and remote branch state again at commit time. Detect stale/conflicting files and concurrent branch-head changes, refuse unsafe overwrites, and report actionable conflicts. Honor branch protection; do not bypass GitHub errors. Keep installation tokens and write operations off the public frontend.
- Commit the approved change set as one GitHub commit to **only** the explicitly confirmed branch when possible; do not partially apply a multi-file change set silently. On success show the resulting commit SHA/link and refresh Source Control/history. **Do not auto-delete Supabase drafts**: retain them for Settings → Draft Management, with a committed-state distinction when reliably available. On failure, keep drafts and unsaved edits available for recovery.

#### Task 14 — History tab and Git Commit Graph

- The **History** tab inside the same right Source Control panel shows a **Git Commit Graph** (also called Git History Graph), modeled on VS Code's branch/commit graph rather than a plain text-only history list.
- Render actual commit topology using GitHub commit and parent metadata: commit dots, colored graph lanes/lines, splits and merge connections when present, and accurate branch/ref labels **only for refs actually known**. A linear history may legitimately be a single vertical line; do not manufacture branches or pretend the browser has local Git branches.
- Alongside the graph show concise commit messages and helpful metadata (author, date, abbreviated SHA), scoped to the active repository/branch, with refresh and incremental loading/pagination for longer histories. Include commits made both through Luxraj CMS and externally on GitHub/VS Code.
- Selecting a commit reveals its metadata and changed-file list. Selecting a changed file opens its **committed before/after code diff in the existing center Monaco editor area**, without losing unsaved editing buffers. Show added, modified, deleted, and renamed files accurately where supported; explain unsupported/binary or unavailable diffs instead of showing misleading code.
- Commit-history reads, file listings, and diff retrieval also go through authorized backend requests, enforcing repository access. The graph represents GitHub remote data; changing the viewed commit must **not** switch the saved workspace branch or modify GitHub.

#### Scope, integration and tests

- Reuse the existing workspace selection, draft/change-set services, Monaco diff component, GitHub App installation connection, and Supabase authorization. Avoid duplicate commit implementations for later Metadata Injector features.
- Preserve the current file Explorer, topbar workspace indicator, repository-switch confirmation, Source Control panel collapse/focus behavior, drafts and Settings storage policy. Use responsive layout so the graph and diffs remain usable on smaller screens.
- Test: confirming/cancelling commits, authorized versus denied writes, precise repository/branch targeting, multi-file consistency, conflicts from externally updated files or moved branch heads, protected branches, draft retention and unsaved-buffer safety; then history graph ordering/topology (including merges), external commits, paging, clicked commit/file diffs, and successful return to an active editor.
- **Documentation is not implementation approval.** Build/deploy/backend changes require the owner's separate explicit authorization. The owner must verify the complete edit → draft → diff → confirm → commit → graph → committed-diff workflow on a safe test branch before Tasks 13–14 are accepted.


## 7. Metadata Injector — category templates, page types, and placeholder injection

**Status: requirements/planning specification, not implemented.** Metadata Injector is a left-sidebar feature opened in the viewport for the **currently selected GitHub repository and branch**. The engine works across unrelated website repositories; it does not assume Luxraj Blog's file hierarchy or build process.

### 7.1 Template architecture — independent copies, NOT shared inheritance

- The **Blog & Publishing** category is the first approved reference template.
- **At initial setup**, copy its complete placeholder structure into the other website category templates (e.g., E-commerce, Business, News, Portfolio, Education, Software, and other planned categories).
- After copying, **each category owns its own independent snapshot of placeholders, schema configurations, and injection rules**. These are **not** live references to one eternal shared Blog template. Changing Blog later **does not update** E-commerce, and changing E-commerce **does not affect** Blog.
- Reuse a **single generic injection engine** to apply those independent category configurations; do not duplicate or hardcode the entire engine for each repository.
- Category selections and relevant preferences must be scoped to the selected repository/branch, rather than applied globally to unrelated projects.
- The specifics of other categories can be customized **later**, independently. Do not infer that another category must use Blog-specific schema forever.

### 7.2 Agreed workflow in the same viewport

**Category choice → Step 1: SEO-eligible HTML selection → Step 2: Page Type assignment/injection → Step 3: Placeholder verification/injection → Source Control review → explicit GitHub commit.**

**Step 1 — SEO eligibility**

The Admin **manually** adds this custom attribute in the Code Editor to pages that may enter the metadata workflow:

```html
<html data-seo="true">
```

- `data-seo="true"` is **only an eligibility test**. It does **not** mean the page automatically qualifies for indexing or Google ranking, and **the Metadata Injector must never add or modify this attribute**.
- Scan the chosen repository/branch's HTML pages, irrespective of folder layout; show only matching pages in the eligibility dropdown.
- Support **Select All**, manual selections, deselection, **Cancel**, and **Save Selection**.
- Save the selected eligible files as preferences in Supabase, scoped to repository and branch, and restore them later.
- Only saved, still-eligible files progress to Step 2; a removed eligibility marker cannot be overridden by an old saved selection.
- Unlock the next step only after Step 1 preferences have been saved.

**Step 2 — Page Type assignment and injection (a separate stage before metadata placeholders)**

- The Admin assigns page types using a **page-type dropdown for individual HTML files or whole folders**. Assigning a folder applies to eligible HTML files inside that folder, avoiding repetitive file-by-file work.
- Example choices: `site/index.html` → `WebSite`; files in `site/articles/` → `BlogPosting`. These paths are illustrative; **no folder names are hardcoded**.
- The accepted page-type values should use **official Schema.org type names**, rather than assuming that earlier informal examples like lowercase `article` were final.
- The CMS injects a custom attribute into the existing opening `<html>` tag, without disturbing other attributes:

```html
<html data-seo="true" data-page-type="BlogPosting">
```

- The CMS **does** inject `data-page-type` as the Admin directs, but **does not** inject `data-seo`.
- If a page or folder does not have an approved type assignment, do not invent its type. The exact full dropdown taxonomy, assignment conflicts/overrides, and treatment of already-present values can be finalized during implementation planning.
- The resulting code changes remain subject to review before a GitHub commit.

**Step 3 — Page-type-aware placeholder verification and injection**

- Read `data-page-type` on each selected eligible HTML page, then load the approved placeholders from the selected website category's **independent** template that apply to that type.
- Check whether each expected placeholder **already exists**. Display these statuses:

| State | Appearance | Selection behavior |
| --- | --- | --- |
| All applicable placeholders exist | **Gray, disabled** | No injection needed |
| All applicable placeholders missing | **Normal, initially checked** | May be injected |
| Some exist, some missing | **Blue, selectable** | Inject **only missing** placeholders |

- Hovering over a filename reveals the exact existing/missing placeholders; provide a tappable details equivalent on touch devices.
- Admin controls the eligible selections; the default checked status for partially complete blue files was **not decided**.
- Preserve existing values and structure; do not duplicate existing placeholders or overwrite completed metadata.
- **The placeholder injector inserts structure/template variables, not actual SEO content.** A later, separately planned metadata population feature handles actual descriptions, images, dates, author information, URLs, and other values.
- **Do not automatically disable, comment out, suppress, remove, or deactivate approved injected placeholders.**
- Use the approved template rules for placement (`<html>` attributes, `<head>` `<title>`/`<meta>`/`<link>`, and JSON-LD `<script type="application/ld+json">`).
- Prepare changes as a reviewable change set. Review before/after code in Source Control before any commit; never silently commit.

### 7.3 Locked Blog & Publishing catalog — core fields

**Approved as the Blog category baseline.** These entries reflect the user's explicit decisions, not an independently selected SEO minimum. Approved item numbering excludes rejected candidates.

| # | Approved field | Exact injection structure or value |
| --- | --- | --- |
| 1 | Permanent Page ID | One permanent per-page `{{PAGE_ID}}`, reused wherever an internal page identifier is relevant. **Final HTML meta tag name remains undecided**; `<meta name="page-id" content="{{PAGE_ID}}">` was only a proposal. |
| 2 | SEO title | `<title>{{SEO_TITLE}}</title>` |
| 3 | Meta description | `<meta name="description" content="{{SEO_DESCRIPTION}}">` |
| 4 | Canonical URL | `<link rel="canonical" href="{{CANONICAL_URL}}">` |
| 5 | Default page language | Add `lang="en"` to `<html>` **only if absent**, keeping existing language attributes and all other attributes intact |
| 6 | Character encoding | `<meta charset="UTF-8">` if the HTML has no existing encoding declaration |
| 7 | General robots controls | `<meta name="robots" content="{{ROBOTS_DIRECTIVES}}">` |
| 8 | Googlebot controls | `<meta name="googlebot" content="{{GOOGLEBOT_DIRECTIVES}}">` |
| 9 | Google site verification | `<meta name="google-site-verification" content="{{GOOGLE_SITE_VERIFICATION}}">` |
| 10 | Language alternates | `<link rel="alternate" hreflang="{{HREFLANG_CODE}}" href="{{HREFLANG_URL}}">`; supports multiple language versions without translating them |
| 11 | RSS feed discovery | `<link rel="alternate" type="application/rss+xml" title="{{RSS_FEED_TITLE}}" href="{{RSS_FEED_URL}}">` |

**Explicit exclusions:** Viewport injection is excluded because the site developer handles viewport configuration; Atom Feed Discovery was declined. The eligibility marker `data-seo="true"` is **not** an injection placeholder. A separate No Index control is deferred for later discussion; no robots directive values are assigned by the placeholder injector. Existing values are preserved wherever present.

### 7.4 Locked Blog Open Graph collection — item #12

**25 retained properties, four selected groups, no individual exclusions or modifications:**

**A. Core (OG-01 through OG-08)**

| Property | Placeholder / behavior |
| --- | --- |
| `og:title` | `{{OG_TITLE}}` |
| `og:type` | **Derive the compatible Open Graph type automatically from assigned `data-page-type`**; do not ask the Admin to enter another type |
| `og:url` | `{{OG_URL}}` (a URL, not the Page ID) |
| `og:description` | `{{OG_DESCRIPTION}}` |
| `og:site_name` | `{{OG_SITE_NAME}}` |
| `og:locale` | `{{OG_LOCALE}}` |
| `og:locale:alternate` | `{{OG_ALTERNATE_LOCALE}}` |
| `og:determiner` | `{{OG_DETERMINER}}` |

**B. Image (OG-09 through OG-15)**

- `og:image` → `{{OG_IMAGE}}`
- `og:image:url` → `{{OG_IMAGE_URL}}` (official alias of `og:image`)
- `og:image:secure_url` → `{{OG_IMAGE_SECURE_URL}}`
- `og:image:type` → `{{OG_IMAGE_TYPE}}`
- `og:image:width` → `{{OG_IMAGE_WIDTH}}`
- `og:image:height` → `{{OG_IMAGE_HEIGHT}}`
- `og:image:alt` → `{{OG_IMAGE_ALT}}`

**D. Article (OG-24 through OG-29)**

- `article:published_time` → `{{ARTICLE_PUBLISHED_TIME}}`
- `article:modified_time` → `{{ARTICLE_MODIFIED_TIME}}`
- `article:expiration_time` → `{{ARTICLE_EXPIRATION_TIME}}`
- `article:author` → `{{ARTICLE_AUTHOR}}`
- `article:section` → `{{ARTICLE_SECTION}}`
- `article:tag` → `{{ARTICLE_TAG}}`

**E. Profile (OG-30 through OG-33)**

- `profile:first_name` → `{{PROFILE_FIRST_NAME}}`
- `profile:last_name` → `{{PROFILE_LAST_NAME}}`
- `profile:username` → `{{PROFILE_USERNAME}}`
- `profile:gender` → `{{PROFILE_GENDER}}`

**Excluded Open Graph groups:** C. Video/Audio; F. Industry/Platform Extensions; G. Specialized OG Content Types. No other OG properties were individually excluded from the retained groups.

**Page-type awareness:** Article/author-related and profile-related placeholders are kept in the approved Blog template and become injection-eligible according to the Admin-assigned page type. Do not place every special-purpose schema/OG object on every page merely because its definition is in the complete Blog catalog.

**Type linking:** The CMS page-type assignment is reused to derive `og:type` via a **compatible vocabulary mapping**; the values are not always textually identical. Examples discussed: `BlogPosting` / `Article` / `NewsArticle` → `article`, `WebSite` / `WebPage` → `website`, `ProfilePage` → `profile`. Preserve existing `og:type` values. Other mapping entries will be handled under the same compatibility principle rather than inventing unsupported OG values.

### 7.5 Locked Blog X / Twitter Card collection — approved items #13–#18

Six fields were individually approved for normal shared-article cards. The established industry metadata prefix remains `twitter:` even though the platform is now branded X.

| # | Tag | Approved placeholder |
| --- | --- | --- |
| 13 | `twitter:card` | `{{TWITTER_CARD_TYPE}}` — **retain the placeholder**, not a fixed `summary_large_image` value |
| 14 | `twitter:title` | `{{TWITTER_TITLE}}` |
| 15 | `twitter:description` | `{{TWITTER_DESCRIPTION}}` |
| 16 | `twitter:image` | `{{TWITTER_IMAGE_URL}}` |
| 17 | `twitter:image:alt` | `{{TWITTER_IMAGE_ALT}}` |
| 18 | `twitter:site` | `{{TWITTER_SITE}}` |

For clarity, their HTML follows `<meta name="twitter:..." content="{{...}}">`. Approved fields are inserted only when missing and do not receive actual usernames, content, images, or card types in the injection stage.

**Explicitly excluded:** `twitter:creator`, `twitter:site:id`, `twitter:creator:id`, `twitter:player`. Other X Player/App Card fields were discussed but **not separately approved**; they are **not part of the six-field approved Blog template**. The conversation did not lock their entire families as permanent exclusions.

### 7.6 Locked Blog Schema.org / JSON-LD catalog — ALL S01–S40

The Admin selected **all six groups, all 40 entries, no exclusions or modifications**. These are catalog entries (some are groups of properties), **not** a requirement to inject 40 unrelated JSON-LD script objects into every HTML page.

| Group | IDs | Approved types / capabilities |
| --- | --- | --- |
| **A. Website and general pages** | S01–S07 | `WebSite`, `WebPage`, `Blog`, `Organization`, `BreadcrumbList`, `AboutPage`, `ContactPage` |
| **B. Articles and publishing** | S08–S14 | `BlogPosting`, `Article`, `NewsArticle`, `LiveBlogPosting`, `CollectionPage`, `ItemList`, `CreativeWork` |
| **C. Authors and profiles** | S15–S18 | `Person`, `ProfilePage`, `Comment`, `InteractionCounter` |
| **D. Media** | S19–S23 | `ImageObject`, `VideoObject`, `AudioObject`, `PodcastEpisode`, `Clip` / `SeekToAction` |
| **E. Specialized content** | S24–S34 | `FAQPage` / `Question` / `Answer`, `QAPage`, `HowTo`, `Review` / `AggregateRating`, `Recipe`, `Product`, `SoftwareApplication`, `Book`, `Course`, `Event`, `DiscussionForumPosting` |
| **F. Advanced capabilities** | S35–S40 | Content relationships, article references, paywall declarations, publisher/editorial properties, `speakable`, site-search `SearchAction` / `potentialAction` |

- **Primary schema selection:** Assign official Schema.org type names in the Page Type step. A `data-page-type="BlogPosting"` source value is reused as the JSON-LD primary `"@type": "BlogPosting"`—no second type selector or `{{SCHEMA_TYPE}}` value entry.
- **Associated nodes:** The selected type determines appropriate approved supporting structures such as author `Person`, publisher `Organization`, `BreadcrumbList`, `ImageObject`, and content relationships. Keep all approved templates available; no automatic disabling.
- **Permanent Page ID:** Reuse the single `{{PAGE_ID}}` wherever a page-internal `identifier` is suitable. Schema.org `@id` references identify graph entities and may be derived from the appropriate canonical URL and entity fragment; they do **not** need additional manually assigned page IDs. Do not assign one identical `@id` to unrelated entities.
- **Structured-data syntax:** JSON-LD uses `<script type="application/ld+json">` with the approved template variables for fields such as author, headline, publication date, images, content, and references.
- Retaining a Schema.org type does **not** guarantee Google rich-result support. Several older rich-result features are discontinued or restricted. This research distinction **does not authorize removing/disabling** any of the 40 approved template definitions.
- The **exact per-type JSON-LD field layouts, nested links, and full template details** are to be implemented from the approved catalog, with technical validation; approval of S01–S40 is **not** authorization for the engine to invent substantive SEO values.

### 7.7 Global decisions and validation boundaries

1. **One source for type assignment:** Admin-defined page type drives primary schema `@type`, compatible `og:type` mapping, and page-type-specific placeholder selection. No second type-value input.
2. **One permanent Page ID per HTML page:** reuse it rather than issuing redundant IDs. This is separate from canonical/public URLs.
3. **One category's copy never silently changes another:** Blog, E-commerce, and other templates start from a snapshot copy, then evolve independently.
4. **Full coverage, no silent suppression:** approved template placeholders remain available for injection. No automatic disabling, hiding, removing, or commenting out.
5. **Do not fill actual SEO values during injection.** The later population stage is a different feature.
6. **Do not overwrite existing metadata:** scan, preserve, compare, and only prepare missing structures. Detect conflicts/malformed structures rather than causing unintended damage.
7. **Explicit code review before commit.** Changes prepared by the injector must be inspectable through the shared Source Control diff workflow.
8. **SEO compliance is distinct from injection:** Google doesn't guarantee rankings from quantity of metadata. Validate populated JSON-LD and active search directives when that later stage exists. This is **not** approval to deactivate placeholders.

**Decisions not yet locked:** final Page ID HTML meta-tag name; comprehensive folder/file assignment conflict handling; full per-page-type Schema.org field layouts and mapping details; the remaining Metadata Injector stages and future SEO value population controls. The Blog catalog itself and category-template copying rule are approved; do not reopen those choices without a new owner request.

## 8. Moving source injection out of GitHub Actions

Long-term objective: for repositories using automatic **source-file injection** in their build workflows, move control of those source modifications into the CMS:

**Choose repository/branch → choose injection → inspect proposed changes → review code diff → explicitly commit.**

This must remain repository-independent. GitHub Actions may still **build, validate, assemble, and deploy** a site, where those responsibilities are required by its project. In particular, **source-file metadata injection** and **build-time assembly of shared site components** are not automatically interchangeable.

Do not disable or remove any repository's build/injection workflow until the corresponding CMS operations have been implemented, verified, and explicitly approved for migration.

## 9. Future author workflow (planned for later phases)

The architecture must anticipate a restricted author process:

1. Author logs in and sees only assigned repository/branch workspaces.
2. Author views/edits permitted HTML and reviews their own changes.
3. Author **saves drafts to Supabase**, not directly to GitHub.
4. Author **submits changes for Super Admin review**.
5. Super Admin checks the changed files and code diff, then **approves** (creating an authorized GitHub commit) or **rejects/discards** the proposal without changing GitHub.

A draft or pending change request is **not yet a Git commit**. Unapproved author work must never update a GitHub branch.

The precise permission matrix and approval interface are intentionally postponed until later phases.

## 10. Proposed phased delivery (subject to approval)

| Phase | Main scope | Minimum meaningful verification |
| --- | --- | --- |
| 1. Foundation and auth | Public frontend, secure backend, login-first UI, one Super Admin, token onboarding | Login protection, token handling, role checks verified |
| 2. Repository workspace | Dashboard/sidebar, repository discovery/registry, branch selection, saved preferences | Switch repositories and remote branches; restore choice from another session |
| 3. Editor and Source Control | HTML/CSS/JS editing, shared drafts, code diff review, remote commits and history | Inspect pre/post-commit diffs and commit to one branch without affecting another |
| 4. Metadata Injector | Independent category templates; eligibility, page-type assignment, and page-type-aware placeholder injection | Verify marker eligibility, folder/file type assignment, preserved values, partial/missing classification, accurate diffs and safe commits |
| 5. Users and permissions | Invitations, restricted accounts, repository/branch authorization | Prove unauthorized users cannot read/write other workspaces |
| 6. Author reviews | Supabase drafts, submission queue, approve/reject flow | Prove pending drafts never touch GitHub until Admin approval |

Each phase must have an agreed scope, actual end-to-end testing, and explicit owner approval before implementation. The phase order is a **proposal**, not a commitment to invent unfinished features.

## 11. Modular application architecture and Codex implementation path

**Decision: The CMS frontend will use React + TypeScript + Vite.** This is the approved frontend technology direction. The CMS must be **modular rather than monolithic**, with routing, layouts, reusable/shared UI, and environment configuration organized into separate responsibilities. Codex in VS Code is the planned implementation path. The project owner knows HTML, CSS, and JavaScript and must be able to inspect what the system is doing; readable code and understandable diagnostic/testing procedures are architecture requirements, not optional niceties.

This is a **design blueprint, not an implementation claim**. An explicit phase-specific authorization is required before Codex or another tool creates or deploys code.

### 11.1 Confirmed technology and responsibilities

| Layer | Planned technology | Purpose |
| --- | --- | --- |
| Frontend UI | **React** | Dashboard, sidebar, feature screens, shared interface components |
| Application source | **TypeScript** (TSX for React components) | Typed module interfaces and predictable file/workspace/draft models |
| Build and local development | **Vite** | Development server and production build targeting GitHub Pages |
| Navigation | **Client-side routing** | Navigate login, dashboard, repository workspace, editor, review, and settings screens |
| Layouts | **Modular React layouts** | Auth-only layout, protected dashboard/workspace layout, reusable page structure |
| Reusable UI | **Shared React UI components** | Buttons, dialogs, status notices, file lists, selection controls, diff surfaces |
| Code editor | **Monaco Editor** | Editing HTML/CSS/JavaScript, code comparison and source inspection |
| Backend | **Supabase Auth, PostgreSQL, Edge Functions** | Authentication, backend authorization, scoped preferences/drafts, protected GitHub access |
| Source control | **GitHub APIs** | Repository/branch reads, approved remote commits and history |
| Implementation agent | **Codex in VS Code** | Implement approved modules, run tests, review diffs and explain changes |

**Not decided by this architecture approval:** a particular React router package, UI design system, global state library, test runner, ORM, or Monaco wrapper package. Select only when the relevant phase is approved, using an explicit technical justification rather than silently adding dependencies.

### 11.2 Layer and module boundaries

```text
Public GitHub Pages frontend (React + TypeScript + Vite)
  ├── App shell: routing, protected layouts, common providers
  ├── Independent feature modules
  │     Authentication / Dashboard / Repositories / Code Editor /
  │     Source Control / Metadata Injector / Settings /
  │     Later: Users & Permissions / Pending Reviews
  ├── Shared UI primitives and reusable hooks/types
  └── Core services: session, permissions, workspace, API contracts,
        drafts, change sets and review state
                         │
                         ▼ authorized requests
Supabase backend
  ├── Auth and protected database with enforced authorization
  ├── Edge Functions: GitHub connection, repository operations,
  │     commit operations and shared backend validation
  └── Protected credential storage and persisted preferences/drafts
                         │
                         ▼ authorized GitHub API calls
GitHub repositories / branches / source files / commits
```

- Feature modules **own their view components and feature-specific logic**. They may depend on stable core/shared interfaces, but must not directly reach into another feature's internal files.
- Core infrastructure **must not import feature-specific UI modules**. Cross-feature behaviors use defined contracts and services, not hidden side effects.
- Shared UI includes only genuinely reusable components; do not move every feature-specific component into `shared/`.
- A shared service is not permission for a monolithic utility file. Keep session, permissions, repository context, API access, drafts, change sets, and commits separated by responsibility.
- GitHub App private keys, installation tokens, service-role keys, authorization decisions, and privileged GitHub API calls remain **server-side**. The browser uses only appropriately public configuration and user session data.
- Frontend permissions and route guards improve UX but never substitute for server-side permission enforcement, database access rules, and repository/branch verification.

### 11.3 Proposed repository layout (guide, not a required empty scaffold)

```text
Luxraj-CMS/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes/
│   │   ├── layouts/
│   │   └── providers/
│   ├── core/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── permissions/
│   │   ├── workspace/
│   │   ├── drafts/
│   │   └── changesets/
│   ├── features/
│   │   ├── authentication/
│   │   ├── dashboard/
│   │   ├── repositories/
│   │   ├── code-editor/
│   │   ├── source-control/
│   │   ├── metadata-injector/
│   │   │   ├── eligibility/
│   │   │   ├── page-types/
│   │   │   ├── scanner/
│   │   │   ├── injection-engine/
│   │   │   ├── templates/
│   │   │   │   ├── blog/
│   │   │   │   ├── ecommerce/
│   │   │   │   └── ... other independent category copies
│   │   │   └── components/
│   │   ├── settings/
│   │   ├── users-permissions/       # later phase
│   │   └── reviews/                 # later phase
│   └── shared/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
├── supabase/
│   ├── functions/
│   │   ├── github-connection/
│   │   ├── repository-api/
│   │   ├── commit-changes/
│   │   └── _shared/
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── .github/
    └── workflows/
```

This tree communicates **boundaries and intended responsibilities**, not a mandate to generate all folders immediately. Add working, tested modules only in approved phases. The exact filenames and implementation-specific package choices remain adjustable.

### 11.4 Shared change-set and Source Control architecture

All source-writing features (manual editor, page-type injector, metadata injector, and future tools) feed **one reviewable change-set contract**, rather than implementing their own commits:

1. Load the selected repository, branch, file path and current original file/version.
2. Prepare proposed file contents **without changing the GitHub branch**.
3. Store a draft/change set and associated scope/version information securely (Supabase where appropriate).
4. Render changed-file lists and before/after diffs in Source Control (Monaco can supply editor/diff views).
5. At explicit approval, the backend rechecks user permissions, selected repository and branch, and remote source versions; report conflicts rather than silently overwriting.
6. Commit the approved set to the selected branch using an authorized backend GitHub operation; then show the resulting GitHub history.

This rule prevents the Metadata Injector, Page Type Injector, and Code Editor from each inventing different save/commit behavior.

### 11.5 Independent metadata category templates within the modular system

- The `metadata-injector/` feature contains separate eligibility, page-type, scanning, injection, and template responsibilities.
- The **same generic injection logic** can execute different category configurations, but must not hardcode Blog-specific paths or values.
- At initial setup, Blog's approved metadata structure is **copied into each other category's separate template**. These are independent snapshots, **not shared live inheritance**. Subsequent changes to one category never silently update another.
- Metadata Injector operations must still use the shared workspace, change-set, diff and commit services.
- The approved 11 core items, 25 OG properties, six X fields, and S01–S40 Schema.org catalog remain governed by Section 7; the frontend architecture decision does not modify their approvals or pending details.

### 11.6 Human-verifiable, Codex-assisted development requirements

Because the project owner is comfortable inspecting HTML, CSS and JavaScript but not yet TypeScript/React internals:

- Use **clear module names**, readable TypeScript, small focused files/functions, and explanatory documentation for non-obvious logic; avoid needless abstraction.
- Keep business logic testable separately from React components. Prefer functions with explicit inputs/outputs for scanners, templates, permission checks and change preparation.
- Build **readable, non-secret diagnostics**: identify failing module/operation and repository/branch/file context where safe. Never log tokens or protected credentials.
- Include **unit**, **integration**, and **end-to-end/browser** tests as applicable to each approved phase, plus a production build check.
- For each completed phase, Codex must supply: the changed-file summary, an explanation in familiar HTML/CSS/JavaScript concepts, tests run and results, and clear **manual browser verification steps** so the owner can confirm behavior without reading every TSX line.
- Use small reversible Git changes; inspect diffs before commits and confirm deployments separately. A successful build alone is not proof of correct behavior.
- Do not silently refactor unrelated modules, introduce unnecessary dependencies, expand phase scope, or change approved metadata rules.
- **Planning and coding are separate permissions.** A README update is documentation only; actual implementation, remote updates, and deployment require the owner's explicit go-ahead.

### 11.7 Recommended phased Codex implementation

1. **Foundation / app shell:** Vite + React + TypeScript bootstrap, routes, login-only layout, protected layout, shared UI boundaries and public environment configuration.
2. **Authentication / secure backend:** Supabase Auth, backend-controlled Super Admin authorization, secure one-time GitHub App installation authorization and Super Admin-only Settings connection/disconnect management.
3. **Repository workspace:** Selected repository/branch state, remote file read interfaces, saved user preferences and access enforcement.
4. **Editor / draft / source control foundation:** Monaco integration, shared drafts and changesets, reviewable diffs, verified branch-safe GitHub commits and history.
5. **Metadata Injector:** Eligibility, page-type assignment, independent category configurations and approved placeholder templates using the established shared change-set pipeline.
6. **Later features:** User/branch permissions, restricted authors, approvals and other CMS modules as separately approved.

These are **implementation slices**, not an instruction to code all six at once. The existing project-phase table above remains the controlling high-level plan; no new phase has been approved for execution merely by recording this architecture.

## 12. Planning status and change boundaries

**Confirmed implementation direction:** React + TypeScript + Vite frontend; modular routing, layouts, shared UI and environment configuration; isolated feature modules and secure backend boundaries; Codex in VS Code as the coding path. This is an architectural decision, **not implementation approval**.

**Discussed and established so far:** login-first UI, one Super Admin with future restricted users, GitHub App installation authorization with persisted backend status and Super Admin-only Settings management, Supabase-stored user preferences, repository and remote branch selection, future branch-level user assignments, a VS Code-style HTML/CSS/JS editor, code-level before/after reviews and commit history, and shared review-before-commit flow. **Metadata Injector:** manual SEO eligibility marker and saved file preferences; Admin-controlled file/folder Page Type assignment; page-type-aware placeholder injection; approved Blog core, Open Graph, X, and S01–S40 Schema.org catalogs; and independent snapshot copies for other website categories.

**Still being discussed:** final Page ID meta element name, finer schema/template and folder-overlap implementation details, future metadata population and index-control features, exact author permissions and review controls, and finer UI details. Approved catalogs must not be silently reduced, disabled, or treated as permission to generate real SEO data.

**No application implementation is authorized by updating this README.** This commit documents the plan only. Existing Luxraj Blog and older CMS repositories are outside the scope of this documentation update.
this is the commit test from the vs code.