# Luxraj-CMS

Cloud-based CMS powered by Supabase and GitHub.

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
| Supabase secure storage / Vault | Protected GitHub credential storage, accessible only to trusted backend code |
| Supabase Edge Functions | Authenticate requests, authorize repository/branch actions, securely call GitHub |
| GitHub API | List authorized repositories and branches; read HTML/CSS/JS; create approved commits; read commit history |

A public frontend repository must never contain GitHub tokens, Supabase secret/service-role keys, decrypted credentials, or other private secrets. A frontend Supabase publishable key may be public when access controls are correctly configured.

**Important:** A GitHub API commit updates the remote branch directly. It does not require a separate local \`git push\`, and it does not update a user's local clone until they fetch/pull.

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

### First-time GitHub connection

1. Super Admin logs in and their role is verified.
2. If no GitHub credential is configured, show a **first-time GitHub token connection screen**.
3. Super Admin enters a GitHub token. A trusted Supabase server function verifies it and securely stores the credential in Supabase (encrypted secret storage planned).
4. After successful verification/storage, **open the Dashboard**.
5. On future logins with a valid connection, open the Dashboard directly.
6. Move all future token management to **Settings → GitHub Connection**, visible only to the Super Admin: view connection status, replace token, disconnect/revoke.

Token handling requirements:

- The token passes from the initial entry form over HTTPS directly to an authorized backend function; it must never be persisted in frontend storage, source files, GitHub Pages assets, or logs.
- The backend must **never return the stored token** to CMS users, including authors.
- Prefer a **fine-grained GitHub token** scoped to approved repositories and necessary permissions. One credential may provide access to multiple repositories under the same GitHub resource owner.
- The backend, not the frontend, performs privileged GitHub calls and checks the CMS user's permission on each operation.
- A revoked/expired credential should display a connection warning and allow Super Admin replacement through Settings.

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

## 7. Metadata Injector — generic, repository-independent feature

Metadata Injector is a **dedicated left-sidebar item**. It opens a single viewport for the **current repository and branch**, with staged steps.

The engine must **not** assume Luxraj Blog's file tree, Page ID format, metadata schema, or particular HTML placeholders. Placeholder definitions, intended insertion points, and other injection rules will be designed/configured **per repository** in later planning.

### Step 1 — SEO-eligible HTML selection (agreed)

**One universal eligibility marker is deliberately fixed for the CMS:**

\`\`\`html
<html data-seo="true">
\`\`\`

Behavior:

1. Admin manually adds \`data-seo="true"\` to the opening \`<html>\` element of pages they want eligible, using the Code Editor.
2. Metadata Injector scans **HTML files in the selected repository and branch** and shows **only files with this marker** in the Step 1 dropdown.
3. Admin can **Select All**, manually select/deselect individual eligible files, **Cancel** unconfirmed changes, or **Save Selection**.
4. Save the confirmed Step 1 selection to **Supabase**, scoped to that repository and branch, so it persists across sessions/devices.
5. **Only confirmed, still-eligible HTML files** advance to Step 2. If a file loses the marker later, prior selection must not override its ineligibility.
6. Step 2 stays locked until Step 1 selection is saved.

Step 1 **does not automatically inject** the eligibility marker. The Admin controls which pages become eligible by editing source HTML.

### Step 2 — Placeholder verification and selective injection (agreed behavior)

After saving Step 1, unlock Step 2 **in the same viewport**. The CMS checks only confirmed eligible files against the set of placeholders required by that repository's configuration.

| File state | Visual appearance | Selection/injection behavior |
| --- | --- | --- |
| All required placeholders already exist | **Gray / disabled** | Not selectable; no injection necessary |
| All required placeholders are missing | **Normal** | Eligible and **automatically checked** for injection |
| Some placeholders exist and others are missing | **Blue** | Still selectable for injection of **only its missing placeholders** |

- Hovering over a filename shows the **specific existing placeholders and missing placeholders**. A mobile-accessible tap/details equivalent should provide the same information.
- Provide selection controls for eligible files; completed/gray files are never injection targets.
- For partially complete/blue files, whether they should start checked by default was **not yet decided**; their ability to be selected **was** decided.
- The CMS must preserve existing placeholder elements and values, inject only missing ones, and avoid duplicates or modifications unrelated to the selected operation.
- Admin chooses the target files and prepares the injection; the resulting HTML changes enter the **shared review/diff process** before any GitHub commit.
- No silent auto-commit after injection.

### What is *not yet defined*

The following are **open design questions**, not implementation assumptions:

- Which placeholder types exist for each repository.
- How administrators define placeholders and insertion locations, and whether rules can vary by branch.
- How to handle malformed, ambiguous, or multiply occurring placeholders.
- Which further steps follow Step 2 in the same viewport.
- The exact injection UI behavior and the default selection state of partially complete (blue) files.

**Do not implement Step 2 with assumed Luxraj Blog placeholder names or templates.**

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
| 4. Metadata Injector | Steps 1 and 2 and further approved placeholder rules | Verify marker eligibility, stored selection, partial/missing classification, accurate diffs, safe injection |
| 5. Users and permissions | Invitations, restricted accounts, repository/branch authorization | Prove unauthorized users cannot read/write other workspaces |
| 6. Author reviews | Supabase drafts, submission queue, approve/reject flow | Prove pending drafts never touch GitHub until Admin approval |

Each phase must have an agreed scope, actual end-to-end testing, and explicit owner approval before implementation. The phase order is a **proposal**, not a commitment to invent unfinished features.

## 11. Planning status and change boundaries

**Discussed and established so far:** login-first UI, one Super Admin with future restricted users, first-time GitHub token connection and Settings management, Supabase-stored user preferences, repository and remote branch selection, future branch-level user assignments, a VS Code-style HTML/CSS/JS editor, code-level before/after reviews and commit history, shared review-before-commit flow, and Metadata Injector Steps 1 and 2.

**Still being discussed:** placeholder schema and location rules, remaining Metadata Injector stages, exact author permissions and review controls, and finer UI details.

**No application implementation is authorized by updating this README.** This commit documents the plan only. Existing Luxraj Blog and older CMS repositories are outside the scope of this documentation update.
