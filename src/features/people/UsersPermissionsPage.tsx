import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { MemberAccount } from '../../../supabase/functions/_shared/member-contracts';
import { ModuleTopbar } from '../../shared/ui/ModuleChrome';
import { memberRequest, workspaceError } from '../workspace/api';
import { AdminAccountPanel } from './AdminAccountPanel';
import { AdminAssignments } from './AdminAssignments';
import { AdminTasks, reviewNoticeEvent } from './AdminTasks';
import { roleName } from './AccountDetails';
import './people.css';

export default function UsersPermissionsPage() {
  const [params, setParams] = useSearchParams();
  const showTasks = params.get('section') === 'tasks';
  const [accounts, setAccounts] = useState<MemberAccount[]>();
  const [selected, setSelected] = useState<string | 'new' | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const account = accounts?.find(item => item.id === selected);
  useEffect(() => {
    const request = new AbortController();
    memberRequest({ action: 'people_list' }, request.signal).then(result => {
      if (!request.signal.aborted) setAccounts(result.accounts);
    }).catch(failure => { if (!request.signal.aborted) setError(workspaceError(failure)); });
    return () => request.abort();
  }, [reload]);
  function finish(message: string) {
    setSelected(null);
    setCreating(false);
    setNotice(message);
    setReload(value => value + 1);
  }
  return <>
    <ModuleTopbar title="Users & Permissions">
      <button type="button" aria-pressed={!showTasks} onClick={() => setParams({})}>Accounts and applications</button>
      <button type="button" aria-pressed={showTasks} onClick={() => setParams({ section: 'tasks' })}>Tasks and submissions</button>
    </ModuleTopbar>
    <div className="module-body">
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
      {!accounts && !error && <p role="status">Loading CMS accounts…</p>}
      {showTasks ? <AdminTasks accounts={accounts ?? []} /> : <div className="people-grid">
        <section className="people-panel">
          <h2>Users</h2>
          <div className="workspace-actions">
            <button type="button" onClick={() => { setSelected('new'); setCreating(true); setNotice(''); }}>Add New User</button>
            <button type="button" onClick={() => { setError(''); setReload(value => value + 1); }}>Refresh users</button>
          </div>
          {accounts?.length === 0 && <p>No managed accounts. Create an account here or add one in Supabase.</p>}
          {accounts?.map(item => <article key={item.id} className="people-item">
            <h3>{item.profile?.full_name ?? item.email}</h3>
            <p>{item.profile ? item.email + ' · ' + roleName[item.profile.role] : 'Supabase account · profile setup required'}</p>
            <button type="button" aria-label={'Modify ' + item.email} onClick={() => {
              setSelected(item.id); setCreating(false); setNotice('');
            }}>Modify Existing User</button>
          </article>)}
        </section>
        {(creating || account) && <div className="people-detail">
          <AdminAccountPanel key={(account?.id ?? 'new') + reload} account={account ?? null} finished={finish} />
          {account?.profile && !account.profile.disabled && <AdminAssignments key={account.id} userId={account.id} />}
        </div>}
      </div>}
    </div>
  </>;
}

export function AdminDashboard() {
  const [count, setCount] = useState<number>();
  useEffect(() => {
    let controller: AbortController | undefined;
    function refresh() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      void (async () => {
        try {
          const result = await memberRequest({ action: 'people_notice_count' }, request.signal);
          if (!request.signal.aborted) setCount(result.count);
        } catch { if (!request.signal.aborted) setCount(undefined); }
      })();
    }
    refresh();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    window.addEventListener(reviewNoticeEvent, refresh);
    return () => {
      window.clearInterval(interval);
      controller?.abort();
      window.removeEventListener('focus', refresh);
      window.removeEventListener(reviewNoticeEvent, refresh);
    };
  }, []);
  return <ModuleTopbar title="Dashboard">
    <Link className="people-notification" to="/users-permissions?section=tasks">
      {count ? count + (count === 1 ? ' new submission' : ' new submissions') : 'Task submissions'}
    </Link>
  </ModuleTopbar>;
}
