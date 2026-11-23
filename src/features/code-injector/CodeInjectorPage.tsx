import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useMatch } from 'react-router';
import { PanelLeft } from 'lucide-react';
import { ModulePanel, ModuleTopbar } from '../../shared/ui/ModuleChrome';
import type { HtmlDiscovery } from '../../../supabase/functions/_shared/workspace-contracts';
import { useEditBuffers } from '../workspace/EditBuffers';
import { BranchPicker, useWorkspace } from '../workspace/WorkspaceLayout';
import { workspaceError, workspaceRequest } from '../workspace/api';
import { defaultSelection, identification, openingTag, pagesFor, prepareBoilerplate, websites } from './boilerplate';
import './code-injector.css';

const SourceInjector = lazy(() => import('./SourceInjector'));

type Scope = { repositoryId: number; branch: string };
type Injection = { path: string; commit: string; source: string; revision: string | null; replacesMarkers: boolean };
const unsavedMessage = 'This file has unsaved editor changes. Open it in Code Editor and save your edits as a draft first.';

function BoilerplateGenerator({ scope, repository }: { scope: Scope | null; repository?: string }) {
  const [category, setCategory] = useState(defaultSelection.category_key);
  const [page, setPage] = useState(defaultSelection.cms_page_type_key);
  const [discovery, setDiscovery] = useState<HtmlDiscovery | null>(null);
  const [path, setPath] = useState('');
  const [injection, setInjection] = useState<Injection | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const request = useRef<AbortController | null>(null);
  const { buffers } = useEditBuffers();
  const attributes = identification(category, page);
  const snippet = attributes ? openingTag(attributes) : '';
  const hasUnsaved = !!scope && !!buffers[JSON.stringify([scope.repositoryId, scope.branch, path])];
  const editorTarget = scope && path ? { editorTarget: { ...scope, path } } : undefined;

  useEffect(() => () => request.current?.abort(), []);

  function clearFeedback() {
    setError('');
    setStatus('');
  }

  async function run(operation: (signal: AbortSignal) => Promise<void>) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    clearFeedback();
    setBusy(true);
    try {
      await operation(controller.signal);
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof Error && error.message === 'branch_changed') {
        setInjection(null);
        setDiscovery(null);
        setPath('');
        setError('The GitHub branch changed. Detect HTML files again before preparing a draft.');
      } else {
        setError(workspaceError(error));
      }
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  async function copy() {
    clearFeedback();
    try {
      await navigator.clipboard.writeText(snippet);
      setStatus('Boilerplate copied.');
    } catch {
      setError('Clipboard access is unavailable. Select and copy the displayed HTML.');
    }
  }

  function detect() {
    if (!scope) return;
    setDiscovery(null);
    setPath('');
    void run(async signal => {
      const result = await workspaceRequest({ action: 'discover_html', ...scope }, signal);
      if (!signal.aborted) setDiscovery(result);
    });
  }

  function prepare() {
    if (!scope || !path || !discovery || !attributes || hasUnsaved) return;
    void run(async signal => {
      const { current, draft } = await workspaceRequest({
        action: 'open_draft', ...scope, path: path.split('/'), commit: discovery.commit,
      }, signal);
      if (signal.aborted) return;
      if (draft && draft.originalBlob !== current.blob) {
        setError('GitHub has changed since this draft began. Review the file and resolve the conflict in Code Editor first.');
        return;
      }
      const base = draft?.proposedSource ?? current.source;
      try {
        const proposed = prepareBoilerplate(base, attributes);
        if (proposed.source === base) setStatus('This file already has the selected boilerplate.');
        else setInjection({ ...proposed, path, commit: current.commit, revision: draft?.revision ?? null });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'The opening HTML tag could not be edited.');
      }
    });
  }

  function save() {
    if (!scope || !injection || hasUnsaved) return;
    void run(async signal => {
      const result = await workspaceRequest({
        action: 'save_draft', ...scope, path: injection.path.split('/'), commit: injection.commit,
        source: injection.source, revision: injection.revision,
      }, signal);
      if (signal.aborted) return;
      setInjection(null);
      setStatus(result.draft ? 'Draft saved. Review the changes in Source Control.' : 'The proposed source already matches GitHub.');
    });
  }

  return <section className="module-body module-scroll boilerplate">
    <h2>Boilerplate Generator</h2>
    <div className="workspace-actions">
      <label>Website Type <select value={category} disabled={busy || !!injection} onChange={event => {
        const next = event.target.value;
        setCategory(next);
        if (!pagesFor(next).some(option => option.cms_page_type_key === page)) setPage('');
        clearFeedback();
      }}>
        {websites.map(website => <option key={website.category_key} value={website.category_key}>{website.website_type}</option>)}
      </select></label>
      <label>Page Type <select value={page} disabled={busy || !!injection} onChange={event => {
        setPage(event.target.value);
        clearFeedback();
      }}>
        <option value="" disabled>Choose a page type</option>
        {pagesFor(category).map(option => <option key={option.cms_page_type_key} value={option.cms_page_type_key}>{option.page_type}</option>)}
      </select></label>
    </div>
    {snippet && <pre aria-label="HTML boilerplate"><code>{snippet}</code></pre>}
    <button type="button" disabled={!snippet || busy || !!injection} onClick={() => void copy()}>Copy</button>
    <h3>Repository HTML files</h3>
    {scope ? <p className="boilerplate-scope">{repository} · {scope.branch}</p>
      : <p><Link to="/repositories">Select a repository and branch</Link> to detect files.</p>}
    <button type="button" disabled={!scope || busy || !!injection} onClick={detect}>Detect all HTML/HTM files from the repository</button>
    {discovery && (discovery.files.length ? <>
      <label className="boilerplate-file">HTML file <select value={path} disabled={busy || !!injection} onChange={event => {
        setPath(event.target.value);
        clearFeedback();
      }}>
        <option value="" disabled>Choose an HTML file</option>
        {discovery.files.map(file => <option key={file}>{file}</option>)}
      </select></label>
      <div className="workspace-actions">
        {editorTarget && !busy && !injection && <Link to="/code-editor" state={editorTarget}>Open in Code Editor</Link>}
        <button type="button" disabled={!path || !attributes || busy || !!injection || hasUnsaved} onClick={prepare}>Inject</button>
      </div>
      {hasUnsaved && <p role="alert">{unsavedMessage}</p>}
    </> : <p>No HTML or HTM files found on this branch.</p>)}
    {injection && <section className="boilerplate-confirm" role="alertdialog" aria-labelledby="boilerplate-confirm-title">
      <h3 id="boilerplate-confirm-title">Save boilerplate draft?</h3>
      <p><strong>{injection.path}</strong> · {repository} · {scope?.branch}</p>
      <p>{injection.replacesMarkers ? 'This replaces existing CMS identification attributes in the opening <html> tag.'
        : 'This adds CMS identification attributes to the opening <html> tag.'} GitHub changes only after a separate Source Control commit.</p>
      <div className="workspace-actions">
        <button type="button" disabled={busy} onClick={() => setInjection(null)}>Cancel</button>
        <button type="button" disabled={busy || hasUnsaved} onClick={save}>Save Draft</button>
      </div>
    </section>}
    {busy && <p role="status">Working with the selected repository…</p>}
    {error && <p className="workspace-alert" role="alert">{error}</p>}
    {status && <p role="status">{status}</p>}
    {status.startsWith('Draft saved') && editorTarget &&
      <Link to="/code-editor" state={{ editorTarget: { ...editorTarget.editorTarget, review: true } }}>Review in Code Editor</Link>}
  </section>;
}

export default function CodeInjectorPage() {
  const injector = useMatch('/code-injector/inject');
  const { workspace: { repositories, selection }, saving } = useWorkspace();
  const [expanded, setExpanded] = useState(true);
  const repository = repositories.find(item => item.id === selection?.repositoryId);
  const scope = !saving && repository && selection?.branch
    ? { repositoryId: repository.id, branch: selection.branch } : null;
  return <div className="module-stack injector-shell">
    <ModuleTopbar title="Code Injector">
      <button type="button" aria-label="Code Injector navigation" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
        <PanelLeft size={17} aria-hidden="true" />
      </button>
      {repository && <Link to="/repositories">{repository.name}</Link>}
      <BranchPicker />
    </ModuleTopbar>
    <div className="injector-body">
      <ModulePanel title="Code Injector sections" hidden={!expanded}>
        <nav aria-label="Code Injector sections">
          <NavLink to="/code-injector" end>Boilerplate Generator</NavLink>
          <NavLink to="/code-injector/inject">Code Injector</NavLink>
        </nav>
      </ModulePanel>
      {injector
        ? <Suspense fallback={<p role="status">Loading injector tools…</p>}>
          <SourceInjector key={JSON.stringify(scope)} scope={scope} repository={repository?.name} />
        </Suspense>
        : <BoilerplateGenerator key={JSON.stringify(scope)} scope={scope} repository={repository?.name} />}
    </div>
  </div>;
}
