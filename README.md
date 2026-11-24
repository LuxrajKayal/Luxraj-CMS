# Luxraj-CMS

Cloud-based CMS powered by Supabase and GitHub.

**Selected frontend architecture:** React + TypeScript + Vite, with modular feature boundaries, client-side routing, independent layouts, shared UI and controlled environment configuration. **Codex in VS Code** is the planned implementation path; all coding requires explicit phase approval.

> **Project status, November 23, 2026:** **Tasks 0–16 completed and owner-accepted**. **P-1 Universal File Manager** is implemented on `codex-development` and awaits deployed integration testing and owner acceptance before Task 17. Tasks 17–20 remain approved future work.

**Website Controls** runs registered repository HTML applications and stages their generated files through the shared Source Control workflow. See the [owner-approved specification](docs/Luxraj_CMS_Website_Controls_Codex_Plan.md) and the [application file bridge and setup](docs/website-controls.md).

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
- Regular Author, Developer and Advisor roles have restricted, backend-enforced access. **The Author interfaces have already been approved in Tasks 18–20**, rather than left wholly undecided; only detailed Developer/Advisor workspace screens remain separately planned. **The Super Admin can also work as Author and Developer through the same Owner/Admin account** without losing administrative powers.

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
3. **Code Editor** — text/source-code browsing and editing.
4. **File Manager (P-1)** — arbitrary file uploads, saved binary drafts, format-appropriate previews, and shared Source Control review.
5. **Source Control** — shared text and binary changes, review/diffs, explicit commits and Git history.
6. **Code Injector** — completed Boilerplate Generator and Code Injector (Tasks 15–16).
7. **Users & Permissions** — Task 17 user and position-based permissions/assignments.
8. **Pending Reviews** — Author submissions awaiting Super Admin decisions.
9. **Settings** — GitHub connection, account/workspace settings and planned Author Profile Picture Location.
10. **Logout**.

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
- Support file-level history/comparison so the Super Admin can check the exact lines changed by Code Injector or another CMS tool.
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

**Implemented commit-limit setting:** **Settings → Maximum Files Per Commit** supports **1–100**, default **20**, enforced in frontend and backend. The actual live value may differ. This limits reviewed files per confirmed GitHub commit, not how many drafts Code Injector or the future File Manager prepares.

#### Task 14 — History tab and Git Commit Graph

- The **History** tab inside the same right Source Control panel shows a **Git Commit Graph** (also called Git History Graph), modeled on VS Code's branch/commit graph rather than a plain text-only history list.
- Render actual commit topology using GitHub commit and parent metadata: commit dots, colored graph lanes/lines, splits and merge connections when present, and accurate branch/ref labels **only for refs actually known**. A linear history may legitimately be a single vertical line; do not manufacture branches or pretend the browser has local Git branches.
- Alongside the graph show concise commit messages and helpful metadata (author, date, abbreviated SHA), scoped to the active repository/branch, with refresh and incremental loading/pagination for longer histories. Include commits made both through Luxraj CMS and externally on GitHub/VS Code.
- Selecting a commit reveals its metadata and changed-file list. Selecting a changed file opens its **committed before/after code diff in the existing center Monaco editor area**, without losing unsaved editing buffers. Show added, modified, deleted, and renamed files accurately where supported; explain unsupported/binary or unavailable diffs instead of showing misleading code.
- Commit-history reads, file listings, and diff retrieval also go through authorized backend requests, enforcing repository access. The graph represents GitHub remote data; changing the viewed commit must **not** switch the saved workspace branch or modify GitHub.

#### Scope, integration and tests

- Reuse the existing workspace selection, draft/change-set services, Monaco diff component, GitHub App installation connection, and Supabase authorization. Avoid duplicate commit implementations for later Boilerplate/Code Injector features.
- Preserve the current file Explorer, topbar workspace indicator, repository-switch confirmation, Source Control panel collapse/focus behavior, drafts and Settings storage policy. Use responsive layout so the graph and diffs remain usable on smaller screens.
- Test: confirming/cancelling commits, authorized versus denied writes, precise repository/branch targeting, multi-file consistency, conflicts from externally updated files or moved branch heads, protected branches, draft retention and unsaved-buffer safety; then history graph ordering/topology (including merges), external commits, paging, clicked commit/file diffs, and successful return to an active editor.
- **Documentation is not implementation approval.** Build/deploy/backend changes require the owner's separate explicit authorization. The owner must verify the complete edit → draft → diff → confirm → commit → graph → committed-diff workflow on a safe test branch before Tasks 13–14 are accepted.


## 7. Code Injector — Tasks 15–16 (current plan)

**Authoritative full Task 15–20 definitions:** [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) (Milestones 5–7), copied from the [portfolio living plan](https://github.com/LuxrajKayal/luxraj-portfolio/blob/main/Luxraj_CMS_Revised_Metadata_Injector_Living_Plan.md). **Task 15 implementation configuration:** [`docs/Luxraj_CMS_Working_Sheet_Config.json`](./docs/Luxraj_CMS_Working_Sheet_Config.json) in this repository. This section supersedes the former Tasks 15–19 sequence involving manual `data-seo` eligibility, `data-page-type` injection, and automatic missing-placeholder stages. Those earlier workflows are **not** the current roadmap.

### 7.1 Task 15 — Boilerplate Generator

- In the primary Code Injector/Metadata Injector area, the dedicated sidebar provides **Boilerplate Generator** first.
- Use the CMS repository's [`docs/Luxraj_CMS_Working_Sheet_Config.json`](./docs/Luxraj_CMS_Working_Sheet_Config.json) (`website_categories`, `page_categories`, `generator`) as the Task 15 website/page selection and boilerplate configuration source to generate the agreed HTML identification attributes: `data-cms-seo="true"`, `data-cms-website="..."`, and `data-cms-seo-type="..."` on the existing `<html>` element.
- Allow Copy or intentional per-file injection into discovered `.html`/`.htm` pages. Preserve unrelated HTML attributes and prepare reviewable Source Control drafts before any commit.

### 7.2 Task 16 — Code Injector

- The second dedicated sidebar option supports **HTML, Script, and CSS** code cards, reusable saved groups and temporary instant selections.
- The Super Admin chooses the target **text-based source files**, not only HTML/HTM, and the exact insertion line in each file. HTML marker matching uses Task 15's CMS attributes when applicable; non-HTML files do not require HTML markers.
- Detection has two explicit modes: **Selection Mode** shows only HTML pages matching both website and page type from the committed JSON configuration and the Task 15 eligibility marker; **Universal Mode** shows all repository source candidates, including unmarked HTML, without requiring website/page selection.
- Clicking an actual source line highlights the insertion location and displays a read-only inline code preview before the remaining lines, with a local **Preview insertion here** action. This does not save or commit automatically.
- A reusable **Sample SEO Metadata** HTML template is supplied for initial browser testing. Saved templates can be edited, including their name, kind and source, without changing their persistent identity or saved-group membership.
- Display complete/partial/absent code-presence status and explicit Duplicate or Replace warnings where matching code is detected. Show the proposed insertion before saving, including in bulk operations.
- Reuse existing Supabase drafts, Monaco diffs and the one explicit Source Control commit workflow. Do not constrain the number of discovered/prepared files to the commit-file limit.
- **Settings → Maximum Files Per Commit:** Super Admin-selectable **1–100**, default **20**, enforced in both frontend and trusted backend; any bulk change exceeding the selected limit is reviewed and committed in batches.

#### Task 16 matching and conflict handling

- HTML cards count top-level elements. A JSON-LD block counts distinct schema types declared at its root or in its graph. Inline scripts and styles count their parsed declarations, statements, or rules. JavaScript cards count each named binding/import or other top-level statement. CSS cards count top-level rules, at-rules and standalone declarations. Comments do not count as code items.
- HTML matches use identities such as document title, meta name/property, script URL, or element ID. Other elements use exact source. JavaScript uses parsed binding/import identities and structurally equal statements. CSS matches selectors or at-rule identities within the same block level. Presence indicators report syntax matches and leave value correctness to the reviewer.
- **Replace** removes the matched source spans and inserts the selected templates at the line chosen in that file. It is blocked if a matched span also contains unselected JS bindings, unrelated CSS rules/properties, other JSON-LD graph types, or protected element contents. Overlapping existing spans and repeated identities across selected templates need a narrower selection or manual editing. When the parser cannot assess a format, review the source manually before continuing.
- Bulk saves use independent versioned drafts. Each file reports success or the specific conflict, and earlier successful drafts stay available in Source Control. File type is checked on open. Existing UTF-8, repository path, per-file 1 MiB and aggregate commit payload limits still apply.

### 7.3–7.6 Approved SEO catalog reference (preserved)

The following previously approved Blog core, Open Graph, X and Schema.org **catalog entries** are retained as reference material. Their earlier examples of `data-page-type` and the old automated placeholder workflow do **not** supersede the new Task 15 identification attributes or Task 16 user-controlled code injection. Inclusion of catalog entries does not authorize injecting or overwriting their values automatically.

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

### 7.7 Current validation and review boundaries

- The Super Admin selects code, files and insertion locations; avoid silent duplicate insertion or replacement.
- Presence checks must be syntax-aware and must not treat an existing metadata value as missing merely because its value differs from a template placeholder.
- Preserve unrelated source code, review changes against current remote versions, and require explicit GitHub commit approval.
- For complete workflow definitions, including unresolved technical matching rules, use the current Roadmap Tasks 15–16 and the portfolio living plan, not obsolete eligibility/page-type/placeholder steps.

## 8. Moving source injection out of GitHub Actions

Long-term objective: for repositories using automatic **source-file injection** in their build workflows, move control of those source modifications into the CMS:

**Choose repository/branch → choose injection → inspect proposed changes → review code diff → explicitly commit.**

This must remain repository-independent. GitHub Actions may still **build, validate, assemble, and deploy** a site, where those responsibilities are required by its project. In particular, **source-file metadata injection** and **build-time assembly of shared site components** are not automatically interchangeable.

Do not disable or remove any repository's build/injection workflow until the corresponding CMS operations have been implemented, verified, and explicitly approved for migration.

### Owner-approved prerequisite P-1 — Universal File Manager (implemented; owner verification pending)

**Owner: Luxraj Kayal (Subrata), November 23, 2026.** Full definitive requirements: [Universal File Manager Prerequisite](./docs/Luxraj_CMS_Universal_File_Manager_Prerequisite.md). This is an **unnumbered prerequisite to implement and owner-verify before Task 17**; it is not a replacement for Tasks 0–20.

- The **Super Admin File Manager** is separate from Code Editor/Monaco and accepts **all file types**, including Word DOC/DOCX, PDF, PNG/JPG/WebP and other images, Office files, archives, fonts, source/text and unknown binaries, within configured security/storage/platform limits. Upload, prepare new file or replacement, **Save Draft**, and review without changing GitHub.
- Draft exact bytes privately in **Supabase Storage**, with protected PostgreSQL metadata. Support multiple files, durable draft reopening, new/replacement status, old/new metadata and hash comparisons and safe previews.
- **Required owner-decided integrations, not optional:** **PDF.js (pdfjs-dist)** for PDF page previews, **Mammoth (mammoth) and DOMPurify (dompurify)** for sanitized read-only DOCX previews; browser-native safe image/media previews; metadata/hash/download fallback for legacy DOC/ODT and other formats lacking safe inline rendering. No browser or VS Code extensions are required.
- Reuse **existing Source Control** final Super Admin review and GitHub commit, repository/branch/source-conflict checks and 1–100 commit-file limit, extended for new/binary files. **Do not create a separate GitHub commit/publishing system**.
- **Settings → Author Profile Picture Location**: Super Admin configures **one authorized GitHub repository, branch, specific assets folder and public URL prefix for all approved profile pictures**. Task 18 stages approved WebP through P-1 and the Super Admin explicitly commits it. An approved profile is not a published image until its repository asset commit succeeds.
- The **Super Admin** can self-manage their own profile, without ordinary Author profile-approval restrictions, and work as Owner/Admin, Author and Developer in **one account** while keeping GitHub commit safeguards.

**Deployment and acceptance:** Apply the P-1 migration and deploy the matching `github-workspace` function and frontend in an approved environment. Owner acceptance follows live verification.

## 9. Users, Authors, and website inspection — Tasks 17–20

**Current specification:** [Development Roadmap, Milestones 6–7](./DEVELOPMENT_ROADMAP.md), copied from the portfolio living plan. This replaces the old concept of Authors editing permitted GitHub HTML files directly.

- **Task 17 — Users & Permissions:** Super Admin manually creates Supabase users, assigns Author/Developer/Advisor roles, tasks, unique Task IDs, separate access, Hold/Resume and notifications. **Author profile/dashboard, Workstation and Website Preview interfaces are already owner-decided in Tasks 18–20**, not undecided. The Owner operates as Super Admin, Author and Developer on one account. The precise regular Author repository/branch assignment mechanism remains separately planned.
- **Task 18 — Author Homepage:** regular Authors must submit a profile for Super Admin approval; WebP images are stored in Supabase. Once approved, the website copy is staged through P-1 to the **configured GitHub repository/branch/folder** and explicitly committed by Super Admin. Author dashboard, chat, presence and notifications remain defined. Pending-approval Authors can access permitted tools and save drafts, but cannot Preview/Submit articles until approval and website-asset readiness. The **Owner's self-managed profile is exempt from regular Author onboarding/approval gates**.
- **Task 19 — Author Workstation:** Already owner-approved Word-like Author editor for category-selected Supabase Markdown drafts, metadata, validation, article previews, submission, marked correction, approval and Super Admin publication handoff. Task 18/P-1 supplies the approved website-hosted Author image URL. Generated website HTML uses the existing **Code Editor → Source Control review → explicit GitHub commit** path, extended by P-1 where new/binary files are involved. Ordinary Authors never directly publish; the Super Admin may author under the same Owner account.
- **Task 20 — Website Preview:** both Author and Super Admin may inspect the configured existing live website in an iframe, subject to embedding restrictions. This is distinct from Task 19's new-tab preview of an unpublished Supabase article draft.
- **Task 21:** manual sitemap/status checking is a later discussion, **not part of the committed Tasks 15–20 specification**.

## 10. Proposed phased delivery (subject to approval)

| Phase | Main scope | Minimum meaningful verification |
| --- | --- | --- |
| 1. Foundation and authentication (Tasks 0–6) | Modular frontend, secure Supabase login, Super Admin, GitHub App installation | App boots; user/session and privileged GitHub access checks pass |
| 2. Repository workspace (Tasks 7–9) | Repository/branch selection, saved preferences and authorized browsing | Switching repositories/branches restores the correct context |
| 3. Code Editor and Source Control (Tasks 10–14) | Monaco editing, Supabase drafts, diffs, reviewed GitHub commits and history | Test edit → draft → diff → confirmed commit → history/file diff |
| 4. Boilerplate and Code Injector (Tasks 15–16) | CMS HTML markers, code cards/groups, chosen source-file lines, bulk drafts and configurable commit limit | Correct matching, reviewable diffs, safety checks, and explicit authorized commits |
| 5. Users and Author entry (Tasks 17–18) | Manual Supabase accounts, permissions, assigned work, approved profile, dashboard and chat | Role isolation, profile approval, notifications and task synchronization |
| 6. Author editorial workflow (Task 19) | Supabase Markdown article creation, new-tab preview, editorial review and category-based HTML publication | Authors never write to GitHub; Super Admin approves and uses existing Source Control |
| 7. Existing website preview (Task 20) | Live-site iframe inspection for permitted roles | Preview functions when embedding is allowed and grants no extra privileges |

**Current delivery status:** **Tasks 0–16 completed and owner-accepted**. P-1 is implemented and awaits owner verification. Tasks 17–20 remain planned.

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
  │     Source Control / Code Injector / Settings /
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

All file-writing features (Code Editor, Boilerplate Generator, Code Injector, **P-1 File Manager**, approved Author publication and future tools) feed **one trusted Source Control review and explicit GitHub commit system**, rather than implementing separate commit systems:

1. Load the authorized repository, branch, path and original file/blob/version, or confirm absence for a new path.
2. Prepare proposed **text or binary file contents** without changing the GitHub branch.
3. Store scoped drafts securely; P-1 puts **binary bytes in private Supabase Storage** and protected metadata in PostgreSQL, without changing text-draft columns.
4. Render Source Control changes using Monaco for text and **old/new file previews, sizes, checksums and New/Replace status** for binary files.
5. At explicit approval, the backend rechecks user permissions, selected repository and branch, and remote source versions; report conflicts rather than silently overwriting.
6. Commit the approved set to the selected branch using an authorized backend GitHub operation; then show the resulting GitHub history.

This rule prevents Boilerplate Generator, Code Injector, the Author publication handoff, and Code Editor from inventing separate save/commit behavior.

### 11.5 Boilerplate, Code Injector, and article-workflow module boundaries

- **Task 15** creates the category/page-type-specific HTML identification boilerplate; it remains an HTML-focused operation.
- **Task 16** handles Super Admin-directed source-code templates, presence checks, exact insertion lines and bulk draft changes for supported text-based files; it reuses the existing Source Control services.
- **P-1 prerequisite** adds the separate universal File Manager, PDF.js/Mammoth/DOMPurify integrations, binary-safe drafts and new-file/replacement Source Control handling.
- **Tasks 17–18** add authorized roles, tasks, Author profiles, dashboard and collaboration without granting ordinary Authors GitHub write access; Task 18 uses P-1 for approved WebP repository assets.
- **Task 19** stores Author-specific Markdown article drafts in Supabase, renders unpublished new-tab previews, and hands approved website HTML to the existing Code Editor/Source Control publication workflow, with support for reviewed new-file additions.
- **Task 20** embeds the existing live website in an iframe for authorized visual inspection.
- Preserve the Blog core/OG/X/Schema.org catalogs in Section 7 as reference material without reinstating obsolete injection steps. See the roadmap for current complete task definitions.

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

1. **Tasks 0–16: Completed owner-accepted baseline.** Maintain app shell, authentication, repository workspace, Monaco, Supabase text drafts, Source Control commits/history, Boilerplate Generator and Code Injector.
2. **Tasks 15–16: Boilerplate Generator and Code Injector.** Reuse the baseline review/commit services and implement the configurable 1–100-file commit limit (20 default).
3. **Tasks 17–18: Users, role-specific workspaces, Author profile, dashboard and communications.** Enforce authorization server-side.
4. **Task 19: Supabase Markdown authoring, article review and HTML publication handoff.** Do not let ordinary Authors operate on GitHub repository files.
5. **Task 20: Existing website iframe preview.** Preserve role restrictions and hosting embedding constraints.

Each new implementation step needs separate owner approval; the roadmap carries the full current requirements.

## 12. Planning status and change boundaries

**Accepted code baseline (November 23, 2026):** Tasks **0–16** completed and owner-accepted, including live-tested Tasks 15–16. This does not claim every possible regression/security edge case has been independently retested.

**Current agreed future scope:** **P-1 Universal File Manager** comes before **Tasks 17–20** (Users & Permissions, the already-defined Author Homepage/Workstation and Website Preview). Do not treat approved Author designs as undecided, invent detailed Developer/Advisor screens, or reintroduce superseded earlier injection tasks.

**Later discussion only:** Task 21 site/sitemap status checks are not included as a finalized Task 21 roadmap specification.

**Documentation does not authorize application changes or deployment.** Tasks **0–16** are complete; **P-1 and Tasks 17–20** require separate approval and actual verification.
