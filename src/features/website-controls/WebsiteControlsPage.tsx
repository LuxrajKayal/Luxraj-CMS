import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AppWindow, GitBranch, Play, Plus } from 'lucide-react';
import type { WebsiteControl, WebsiteLaunch, WebsiteRegistration } from '../../../supabase/functions/_shared/workspace-contracts';
import { ModuleTopbar } from '../../shared/ui/ModuleChrome';
import type { FileScope } from '../file-manager/FileDestination';
import { workspaceError, workspaceRequest } from '../workspace/api';
import { useWorkspace } from '../workspace/WorkspaceLayout';
import { ControlRegistration } from './ControlRegistration';
import { ControlRunner, controlInput } from './ControlRunner';
import './website-controls.css';

export default function WebsiteControlsPage() {
  const { workspace } = useWorkspace();
  const { selection } = workspace;
  const repository = workspace.repositories.find(item => item.id === selection?.repositoryId);
  if (!selection?.branch || !repository) return <>
    <ModuleTopbar title="Website Controls" />
    <div className="module-body"><Link to="/repositories">Select a repository and branch</Link></div>
  </>;
  return <ScopedControls key={JSON.stringify([repository.id, selection.branch])}
    repository={repository.name} repositoryId={repository.id} branch={selection.branch} />;
}

function ScopedControls({ repository, repositoryId, branch }: FileScope & { repository: string }) {
  const [controls, setControls] = useState<WebsiteControl[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [working, setWorking] = useState('');
  const [active, setActive] = useState<{ launched: WebsiteLaunch; files: File[] } | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const lifetime = useRef<AbortController>(undefined);
  const scope = { repositoryId, branch };
  useEffect(() => {
    const request = new AbortController();
    lifetime.current = request;
    workspaceRequest({ action: 'website_list', repositoryId, branch }, request.signal).then(({ controls }) => {
      if (!request.signal.aborted) setControls(controls);
    }).catch(failure => {
      if (!request.signal.aborted) setError(workspaceError(failure));
    });
    return () => request.abort();
  }, [repositoryId, branch, reload]);

  async function register(registration: WebsiteRegistration) {
    if (working) return;
    const signal = lifetime.current?.signal;
    setError('');
    setWorking('Saving control…');
    try {
      const { control } = await workspaceRequest({ action: 'website_register', ...scope, registration }, signal);
      if (!signal?.aborted) {
        setControls(current => [...(current ?? []), control]);
        setAdding(false);
      }
    } catch (failure) {
      if (!signal?.aborted) setError(workspaceError(failure));
    } finally {
      if (!signal?.aborted) setWorking('');
    }
  }

  async function launch(control: WebsiteControl) {
    if (working) return;
    const signal = lifetime.current?.signal;
    setError('');
    setWorking('Loading application…');
    try {
      const launched = await workspaceRequest({ action: 'website_launch', ...scope, id: control.id }, signal);
      const files: File[] = [];
      for (const path of launched.control.inputs) {
        setWorking('Loading ' + path + '…');
        try {
          files.push(await controlInput(launched, scope, path, signal));
        } catch (failure) {
          throw new Error(path + '. ' + workspaceError(failure), { cause: failure });
        }
      }
      if (!signal?.aborted) setActive({ launched, files });
    } catch (failure) {
      if (!signal?.aborted) setError(failure instanceof Error && failure.cause ? failure.message : workspaceError(failure));
    } finally {
      if (!signal?.aborted) setWorking('');
    }
  }

  return <div className="website-controls">
    <ModuleTopbar title="Website Controls">
      {!active && !adding && <button type="button" disabled={!!working || !controls} onClick={() => setAdding(true)}>Add Control</button>}
    </ModuleTopbar>
    <div className="module-body">
      <p className="website-scope"><strong>{repository}</strong> <GitBranch size={15} /><code>{branch}</code></p>
      {error && <p role="alert">{error}</p>}
      {working && <p role="status">{working}</p>}
      {!controls && (error
        ? <button type="button" onClick={() => { setError(''); setReload(value => value + 1); }}>Retry loading controls</button>
        : <p role="status">Loading stored controls…</p>)}
      {active ? <ControlRunner scope={scope} run={active.launched} inputs={active.files} close={() => setActive(null)} /> :
        adding ? <ControlRegistration scope={scope} saving={!!working} save={register}
          cancel={() => { setAdding(false); setError(''); }} /> :
          controls && <section className="website-launcher" aria-label="Registered applications">
            <div className="website-launcher-heading"><h2>Your applications</h2><small>{controls.length} registered</small></div>
            {!controls.length && <p>No controls are registered for this branch.</p>}
            <div className="website-cards">{controls.map(control => <article key={control.id}>
              <div className="website-app-icon"><AppWindow size={27} /></div>
              <h2>{control.name}</h2>
              <code title={control.application}>{control.application}</code>
              <p>{control.inputs.length} associated files · {control.destinations.length} preset destinations</p>
              <button type="button" className="website-launch-button" disabled={!!working} onClick={() => void launch(control)}><Play size={16} /> Run</button>
            </article>)}
            <button className="website-add-card" type="button" disabled={!!working} onClick={() => setAdding(true)}><Plus size={30} /><strong>Add new control</strong><small>Register an HTML application</small></button>
            </div>
          </section>}
    </div>
  </div>;
}
