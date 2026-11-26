import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useOutletContext } from 'react-router';
import type { MemberHome, MemberTask } from '../../../supabase/functions/_shared/member-contracts';
import type { WebsiteLaunch } from '../../../supabase/functions/_shared/workspace-contracts';
import { useAuth } from '../../core/auth/AuthProvider';
import { Brand } from '../../shared/ui/Brand';
import { ModuleTopbar } from '../../shared/ui/ModuleChrome';
import { PagePanel } from '../../shared/ui/PagePanel';
import { ControlRunner, controlInput } from '../website-controls/ControlRunner';
import { memberRequest, workspaceError } from '../workspace/api';
import { AccountDetails, roleName } from './AccountDetails';
import { memberOutput } from './memberFiles';
import '../website-controls/website-controls.css';
import './people.css';

const titles = { pending: 'Pending', submitted: 'Submitted for Review', returned: 'Returned for Correction',
  rejected: 'Rejected', terminated: 'Terminated', completed: 'Completed' } as const;

export function TaskSummary({ item }: { item: MemberTask }) {
  return <>
    <h3>{item.id} <span className="people-status">{titles[item.status]}</span></h3>
    <p><strong>{item.task_type}</strong></p>
    <p className="people-description">{item.description}</p>
    {item.comment && <p className="people-description">Review comment · {item.comment}</p>}
    {item.commit_sha && <a href={'https://github.com/' + item.commit_repository + '/commit/' + item.commit_sha}
      target="_blank" rel="noreferrer">GitHub commit {item.commit_sha.slice(0, 12)}</a>}
  </>;
}

type Context = { home: MemberHome; refresh(): void };
const useMember = () => useOutletContext<Context>();

export function MemberLayout() {
  const { loading, session, signOut } = useAuth();
  const [record, setRecord] = useState<{ user: string; data?: MemberHome; error?: string }>();
  const [signingOut, setSigningOut] = useState(false);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(value => value + 1), []);
  const id = session?.user.id;
  const token = session?.access_token;
  const { pathname } = useLocation();
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await memberRequest({ action: 'member_home' }, controller.signal);
        if (!controller.signal.aborted) setRecord({ user: id!, data });
      } catch (failure) {
        if (!controller.signal.aborted) setRecord({ user: id!, error: workspaceError(failure) });
      }
    }
    void load();
    return () => controller.abort();
  }, [id, token, pathname, version]);
  useEffect(() => {
    if (!id) return;
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, [id, refresh]);
  async function logout() {
    setSigningOut(true);
    try { await signOut(); } finally { setSigningOut(false); }
  }
  if (loading) return <PagePanel><p role="status">Checking your session…</p></PagePanel>;
  if (!session) return <Navigate to="/login" replace />;
  if (!record || record.user !== id) return <PagePanel><p role="status">Loading your workspace…</p></PagePanel>;
  if (!record.data) return <PagePanel><p role="alert">{record.error}</p>
    <Link to="/dashboard">Go to sign-in landing page</Link>
    <button type="button" disabled={signingOut} onClick={() => void logout()}>Logout</button></PagePanel>;
  const home = record.data;
  return <div className="member-layout">
    <aside>
      <Brand />
      <strong>{roleName[home.profile.role]} workspace</strong>
      <nav aria-label="Member navigation">
        <NavLink to="/member/profile">Profile</NavLink>
        {home.apps.length ? <NavLink to="/member/workstation">Workstation</NavLink> : <span aria-disabled="true">Workstation</span>}
        <NavLink to="/member/tasks">Tasks</NavLink>
      </nav>
      <button type="button" disabled={signingOut} onClick={() => void logout()}>Logout</button>
    </aside>
    <main><Outlet context={{ home, refresh } satisfies Context} /></main>
  </div>;
}

export function MemberProfilePage() {
  const { session } = useAuth();
  const { home: { profile }, refresh } = useMember();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (file.size < 15000 || file.size > 150000) throw new Error('invalid_profile_image');
      await memberRequest({ action: 'member_save', appId: null, file: await memberOutput(crypto.randomUUID(), 'profile.webp', file) });
      setNotice('Picture submitted for Super Admin review.');
      refresh();
    } catch (failure) { setError(workspaceError(failure)); }
    finally { setBusy(false); }
  }
  return <>
    <ModuleTopbar title="Profile" />
    <section className="module-body people-panel">
      <AccountDetails fields={{ ...profile, email: session?.user.email ?? '' }} />
      <h2>Profile picture</h2>
      {profile.approved_picture_url && <img className="people-avatar" src={profile.approved_picture_url} alt="Approved profile picture" referrerPolicy="no-referrer" />}
      {profile.picture_state === 'returned' && <p role="status">Returned for correction. {profile.picture_comment}</p>}
      {profile.picture_state === 'pending' && <p role="status">Picture awaiting review or publication.</p>}
      <p>Use a WebP image between 15 and 150 KB. A square image works best.</p>
      <label>Upload profile picture<input type="file" accept="image/webp,.webp" disabled={busy}
        onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} /></label>
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  </>;
}

export function MemberWorkstation() {
  const { home, refresh } = useMember();
  const [active, setActive] = useState<{ run: WebsiteLaunch; inputs: File[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const launch = useRef<AbortController>(undefined);
  useEffect(() => () => launch.current?.abort(), []);
  const available = active && home.apps.some(app => app.id === active.run.control.id);
  async function open(appId: string) {
    launch.current?.abort();
    const request = new AbortController();
    launch.current = request;
    setActive(null);
    setLoading(true);
    setError('');
    try {
      const run = await memberRequest({ action: 'member_launch', appId }, request.signal);
      const inputs: File[] = [];
      for (const path of run.control.inputs) inputs.push(await controlInput(run, undefined, path, request.signal));
      if (!request.signal.aborted) setActive({ run, inputs });
    } catch (failure) { if (!request.signal.aborted) { setError(workspaceError(failure)); refresh(); } }
    finally { if (!request.signal.aborted) setLoading(false); }
  }
  return <>
    <ModuleTopbar title="Workstation"><button type="button" onClick={refresh}>Refresh assignments</button></ModuleTopbar>
    <section className="module-body">
      {!home.apps.length && <p>No applications are assigned. Your saved work remains in Tasks.</p>}
      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">Loading assigned application…</p>}
      {available ? <ControlRunner key={active.run.control.id} run={active.run} inputs={active.inputs} onMemberSave={refresh} privateDrafts={home.drafts}
        close={() => setActive(null)} /> :
        <div className="website-cards">{home.apps.map(app => <article key={app.id}>
          <h2>{app.name}</h2><button type="button" disabled={loading} onClick={() => void open(app.id)}>Run</button>
        </article>)}</div>}
    </section>
  </>;
}

export function MemberTasksPage() {
  const { home, refresh } = useMember();
  const [taskId, setTask] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const available = home.tasks.filter(task => task.status === 'pending' || task.status === 'returned');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await memberRequest({ action: 'member_submit', taskId, files });
      setNotice(taskId + ' submitted for review.');
      setTask('');
      setFiles([]);
      refresh();
    } catch (failure) { setError(workspaceError(failure)); }
    finally { setBusy(false); }
  }
  return <>
    <ModuleTopbar title="Tasks"><button type="button" onClick={refresh}>Refresh tasks</button></ModuleTopbar>
    <div className="module-body people-grid">
      <section className="people-panel"><h2>Assigned tasks</h2>
        {!home.tasks.length && <p>No tasks assigned.</p>}
        {home.tasks.map(task => <article className="people-item" key={task.id}><TaskSummary item={task} /></article>)}
      </section>
      <form className="people-panel" onSubmit={event => void submit(event)}>
        <h2>Submit saved work</h2>
        <label>Task ID<select value={taskId} required onChange={event => setTask(event.target.value)}>
          <option value="" disabled>Select an assigned task</option>
          {available.map(task => <option key={task.id} value={task.id}>{task.id} · {task.task_type}</option>)}
        </select></label>
        {!home.drafts.length && <p>No private drafts saved.</p>}
        {home.drafts.map(draft => <label key={draft.id} className="people-check">
          <input type="checkbox" checked={files.includes(draft.id)} onChange={event => {
            setFiles(current => event.target.checked ? [...current, draft.id] : current.filter(id => id !== draft.id));
          }} />
          {draft.name} <small>{new Date(draft.created_at).toLocaleString()}</small>
        </label>)}
        <button type="submit" disabled={busy || !available.some(task => task.id === taskId) || !files.length || !home.apps.length}>Submit for Review</button>
        {notice && <p role="status">{notice}</p>}
        {error && <p role="alert">{error}</p>}
      </form>
    </div>
  </>;
}
