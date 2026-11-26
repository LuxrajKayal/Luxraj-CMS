# Task 17 — Users & Permissions

## Accounts, work and publishing

- **Users & Permissions → Add New User** provisions an account in Supabase Auth and saves the assigned CMS fields. The password is sent to Auth at creation. It is never stored in the CMS profile or returned in a response. Manually created email accounts appear in **Modify Existing User** and are eligible for member access once the Super Admin saves their CMS profile and role. Explicit deletion disables the member before removing the account and private records.
- **Author**, **Developer** and **Advisor** share the same restricted interface at `#/member/profile`, `#/member/workstation` and `#/member/tasks`. Their assigned HTML applications determine the available tools. Assign a registered control or browse for an existing repository HTML file. Each assignment covers only that application and its selected input files. Revising or removing it invalidates the saved assignment ID. The server checks the current account and assignment even when a member keeps an old browser session open.
- Members use the existing sandbox, local files, assigned repository inputs and their own saved work drafts. Saving work creates a private file with no Git destination. Submitting selected drafts records an immutable set of files, the Task ID and the submitter's name and role. The new submission appears in the Admin dashboard notification and in **Users & Permissions → Tasks and submissions**. Returned work uses its original Task ID. Rejected or terminated tasks retain their submitted work.
- For publication, open a submission as input to an Admin application in **Website Controls**. Stage the generated file through the existing file draft process. Source Control displays the linked Task ID and adds it to the descriptive commit message automatically. A successful linked commit completes the task. The task retains the first verified SHA and subsequent batches of already-staged work for that submission may use the same Task ID. GitHub and the existing History panel show the individual commits.
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
