# Website Controls

Select a repository and branch in **Repositories**. In **Website Controls**, add a control with a name and an existing monolithic UTF-8 `.html` application. Associated files and preset output paths are optional. The CMS saves only the registration and its repository-relative paths.

**Run** loads the application and associated inputs at the selected branch head. The runner can supply additional local and repository files. Each run stays bound to its original repository, branch and head. If the branch changes, open a fresh run to review the latest version. Leaving a run closes the application and its in-memory inputs and unstaged outputs. Saved drafts remain available in Source Control.

## Execution modes

The runner starts in **Internal Mode**. Switch to **Local Mode** for normal desktop file selection and browser downloads, then switch back without reloading the application. Existing in-memory application state and pending CMS outputs are retained; Local Mode does not save drafts or supply new repository files. Previously loaded data may remain in the application until it is closed.

In Internal Mode, ordinary HTML file inputs (including programmatic clicks and supported `showPicker()` calls) open the existing repository picker. Choose a file, or multiple files for a multiple-selection input. The CMS supplies the actual bytes as a native FileList and dispatches input/change events. The input's accept attribute is shown as a hint, not an additional CMS extension restriction. Ordinary Blob and data URL anchor downloads are captured as generated outputs, including common detached-anchor exporters and immediate object URL revocation. A matching configured destination or unique matching repository input is suggested; confirm or change the destination and use Save Drafts and Source Control as usual.

No application-specific code is necessary for these common patterns. Directory selection, File System Access APIs, remote server downloads and other custom download mechanisms are not transparently redirected; use Local Mode or the explicit bridge when needed. Normal browser restrictions still apply. The explicit bridge remains available in Internal Mode for advanced applications.

## File bridge for HTML applications

The application can use embedded HTML, CSS and JavaScript and standard browser file APIs. The CMS adds `window.LuxrajCMS` before application scripts run. The bridge provides these methods.

| Method | Behavior |
| --- | --- |
| `await LuxrajCMS.ready` | Resolves when the initial input list is available, including when it is empty. |
| `await LuxrajCMS.getFiles()` | Returns a snapshot of the supplied input files as conventional `File` objects. Repository inputs use their repository-relative path as the name. Local files use their original name. |
| `LuxrajCMS.onFiles(callback)` | Calls the callback with the full list when supplied files change. Returns a function that unsubscribes. |
| `await LuxrajCMS.requestRepositoryFiles()` | Opens the CMS picker so the user can choose additional files in the running workspace. Observe changes through `onFiles`. |
| `await LuxrajCMS.emitOutputs(outputs)` | Sends an array of `File` objects or descriptors `{ name, type?, data, path? }`. `name` is a filename. `data` accepts a string encoded as UTF-8, a Blob or File, an ArrayBuffer, or an ArrayBuffer view. `path` optionally suggests a repository-relative destination. The promise confirms that the message was sent. Draft status and validation appear in the CMS runner. |

For example, an application can combine supplied files with its own file input, process them, and send its output files from its save button.

```js
const bridge = window.LuxrajCMS;
const initial = await bridge.getFiles();
const unsubscribe = bridge.onFiles(files => updateInputList(files));
updateInputList(initial);

await bridge.emitOutputs([
  { name: 'summary.txt', type: 'text/plain', data: generatedText },
  { name: 'result.bin', data: generatedBytes, path: 'assets/result.bin' },
]);
```

The CMS applies configured destinations in output array order, then uses a valid suggested path or the filename as the initial value. Choose the repository root or an existing folder, as in File Manager. The Super Admin confirms destinations by selecting **Save Drafts**. Drafts of a new path show as additions. Drafts targeting an existing path show as replacements. Open **Source Control** for the diff and the existing **Review & Commit** confirmation. The CMS uses Monaco for eligible UTF-8 changes and the binary file comparison for other files.

The document runs in an opaque-origin iframe with scripts, forms and downloads enabled. It cannot read CMS storage, DOM or session credentials. Monolithic applications can use embedded assets, data or Blob URLs, and external resources that work under normal browser security and CORS. Supply repository files explicitly through the picker. Relative URLs do not mount the repository or CMS. As with a local HTML tool, supply files only to applications and dependencies you trust.

## Maintenance

**Settings → Maintenance** offers three confirmed operations across all repositories and branches. Clearing controls removes registrations only. Clearing drafts removes saved draft records and private draft objects, including retained copies of committed drafts. Full cleanup also restores workspace selection and profile picture destination to unset, restores storage and commit limits to their defaults, and resets presentation preferences in the current browser. Saved templates and groups are authored content. Auth, GitHub App registration, and committed repository files remain in place.

Incomplete draft cleanup reports the number of remaining drafts. Retry after in-progress uploads finish or after Storage recovers. Browser editor buffers are independent of the saved drafts and remain available.

## Development environment setup

Use an isolated Supabase project and a GitHub App installation scoped to disposable test repositories. Apply pending migrations in order, including `20261123174612_cms_universal_file_drafts.sql` if needed, then `20261124175131_cms_website_controls.sql`. Deploy the updated `github-workspace` Edge Function. Use the existing GitHub App and Supabase configuration with `VITE_GITHUB_CONNECTION_ENABLED=true`. No new application secrets or bucket are required.
