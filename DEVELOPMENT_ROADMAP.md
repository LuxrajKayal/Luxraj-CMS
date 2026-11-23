# Luxraj CMS — Development Roadmap

> **For the project owner.** This is a human-readable progress and verification guide, **not a Codex prompt or an implementation specification**. The approved requirements, architecture decisions, and metadata catalogs remain in [README.md](./README.md).
>
> **Status:** Planning only. No development milestone is marked complete. Document created November 19, 2026. Implementation, deployment, and external-service changes require separate explicit approval.

## What we are building

Luxraj CMS is a browser-based system for managing multiple GitHub repositories and branches. It will use a **modular React + TypeScript + Vite frontend**, a **Monaco-based code editor**, and **Supabase** for authentication, secure backend operations, preferences, and drafts.

**Our order of work:** First create a working, secure CMS foundation. Then add feature modules such as Metadata Injector. We will use **Codex in VS Code to implement approved tasks**, while the owner reviews the results and decides when to advance.

The roadmap has **20 numbered tasks (0–19)** grouped into **five initial milestones**, followed by a sixth milestone for future features. These are manageable units, not an instruction to implement everything at once.

## Progress at a glance

| Milestone | Tasks | Goal | Current status |
| --- | --- | --- | --- |
| **1. Application Foundation** | 0–3 | Start a maintainable frontend with routing and readable errors | Not started |
| **2. Authentication & Security** | 4–6 | Log in securely and connect to GitHub | Not started |
| **3. Repository & Branch Workspace** | 7–9 | Select repositories/branches and browse their files | Not started |
| **4. Code Editor & Source Control** | 10–14 | Edit, save drafts, review diffs, and commit safely | Not started |
| **5. Metadata Injector** | 15–19 | Inject approved placeholders through the shared review workflow | Not started |
| **6. Future CMS Features** | Later | Restricted users, reviews, and further features | Not planned in detail |

**Progress rule:** Mark a task complete only after the implementation is working, its checks have passed, and you have personally reviewed the result. Finishing a task does **not** automatically authorize the next one.

---

## Milestone 1 — Application Foundation

**Purpose:** Get Luxraj CMS running locally with the agreed modular React + TypeScript + Vite structure, before connecting sensitive services.

- [ ] **Task 0 — Inspect the repository.** Read the existing README and files; establish what is present and what the first implementation change would involve. **Inspection only.**
  - **Your check:** The proposed work matches the approved architecture; nothing has been edited during inspection.
- [ ] **Task 1 — Set up React, TypeScript and Vite.** Establish the application entry point, dependencies, build configuration, and basic module layout.
  - **Your check:** The local development server opens the application; the production build succeeds.
- [ ] **Task 2 — Add routing and layouts.** Separate the login screen layout from the future authenticated dashboard/sidebar layout. Add navigation structure without pretending authentication works yet.
  - **Your check:** Navigation behaves as expected. No real repository data is exposed to unauthenticated visitors.
- [ ] **Task 3 — Shared UI and understandable diagnostics.** Establish genuinely reusable interface components, visible error messages, and initial checks/tests.
  - **Your check:** Common UI looks consistent, errors are understandable, and checks/build succeed.

### Milestone 1 acceptance

- [ ] The application starts locally without errors.
- [ ] The production build passes.
- [ ] Login and dashboard layouts are cleanly separated.
- [ ] Core folders are modular, not one giant component.
- [ ] You know how to run the site and how to see a useful error message.

**Important:** A visible login screen is not the same thing as secure, working login. That comes in Milestone 2.

---

## Milestone 2 — Authentication & Security

**Purpose:** Make sure only authorized users can access the CMS, and that GitHub credentials are never exposed through the public frontend.

- [ ] **Task 4 — Supabase login and sessions.** Implement the approved login-first behavior, logout, session restoration, and protected navigation.
  - **Your check:** Login and logout work. Without a valid login, the dashboard cannot be accessed.
- [ ] **Task 5 — Protected Super Admin permissions.** Establish the backend-controlled initial Super Admin identity, authorization checks, and database access restrictions.
  - **Your check:** The approved account is recognized. A non-approved account cannot bypass access rules simply by changing browser code.
- [ ] **Task 6 — Secure GitHub App installation connection.** Implement Super Admin-only **Connect GitHub** installation approval, verified backend callback/installation ownership, protected persisted installation ID and status, and short-lived installation tokens minted only by Supabase Edge Functions. Provide Super Admin-only status, selected-repository scope, reconnect and GitHub-side uninstall/revocation controls in Settings; never request a personal access token.
  - **Your check:** Approve selected repositories once, return on another session/device without reconnecting, verify an unapproved user cannot link/unlink or use unauthorized repositories, and confirm Disconnect stops CMS access and actually revokes the GitHub installation (or explicitly reports incomplete revocation). No private key or installation token appears in the frontend.

### Milestone 2 acceptance

- [ ] Login, logout, and returning sessions work.
- [ ] Backend authorization is actually enforced.
- [ ] GitHub credentials remain protected.
- [ ] Connection errors can be understood and recovered from.
- [ ] You have tested from a second browser/session where practical.

**Important:** Never paste production secrets into source code, the README, or chat prompts.

---

## Milestone 3 — Repository & Branch Workspace

**Purpose:** Navigate and inspect multiple GitHub repositories and branches without mixing their state.

- [ ] **Task 7 — Repository selection.** Display accessible GitHub repositories and allow the Super Admin to choose the current repository.
  - **Your check:** You can select between authorized repositories; changing the selection does not require entering a token again.
- [ ] **Task 8 — Branch selection and saved preferences.** List allowed branches, switch the current branch, and remember the last selected repository/branch for the user.
  - **Your check:** Selected branches are correct and your workspace preferences restore after login.
- [ ] **Task 9 — Secure file browsing.** Show a file tree and read HTML, CSS, and JavaScript files through authorized backend operations.
  - **Your check:** The displayed contents match the selected repository and selected branch.

### Milestone 3 acceptance

- [ ] Two test repositories can be selected safely.
- [ ] Switching branches changes the files being viewed.
- [ ] Workspace preferences persist for the appropriate user.
- [ ] No inaccessible repository/branch is revealed or read.
- [ ] No accidental edits occur during file browsing.

**Important:** Use safe test repositories/branches for development checks; do not assume the live Luxraj Blog repository's folder layout.

---

## Milestone 4 — Code Editor & Source Control

**Purpose:** Reach a functional **core CMS**: inspect remote source, edit it, save an uncommitted draft, review changes, and explicitly commit to the intended branch.

- [ ] **Task 10 — Monaco code editor.** Integrate Monaco to read and display HTML, CSS, and JavaScript files. Begin with read-only viewing.
  - **Your check:** Syntax highlighting and displayed file contents are correct.
- [ ] **Task 11 — Editing and drafts.** Enable editing, unsaved-change indicators, and Supabase-backed draft storage without modifying GitHub.
  - **Your check:** Make a small change, save the draft, reopen it, and confirm the GitHub file is unchanged.
- [ ] **Task 12 — Shared Change Set and diff viewer.** Track original versus proposed content and display exact changed files and lines in Source Control.
  - **Your check:** You can identify every proposed modification before committing.
- [ ] **Task 13 — Safe GitHub commits.** Commit only after explicit confirmation, with backend authorization and checks against unexpected newer changes.
  - **Your check:** A test change reaches the correct branch only; stale/conflicting changes do not silently overwrite others.
- [ ] **Task 14 — History and committed diffs.** Browse commits and inspect file-level changes, including changes made outside the CMS.
  - **Your check:** You can locate your test commit and compare its code-level differences.

### Tasks 13–14 — agreed interface destination and verification plan

**Where these features live:** Keep the existing Code Editor's three-pane layout unchanged: **Files (left) | Monaco editor/diff (center) | Source Control (right)**. Add **Changes** and **History** views/tabs inside the existing, collapsible **right Source Control panel**; no new top-level page is needed for either task. Maintain the existing Source Control route and do not break unsaved buffers or drafts. Full implementation guidance is in README §6.

**Task 13 — Changes/Commit:**

- [ ] Keep saved changed-file review and open the selected draft diff in the current **center editor**, not in another page.
- [ ] Add commit message and **Review & Commit** beneath changes. Show final confirmation with repository, branch, exact filenames, and message; Cancel never writes.
- [ ] Backend-only GitHub App commit verifies Super Admin, authorized repository/branch, draft/file base versions, current remote files and branch head. Reject stale/conflicting or protected-branch writes safely; never silently overwrite or partially commit a change set.
- [ ] Commit only the confirmed files to the confirmed **test branch**; show commit SHA/link. Preserve saved drafts in Draft Management (including committed drafts), and do not discard unsaved browser edits.
- **Your check:** A commit reaches exactly its intended test branch, the other branch remains unchanged, cancel writes nothing, conflicts stop the commit, and drafts remain available for manual management.

**Approved later enhancement to Task 13 (planning only):** Move the currently fixed 20-file commit selection limit into Super Admin **Settings → Maximum Files Per Commit** (range **1–100**, default **20**), enforced in frontend and backend. Preserve the existing safe review/commit process. This is not recorded as already implemented, and the detailed Code Injector/Author plans live in the portfolio planning document.

**Task 14 — History/Git Commit Graph:**

- [ ] The right-panel **History** tab displays a **Git Commit Graph**, similar to VS Code's graph: commit dots, colored graph lanes, actual parent/merge/split lines, accurate known branch labels, and compact messages/authors/dates/SHAs. Do not invent graph branches or local refs.
- [ ] Scope the graph to the active repository/branch; provide refresh and load-more/pagination. Include GitHub commits made **both inside and outside the CMS**.
- [ ] Selecting a commit reveals its changed files. Selecting a file opens that commit's **before/after Monaco code diff in the center editor** while preserving any unsaved draft buffers.
- [ ] History and diff operations must enforce backend authorization; represent additions/deletions/renames/merges and unavailable/binary diffs honestly.
- **Your check:** Find the Task 13 test commit and an external GitHub/VS Code commit, select both, inspect the actual file/line diffs, and verify the graph accurately represents a real merge when present.

**Combined verification:** Test commit confirmation/cancellation, race conditions, authorization, and branch isolation; then follow the resulting commit through History → changed files → committed diff without altering the editor's active workspace. **Tasks remain pending until the owner personally verifies the behavior.** Planning text does not authorize implementation or deployment.


### Milestone 4 acceptance — **Core CMS ready**

- [ ] Open a GitHub file in the CMS.
- [ ] Edit it without immediately changing GitHub.
- [ ] Save and reopen a draft.
- [ ] Review the exact diff.
- [ ] Approve a commit to a **test branch**.
- [ ] Confirm another branch is unaffected.
- [ ] Inspect the resulting commit in CMS history.
- [ ] Confirm a conflicting newer version is detected safely.

**Gate:** The Metadata Injector must **not** be treated as ready to implement on top of the app until this shared edit/draft/diff/commit workflow has passed its checks.

---

## Milestone 5 — Metadata Injector

**Purpose:** Add the already-planned metadata functionality as independent modules that reuse the established repository workspace and Source Control infrastructure.

- [ ] **Task 15 — Website category templates.** Store the approved Blog template and create independent initial copies for other website categories.
  - **Your check:** Editing the E-commerce copy does not edit Blog, Business, or other category copies. No permanent shared inheritance.
- [ ] **Task 16 — SEO eligibility selection.** Find HTML pages where the owner manually added `data-seo="true"`, allow selections, and save selections per repository/branch.
  - **Your check:** Only eligible pages are listed; deselections persist; the CMS **never inserts the eligibility marker itself**.
- [ ] **Task 17 — Page Type injection.** Assign official Schema.org page types per eligible file or folder, preparing the `data-page-type` attribute without disturbing other HTML.
  - **Your check:** The intended pages receive the right type; unrelated pages and existing attributes remain intact.
- [ ] **Task 18 — Placeholder verification.** Scan applicable fields, identify existing versus missing placeholders, and show the agreed gray, normal, and blue file states.
  - **Your check:** Complete files are disabled, fully missing files are initially selected, and partially complete files remain selectable with clear details.
- [ ] **Task 19 — Missing-placeholder injection.** Prepare only missing approved core, Open Graph, X/Twitter, and Schema.org template structures, then send the proposed changes through shared Source Control.
  - **Your check:** Existing metadata and values remain unchanged; no duplicates are created; nothing is silently disabled; you review the full diff before a commit.

### Milestone 5 acceptance

- [ ] The same injector works with different repository structures.
- [ ] Eligible pages and page types determine which approved placeholders apply.
- [ ] The Blog catalog retains its approved 11 core items, 25 OG properties, six X properties, and all 40 Schema.org catalog entries.
- [ ] Other categories have **independent template copies**, not synchronized references to Blog.
- [ ] The CMS injects **placeholder structures**, not real SEO descriptions, author details, image URLs, or other values.
- [ ] The inspector can distinguish fully complete, fully missing, and partially complete files.
- [ ] All proposed changes pass through the same draft, diff, and explicit commit pathway used by the Code Editor.

**For testing:** It is reasonable to check core metadata, OG, X, and Schema.org subsets separately. Completion still requires verifying the full approved catalog's intended behavior.

---

## Milestone 6 — Future CMS features (later decision)

These are **not included in the initial 20 tasks** and are not approved for implementation merely by listing them here:

- Restricted user invitations and role/branch permissions.
- Author-specific drafts and submission to the Super Admin.
- Pending review, approval, rejection, and commit workflows.
- Metadata value population and other later SEO tools.
- Additional CMS modules and template refinements.

We will break these into small tasks when their exact behavior is decided.

---

## How to use this roadmap as project owner

At the end of **each task**, you should have four things:

1. **A visible result:** What changed in the application and where to find it.
2. **A plain-language explanation:** What changed, why it was needed, and how it relates to HTML/CSS/JavaScript concepts you know.
3. **Test evidence:** Which checks passed, which failed, and any limitations.
4. **Your own verification steps:** Something you can try in the browser or VS Code before accepting the change.

After reviewing those items, mark the task complete and separately decide whether to proceed. If a task fails, leave it incomplete until repaired.

### Simple task record

You can copy this block below a task later to record progress:

```text
Task:
Status: Not started / In progress / Needs fixes / Verified
Date:
Git branch or commit:
What I tested:
Result:
Notes:
```

### Project-level safeguards

- Work in small, reviewable changes and use dedicated development/test branches.
- Do not treat "the app builds" as proof that the feature behaves correctly.
- Never approve a commit or deployment solely because an AI agent reports success.
- Never silently change approved metadata selections, security boundaries, or independent category templates.
- Do not move on to a later milestone while its required foundation is broken.
- Keep [README.md](./README.md) as the source for detailed architecture and specifications. **This file is your progress guide**.

---

**Current next action:** **Task 0 — Read-only repository inspection.** No project implementation is authorized by creating this roadmap.
