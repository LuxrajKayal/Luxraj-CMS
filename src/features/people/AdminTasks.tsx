import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import type { MemberAccount, MemberTask, Submission } from '../../../supabase/functions/_shared/member-contracts';
import { memberRequest, workspaceError } from '../workspace/api';
import { roleName } from './AccountDetails';
import { TaskSummary } from './MemberWorkspace';

const reviewNoticeEvent = 'luxraj:review-notices';
export { reviewNoticeEvent };

export function AdminTasks({ accounts }: { accounts: MemberAccount[] }) {
  const [tasks, setTasks] = useState<MemberTask[]>([]);
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
    memberRequest({ action: 'people_tasks' }, request.signal).then(result => {
      if (request.signal.aborted) return;
      setTasks(result.tasks);
      setSubmissions(result.submissions);
    }).catch(failure => { if (!request.signal.aborted) setError(workspaceError(failure)); });
    return () => request.abort();
  }, [reload]);
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { id } = await memberRequest({ action: 'people_add_task', userId, type, description,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
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
  return <div className="people-grid">
    <section className="people-panel">
      <h2>Assigned tasks</h2>
      <form onSubmit={event => void add(event)}>
        <label>Assigned user<select value={userId} required onChange={event => setUserId(event.target.value)}>
          <option value="">Choose an existing user</option>
          {accounts.filter(account => account.profile && !account.profile.disabled).map(account =>
            <option key={account.id} value={account.id}>{account.profile?.full_name} ({roleName[account.profile!.role]})</option>)}
        </select></label>
        <label>Task type<input value={type} maxLength={150} onChange={event => setType(event.target.value)} required /></label>
        <label>Task description<textarea value={description} maxLength={4000} onChange={event => setDescription(event.target.value)} required /></label>
        <button type="submit" disabled={busy}>Assign task</button>
      </form>
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={refresh}>Refresh tasks and submissions</button>
      {tasks.map(task => <TaskReview key={task.id + '/' + task.status + '/' + task.submission_id}
        task={task} name={accounts.find(account => account.id === task.user_id)?.profile?.full_name} refresh={refresh} />)}
    </section>
    <section className="people-panel">
      <h2>Submissions</h2>
      {!submissions.length && <p>No work submitted.</p>}
      {submissions.map(submission => {
        const current = tasks.some(task => task.id === submission.task_id && task.submission_id === submission.id && task.status === 'submitted');
        const params = new URLSearchParams({ submission: submission.id });
        for (const file of submission.files) params.append('file', file.id);
        return <article key={submission.id} className="people-item">
          <h3>{submission.task_id}{!submission.seen && <span className="people-status">New</span>}</h3>
          <p>{submission.full_name} · {roleName[submission.role]}</p>
          <time dateTime={submission.created_at}>{new Date(submission.created_at).toLocaleString()}</time>
          <ul>{submission.files.map(file => <li key={file.id}>{file.name}</li>)}</ul>
          <div className="workspace-actions">
            {current && <Link to={'/website-controls?' + params.toString()}>Open as Website Controls input</Link>}
            {!submission.seen && <button type="button" onClick={() => void seen(submission.id)}>Mark read</button>}
          </div>
        </article>;
      })}
    </section>
  </div>;
}

function TaskReview({ task, name, refresh }: { task: MemberTask; name?: string; refresh(): void }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function decide(decision: 'returned' | 'rejected' | 'terminated') {
    if (decision === 'terminated' && !window.confirm('Terminate ' + task.id + '? Drafts and submitted records are kept.')) return;
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
    {!task.active_review && task.status !== 'terminated' && <>
      <label>Review comment for {task.id}<textarea maxLength={2000} value={comment} onChange={event => setComment(event.target.value)} /></label>
      <div className="workspace-actions">
        {task.status === 'submitted' && <>
          <button type="button" disabled={busy || !comment.trim()} onClick={() => void decide('returned')}>Return for Correction</button>
          <button type="button" disabled={busy || !comment.trim()} onClick={() => void decide('rejected')}>Reject</button>
        </>}
        <button type="button" disabled={busy} onClick={() => void decide('terminated')}>Terminate</button>
      </div>
    </>}
    {error && <p role="alert">{error}</p>}
  </article>;
}
