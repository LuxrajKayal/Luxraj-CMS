import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, ChevronDown, ChevronRight, File, FileCode, Folder, FolderOpen, Grid2X2, List, X } from 'lucide-react';
import { filePath } from '../../../supabase/functions/_shared/file-bytes';
import type { FileScope } from '../file-manager/FileDestination';
import { workspaceError, workspaceRequest, type Directory } from '../workspace/api';

type Props = {
  scope: FileScope; label: string; htmlOnly?: boolean; multiple?: boolean;
  destination?: string; hint?: string; errorMessage?: string; disabled?: boolean;
  onPick(paths: string[]): void | Promise<void>; onCancel(): void;
};

export function RepositoryFilePicker({ scope, label, htmlOnly, multiple, destination, hint, errorMessage, disabled, onPick, onCancel }: Props) {
  const initialFolder = destination?.split('/').slice(0, -1).join('/') ?? '';
  const [folder, setFolder] = useState(filePath(initialFolder ? initialFolder.split('/') : []) ? initialFolder : '');
  const [cache, setCache] = useState<Record<string, Directory>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['', ...initialFolder.split('/').filter(Boolean).map((_, i) => initialFolder.split('/').slice(0, i + 1).join('/'))]));
  const [selected, setSelected] = useState<string[]>([]);
  const [filename, setFilename] = useState(destination?.split('/').at(-1) ?? '');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const { repositoryId, branch } = scope;
  const directory = cache[folder];
  const cacheRef = useRef(cache);
  cacheRef.current = cache;
  const isDestination = destination !== undefined;

  useEffect(() => {
    const el = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    if (typeof el.showModal === 'function') el.showModal();
    else el.setAttribute('open', '');
    const cancel = (event: Event) => {
      event.preventDefault();
      if (!disabledRef.current) cancelRef.current();
    };
    el.addEventListener('cancel', cancel);
    return () => {
      el.removeEventListener('cancel', cancel);
      if (typeof el.close === 'function' && el.open) el.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    const parts = folder.split('/').filter(Boolean);
    const ancestors = ['', ...parts.map((_, i) => parts.slice(0, i + 1).join('/'))];
    for (const path of ancestors) {
      if (path !== folder && cacheRef.current[path]) continue;
      workspaceRequest({ action: 'file_manager_tree', repositoryId, branch, path: path ? path.split('/') : [], includeExecutables: true }, controller.signal)
        .then(data => { if (!controller.signal.aborted) setCache(current => ({ ...current, [path]: data })); })
        .catch(failure => { if (!controller.signal.aborted && path === folder) setError(workspaceError(failure)); });
    }
    return () => controller.abort();
  }, [repositoryId, branch, folder, retry]);

  function navigate(path: string) {
    if (disabled || !filePath(path ? path.split('/') : [])) return;
    setFolder(path);
    setSearch('');
    if (!multiple) setSelected([]);
    setExpanded(current => {
      const next = new Set(current);
      next.add('');
      const parts = path.split('/').filter(Boolean);
      parts.forEach((_, i) => next.add(parts.slice(0, i + 1).join('/')));
      return next;
    });
  }
  function selectFile(path: string) {
    if (disabled) return;
    if (isDestination) {
      setFilename(path.split('/').at(-1)!);
      setSelected([path]);
    } else setSelected(current => multiple
      ? current.includes(path) ? current.filter(value => value !== path) : [...current, path]
      : [path]);
  }
  const join = (name: string) => folder ? folder + '/' + name : name;
  const visible = (directory?.entries ?? [])
    .filter(entry => (entry.kind === 'folder' || (entry.kind === 'file' && (!htmlOnly || /\.html$/i.test(entry.name)))) &&
      entry.name.toLowerCase().includes(search.toLowerCase()))
    .slice().sort((a, b) => a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'folder' ? -1 : 1);
  const target = join(filename);
  const valid = isDestination ? !!filename && filePath([filename]) && filePath(target.split('/')) && !!directory &&
    !directory.entries.some(entry => entry.kind === 'folder' && entry.name === filename) : selected.length > 0;
  function confirm() {
    if (!disabled && valid) void onPick(isDestination ? [target] : selected);
  }
  function tree(path: string, depth = 0) {
    const children = cache[path]?.entries.filter(entry => entry.kind === 'folder') ?? [];
    const open = expanded.has(path);
    return <div key={path} className="website-tree-node">
      <div className={'website-tree-row' + (folder === path ? ' is-selected' : '')} style={{ paddingInlineStart: depth * 12 }}>
        <button type="button" aria-label={(open ? 'Collapse ' : 'Expand ') + (path || 'Repository root')} aria-expanded={open}
          disabled={disabled} onClick={() => {
            if (open) setExpanded(current => { const next = new Set(current); next.delete(path); return next; });
            else navigate(path);
          }}>{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button>
        <button type="button" disabled={disabled} onClick={() => navigate(path)}>{open ? <FolderOpen size={16} /> : <Folder size={16} />}{path.split('/').at(-1) || 'Repository root'}</button>
      </div>
      {open && children.map(child => tree(path ? path + '/' + child.name : child.name, depth + 1))}
    </div>;
  }

  return createPortal(<dialog className="website-explorer" ref={dialog} aria-label={label}>
    <header className="website-explorer-header"><FolderOpen size={22} /><div><h2>{label}</h2><small>Repository workspace · {branch}</small></div>
      <button type="button" className="website-icon-button" disabled={disabled} aria-label="Close file explorer" onClick={onCancel}><X size={20} /></button>
    </header>
    <div className="website-explorer-tools">
      <button type="button" disabled={!folder || disabled} aria-label="Up one folder" onClick={() => navigate(folder.split('/').slice(0, -1).join('/'))}><ArrowUp size={17} /></button>
      <nav aria-label="Folder path" className="website-breadcrumb"><button type="button" disabled={disabled} onClick={() => navigate('')}>Root</button>
        {folder.split('/').filter(Boolean).map((name, i) => <span key={i}><ChevronRight size={14} /><button type="button" disabled={disabled} onClick={() => navigate(folder.split('/').slice(0, i + 1).join('/'))}>{name}</button></span>)}
      </nav>
      <input type="search" aria-label="Search current folder" placeholder="Search folder" value={search} onChange={event => setSearch(event.target.value)} />
      <button type="button" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={17} /></button>
      <button type="button" aria-label="Icon view" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><Grid2X2 size={17} /></button>
    </div>
    <div className="website-explorer-body">
      <aside aria-label="Repository folders"><h3>Folders</h3>{tree('')}</aside>
      <section aria-label="Files and folders" className="website-explorer-content">
        {hint && <p className="website-hint">{hint}</p>}
        {errorMessage && <p role="alert">{errorMessage}</p>}
        {disabled && <p role="status">Working…</p>}
        {error && <div role="alert">{error} <button type="button" onClick={() => { setCache(current => { const next = { ...current }; delete next[folder]; return next; }); setRetry(value => value + 1); }}>Reload folder</button></div>}
        {!directory && !error && <p role="status">Loading files…</p>}
        {directory && !visible.length && <p className="website-hint">No matching files or folders.</p>}
        {directory && view === 'list' && <div className="website-file-head"><span>Name</span><span>Type</span></div>}
        <div className={'website-file-entries is-' + view}>
          {visible.map(entry => {
            const path = join(entry.name);
            const isFolder = entry.kind === 'folder';
            const type = isFolder ? 'Folder' : entry.name.includes('.') ? entry.name.split('.').at(-1)!.toUpperCase() + ' file' : 'File';
            const Icon = isFolder ? Folder : /\.(html|js|css|json|md|xml|ts)$/i.test(entry.name) ? FileCode : File;
            return <button key={path} type="button" className="website-file-entry" disabled={disabled}
              aria-label={(isFolder ? 'Open folder ' : 'Select file ') + entry.name}
              aria-pressed={isFolder ? undefined : selected.includes(path)}
              onClick={() => isFolder ? navigate(path) : selectFile(path)}
              onDoubleClick={() => { if (!isFolder && !multiple && !isDestination && !disabled) void onPick([path]); }}>
              <Icon className={isFolder ? 'folder-icon' : ''} size={view === 'grid' ? 34 : 19} /><span>{entry.name}</span><small>{type}</small>
            </button>;
          })}
        </div>
      </section>
    </div>
    <footer className="website-explorer-footer">
      {isDestination ? <label>File name <input value={filename} onChange={event => setFilename(event.target.value)} disabled={disabled} /></label> :
        <div className="website-selected"><strong>{selected.length} selected</strong>{selected.map(path => <span key={path}>{path}{multiple && <button type="button" disabled={disabled} aria-label={'Remove ' + path} onClick={() => setSelected(current => current.filter(value => value !== path))}><X size={13} /></button>}</span>)}</div>}
      <div className="website-explorer-actions"><button type="button" disabled={disabled} onClick={onCancel}>Cancel</button>
        <button type="button" className="website-primary" disabled={!valid || disabled} onClick={confirm}>{isDestination ? 'Use destination' : 'Open'}</button></div>
    </footer>
  </dialog>, document.body);
}
