# Luxraj CMS — Temporary UI, Navigation, Draft & Storage Fix Specification

> **Status:** Owner-approved design requirements. **Documentation only**; this file does not mean implementation is complete.
>
> **Scope:** Implement all changes described here in **one coordinated Codex run** on `codex-development`, preserving working Tasks 1–12. This is **separate from `DEVELOPMENT_ROADMAP.md` and Milestone 4**; do not amend milestone scope.
>
> **Visual direction:** [docs/fix-ui-reference.svg](docs/fix-ui-reference.svg). That SVG is a compact vector reconstruction of the **original illustration produced in the owner's ChatGPT discussion** (expanded/collapsed navigation, three-stage repository explorer, full-height three-pane Code Editor). Use it as a layout/control reference, not real project metadata or the official brand. Prioritize the **illustration's navigation hierarchy, control placement, spacing, panel proportions and functional behavior**. Refer to the original conversation raster when available.
>
> **Temporary document:** After the owner live-tests and approves all fixes, remove `fix.md` from **both branches** (and this temporary SVG reference if no longer useful), **only after a new explicit owner cleanup instruction**. Never auto-delete these files.

## 1. Scope, safeguards and acceptance approach

- Preserve the working **Tasks 1–12**, including login, Super Admin, GitHub App (both All and Selected repository installation modes plus reconnect), repository/branch selection, GitHub read-only browsing, Monaco HTML/CSS/JS editing, unsaved session buffers, Supabase drafts, revision-conflict handling and Source Control diff data.
- Keep backend secrets on the server and maintain existing authentication, authorization, per-user/repository/branch isolation, GitHub scope checks, Supabase RLS and existing draft versions. UI changes must not bypass backend authorization.
- No GitHub file writes, commit feature (Tasks 13–14), Metadata Injector implementation, forced GitHub branch change, or new unrelated feature in this fix.
- Keep `main` production Vite build base `/` (custom domain `cms.luxraj.com`) and GitHub connection build flag. Implementation is prepared on `codex-development`; **Codex must not merge/deploy**. Owner verifies and authorizes a release separately.
- Build modular reusable layout components; avoid a full rewrite of working application state or backend access. All controls must be real, keyboard accessible, labelled and responsive. Use real data; *never fabricate* repository names, commit totals, file types, usage figures or statuses to match the mockup.
- This plan is the **owner's requested fixes**, not an invitation to infer other layout features or add approvals. Implement the changes together and report tests, limitations and any remaining missing input concisely.

## 2. Dashboard shell: global navigation and module-level workspaces

**Global CMS sidebar**
- Expanded mode: app branding at top, visible icons plus text labels for existing navigation controls, active route highlight and account/logout access.
- Collapsed mode: **icons only** in a narrow rail, preserving every navigation action, selection highlight, discoverability via tooltips/accessible labels, and a visible expand control.
- A clearly accessible toggle expands/collapses; collapsing changes only layout, not route/session/workspace context. Preserve all presently available modules and routes.

**Each dashboard module**
- Each main content area gets its own **compact topbar** and an independently **collapsible module sidebar or tools region** where controls exist. The **global** sidebar and the **module** sidebar are distinct.
- Repositories, Code Editor and Source Control-related controls use these shared shell components, but module-specific behavior stays scoped to that module. Settings and other screens should be compatible with this shell; do not add empty ornamental panels.
- Use the available viewport effectively: small fixed chrome, reduced page padding and unnecessary margins/headings, vertically stretching work area, and panel-local scroll rather than page-level scrolling.
- Independent collapse for file explorer and Source Control; where useful, resize panes or provide editor focus/maximize without discarding unsaved edits. Preserve actions when narrow. Mobile layout uses collapsible panels/drawers and accessible touch targets.

## 3. Branding — owner's source assets now available

**Verified source files in the root of `codex-development`:**
- **Master SVG (authoritative artwork):** [`Luxraj-App-Icon.svg`](https://github.com/LuxrajKayal/Luxraj-CMS/blob/codex-development/Luxraj-App-Icon.svg) — 512 × 512 viewBox; internal title `Luxraj.com – Master Brand Icon`.
- **PNG reference:** [`App Icon.png`](https://github.com/LuxrajKayal/Luxraj-CMS/blob/codex-development/App%20Icon.png) — matching app-icon source asset. These two sources are in `codex-development`; links deliberately target that branch so this documentation also works from `main`.

**Branding implementation requirements:**
- Use the provided **SVG as the source of truth** to create the Luxraj CMS branded logo/wordmark and icon-only variant; use the supplied PNG as an appearance reference or suitable raster asset. Preserve the owner's design and aspect ratio; do **not** substitute the placeholder blue mark from the UI mockup or fabricate a different logo.
- Apply branding consistently to login, expanded main sidebar (mark + `Luxraj CMS` wordmark), collapsed icon-only sidebar, browser favicon/tab and other genuine branding touchpoints.
- Produce appropriate browser-ready static assets and favicon references as necessary; preserve the original root source files and ensure the Vite production build works at `cms.luxraj.com` root.
- Provide accessible alt/labels and crisp rendering at small icon sizes. If SVG-specific compatibility issues arise, derive assets from the actual supplied source rather than guessing.
- This is now **unblocked for Codex implementation**. No need to ask the owner for another logo upload.

## 4. Repositories: Windows File Explorer-style selection and navigation

**All repositories view**
- The Repositories module has a topbar with search, refresh and exactly **three view-mode controls: Large, Medium and List**. The currently selected mode is visually obvious; preserve mode on navigation where practical.
- **Large** mode shows spacious repository cards/icons; **Medium** shows compact cards/icons; **List** keeps a practical row/list view (the current list style). Real authorized GitHub App repository data underlies all three views. Indicate actual names/access status and real metadata only when available.
- Follow the reference illustration's card spacing, icons and toolbar layout rather than stacking large button rows.

**Repository opened / focused**
- Selecting a repository is like **opening a folder in Windows File Explorer**: all other repository tiles disappear from that workspace; show the selected repository identity, a breadcrumb/back action to return to all repositories, and the selected repository's real branches.
- Present branches as a selectable list for that repo. A clear **Open with Code Editor** action is available **after branch selection**, opening that exact selected repository + branch.
- Use the existing saved workspace selection and backend branch validation; no permission bypass or fake branch. Handle no branches, inaccessible/deleted repository/branch, loading and errors. Returning to all repositories preserves the ability to select another.
- Maintain consistent navigation flow: **All repositories → Open one repository → Choose branch → Open with Code Editor**.

## 5. Code Editor: full-height, integrated editor + Source Control

Follow the reference's bottom wide layout:

1. **Global CMS sidebar** at far left, expanded or icon-only.
2. **Code Editor module sidebar** on the left: folders/files explorer, independent collapse and usable width. Ideally resizable, with a compact header and file-tree scrolling.
3. **Central editing area** uses most available width/height. Monaco fills remaining vertical space, resizes correctly, and avoids its old fixed `min(65vh, 42rem)` height cap. Keep Code Editor usable at normal laptop dimensions without scrolling past multiple rows of headings and controls.
4. **Module right sidebar**: **Source Control integrated inside Code Editor**, collapsible independently. Show changed-file list, relevant saved/unsaved draft state and controls. No need to leave Code Editor to inspect changes.
5. **Compact module topbar**: repository/branch breadcrumb or selectors, open file/tab, Read-only/Edit toggle, Save Draft, refresh/reopen and appropriate view/focus controls; show errors and saved/pending status without wasting vertical workspace.
6. Clicking a saved changed file in the right Source Control panel opens its **original vs proposed diff in the central Monaco workspace**; allow returning to normal editing immediately, with no navigation to another dashboard page and **no loss of unsaved edit buffers**.
7. **Same-place workflow:** Open file → Edit in browser → Save Draft to Supabase → View changes/diff in Code Editor → Return to editor. Show whether the central view is source or diff and which file is selected.
8. The old separate Source Control route may be kept for compatibility if useful, but **normal draft review must work entirely inside Code Editor**. Do not remove backend change-set APIs or break existing links.
9. Current edit/draft behavior remains: browser edits are local until saved, save drafts to Supabase only, per-user/repo/branch/file isolation, stale draft revisions fail safely, current GitHub file unchanged. Never execute source HTML/JS in the browser while previewing text.

## 6. Settings → Draft Management

**Owner policy: Drafts are retained even after future successful GitHub commits; there must be NO automatic post-commit deletion or expiry.**

- Provide Settings → **Draft Management** accessible to the Super Admin.
- List **all drafts belonging to the authenticated Super Admin**, including drafts from deleted branches, removed repositories, or a disconnected GitHub App, with repository identifier/name when available, branch, file path, last updated, draft state and estimated bytes/size. Display total draft count and usage. Use backend-authorized listing, not public direct-table access. GitHub access must not be required to see/delete an owned Supabase draft.
- Allow **single-draft manual deletion**, **multi-select and bulk deletion**, optionally select all; require clear irreversible-deletion confirmation and show which drafts would be affected.
- Deleting a draft must **never modify or delete the GitHub source file**. Protect against stale concurrent deletion and unauthorized cross-user/repository deletion. Handle errors/partial bulk failures honestly.
- For future Task 13, retained drafts that were already committed should become **committed/archived rather than pending**, to avoid recommitting the same proposal accidentally. A specific commit-status mechanism must be designed with Task 13; do **not** invent GitHub commits or an unverified committed state as part of this UI fix.
- All cleanup remains manual. Unsaved browser edits are distinct from saved Supabase drafts; warn appropriately if a user is trying to delete a draft with unsaved edits.

## 7. Settings → Storage Management: adjustable Supabase-stored CMS policy

**Goal:** Avoid exceeding Supabase Free-plan quotas by owner-configurable **CMS-enforced safeguards stored in Supabase**. This is NOT changing the actual Supabase plan quotas.

| Resource | Free-plan quota to monitor | Absolute CMS-configurable ceiling | Reserve at ceiling |
| --- | ---: | ---: | ---: |
| **Entire PostgreSQL database** (drafts, roles, preferences, other project tables and system overhead where measurable) | 500 MB | **450 MB** | 50 MB |
| **Supabase File Storage** | 1 GB | **900 MB** | ~100 MB |

- Settings → **Storage Management** shows **two independent sliders**: PostgreSQL allocation (never above 450 MB) and File Storage allocation (never above 900 MB). Owner can raise/lower limits manually; both settings **persist in Supabase**, not browser/local storage/hardcoded frontend constants.
- Show current usage, selected allocation, absolute ceiling, remaining budget and explanatory safety reserve per resource. Display honest metrics: PostgreSQL DB size (e.g. `pg_database_size`) includes more than draft text bytes; report draft table size and total estimated draft content size separately. Storage usage must be measured from actual storage data or a reliable project usage source and labelled if estimates.
- All settings updates are authorized **Super Admin-only on the backend** and constrained by the two hard safety ceilings. Never trust slider values or usage totals sent by the browser.
- On CMS-controlled draft saves and storage uploads, **server-side check the configured allocation before write**; when the proposed write would exceed an allocation, reject cleanly and show a prominent **red alert** explaining the limit, current use and manual cleanup route. Preserve the pending unsaved edit buffer and existing saved drafts. Avoid partial writes; treat concurrent saves and updates carefully to avoid racing past limits.
- Optional earlier *warning* at 80% usage is acceptable if it does not replace hard enforcement; **no automatic deletion**, no surprise compression or silent truncation.
- The **PostgreSQL allocation covers the whole database**, not only drafts. Enforcement can stop only writes controlled by CMS, **not** Supabase system growth or external writes; communicate this honestly and keep the safety reserve. If the configured limit is lowered below actual usage, existing data stays; block new size-increasing CMS writes and allow reductions/deletions.
- File Storage is currently **separate from the PostgreSQL draft table**; do not assume that 1 GB File Storage grants 1 GB of database capacity. Do not migrate draft content into File Storage unless separately approved. File Storage slider/policy should be ready for CMS-controlled uploads when such operations exist, without faking active uploads/storage use.
- Configure suitable defaults inside the ceilings but **do not preselect a final owner allocation without verification**. Prefer conservative initial allocations and allow editing in Settings.
- If a reliable full-project usage metric, transaction-safe quota check, or File Storage monitoring is unavailable from the current service, **do not claim guaranteed enforcement**: implement the safely enforceable portion and report precise limitations instead of bypassing the requirement.

## 8. Test requirements and completion checklist

- Main sidebar expands/collapses: icons-only state preserves all navigation, keyboard use and tooltips.
- Each module topbar/sidebar works with a full-height workspace, narrow widths and restored state; controls remain accessible.
- Repositories: Large / Medium / List views, breadcrumb/back, selected-repo-only mode, actual branches, and Open with Code Editor with correct repo/branch.
- Code Editor: full usable viewport, responsive Monaco, collapsible explorer/Source Control panes, save draft and inline diff in the **same** editor route, return to edit without losing unsaved changes.
- Drafts: saved across sessions, listed in Settings, deleted individually and in bulk **only after confirmation**; GitHub file untouched and other drafts unaffected.
- Quotas: Supabase-stored configurable ceilings enforced server-side for CMS-controlled writes, correct accounting for whole DB versus drafts versus File Storage, alerts without lost edits, no automatic deletion, and authentication/authorization failure cases.
- Regression: all existing login, App connection, GitHub scope modes, repository/branch selection, source reads, editing, drafts, changes/diffs, and safe conflict detection continue to work.
- Run full frontend/backend tests, TypeScript and Deno checks, production build, and relevant isolated database tests. No fake live verification. Give the owner specific browser checks and any unimplemented branding-dependent step.

## 9. Owner sign-off and cleanup

- Implement this independently from Tasks 13–14; no modifications to `DEVELOPMENT_ROADMAP.md`.
- After Codex's implementation, the owner decides whether to deploy and tests the actual live CMS. A green build alone is not acceptance.
- The owner will explicitly request deletion of **`fix.md` on both `main` and `codex-development`** after the work is satisfactory, including the temporary reference if requested.
- Until then, retain this specification and the visual reference as the contract for the fixes.
