import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ModulePanel } from '../../shared/ui/ModuleChrome';
import type { CodeGroup, FileVersion, HtmlDiscovery } from '../../../supabase/functions/_shared/workspace-contracts';
import { useEditBuffers } from '../workspace/EditBuffers';
import { workspaceError, workspaceRequest } from '../workspace/api';
import { defaultSelection, pagesFor, websites } from './boilerplate';
import { compareTemplates, inspectSource, proposeInsertion, readTemplate, type ParsedTemplate } from './code-matching';
import { InjectionLines } from './InjectionLines';
import { TemplatePanel } from './TemplatePanel';

const MonacoDiff = lazy(() => import('../workspace/MonacoViews').then(module => ({ default: module.MonacoDiff })));
type Scope = { repositoryId: number; branch: string };
type Target = {
  current: FileVersion; base: string; revision: string | null; offset: number | null;
  decision: 'duplicate' | 'replace' | null; acknowledged: boolean;
  scan: ReturnType<typeof inspectSource>;
};
type Proposal = { path: string; target: Target; source: string };
type SavedResult = { path: string; error?: string };
const isHtml = (path: string) => /\.html?$/i.test(path);

export default function SourceInjector({ scope, repository }: { scope: Scope | null; repository?: string }) {
  const [mode, setMode] = useState<'selection' | 'universal'>('selection');
  const [category, setCategory] = useState(defaultSelection.category_key);
  const [page, setPage] = useState(defaultSelection.cms_page_type_key);
  const [catalog, setCatalog] = useState<{ templates: ParsedTemplate[]; groups: CodeGroup[] } | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [discovery, setDiscovery] = useState<HtmlDiscovery | null>(null);
  const [unreadable, setUnreadable] = useState<string[]>([]);
  const [targets, setTargets] = useState<Record<string, Target>>({});
  const [active, setActive] = useState('');
  const [filter, setFilter] = useState('');
  const [filePage, setFilePage] = useState(0);
  const [preview, setPreview] = useState<Proposal[] | null>(null);
  const [results, setResults] = useState<SavedResult[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [catalogError, setCatalogError] = useState('');
  const [catalogVersion, setCatalogVersion] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);
  const { buffers } = useEditBuffers();

  useEffect(() => {
    const controller = new AbortController();
    setCatalogError('');
    workspaceRequest({ action: 'injector_catalog' }, controller.signal).then(result => {
      if (controller.signal.aborted) return;
      const templates = result.templates.map(template => {
        try { return { ...template, items: readTemplate(template.kind, template.source) }; }
        catch { return { ...template, items: [] }; }
      });
      setCatalog({ templates, groups: result.groups });
    }).catch(error => { if (!controller.signal.aborted) setCatalogError(workspaceError(error)); });
    return () => controller.abort();
  }, [catalogVersion]);
  useEffect(() => () => controllerRef.current?.abort(), []);

  const selectedTemplates = chosen.flatMap(id => catalog?.templates.find(template => template.id === id) ?? []);
  const target = targets[active];
  const targetEntries = Object.entries(targets);
  const existing = target?.scan;
  const assessment = compareTemplates(selectedTemplates, existing?.items ?? []);
  const activePreview = preview?.find(item => item.path === active);
  const files = (discovery?.files ?? []).filter(path => path.toLowerCase().includes(filter.trim().toLowerCase()));
  const shownFiles = files.slice(filePage * 100, (filePage + 1) * 100);

  function hasUnsaved(path: string) {
    return !!scope && !!buffers[JSON.stringify([scope.repositoryId, scope.branch, path])];
  }

  function resetFiles() {
    setPreview(null);
    setDiscovery(null);
    setUnreadable([]);
    setTargets({});
    setActive('');
    setFilePage(0);
    setResults([]);
    setError('');
  }

  async function run(status: string, work: (signal: AbortSignal) => Promise<void>) {
    if (controllerRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(status);
    setError('');
    try { await work(controller.signal); }
    catch (error) { if (!controller.signal.aborted) setError(workspaceError(error)); }
    finally {
      controllerRef.current = null;
      if (!controller.signal.aborted) setBusy('');
    }
  }

  function detect() {
    if (!scope || (mode === 'selection' && !page)) return;
    resetFiles();
    void run('Scanning selected branch…', async signal => {
      const scan = await workspaceRequest({ action: 'discover_sources', ...scope }, signal);
      if (mode === 'universal') {
        if (!signal.aborted) setDiscovery(scan);
        return;
      }
      const html = scan.files.filter(isHtml);
      const matches: string[] = [];
      const skipped: string[] = [];
      for (let i = 0; i < html.length && !signal.aborted; i += 12) {
        const match = await workspaceRequest({ action: 'scan_injector_html', ...scope, commit: scan.commit,
          files: html.slice(i, i + 12), category, page }, signal);
        matches.push(...match.matches);
        skipped.push(...match.unreadable);
      }
      if (signal.aborted) return;
      setDiscovery({ commit: scan.commit, files: matches.sort((a, b) => a.localeCompare(b)) });
      setUnreadable(skipped);
    });
  }

  function selectFile(path: string) {
    if (!scope || !discovery) return;
    setPreview(null);
    if (Object.hasOwn(targets, path)) {
      setTargets(Object.fromEntries(targetEntries.filter(([item]) => item !== path)));
      if (active === path) setActive(targetEntries.find(([item]) => item !== path)?.[0] ?? '');
      return;
    }
    void run('Loading ' + path + '…', async signal => {
      const { current, draft } = await workspaceRequest({ action: 'open_draft', ...scope,
        commit: discovery.commit, path: path.split('/') }, signal);
      if (signal.aborted) return;
      if (draft && draft.originalBlob !== current.blob) {
        setError(path + ': GitHub changed since this draft began. Resolve the conflict in Code Editor.');
        return;
      }
      const base = draft?.proposedSource ?? current.source;
      const selected = { current, base, scan: inspectSource(path, base), revision: draft?.revision ?? null,
        offset: null, decision: null, acknowledged: false };
      setTargets(previous => ({ ...previous, [path]: selected }));
      setActive(path);
    });
  }

  function chooseTemplates(ids: string[]) {
    setChosen(ids);
    setPreview(null);
    setTargets(Object.fromEntries(targetEntries.map(([path, file]) => [path, { ...file, decision: null }])));
  }

  function updateTarget(values: Partial<Target>) {
    setPreview(null);
    setTargets(previous => ({ ...previous, [active]: { ...previous[active], ...values } }));
  }

  function plan() {
    if (!targetEntries.length || !selectedTemplates.length) return;
    setError('');
    setPreview(null);
    const proposals: Proposal[] = [];
    for (const [path, file] of targetEntries) {
      const { scan } = file;
      const match = compareTemplates(selectedTemplates, scan.items);
      let message = '';
      if (hasUnsaved(path)) message = 'Save the unsaved editor changes before injecting.';
      else if (file.offset === null) message = 'Choose an insertion line.';
      else if (match.repeated) message = 'Selected templates have overlapping match identities. Narrow the template selection.';
      else if (scan.warnings.length && !file.acknowledged) message = 'Review the syntax warning and confirm a manual duplicate check.';
      else if (match.matches.length && !file.decision) message = 'Choose Duplicate or Replace for the existing matches.';
      else if (file.decision === 'replace' && match.blocked) message = 'These matches contain unrelated code. Choose Duplicate or edit in Code Editor.';
      if (message) { setActive(path); setError(path + ': ' + message); return; }
      try {
        const source = proposeInsertion(file.base, file.offset!, selectedTemplates, file.decision === 'replace' ? match.matches : []);
        if (source === file.base) continue;
        if (new TextEncoder().encode(source).length > 1048576) {
          throw new Error('The resulting draft exceeds the 1 MiB source limit.');
        }
        proposals.push({ path, target: file, source });
      } catch (error) {
        setActive(path);
        setError(path + ': ' + (error instanceof Error ? error.message : 'No preview is available.'));
        return;
      }
    }
    if (!proposals.length) { setError('The proposals match the existing source. There is nothing to save.'); return; }
    setPreview(proposals);
    setActive(proposals[0].path);
  }

  function save() {
    if (!scope || !preview) return;
    const editorConflict = preview.find(item => hasUnsaved(item.path));
    if (editorConflict) {
      setPreview(null);
      setError(editorConflict.path + ': Save the unsaved editor changes before injecting.');
      return;
    }
    setResults([]);
    void run('Saving reviewed drafts…', async signal => {
      const saved: SavedResult[] = [];
      for (const { path, target, source } of preview) {
        if (signal.aborted) return;
        try {
          await workspaceRequest({ action: 'save_draft', ...scope, path: path.split('/'), commit: target.current.commit,
            revision: target.revision, source }, signal);
          saved.push({ path });
        } catch (error) { saved.push({ path, error: workspaceError(error) }); }
        if (!signal.aborted) setResults([...saved]);
      }
      if (signal.aborted) return;
      const done = new Set(saved.filter(item => !item.error).map(item => item.path));
      setPreview(null);
      const remaining = targetEntries.filter(([path]) => !done.has(path));
      setTargets(Object.fromEntries(remaining));
      setActive(remaining[0]?.[0] ?? '');
    });
  }

  return <div className="injector-workspace">
    <section className="module-body module-scroll injector-main">
      <h2>Code Injector</h2>
      {!scope && <p><Link to="/repositories">Select a repository and branch</Link> to detect files.</p>}
      {scope && <p>{repository} · {scope.branch}</p>}
      <fieldset className="injector-detection-mode" disabled={!!busy}>
        <legend>Detection Mode</legend>
        <label><input type="radio" name="injector-detection-mode" checked={mode === 'selection'}
          onChange={() => { setMode('selection'); resetFiles(); }} /> Selection Mode</label>
        <label><input type="radio" name="injector-detection-mode" checked={mode === 'universal'}
          onChange={() => { setMode('universal'); resetFiles(); }} /> Universal Mode</label>
      </fieldset>
      {mode === 'selection' ? <p>Show only HTML pages identified by the selected CMS boilerplate attributes.</p>
        : <p>Show repository-wide source candidates, including HTML without CMS markers. Readable UTF-8 source is required to edit a file.</p>}
      <div className="workspace-actions">
        {mode === 'selection' && <>
          <label>Website Type <select value={category} disabled={!!busy} onChange={event => {
            const next = event.target.value;
            setCategory(next);
            if (!pagesFor(next).some(item => item.cms_page_type_key === page)) setPage('');
            resetFiles();
          }}>
            {websites.map(item => <option key={item.category_key} value={item.category_key}>{item.website_type}</option>)}
          </select></label>
          <label>Page Type <select value={page} disabled={!!busy} onChange={event => { setPage(event.target.value); resetFiles(); }}>
            <option value="">Choose a page type</option>
            {pagesFor(category).map(item => <option key={item.cms_page_type_key} value={item.cms_page_type_key}>{item.page_type}</option>)}
          </select></label>
        </>}
        <button type="button" disabled={!scope || (mode === 'selection' && !page) || !!busy} onClick={detect}>Detect</button>
      </div>
      {discovery && <section aria-label="Detected files">
        <p>{mode === 'selection' ? discovery.files.length + ' matching CMS-identified HTML pages.' : discovery.files.length + ' repository-wide source candidates. Files are checked for readable text when opened.'}</p>
        {unreadable.length > 0 && <details><summary>{unreadable.length} HTML files could not be inspected</summary>
          <p>These files were unavailable, exceeded the 1 MiB limit, or could not be read as UTF-8 text.</p>
          <ul>{unreadable.map(path => <li key={path}>{path}</li>)}</ul></details>}
        <label>Filter file paths <input type="search" value={filter} onChange={event => { setFilter(event.target.value); setFilePage(0); }} /></label>
        <div className="injector-files">
          {shownFiles.map(path => <label key={path}>
            <input type="checkbox" aria-label={'Select file ' + path} checked={Object.hasOwn(targets, path)}
              disabled={!!busy} onChange={() => selectFile(path)} /> {path}
          </label>)}
        </div>
        {files.length > 100 && <div className="workspace-actions">
          <button type="button" disabled={filePage === 0} onClick={() => setFilePage(filePage - 1)}>Previous files</button>
          <button type="button" disabled={(filePage + 1) * 100 >= files.length} onClick={() => setFilePage(filePage + 1)}>Next files</button>
        </div>}
      </section>}
      {targetEntries.length > 0 && <div className="workspace-actions">
        <label>Active source file <select value={active} onChange={event => setActive(event.target.value)}>
          {targetEntries.map(([path, file]) => <option key={path} value={path}>{path}{file.offset === null ? ' · choose line' : ''}</option>)}
        </select></label>
        {scope && <Link to="/code-editor" state={{ editorTarget: { ...scope, path: active } }}>Inspect in Code Editor</Link>}
      </div>}
      {target && existing && <>
        {hasUnsaved(active) && <p role="alert">This file has unsaved editor changes. Save them in Code Editor and reopen the target.</p>}
        <InjectionLines key={active} source={target.base} offset={target.offset} disabled={!!busy}
          previewCode={selectedTemplates.map(template => template.source.trimEnd()).join('\n')}
          canPreview={!!selectedTemplates.length && !!targetEntries.length}
          onPreview={plan}
          choose={offset => updateTarget({ offset })} />
        {existing.warnings.length > 0 && <div className="workspace-alert">
          <ul>{existing.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul>
          <label><input type="checkbox" checked={target.acknowledged} disabled={!!busy}
            onChange={event => updateTarget({ acknowledged: event.target.checked })} /> I checked this file for other duplicates</label>
        </div>}
        {assessment.matches.length > 0 && <fieldset className="injector-matches" disabled={!!busy}>
          <legend>Existing code matches</legend>
          <ul>{assessment.matches.map((item, i) => <li key={i}>{item.label}</li>)}</ul>
          <label><input type="radio" name="match-decision" checked={target.decision === 'duplicate'}
            onChange={() => updateTarget({ decision: 'duplicate' })} /> Duplicate</label>
          <label><input type="radio" name="match-decision" checked={target.decision === 'replace'} disabled={assessment.blocked}
            onChange={() => updateTarget({ decision: 'replace' })} /> Replace</label>
          {assessment.blocked && <p>Replace is unavailable because it could remove other code in the matched block.</p>}
        </fieldset>}
      </>}
      <div className="workspace-actions">
        <button type="button" disabled={!!busy || !targetEntries.length || !selectedTemplates.length} onClick={plan}>Preview insertion</button>
        {preview && <button type="button" disabled={!!busy} onClick={save}>Save Draft</button>}
      </div>
      {preview && <section aria-label="Insertion preview">
        <h3>Insertion preview</h3>
        <p>{preview.length} files prepared. Choose each file above to inspect its proposed diff.</p>
        {activePreview && <div className="injector-diff"><Suspense fallback={<p role="status">Loading diff…</p>}>
          <MonacoDiff path={active} original={activePreview.target.base} proposed={activePreview.source} />
        </Suspense></div>}
      </section>}
      {busy && <p role="status">{busy}</p>}
      {error && <p role="alert">{error}</p>}
      {results.length > 0 && <section aria-label="Draft results">
        <h3>Draft results</h3>
        <ul>{results.map(item => <li key={item.path}>{item.path} · {item.error ? <span role="alert">{item.error}</span>
          : <Link to="/code-editor" state={{ editorTarget: { ...scope, path: item.path, review: true } }}>Saved · review in Code Editor</Link>}</li>)}</ul>
        {results.some(item => !item.error) && <Link to="/source-control">Open Source Control</Link>}
      </section>}
    </section>
    <ModulePanel title="Code templates and groups">
      {catalog ? <TemplatePanel {...catalog} selected={chosen} existing={existing?.items ?? []} disabled={!!busy}
        choose={chooseTemplates} addTemplate={template => setCatalog(previous => previous && { ...previous, templates: [...previous.templates, template] })}
        addGroup={group => setCatalog(previous => previous && { ...previous, groups: [...previous.groups, group] })}
        updateTemplate={template => setCatalog(previous => previous && {
          ...previous, templates: previous.templates.map(item => item.id === template.id ? template : item),
        })} />
        : catalogError ? <><p role="alert">{catalogError}</p><button type="button" onClick={() => setCatalogVersion(value => value + 1)}>Retry catalog</button></>
          : <p role="status">Loading code catalog…</p>}
    </ModulePanel>
  </div>;
}
