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
import { memberFile, memberOutput } from './memberFiles';
import '../website-controls/website-controls.css';
import './people.css';

const titles = { pending: 'Pending', working: 'Working', finished: 'Finished', submitted: 'Submitted for Review', returned: 'Returned for Correction',
  rejected: 'Rejected', terminated: 'Terminated', completed: 'Completed' } as const;

export function TaskSummary({ item }: { item: MemberTask }) {
  return <>
    <h3>{item.id} <span className={'people-status status-' + item.status}>{titles[item.status]}</span></h3>
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
  const section = pathname.endsWith('/profile') ? 'profile' : pathname.endsWith('/tasks') ? 'tasks' : pathname.endsWith('/drafts') ? 'drafts' : pathname.endsWith('/workstation') ? 'workstation' : 'dashboard';
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await memberRequest({ action: 'member_home', section }, controller.signal);
        if (!controller.signal.aborted) setRecord({ user: id!, data });
      } catch (failure) {
        if (!controller.signal.aborted) setRecord({ user: id!, error: workspaceError(failure) });
      }
    }
    void load();
    return () => controller.abort();
  }, [id, token, section, version]);
  useEffect(() => {
    if (!id) return;
    let request: AbortController | undefined;
    const interval = window.setInterval(() => {
      if (document.hidden) return;
      request?.abort();
      const current = new AbortController(); request = current;
      void memberRequest({ action: 'member_home', section: 'profile' }, current.signal).then(data => {
        if (!current.signal.aborted) setRecord(previous => previous?.user === id && previous.data
          ? { user: id, data: { ...previous.data, profile: data.profile, apps: data.apps } } : previous);
      }).catch(failure => { if (!current.signal.aborted && failure instanceof Error && failure.message === 'member_forbidden')
        setRecord({ user: id, error: workspaceError(failure) }); });
    }, 30000);
    window.addEventListener('focus', refresh);
    return () => { request?.abort(); window.clearInterval(interval); window.removeEventListener('focus', refresh); };
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
  return <div className={'member-layout' + (collapsed ? ' member-layout--collapsed' : '')}>
    <aside>
      <Brand compact={collapsed} />
      <button className="member-collapse" type="button" onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? '»' : '«'}</button>
      <div className="member-identity"><PersonAvatar name={home.profile.full_name} url={home.profile.approved_picture_url} />
      {!collapsed && <><strong>{home.profile.full_name}</strong><small>{roleName[home.profile.role]} workspace</small></>}</div>
      <nav aria-label="Member navigation">
        <NavLink to="/member/dashboard">Dashboard</NavLink>
        <NavLink to="/member/profile">Profile</NavLink>
        {home.apps.length ? <NavLink to="/member/workstation">Workstation</NavLink> : <span aria-disabled="true">Workstation</span>}
        <NavLink to="/member/tasks">Tasks</NavLink>
        <NavLink to="/member/drafts">My Drafts</NavLink>
      </nav>
      <button type="button" disabled={signingOut} onClick={() => void logout()}>Logout</button>
    </aside>
    <main><Outlet context={{ home, refresh } satisfies Context} /></main>
  </div>;
}

export function PersonAvatar({name,url}: {name:string;url?:string|null}) {
  const [failed,setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  const initials = name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
  return url && !failed ? <img className="people-avatar" src={url} alt={name + ' profile picture'} referrerPolicy="no-referrer" onError={()=>setFailed(true)} />
    : <span className="people-avatar avatar-fallback" aria-label={name}>{initials || 'U'}</span>;
}

export function MemberLanding() {
  const {home} = useMember();
  return <Navigate replace to={home.profile.onboarding_completed ? '/member/dashboard' : '/member/profile'} />;
}

export function MemberDashboard() {
  const {home,refresh} = useMember();
  const stats = [['Pending','pending'],['Working','working'],['Finished','finished'],['In review','submitted'],['Returned','returned'],['Completed','completed']] as const;
  return <><ModuleTopbar title={roleName[home.profile.role] + ' Dashboard'}><button onClick={refresh}>Refresh</button></ModuleTopbar>
    <div className="module-body people-page"><div className="people-panel people-identity"><PersonAvatar name={home.profile.full_name} url={home.profile.approved_picture_url}/>
      <div><h2>Welcome, {home.profile.full_name}</h2><p>{roleName[home.profile.role]} · {home.apps.length} assigned applications</p>
      {home.profile.picture_state !== 'published' && <Link to="/member/profile">Profile picture: {home.profile.picture_state === 'unset' ? 'not submitted' : home.profile.picture_state}</Link>}</div></div>
    <div className="people-stats">{stats.map(([label,state])=><Link key={state} to="/member/tasks" className="people-stat"><small>{label}</small><strong>{home.tasks.filter(t=>t.status===state).length}</strong></Link>)}</div>
    <div className="people-grid"><section className="people-panel"><h2>Recent tasks</h2>{home.tasks.length ? home.tasks.slice(0,5).map(task=><article key={task.id} className="people-item"><TaskSummary item={task}/></article>) : <p>No tasks assigned.</p>}<Link to="/member/tasks">View all tasks</Link></section>
    <section className="people-panel"><h2>Workstation</h2>{home.apps.map(app=><p key={app.id}>{app.name}</p>)}{home.apps.length ? <Link to="/member/workstation">Open Workstation</Link> : <p>No applications assigned.</p>}
    <h2>My drafts</h2><p>{home.drafts.length} private files</p><Link to="/member/drafts">Manage drafts</Link></section></div></div></>;
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
  async function continueToDashboard() {
    setBusy(true); setError('');
    try { await memberRequest({action:'member_onboard'}); refresh(); window.location.hash = '/member/dashboard'; }
    catch(failure) { setError(workspaceError(failure)); } finally { setBusy(false); }
  }
  return <>
    <ModuleTopbar title="Profile" />
    <section className="module-body people-panel">
      <div className="people-identity"><PersonAvatar name={profile.full_name} url={profile.approved_picture_url}/><div><h2>{profile.full_name}</h2><p>{roleName[profile.role]}</p></div></div>
      <h2>Personal information</h2>
      <AccountDetails fields={{ ...profile, email: session?.user.email ?? '' }} />
      <h2>Profile picture</h2>
      {profile.approved_picture_url && <img className="people-avatar" src={profile.approved_picture_url} alt="Approved profile picture" referrerPolicy="no-referrer" />}
      {profile.picture_state === 'returned' && <p role="status">Returned for correction. {profile.picture_comment}</p>}
      {profile.picture_state === 'pending' && <p role="status">Picture awaiting review or publication.</p>}
      <p>Use a WebP image between 15 and 150 KB. A square image works best.</p>
      <label>Upload profile picture<input type="file" accept="image/webp,.webp" disabled={busy}
        onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} /></label>
      {!profile.onboarding_completed && <button className="people-primary" type="button" disabled={busy} onClick={()=>void continueToDashboard()}>Continue to Dashboard</button>}
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
      for (let i=0;i<run.control.inputs.length;i+=4) inputs.push(...await Promise.all(run.control.inputs.slice(i,i+4).map(path=>controlInput(run, undefined, path, request.signal))));
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
        memberTasks={home.tasks} memberLinks={home.links ?? []}
        close={() => setActive(null)} /> :
        <div className="website-cards">{home.apps.map(app => <article key={app.id}>
          <h2>{app.name}</h2><button type="button" disabled={loading} onClick={() => void open(app.id)}>Run</button>
        </article>)}</div>}
    </section>
  </>;
}

export function MemberTasksPage() {
  const {home, refresh} = useMember();
  const [taskId,setTask]=useState('');
  const [files,setFiles]=useState<string[]>([]);
  const [filter,setFilter]=useState('');
  const [query,setQuery]=useState('');
  const [page,setPage]=useState(0);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const selected=home.tasks.find(t=>t.id===taskId);
  const editable=selected && ['pending','working','finished','returned'].includes(selected.status);
  const available=home.tasks.filter(t=>['pending','working','finished','returned'].includes(t.status));
  const linked=(id:string)=>(home.links ?? []).filter(l=>l.task_id===id).map(l=>l.file_id);
  function select(id:string){setTask(id);setFiles(linked(id));setError('');setNotice('');}
  async function progress(status:'working'|'finished'){
    if(!selected)return;
    setBusy(true);setError('');setNotice('');
    try {await memberRequest({action:'member_progress',taskId,status,files});setNotice('Task ' + status + ' — draft links saved.');refresh();}
    catch(failure){setError(workspaceError(failure));}finally{setBusy(false);}
  }
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError('');setNotice('');
    try {await memberRequest({action:'member_submit',taskId,files});setNotice(taskId+' submitted for review.');setTask('');setFiles([]);refresh();}
    catch(failure){setError(workspaceError(failure));}finally{setBusy(false);}
  }
  const filtered=home.tasks.filter(t=>(!filter||t.status===filter)&&(!query||(t.id+' '+t.task_type+' '+t.description).toLowerCase().includes(query.toLowerCase())));
  const saved=selected ? linked(selected.id):[];
  const linksChanged=files.length!==saved.length||files.some(id=>!saved.includes(id));
  return <><ModuleTopbar title="Tasks"><button type="button" onClick={refresh}>Refresh tasks</button></ModuleTopbar>
    <div className="module-body people-grid">
    <section className="people-panel"><h2>Assigned tasks</h2><div className="people-toolbar"><input type="search" aria-label="Search tasks" placeholder="Search tasks" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/>
    <select aria-label="Filter task status" value={filter} onChange={e=>{setFilter(e.target.value);setPage(0);}}><option value="">All statuses</option>{Object.entries(titles).map(([key,title])=><option key={key} value={key}>{title}</option>)}</select></div>
    {!filtered.length && <p>No matching tasks.</p>}{filtered.slice(page*10,page*10+10).map(task=><article className="people-item" key={task.id}><TaskSummary item={task}/>{available.includes(task)&&<button type="button" onClick={()=>select(task.id)}>Manage task</button>}</article>)}
    <div className="people-toolbar"><button disabled={!page} onClick={()=>setPage(p=>Math.max(0,p-1))}>Previous</button><small>Page {page+1} of {Math.max(1,Math.ceil(filtered.length/10))}</small><button disabled={(page+1)*10>=filtered.length} onClick={()=>setPage(p=>p+1)}>Next</button></div></section>
    <form className="people-panel" onSubmit={event=>void submit(event)}><h2>Task workspace</h2>
      <label>Task ID<select value={taskId} required onChange={event=>select(event.target.value)}><option value="">Select an assigned task</option>{available.map(task=><option key={task.id} value={task.id}>{task.id} · {task.task_type}</option>)}</select></label>
      {selected && <><p><span className={'people-status status-'+selected.status}>{titles[selected.status]}</span></p><p>{selected.description}</p>{selected.comment&&<p>Review comment: {selected.comment}</p>}
      <h3>Link private drafts</h3>{!home.drafts.length && <p>No private drafts saved.</p>}
      {home.drafts.map(draft=><label key={draft.id} className="people-check"><input type="checkbox" disabled={!editable||busy} checked={files.includes(draft.id)} onChange={event=>setFiles(current=>event.target.checked?[...current,draft.id]:current.filter(id=>id!==draft.id))}/>{draft.name}<small>{saved.includes(draft.id)?'Linked':'Not linked'}</small></label>)}
      <div className="people-toolbar"><button type="button" disabled={busy||!editable} onClick={()=>void progress('working')}>{selected.status==='pending'||selected.status==='returned'?'Start Working':selected.status==='finished'?'Resume Working':'Save draft links'}</button>
      <button type="button" disabled={busy||!editable||!files.length||!home.apps.length} onClick={()=>void progress('finished')}>Mark Finished</button></div></>}
      <button className="people-primary" type="submit" disabled={busy||selected?.status!=='finished'||!files.length||linksChanged||!home.apps.length}>Submit for Review</button>
      {notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error}</p>}
    </form></div></>;
}

export function MemberDraftsPage(){
  const {home,refresh}=useMember();
  const [query,setQuery]=useState('');
  const [page,setPage]=useState(0);
  const [busy,setBusy]=useState('');
  const [error,setError]=useState('');
  const [preview,setPreview]=useState<{name:string;text?:string;url?:string}>();
  useEffect(()=>()=>{if(preview?.url)URL.revokeObjectURL(preview.url);},[preview]);
  const drafts=home.drafts.filter(d=>d.name.toLowerCase().includes(query.toLowerCase()));
  async function view(id:string,download=false){
    setBusy(id);setError('');
    try{
      const {file}=await memberRequest({action:'member_read_draft',fileId:id});
      const blob=await memberFile(file);
      if(download){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=blob.name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);}
      else if(['image/png','image/jpeg','image/webp','image/gif','image/avif'].includes(blob.type))setPreview({name:blob.name,url:URL.createObjectURL(blob)});
      else if(blob.type.startsWith('text/')||/\.(md|json|js|ts|css|html|txt|csv|xml)$/i.test(blob.name))setPreview({name:blob.name,text:(await blob.slice(0,200000).text())});
      else setPreview({name:blob.name,text:'Preview unavailable for this format. Download the original file.'});
    }catch(failure){setError(workspaceError(failure));}finally{setBusy('');}
  }
  async function remove(id:string){if(!window.confirm('Permanently delete this unlinked private draft?'))return;setBusy(id);setError('');
    try{await memberRequest({action:'member_delete_draft',fileId:id});refresh();}catch(failure){setError(workspaceError(failure));}finally{setBusy('');}}
  return <><ModuleTopbar title="My Drafts"><button onClick={refresh}>Refresh drafts</button></ModuleTopbar><div className="module-body people-page">
    <section className="people-panel"><h2>Private work files</h2><p>{home.drafts.length} saved files · Private Supabase database storage. Link and unlink files from Tasks.</p><input type="search" aria-label="Search drafts" placeholder="Search drafts" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/>
    {error&&<p role="alert">{error}</p>}{!drafts.length&&<p>No matching drafts.</p>}
    {drafts.slice(page*15,page*15+15).map(d=>{const links=(home.links??[]).filter(l=>l.file_id===d.id);return <article className="people-item people-draft" key={d.id}><div><h3>{d.name}</h3><small>{new Date(d.created_at).toLocaleString()} · {links.length?links.map(l=>l.task_id).join(', '):'Unlinked'}</small></div><div className="people-toolbar"><button disabled={!!busy} onClick={()=>void view(d.id)}>Preview</button><button disabled={!!busy} onClick={()=>void view(d.id,true)}>Download</button><Link to="/member/tasks">Link to task</Link><button disabled={!!busy||!!links.length} onClick={()=>void remove(d.id)}>Delete</button></div></article>;})}
    <div className="people-toolbar"><button disabled={!page} onClick={()=>setPage(p=>p-1)}>Previous</button><small>Page {page+1} of {Math.max(1,Math.ceil(drafts.length/15))}</small><button disabled={(page+1)*15>=drafts.length} onClick={()=>setPage(p=>p+1)}>Next</button></div></section>
    {preview&&<section className="people-panel"><div className="people-toolbar"><h2>{preview.name}</h2><button onClick={()=>setPreview(undefined)}>Close preview</button></div>{preview.url?<img className="people-preview" src={preview.url} alt={preview.name}/>:<pre className="people-preview-text">{preview.text}</pre>}</section>}
  </div></>;
}
