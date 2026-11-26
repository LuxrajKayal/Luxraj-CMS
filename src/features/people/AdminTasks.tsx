import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import {Trash2} from 'lucide-react';
import {usePeopleConfirm} from './PeopleConfirm';
import type { MemberAccount, MemberTask, Submission } from '../../../supabase/functions/_shared/member-contracts';
import { memberRequest, workspaceError } from '../workspace/api';
import { memberFile } from './memberFiles';
import type { MemberFile, MemberOutput } from '../../../supabase/functions/_shared/member-contracts';
import { roleName } from './AccountDetails';
import { TaskSummary } from './MemberWorkspace';

const FileSide=lazy(()=>import('../file-manager/FileComparison').then(m=>({default:m.FileSide})));
function SubmissionFileActions({submission,file,current}:{submission:Submission;file:MemberFile;current:boolean}){
  const [preview,setPreview]=useState<MemberOutput>();
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const params=new URLSearchParams({submission:submission.id,file:file.id});
  async function read(download:boolean){
    setBusy(true);setError('');
    try{
      const {file:output}=await memberRequest({action:'people_read_submission',submissionId:submission.id,fileId:file.id});
      const blob=await memberFile(output);
      if(download){const url=URL.createObjectURL(new Blob([blob],{type:'application/octet-stream'}));const a=document.createElement('a');a.href=url;a.download=blob.name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),30000);}
      else setPreview(output);
    }catch(failure){setError(workspaceError(failure));}finally{setBusy(false);}
  }
  return <li className="people-item submission-file"><strong>{file.name}</strong>
    <div className="people-toolbar"><button type="button" disabled={busy} onClick={()=>void read(false)}>Preview</button><button type="button" disabled={busy} onClick={()=>void read(true)}>Download</button>
      {current&&<><Link to={'/code-editor?'+params}>Open in Code Editor</Link><Link to={'/file-manager?'+params}>Open in File Manager</Link><Link to={'/file-manager?'+params+'&prepare=1'}>Prepare for Commit</Link></>}
    </div>
    {error&&<p role="alert">{error}</p>}
    {preview&&<section><button type="button" onClick={()=>setPreview(undefined)}>Close preview</button><Suspense fallback={<p role="status">Loading preview…</p>}><FileSide name="Submitted file" path={file.name} value={preview}/></Suspense></section>}
  </li>;
}
const reviewNoticeEvent = 'luxraj:review-notices';
export { reviewNoticeEvent };

export function AdminTasks({ accounts, mode='all' }: { accounts: MemberAccount[]; mode?:'all'|'manage'|'terminated'|'review'|'history' }) {
  const [params]=useSearchParams();
  const [filter,setFilter]=useState('');const [query,setQuery]=useState('');const [page,setPage]=useState(0);const [showForm,setShowForm]=useState(mode==='all');
  const {confirm,confirmation}=usePeopleConfirm();
  const [tasks, setTasks] = useState<MemberTask[]>([]);
  const [total,setTotal]=useState(0);
  const [loading,setLoading]=useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userId, setUserId] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  function refresh() { setReload(value => value + 1); window.dispatchEvent(new Event(reviewNoticeEvent)); }
  useEffect(() => {
    const request = new AbortController();
    setLoading(true);
    const timer=window.setTimeout(()=>{memberRequest({ action: 'people_tasks', ...(mode==='all'?{}:{mode,page,search:query,status:filter}) }, request.signal).then(result => {
      if (request.signal.aborted) return;
      setTasks(result.tasks);
      setSubmissions(result.submissions);setTotal(result.total??result.tasks.length);
    }).catch(failure => { if (!request.signal.aborted) setError(workspaceError(failure)); }).finally(()=>{if(!request.signal.aborted)setLoading(false);});},mode==='all'?0:200);
    return () => {window.clearTimeout(timer);request.abort();};
  }, [reload,mode,page,query,filter]);
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { id } = await memberRequest({ action: 'people_add_task', userId, type, description,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      setShowForm(mode==='all');
      setType('');
      setDescription('');
      setNotice(id + ' assigned.');
      refresh();
    } catch (failure) { setError(workspaceError(failure)); }
    finally { setBusy(false); }
  }
  async function seen(id: string) {
    setError('');
    try { await memberRequest({ action: 'people_seen', id }); refresh(); }
    catch (failure) { setError(workspaceError(failure)); }
  }
  const matches=(task:MemberTask)=> (!query||(task.id+' '+task.task_type+' '+(accounts.find(a=>a.id===task.user_id)?.profile?.full_name??'')).toLowerCase().includes(query.toLowerCase()))&&(!filter||task.status===filter);
  const currentSubmission=(s:Submission)=>tasks.some(t=>t.id===s.task_id&&t.submission_id===s.id&&t.status==='submitted');
  const visibleTasks=mode==='all'?tasks.filter(matches):tasks;
  const visibleSubs=submissions;
  async function erase(task:MemberTask){if(!await confirm('Permanently delete '+task.id+' and its submission records? Independent private files and committed GitHub files will be preserved.'))return;setError('');setBusy(true);
    try{await memberRequest({action:'people_delete_task',taskId:task.id});setNotice('Terminated task deleted.');if(tasks.length===1&&page>0)setPage(p=>p-1);refresh();}catch(failure){setError(workspaceError(failure));}finally{setBusy(false);}}
  const renderSubmission=(submission:Submission)=>{const task=tasks.find(t=>t.id===submission.task_id);const current=currentSubmission(submission);
    const p=new URLSearchParams({submission:submission.id});for(const file of submission.files)p.append('file',file.id);
    return <article key={submission.id} className="people-card"><h3>{submission.task_id}{!submission.seen&&<span className="people-status">New</span>}</h3><p>{submission.full_name} · {roleName[submission.role]}</p><time dateTime={submission.created_at}>{new Date(submission.created_at).toLocaleString()}</time>
      <details open={mode==='all'||params.get('submission')===submission.id?true:undefined}><summary>Submitted files ({submission.files.length})</summary><ul className="submission-files">{submission.files.map(file=><SubmissionFileActions key={file.id} submission={submission} file={file} current={current}/>)}</ul>{current&&<Link to={'/website-controls?'+p.toString()}>Open as Website Controls input</Link>}
      {mode==='review'&&task&&<TaskReview task={task} name={undefined} refresh={refresh}/>}</details>
      {!submission.seen&&<button type="button" onClick={()=>void seen(submission.id)}>Mark read</button>}</article>;
  };
  return <div className={mode==='all'?'people-grid':'people-page'}>
    {confirmation}{loading&&<p role="status">Loading tasks…</p>}{notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error}</p>}
    {mode!=='all'&&<section className="people-panel"><div className="people-toolbar"><input type="search" placeholder="Search tasks or users" aria-label="Search tasks" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/>
    {mode==='manage'&&<select aria-label="Filter status" value={filter} onChange={e=>{setFilter(e.target.value);setPage(0);}}><option value="">All statuses</option>{['pending','working','finished','submitted','returned','rejected','completed'].map(s=><option key={s}>{s}</option>)}</select>}
    {mode==='manage'&&<button className="people-primary" type="button" onClick={()=>setShowForm(true)}>Assign new task</button>}<button onClick={refresh}>Refresh</button></div></section>}
    {(mode==='all'||mode==='manage'||mode==='terminated')&&
    <section className="people-panel">
      <h2>{mode==='terminated'?'Terminated tasks':'Assigned tasks'}</h2>
      {showForm&&mode!=='terminated'&&<form onSubmit={event => void add(event)}>
        <label>Assigned user<select value={userId} required onChange={event => setUserId(event.target.value)}>
          <option value="">Choose an existing user</option>
          {accounts.filter(account => account.profile && !account.profile.disabled).map(account =>
            <option key={account.id} value={account.id}>{account.profile?.full_name} ({roleName[account.profile!.role]})</option>)}
        </select></label>
        <label>Task type<input value={type} maxLength={150} onChange={event => setType(event.target.value)} required /></label>
        <label>Task description<textarea value={description} maxLength={4000} onChange={event => setDescription(event.target.value)} required /></label>
        <div className="people-toolbar"><button type="submit" className="people-primary" disabled={busy}>Assign task</button>{mode!=='all'&&<button type="button" disabled={busy} onClick={()=>{setType('');setDescription('');setUserId('');setShowForm(false);}}>Cancel</button>}</div>
      </form>}
      {!loading&&!visibleTasks.length&&<p>No matching tasks.</p>}
      {visibleTasks.map(task=>mode==='terminated'?<article key={task.id} className="people-card"><TaskSummary item={task}/><button className="people-danger" type="button" aria-label={'Permanently delete '+task.id} title="Permanently delete terminated task" disabled={busy||!!task.active_review} onClick={()=>void erase(task)}><Trash2 size={16}/></button></article>:
      <TaskReview key={task.id+'/'+task.status+'/'+task.submission_id} task={task} name={accounts.find(a=>a.id===task.user_id)?.profile?.full_name} refresh={refresh} compact={mode==='manage'} />)}
      {mode!=='all'&&<div className="people-toolbar"><button disabled={!page} onClick={()=>setPage(p=>p-1)}>Previous</button><small>Page {page+1} of {Math.max(1,Math.ceil(total/12))}</small><button disabled={(page+1)*12>=total} onClick={()=>setPage(p=>p+1)}>Next</button></div>}
    </section>}
    {(mode==='all'||mode==='review'||mode==='history')&&<section className="people-panel"><h2>{mode==='review'?'Awaiting review':mode==='history'?'Past submissions':'Submissions'}</h2>{!loading&&!visibleSubs.length&&<p>No matching submissions.</p>}{visibleSubs.map(renderSubmission)}
      {mode!=='all'&&<div className="people-toolbar"><button disabled={!page} onClick={()=>setPage(p=>p-1)}>Previous</button><small>Page {page+1} of {Math.max(1,Math.ceil(total/12))}</small><button disabled={(page+1)*12>=total} onClick={()=>setPage(p=>p+1)}>Next</button></div>}</section>}
  </div>;
}

function TaskReview({ task, name, refresh, compact=false }: { task: MemberTask; name?: string; refresh(): void; compact?:boolean }) {
  const {confirm,confirmation}=usePeopleConfirm();
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [forceReason,setForceReason]=useState('');
  async function forceComplete(){
    if(!forceReason.trim()||!await confirm('Force complete '+task.id+' without a GitHub commit? This records a manual override, not a publishing receipt.'))return;
    setBusy(true);setError('');try{await memberRequest({action:'people_force_complete',taskId:task.id,expectedStatus:task.status,submissionId:task.submission_id,reason:forceReason});refresh();}catch(failure){setError(workspaceError(failure));}finally{setBusy(false);}
  }
  async function decide(decision: 'returned' | 'rejected' | 'terminated') {
    if (decision === 'terminated' && !await confirm('Terminate ' + task.id + '? Drafts and submitted records are kept.')) return;
    setBusy(true);
    setError('');
    try {
      await memberRequest({ action: 'people_decide', taskId: task.id, decision, comment, submissionId: task.submission_id });
      refresh();
    } catch (failure) { setError(workspaceError(failure)); }
    finally { setBusy(false); }
  }
  return <article className="people-item">
    {name && <p>{name}</p>}
    <TaskSummary item={task} />
    {task.active_review && <p>GitHub review in progress. <Link to={'/source-control?recover=' + task.active_review}>Verify in Source Control</Link></p>}
    {confirmation}
    {!task.active_review && !['terminated','completed'].includes(task.status) && <details open={!compact?true:undefined}><summary>Task actions</summary>
      <label>Review comment for {task.id}<textarea maxLength={2000} value={comment} onChange={event => setComment(event.target.value)} /></label>
      <div className="workspace-actions">
        {!compact && task.status === 'submitted' && <>
          <button type="button" disabled={busy || !comment.trim()} onClick={() => void decide('returned')}>Return for Correction</button>
          <button type="button" disabled={busy || !comment.trim()} onClick={() => void decide('rejected')}>Reject</button>
        </>}
        <button type="button" disabled={busy} onClick={() => void decide('terminated')}>Terminate</button>
      </div>
      <details><summary>Force Complete (Super Admin override)</summary><p>Completes the task without publishing files or creating a GitHub commit. Enter a reason for the audit record.</p><label>Force completion reason<textarea maxLength={2000} value={forceReason} onChange={e=>setForceReason(e.target.value)}/></label><button className="people-danger" type="button" disabled={busy||!forceReason.trim()} onClick={()=>void forceComplete()}>Force Complete</button></details>
    </details>}
    {error && <p role="alert">{error}</p>}
  </article>;
}
