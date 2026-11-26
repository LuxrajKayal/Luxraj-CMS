import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import type { Assignment } from '../../../supabase/functions/_shared/member-contracts';
import type { WebsiteControl } from '../../../supabase/functions/_shared/workspace-contracts';
import { RepositoryFilePicker } from '../website-controls/RepositoryFilePicker';
import { memberRequest, workspaceError, workspaceRequest, type Workspace } from '../workspace/api';
import '../website-controls/website-controls.css';

export function AdminAssignments({ userId }: { userId: string }) {
  const [apps, setApps] = useState<Assignment[]>([]);
  const [workspace, setWorkspace] = useState<Workspace>();
  const [controls, setControls] = useState<WebsiteControl[]>([]);
  const [name, setName] = useState('');
  const [application, setApplication] = useState('');
  const [inputs, setInputs] = useState('');
  const [picker, setPicker] = useState<'app' | 'inputs' | null>(null);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const selection = workspace?.selection;
  const repository = workspace?.repositories.find(repo => repo.id === selection?.repositoryId);
  const scope = selection?.branch && repository ? { repositoryId: repository.id, branch: selection.branch } : null;
  useEffect(() => {
    const request = new AbortController();
    memberRequest({ action: 'people_apps', userId }, request.signal).then(result => {
      if (!request.signal.aborted) setApps(result.apps);
    }).catch(failure => { if (!request.signal.aborted) setError(workspaceError(failure)); });
    return () => request.abort();
  }, [userId, reload]);
  useEffect(() => {
    const request = new AbortController();
    workspaceRequest({ action: 'load' }, request.signal).then(async result => {
      if (request.signal.aborted) return;
      setWorkspace(result);
      const selected = result.selection;
      if (selected?.branch) {
        const data = await workspaceRequest({ action: 'website_list', repositoryId: selected.repositoryId, branch: selected.branch }, request.signal);
        if (!request.signal.aborted) setControls(data.controls);
      }
    }).catch(failure => { if (!request.signal.aborted) setError(workspaceError(failure)); });
    return () => request.abort();
  }, []);

  function clear() { setEditing(null); setApplication(''); setName(''); setInputs(''); }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scope) return;
    setWorking(true);
    setError('');
    setNotice('');
    try {
      await memberRequest({ action: 'people_assign', userId, id: editing?.id, ...scope, name, application, inputs: inputs.split(/\r?\n/).filter(Boolean) });
      clear();
      setNotice(editing ? 'Application assignment updated.' : 'Application assigned.');
      setReload(value => value + 1);
    } catch (failure) { setError(workspaceError(failure)); }
    finally { setWorking(false); }
  }
  async function remove(app: Assignment) {
    if (!window.confirm('Remove ' + app.name + ' from this user? Saved work and tasks will be kept.')) return;
    setWorking(true);
    setError('');
    setNotice('');
    try {
      await memberRequest({ action: 'people_unassign', userId, id: app.id });
      setNotice('Application access revoked.');
      if (editing?.id === app.id) clear();
      setReload(value => value + 1);
    } catch (failure) { setError(workspaceError(failure)); }
    finally { setWorking(false); }
  }
  return <section className="people-panel">
    <h2>Application assignments</h2>
    {!apps.length && <p>No applications are assigned. The Workstation is disabled.</p>}
    {apps.map(app => {
      return <article className="people-item" key={app.id}>
        <h3>{app.name}</h3><p><code>{app.application}</code> · {app.branch} · {app.inputs.length} assigned inputs</p>
        <div className="workspace-actions">
          <button type="button" disabled={working || !scope} title={scope ? undefined : 'Select a repository and branch in Repositories'}
            onClick={() => { setEditing(app); setName(app.name); setApplication(app.application); setInputs(app.inputs.join('\n')); }}>Modify assignment</button>
          <button type="button" disabled={working} onClick={() => void remove(app)}>Remove assignment</button>
        </div>
      </article>;
    })}
    <p><Link to="/repositories">{scope ? 'Change repository or branch' : 'Select a repository and branch'}</Link>
      {repository && scope ? ' · ' + repository.name + ' / ' + scope.branch : ''}</p>
    {scope && <form onSubmit={event => void save(event)}>
      <h3>{editing ? 'Modify application assignment' : 'Assign an HTML application'}</h3>
      {!!controls.length && <label>Use a registered control<select value="" onChange={event => {
        const control = controls.find(item => item.id === event.target.value);
        if (control) { setName(control.name); setApplication(control.application); setInputs(control.inputs.join('\n')); }
      }}><option value="">Choose a control</option>
        {controls.map(control => <option key={control.id} value={control.id}>{control.name}</option>)}
      </select></label>}
      <label>Application name<input required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label>
      <label>HTML application path<input required value={application} onChange={event => setApplication(event.target.value)} /></label>
      <label>Authorized repository inputs (one per line)<textarea value={inputs} onChange={event => setInputs(event.target.value)} /></label>
      <div className="workspace-actions">
        <button type="button" onClick={() => setPicker('app')}>Browse HTML applications</button>
        <button type="button" onClick={() => setPicker('inputs')}>Browse input files</button>
        <button type="submit" disabled={working}>{editing ? 'Save assignment' : 'Assign application'}</button>
        {editing && <button type="button" onClick={clear}>Cancel</button>}
      </div>
      {picker && <RepositoryFilePicker scope={scope} label={picker === 'app' ? 'HTML applications' : 'Allowed repository files'}
        htmlOnly={picker === 'app'} multiple={picker === 'inputs'} onCancel={() => setPicker(null)} onPick={paths => {
          if (picker === 'app') setApplication(paths[0]);
          else setInputs(current => [...new Set([...current.split(/\r?\n/).filter(Boolean), ...paths])].join('\n'));
          setPicker(null);
        }} />}
    </form>}
    {notice && <p role="status">{notice}</p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
