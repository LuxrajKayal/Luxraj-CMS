# Luxraj CMS — Website Controls

**Codex implementation specification | 24 November 2026**

A universal monolithic HTML application runner and file draft management module for Luxraj CMS.

This specification defines the agreed scope for Codex to implement Website Controls in Luxraj CMS. Implement only the CMS functionality described here when authorized. Do not implement, modify or embed any individual website application or website-specific workflow.

## 1. Purpose and scope

Website Controls shall be independent of any particular website, feature or file format. The CMS provides a browser execution environment for self-contained HTML applications, supplies files to those applications, receives generated output files, saves them as temporary drafts and uses the existing Source Control workflow to commit them.

Each HTML application is responsible for its own interface, functionality, input processing, feature-specific validation and output generation. The CMS does not need to understand the application's internal logic, menu, schema or file format.

The module shall support text and binary files, including JSON, Markdown, JavaScript, CSS, HTML, XML, images and other file types supported by the existing CMS file management infrastructure. Website Controls shall not introduce additional file extension restrictions.

## 2. Website Controls page

The module inherits the currently selected repository and branch from the existing repository selection menu. A separate repository or branch selector is not required.

- Display previously saved controls associated with the selected repository and branch.
- Provide an **Add Control** option.
- No file selection is required merely to open the module.
- Display each registered application as a persistent control card with a **Run** action.

## 3. Add Control

When the user selects **Add Control**, present the following fields:

| Field | Purpose |
| --- | --- |
| HTML application | Select the existing monolithic `.html` application from the selected repository and branch. |
| Associated files | Optionally select one or more existing files required by the application, without imposing a file extension restriction. |
| Output destination paths | Optionally configure repository-relative destinations for generated files. Outputs may also be assigned destinations during execution. |
| Control name | Enter a user-defined name for the saved control. |

On Save, register the control name, HTML application path, optional associated input paths and optional output destination paths against the currently selected repository and branch. Display the saved control as a persistent card.

Associated files are optional. An application may operate without existing input files, accept additional files during execution or generate entirely new files.

Registering a control does not modify website files.

## 4. Persistent control preferences

Persist control registrations in the CMS settings infrastructure. Each registration stores only its configuration and references:

- User-defined control name.
- Repository identity and branch.
- Repository-relative HTML application path.
- Optional associated repository input file paths.
- Optional configured repository output destination paths.

Do not persist permanent copies of the HTML application, associated file contents or local input files as control preferences. Retrieve repository files when the application runs. Generated output content belongs only to the existing temporary draft infrastructure until committed or discarded.

### Repository and branch isolation

- Maintain independent control registrations for each repository and branch.
- When the selected repository or branch changes, display only registrations belonging to that selection.
- When a previously selected repository and branch is selected again, automatically restore its saved control cards and configured paths.
- Switching repositories or branches must not delete or overwrite other registrations.
- Preferences must persist across page reloads, browser closure, logout and subsequent login, subject to existing CMS access controls.
- Bind each running application and its outputs to the repository and branch for which it was launched. A subsequent repository or branch switch must not silently redirect its pending outputs to another destination.

## 5. Run and work with the application

1. The user selects **Run** on a saved control card.
2. The CMS retrieves the registered HTML application and any associated files from the selected repository and branch.
3. The monolithic HTML application opens in an isolated browser execution environment.
4. The CMS makes the associated input files available to the application.
5. During execution, the user may select additional local files or files from the selected repository and branch. Both sources may be used together.
6. The user works through the interface defined entirely by the HTML application. The application may configure, edit, process, convert or generate files according to its own functionality.
7. When the user invokes the application's save or output action, the application generates one or more output files.

The execution environment shall support normal browser-compatible HTML, CSS, JavaScript, libraries, file selection and file processing capabilities. It shall not impose feature-specific restrictions, predefined application schemas or artificial file format limitations. Normal browser security and compatibility requirements continue to apply.

## 6. Generated output and repository destinations

Generated output is not required to have the same filename, extension or content format as an input file. An application may produce a single file or multiple files, including text and binary files.

The CMS receives the generated files and allows the user to associate each output with a destination in the repository and branch bound to the running control. Use configured output paths when applicable, while allowing the user to choose destinations during execution.

| Output scenario | Source Control treatment |
| --- | --- |
| Update an existing repository file | Modification |
| Generate a new repository file | Addition |
| Convert a file to another format | Addition or replacement, according to the selected destination |
| Generate multiple output files | Multiple pending additions or modifications |

The user may replace an existing repository file or add a new file. Processing an input file does not automatically modify or replace that file.

No local download is required to transfer the generated output into the CMS draft workflow.

## 7. Temporary drafts and Source Control

1. The CMS saves the generated output files directly to the existing Supabase temporary draft infrastructure, associated with their selected repository, branch and destination paths.
2. The Source Control option in the dashboard indicates pending changes using the existing notification mechanism.
3. The user independently opens Source Control and reviews the pending additions and modifications using the existing comparison workflow.
4. Text files use the existing text comparison workflow, including Monaco diff where applicable. Binary files use the existing binary comparison workflow.
5. The user selects the files to commit and confirms the commit using the existing implementation process.
6. The confirmed files are added to or replaced in the selected repository and branch.

No automatic commit, separate Source Control popup or additional feature-specific publishing workflow is required.

Existing CMS file-size limits, storage constraints and the configurable maximum files per commit continue to apply. Website Controls shall reuse these existing capabilities rather than introduce separate limits or duplicate infrastructure.

## 8. Responsibility and isolation

| Responsibility | Responsible component |
| --- | --- |
| Register and retrieve applications | CMS |
| Provide the browser execution environment | CMS |
| Supply associated and additional repository files | CMS |
| Select local input files | User through the application or CMS file input workflow |
| Define the application interface and functionality | HTML application |
| Interpret input formats and validate feature-specific content | HTML application |
| Process files and generate output | HTML application |
| Receive output and manage repository destinations | CMS |
| Save temporary drafts and indicate pending changes | CMS |
| Compare changes and manage confirmed commits | CMS |
| Use the published files in the website | Website runtime or existing website workflow |

The isolation boundary protects CMS authentication, GitHub and Supabase credentials and preserves the existing user-confirmed Source Control workflow. The application must not gain direct access to those credentials or bypass the CMS publishing process.

Isolation shall not be used to impose unnecessary limitations on the application's browser-compatible functionality, supported file formats, input sources or generated output. The CMS retains responsibility for draft storage and repository changes through its existing infrastructure.

The CMS shall not require feature-specific code changes whenever a new control application is registered.

## 9. Existing CMS infrastructure to reuse

- Repository and branch selection.
- Persistent CMS settings infrastructure.
- Universal File Manager for text and binary file handling.
- Supabase temporary draft storage.
- Monaco text comparison and existing binary comparison.
- Source Control pending-change indicators.
- Configurable maximum files per commit.
- Existing user-confirmed GitHub commit workflow.

## 10. Centralized settings and draft cleanup

Add the following maintenance options to the existing CMS Settings page. These are CMS-wide operations, not limited to the currently selected repository or branch.

| Option | Required behavior |
| --- | --- |
| Clear Website Control Preferences | Delete all persisted control registrations and their saved paths across repositories and branches. |
| Clear All Drafts | Delete all temporary CMS drafts across repositories and branches, including text and binary drafts and their associated temporary storage objects. |
| Clear All Settings and Drafts | Reset user-configurable CMS preferences, including all Website Control registrations, and perform the full draft cleanup. |

Require explicit user confirmation before executing a destructive cleanup action. Use existing CMS authorization and storage mechanisms.

- Clearing Website Control preferences alone does not delete draft content.
- Clearing drafts alone does not remove saved control preferences.
- After draft cleanup, refresh Source Control so deleted drafts and their pending-change indicators no longer appear.
- Clear actual temporary draft records and their associated storage objects; do not merely hide them from the interface.
- Reset user-configurable settings to their existing defaults where applicable.
- Preserve authentication credentials, account records and essential CMS infrastructure.
- Never delete or modify committed repository files through a cleanup action.

## 11. Implementation requirements for Codex

- The generic communication mechanism between the HTML application and CMS for supplying associated files, selecting additional repository files and receiving generated output.
- Support for transferring multiple text and binary files through that mechanism.
- Browser execution isolation and credential protection without unnecessary application functionality restrictions.
- Integration with the existing Universal File Manager, temporary draft infrastructure and Source Control workflow.
- Persistent repository- and branch-scoped control registrations using the existing settings architecture.
- Centralized cleanup of preferences, draft records and associated temporary storage.

Inspect the existing CMS implementation before choosing the communication mechanism, persistence schema and integration points. Reuse existing services, components and workflows wherever applicable. Do not introduce an additional feature-specific publishing pipeline.

These implementation details shall not introduce hardcoded website names, repositories, directory structures, application names, target file extensions, website-specific processing logic or a separate publishing workflow into the CMS.

## 12. Acceptance criteria

Verify the following against the completed CMS implementation:

- Opening Website Controls does not require selecting files beyond the CMS's existing repository and branch selection.
- A control can be registered with an HTML application and no associated input files, or with multiple associated files and optional output destinations.
- Registered controls are restored after reload and subsequent login; switching repositories or branches shows the corresponding independent registrations.
- Saved preferences contain file references, not permanent copies of application or input file content.
- A monolithic browser-compatible HTML application can use local and repository files together, accept additional inputs during execution and generate multiple text or binary outputs.
- Generated outputs can be assigned new repository paths or existing file destinations, irrespective of input file extension.
- Output is saved through existing temporary drafts; Source Control shows the appropriate additions or modifications and commits only after user confirmation.
- Switching repository or branch does not redirect outputs from an already running application or existing drafts.
- All three Settings cleanup options perform their respective operations, preserve unrelated data as specified, and do not alter committed repository files.
- The implementation remains independent of any specific website, application or file format and retains existing CMS limits and authorization boundaries.

## 13. Core owner decision

Luxraj CMS provides the environment to run monolithic HTML applications, supplies local and repository file inputs through the agreed workflow, receives generated files, saves them as temporary drafts and commits the user-approved changes through existing Source Control.

The HTML application determines what happens. The CMS provides the execution environment, file access, draft storage and publishing infrastructure.

Website Controls is a universal application runner and file draft management module, not a JSON configuration manager. It has no responsibility for the internal functionality of an individual website feature.

**Scope: Luxraj CMS implementation only. Individual website applications and their internal workflows are excluded.**
