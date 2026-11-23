# Luxraj CMS — Universal File Manager Prerequisite (P-1)

> **Owner decision:** Luxraj Kayal (Subrata), November 23, 2026.
> **Status:** Implemented on `codex-development`, pending deployed integration testing and owner acceptance. P-1 remains an unnumbered prerequisite before Task 17 and the later Author phases.
> **Authorization:** Recording this plan does not authorize frontend/backend coding, package installation, Supabase changes or deployment. Those require a new, separately scoped GREEN.

## 1. Purpose, placement, and workflow

The Super Admin will have a **File Manager** in Luxraj CMS **separate from Code Editor and Monaco**. This is an upload, staging and review interface, not another code editor and not another GitHub commit system.

The Super Admin selects the authorized **GitHub repository, branch, destination folder and filename**, then uploads one or multiple files, views the proposed change, chooses **Save Draft**, and reviews all proposed changes through the **existing Source Control** before an explicit GitHub commit. Neither upload nor Save Draft changes GitHub.

The File Manager supports **new-file additions and replacements**. It accepts **all filename extensions / file types**, including Word DOC/DOCX, ODT, PDF, PNG, JPG/JPEG, WebP, AVIF, GIF, SVG, BMP, spreadsheets XLS/XLSX, presentations PPT/PPTX, TXT/MD/HTML/CSS/JS/JSON, fonts, audio/video, archives including ZIP/7z and other unfamiliar or binary files. There is **no file-extension allowlist** for staging. Files are never executed as part of this flow.

Any-file-type support does **not** mean unlimited sizes or bypassing actual Supabase/GitHub platform limits, CMS Storage Management quotas, malware/unsafe-content protections or backend authorization. File size, names/paths and content type must be checked; MIME and filename extension are untrusted hints. A file without a safe rich preview still can be drafted, reviewed and committed, with an honest metadata/hash comparison.

## 2. Owner-decided preview technologies: NOT OPEN DECISIONS

| File family | Required preview and comparison |
| --- | --- |
| PNG, JPEG/JPG, WebP, AVIF, GIF, BMP and browser-supported raster images | Browser-native image preview; old/new side-by-side for replacements; dimension when available, filename, size and checksum |
| **PDF** | **Required PDF.js integration via pdfjs-dist**, including its compatible worker; display pages of existing and proposed PDFs, document page count when available and metadata/hash comparison; do not imply semantic or pixel-perfect diff |
| **Modern Word DOCX** | **Required Mammoth integration via mammoth plus DOMPurify integration via dompurify** to render sanitized, read-only DOCX text/structure for old/new inspection with metadata and hashes; not a Word editor or pixel-perfect Word display |
| Legacy Word DOC and OpenDocument ODT | Fully stage, draft, compare, download and commit; use metadata/size/checksum/download fallback. No Office/LibreOffice conversion or inline renderer in P-1 |
| Excel XLS/XLSX, PowerPoint PPT/PPTX, other Office formats | Fully stage, draft, compare, download and commit; metadata/size/checksum/download fallback; no conversion or editing service in P-1 |
| Text and source files selected in File Manager | Read-only safe UTF-8 preview and text comparison within resource limits; do not require entering Code Editor |
| Audio/video | Browser-native read-only media preview when the browser supports the codec; otherwise metadata/checksum/download fallback |
| SVG, active HTML, archives, fonts, executable files, unsupported or unfamiliar binary formats | Never execute or render untrusted active content; use safe metadata/size/checksum/download fallback |

**Owner decision:** pdfjs-dist, mammoth and dompurify are **required application-library integrations for P-1**. They are not optional, not browser/VS Code extensions and not decisions to defer to Codex. The metadata/hash/download fallback for formats without safe viewers is also the **approved implementation decision**, not an unresolved question.

All proposed changes must visibly say **New file** (if no remote original) or **Replacement**. A binary "diff" is a comparison of file presence, name/path, original/proposed hashes and sizes, and visual previews where safely supported. Never invent line-based code diffs for arbitrary binary bytes. Show "Preview unavailable for this format" where appropriate.

## 3. File drafts, security, and shared GitHub review/commit

1. Keep **raw staged file bytes in private Supabase Storage**. Keep only protected structured draft metadata in PostgreSQL: authenticated owner, repository ID, branch, path, storage object reference, filename, MIME hint, size, SHA-256 checksum, original GitHub blob SHA or verified path absence, draft revision, timestamps and status. Do not put arbitrary binary/base64 data in the current text-draft fields.
2. Use authenticated, backend-authorized uploads and access checks; enforce Storage Management budgets and real backend/platform file-size constraints. Use resumable uploads when appropriate for supported larger files. Validate target path, prevent traversal and cross-user access, verify exact staged-byte integrity, and never embed/execute active uploads.
3. Support multiple files, Save Draft, reopening pending drafts after browser reload, recoverable failed/cancelled commits and drafts-management cleanup. Draft creation does **not** write to GitHub.
4. Where replacing a file, inspect the **actual original GitHub blob** alongside proposed bytes and retain its version identity; for a new file, verify target-path absence and show no fabricated original. Guard against path collisions, remote changes, concurrent drafts and stale branch heads.
5. **Reuse and extend the existing trusted Source Control review/commit backend**, not a separate GitHub publishing mechanism. Preserve Super Admin-only commit authority, GitHub App permission checks, repository and branch isolation, reviewed exact file/path list, original source verification, final confirmation, cancellation, concurrency/stale-head detection and protected-branch errors.
6. **Settings → Maximum Files Per Commit** stays configurable from **1–100**, default **20**. Enforce on the trusted backend; preparing more drafts than one commit limit is allowed. Commit only the files and exact bytes explicitly reviewed by the Super Admin; on success record verified GitHub SHA and mark drafts appropriately.
7. Do not weaken or change the current text Code Editor, Code Injector, Monaco diff or text-draft safety boundaries. File Manager is a separate UI and binary-safe draft service, sharing the **final authorization and commit workflow**.

## 4. Author profile-picture destination: approved owner decision

The Super Admin will configure **Settings → Author Profile Picture Location** with **one chosen GitHub repository, branch, specific assets folder, and public asset URL prefix for all approved profile pictures**. An example folder is assets/authors/, but **no default folder is hardcoded**. Ensure the destination is authorized and the public URL mapping is valid: a GitHub repository path is not necessarily a live website URL.

A **regular Author** supplies a **WebP-only picture of 15–150 KB** in Task 18 profile creation. The image is stored in Supabase Storage and reviewed under the existing Author approval requirement. On approval, the CMS stages the approved image to the configured GitHub folder as a **P-1 File Manager draft**. The **Super Admin explicitly reviews and commits** this binary asset through Source Control. Authors do not gain direct GitHub access or general File Manager privileges.

Keep the submitted **Supabase picture and committed website repository picture as two different copies**. Only a **verified committed and correctly mapped public image URL** may be used as the approved Author identity in generated articles. When an updated profile/image is pending review or its GitHub commit fails, keep the previously approved active profile/image; for a first profile, permit private drafts but keep article Preview and Submit for Review gated as specified in Task 18.

**Super Admin personal profile (owner decision):** Luxraj Kayal (Subrata) may optionally create/update their profile directly, **without regular Author onboarding, self-approval or pending-profile restrictions**. The same account can use **Owner/Admin, Author and Developer** capabilities without losing its administrative role. A GitHub-hosted owner profile picture must still follow the existing explicit review and commit protections. Future Developer and Advisor workspace screen details remain separate from this decision.

## 5. Prerequisite implementation acceptance

- [ ] A separately navigable Super Admin File Manager uploads and stages **any file type**, including image, PDF, DOCX, legacy DOC, Office documents, unknown binary and code/text; accepts multi-file uploads and new/replacement destinations under real platform/security limits.
- [ ] Saving drafts writes exact bytes to **private Supabase Storage**, keeps scoped metadata in PostgreSQL and survives logout/browser reload; GitHub is unchanged until explicit commit.
- [ ] Images show truthful before/after previews, PDF previews render via **PDF.js**, DOCX previews render safely with **Mammoth + DOMPurify**, and legacy/unknown formats show the decided metadata/hash/download fallback.
- [ ] Shared Source Control differentiates new and replacement files, shows path, old/new size and hash, supported visuals, commit message and exact target repository/branch.
- [ ] Only Super Admin can authorize/confirm commits. Binary new/replacement commits retain current GitHub App, branch-head/source-version, collision, configurable commit limit and conflict protections.
- [ ] Errors/cancellation never silently change GitHub or lose pending drafts; successful commits record commit SHA. Code Editor/Code Injector remain working.
- [ ] Settings supports the approved **single configurable profile-image destination**, staging and verified public URL identity; regular Author and Super Admin profile rules remain separate.
- [ ] Automated tests, production build, backend verification and **actual owner browser testing** are reported separately. Passing builds do not by themselves establish acceptance.

## 6. Sequence and authorization

**P-1 must be owner-verified before Task 17.** Hosting changes require separate approval. To test an authorized environment, apply the P-1 migration, deploy the updated `github-workspace` function, and serve the matching frontend.

The File Manager uses the existing 8 MiB total commit payload ceiling, so each staged file is limited to 8 MiB. The private bucket independently enforces this limit and the backend reserves space against the configured File Storage budget. Each upload saves independently. If interrupted, reopen the saved draft list before retrying, or remove an interrupted upload in Draft Management after its reservation is no longer in flight. The upload transport sends one bounded request per file.

PDF comparison renders individual pages on canvas. DOCX preview renders sanitized document structure within a 12 MiB expansion budget. Read-only UTF-8 preview is limited to 256 KiB. Other files within the staging limit remain downloadable as attachments. Old files exceeding 8 MiB show Git blob identity and size.

**Settings → Author Profile Picture Location** accepts an existing repository folder and HTTPS public URL prefix. Use **Stage an approved WebP or verify a committed picture** to prepare the website copy. Verification checks the committed repository blob and then requests the public WebP in the browser without credentials to compare SHA-256. The public host must permit cross-origin reads from the CMS. P-1 does not activate any profile identity.

After P-1 approval and acceptance, proceed to Task 17 and the already-approved Author pages/workflows under Tasks 18–20.

**Related files:** [Development Roadmap](../DEVELOPMENT_ROADMAP.md) and [README](../README.md).
