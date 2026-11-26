# Task 17 — Users & Permissions

## Accounts, work and publishing

- **Users & Permissions → Add New User** provisions an account in Supabase Auth and saves the assigned CMS fields. The password is sent to Auth at creation. It is never stored in the CMS profile or returned in a response. Manually created email accounts appear in **Modify Existing User** and are eligible for member access once the Super Admin saves their CMS profile and role. Explicit deletion disables the member before removing the account and private records.
- **Author**, **Developer** and **Advisor** share the same restricted interface at `#/member/profile`, `#/member/workstation` and `#/member/tasks`. Their assigned HTML applications determine the available tools. Assign a registered control or browse for an existing repository HTML file. Each assignment covers only that application and its selected input files. Revising or removing it invalidates the saved assignment ID. The server checks the current account and assignment even when a member keeps an old browser session open.
- Members use the existing sandbox, local files, assigned repository inputs and their own saved work drafts. Saving work creates a private file with no Git destination. Submitting selected drafts records an immutable set of files, the Task ID and the submitter's name and role. The new submission appears in the Admin dashboard notification and in **Users & Permissions → Tasks and submissions**. Returned work uses its original Task ID. Rejected or terminated tasks retain their submitted work.
- For publication, open a submitted file in Code Editor or File Manager, prepare it directly for commit, or open a submission as input to an Admin application in **Website Controls**. Stage the final file through the existing file draft process. Source Control displays the linked Task ID and adds it to the descriptive commit message automatically. A successful linked commit completes the task. The task retains the first verified SHA and subsequent batches of already-staged work for that submission may use the same Task ID. GitHub and the existing History panel show the individual commits.
- A member's pending profile picture is private. Approval stages the exact WebP bytes through P-1 in the configured profile picture repository, branch and folder. The filename includes the account ID and picture revision. The active profile picture switches only after the matching GitHub commit is recorded. Website asset hosting and cache refresh follow the destination site's own publishing process.

## Server and data model

`github-workspace` verifies the bearer user through Supabase Auth and looks up current permissions. The existing single Super Admin role still gates GitHub publishing and account management. The member endpoints grant access to a narrow set of operations with actor- and assignment-scoped queries. They use the existing installation-scoped GitHub reader and never return GitHub credentials to the member or the iframe.

`20261126094753_cms_task17_permissions.sql` creates service-only tables for member profiles, application assignments, private files, tasks, submission notices and submitted-file links. RLS is enabled and browser roles have no grants on these tables or their functions. Member work and pending pictures use private PostgreSQL bytes, governed by the CMS database allocation and the existing 8 MiB work file limit. Git-ready drafts and profile releases use the existing private P-1 Storage bucket and its limits. Settings maintenance applies to publishing drafts and preferences. Member accounts, private work, profiles and task records are retained there.

Linked commit reviews lock the current submission or picture before the GitHub mutation. The existing branch-head, file revision and file count checks still apply. Recording the receipt archives the exact drafts and updates the task and profile in one database transaction. A definite GitHub rejection releases the review without a completion. If GitHub committed but the receipt is missing, select the original repository and branch, open the review recovery link and enter the SHA. The server verifies branch reachability, parent, message, changed paths and file bytes before recording it. When there is no verified commit, a linked review can be released after ten minutes if the GitHub branch is still at its original head.

## Prepare an isolated test deployment

Use a test Supabase project and a GitHub App installation scoped to a disposable repository. With Supabase CLI v3 authenticated, target the test project explicitly. Preview the migration list before applying it and deploy the updated function after the migrations succeed.

```powershell
$testProjectRef = 'your-test-project-ref'
supabase db push --remote=$testProjectRef --skip-vault --dry-run
supabase db push --remote=$testProjectRef --skip-vault
supabase functions deploy github-workspace --remote=$testProjectRef --use-api --no-verify-jwt
```

Use the existing `CMS_PUBLIC_URL`, GitHub App and ownership settings for the test environment. Configure the frontend with the test `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_GITHUB_CONNECTION_ENABLED=true`. Disable public sign-ups in the test Auth project. No new Edge Function, secret or Storage bucket is required. For local development, run `npm run dev` and open `http://localhost:5173/Luxraj-CMS/`. A production preview from the custom-domain root uses `npm run preview -- --base /`.

## Browser verification

1. **Super Admin.** Create an Author at `#/users-permissions`. Add a second account through Supabase Auth and manage it in **Modify Existing User**. Test account edits and deletion using disposable users. Select a test repository and branch in Repositories. Assign a workstation application and create a task. A second task that resolves to the same local minute must report a duplicate ID.
2. **Author.** Sign in and verify the assigned fields at `#/member/profile`. Try an invalid image, then submit a valid 15–150 KB WebP. Open the assigned app in Workstation, generate output, save it privately, and submit it under the Task ID at `#/member/tasks`. Try the direct `#/source-control` and `#/users-permissions` URLs and confirm access is denied.
3. **Super Admin.** Open the new submission from Dashboard, return it with a comment, and have the Author resubmit under the same ID. Process those files in an Admin application. Save the final draft and cancel the first confirmation. The task should stay **Submitted for Review**. Confirm the reviewed commit and check that the task shows **Completed** with the GitHub link. Use separate test tasks for rejection and termination.
4. **Super Admin and Author.** Set **Settings → Author Profile Picture Location**, preview and approve the pending picture, then confirm the staged file in Source Control. Refresh the member profile. Repeat with a replacement to verify the previous image stays active until the new commit succeeds.
5. **Developer and Advisor.** Repeat the restricted workstation, submission and commit workflow with separately assigned accounts. Remove every application from one member while its session remains open. Refresh the Workstation and confirm access is revoked while the Tasks page and its saved work remain. Verify a second member cannot load that user's draft or assignment ID.

The SQL verification at `supabase/tests/task17.sql` is transactional and intended for a clean, isolated database. Use `psql -v ON_ERROR_STOP=1 -f supabase/tests/task17.sql` with the isolated connection. The deployed Auth, PostgREST, Edge Function and GitHub installation still need an end-to-end owner test together.


## Task 17 refinement — owner testing pending (2026-11-26)

- Users & Permissions now has independent Overview, All Users, Add New User, Profile Approvals, Application Access, Task Management and Terminated Tasks views. Add/Modify use cancel/discard confirmation and user cards show the published avatar or initials.
- Pending Reviews is its own route, with actionable submissions, profile pictures, past submissions and separate pending/unread counters. Only current submissions can be opened as publishing inputs.
- Login checks the member role before showing a denial. First login opens Profile; Continue to Dashboard persists onboarding in Supabase. Subsequent sign-ins open the member role dashboard. Read-only fields use explicit light-surface colors.
- Members may start work, persist links to owned private drafts, mark Finished, and submit the exact linked files. Returned tasks resume Working. Workstation can append newly saved output to an assigned task. A successful associated GitHub commit marks Completed automatically; the explicit Super Admin Force Complete override is documented below.
- My Drafts offers preview for supported text/raster images, download and safe deletion. Unlink from mutable tasks first; files referenced by immutable submissions cannot be deleted. Terminated tasks can be permanently deleted by Super Admin after confirmation; independent private files and GitHub history remain. Unresolved reviews and uncommitted linked publishing drafts block deletion.
- Admin task lists are server-paginated; user directory returns server-filtered pages and bulk-checks Super Admin roles (the Auth directory still enumerates accounts to include manually provisioned users). Member home avoids full draft loads on dashboard/profile; dashboard has aggregate counts, targeted refreshes and hidden-tab polling suppression. Task/draft metadata needed for linking remains available to its owner. Input loading uses batches of four.
- Apply `20261126140000_cms_task17_refinement.sql` after Task 17's original migration and redeploy `github-workspace`. Existing accounts, tasks and immutable submissions are preserved. Existing members without a saved onboarding flag see Profile once on their next sign-in.
- Verify all four roles, first/subsequent login, Cancel/Discard, avatar, separate review views, Working/Finished, linked-file ownership, return/resubmit, task and draft deletion safeguards, and unchanged reviewed publishing. Automated verification is not owner acceptance.


## Task 17 — direct submission publishing and Force Complete (2026-11-26)

Pending Reviews now exposes Preview, Download, Open in Code Editor, Open in File Manager, Prepare for Commit and the existing Website Controls path. The submission editor uses the existing Monaco editor and session recovery for UTF-8 text up to 1 MiB. File Manager accepts original bytes for supported storage sizes. Choose the repository, branch and destination, inspect and save the task-linked draft, then explicitly confirm the commit in Source Control. A new file or replacement remains associated with its immutable submission; a successful verified commit automatically marks its task Completed. Draft saving, cancellation and failed commits do not complete a task. A submission with multiple files follows the existing rule: the first successful associated commit completes the task; select all intended files before committing when they belong together.

Super Admin has a Force Complete override for nonterminal tasks, requiring a reason and confirmation. It records completion time, actor and reason without inventing a GitHub SHA, preserves task data, and is blocked during an active commit review. Completed and terminated tasks cannot be force-completed again. Previously staged linked files can still be committed through Source Control after a forced completion. The UI distinguishes forced completion from a verified GitHub commit. Ordinary members cannot invoke this override.

Apply `20261126150300_cms_task17_direct_publishing_force_completion.sql` after the refinement migration and redeploy `github-workspace`. Test with a submitted text file and an asset, a canceled/failed commit, a successful linked commit, and a separate forced-completion task. Owner acceptance remains pending.

### Native module integration

Submitted text opens in the existing `#/code-editor` workbench as a virtual document, alongside the repository Explorer, Monaco, History and Source Control. Save Draft opens the destination controls inside the editor, and the saved linked file is shown in the native Source Control diff. JSON and Markdown syntax highlighting are supported. Non-code submissions enter the ordinary `#/file-manager` upload queue with their Task ID; inspection and Save Draft use the existing file manager. Old submission URLs redirect to the native modules. Both workflows preserve the immutable author submission, task association and existing commit/Force Complete rules. No additional database or Edge Function changes are required.
