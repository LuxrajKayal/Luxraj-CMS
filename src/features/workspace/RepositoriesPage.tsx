import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Folder, Grid2X2, Grid3X3, List, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { ModuleTopbar } from '../../shared/ui/ModuleChrome';
import { useWorkspace } from './WorkspaceLayout';

const modes = [{ name: 'Large', icon: Grid2X2 }, { name: 'Medium', icon: Grid3X3 }, { name: 'List', icon: List }] as const;
type Mode = typeof modes[number]['name'];

function savedMode(): Mode {
  try {
    const value = sessionStorage.getItem('luxraj-repository-view');
    return modes.find(mode => mode.name === value)?.name ?? 'Large';
  } catch {
    return 'Large';
  }
}

export function RepositoriesPage() {
  const { workspace: { repositories, selection, branches }, saving, select, refresh } = useWorkspace();
  const [focused, setFocused] = useState(false);
  const [tools, setTools] = useState(true);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>(savedMode);
  const active = focused ? repositories.find(repository => repository.id === selection?.repositoryId) : null;
  const visible = repositories.filter(repo => repo.name.toLowerCase().includes(query.trim().toLowerCase()));

  async function open(repositoryId: number) {
    if (selection?.repositoryId === repositoryId || await select(repositoryId)) setFocused(true);
  }

  function view(next: Mode) {
    setMode(next);
    try { sessionStorage.setItem('luxraj-repository-view', next); } catch { /* optional display preference */ }
  }

  return (
    <div className="module-stack">
      <ModuleTopbar title="Repositories">
        {!active && <button type="button" aria-expanded={tools} onClick={() => setTools(value => !value)}
          aria-label="Repository tools" title="Repository tools"><SlidersHorizontal size={17} aria-hidden="true" /></button>}
        {!active && tools && <div className="repository-tools">
          <input type="search" aria-label="Search repositories" placeholder="Search repositories" value={query}
            onChange={event => setQuery(event.target.value)} />
          <div className="workspace-actions" role="group" aria-label="Repository view">
            {modes.map(({ name, icon: Icon }) => <button key={name} type="button" aria-pressed={mode === name}
              title={name} onClick={() => view(name)}><Icon size={16} aria-hidden="true" />{name}</button>)}
          </div>
        </div>}
        <button type="button" disabled={saving} onClick={refresh} aria-label="Refresh repositories" title="Refresh repositories">
          <RefreshCw size={17} aria-hidden="true" />
        </button>
      </ModuleTopbar>
      <div className="module-body module-scroll">
        {active ? (
          <>
            <nav aria-label="Repository breadcrumb" className="workspace-actions">
              <button type="button" onClick={() => setFocused(false)}><ArrowLeft size={16} aria-hidden="true" /> All repositories</button>
              <span aria-current="location">{active.name}</span>
            </nav>
            <h2>{active.name}</h2>
            <fieldset className="branch-list">
              <legend>Branches</legend>
              {!branches.length && <p>This repository has no remote branches.</p>}
              {branches.map(branch => <label key={branch}>
                <input name="repository-branch" type="radio" checked={selection?.branch === branch} disabled={saving}
                  onChange={() => void select(active.id, branch)} />
                {branch}{branch === active.defaultBranch && <small>Default</small>}
              </label>)}
            </fieldset>
            {selection?.branch && !saving && <p><Link className="workspace-primary" to="/code-editor">Open with Code Editor</Link></p>}
          </>
        ) : (
          <>
            {!repositories.length && <p>The GitHub App has no accessible repositories.</p>}
            {!!repositories.length && !visible.length && <p>No repositories match your search.</p>}
            <ul className={`repository-grid repository-grid--${mode.toLowerCase()}`}>
              {visible.map(repository => <li key={repository.id}>
                <button type="button" disabled={saving} aria-label={`Open ${repository.name}`} onClick={() => void open(repository.id)}>
                  <Folder className="repository-icon" aria-hidden="true" />
                  <strong>{repository.name}</strong><span>{repository.private ? 'Private' : 'Public'}</span>
                </button>
              </li>)}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
