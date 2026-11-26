import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { MemberAccount } from '../../../supabase/functions/_shared/member-contracts';
import { ModuleTopbar } from '../../shared/ui/ModuleChrome';
import { memberRequest, workspaceError } from '../workspace/api';
import { AdminAccountPanel, AdminPicture } from './AdminAccountPanel';
import { AdminAssignments } from './AdminAssignments';
import { AdminTasks, reviewNoticeEvent } from './AdminTasks';
import { PersonAvatar } from './MemberWorkspace';
import { roleName } from './AccountDetails';
import './people.css';


const sections=[['overview','Overview'],['users','All Users'],['new','Add New User'],['profiles','Profile Approvals'],['apps','Application Access'],['tasks','Task Management'],['terminated','Terminated Tasks']] as const;
function useAccounts(){
 const [accounts,setAccounts]=useState<MemberAccount[]>();
 const [error,setError]=useState('');
 const [version,setVersion]=useState(0);
 const reload=()=>setVersion(n=>n+1);
 useEffect(()=>{const request=new AbortController();setError('');
 memberRequest({action:'people_list'},request.signal).then(r=>{if(!request.signal.aborted)setAccounts(r.accounts);}).catch(f=>{if(!request.signal.aborted)setError(workspaceError(f));});
 return()=>request.abort();},[version]);
 return {accounts,error,reload};
}
function Directory({accounts,manage}: {accounts:MemberAccount[];manage(id:string,section?:string):void}){
 const [query,setQuery]=useState(''),[role,setRole]=useState(''),[page,setPage]=useState(0);
 const filtered=accounts.filter(a=>(!role||(a.profile?.role??'unmanaged')===role)&&((a.profile?.full_name??'')+' '+a.email).toLowerCase().includes(query.toLowerCase()));
 return <section className="people-panel"><h2>All Users</h2><div className="people-toolbar"><input type="search" aria-label="Search users" placeholder="Search by name or email" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/>
 <select aria-label="Filter roles" value={role} onChange={e=>{setRole(e.target.value);setPage(0);}}><option value="">All roles</option><option value="author">Authors</option><option value="developer">Developers</option><option value="advisor">Advisors</option><option value="unmanaged">Unmanaged</option></select></div>
 {!filtered.length&&<p>No matching users.</p>}{filtered.slice(page*12,page*12+12).map(a=><article key={a.id} className="people-card"><div className="people-identity"><PersonAvatar name={a.profile?.full_name??a.email} url={a.profile?.approved_picture_url}/><div><h3>{a.profile?.full_name??a.email}</h3><p>{a.email}</p><small>{a.profile?roleName[a.profile.role]+' · '+(a.profile.disabled?'Disabled':'Active account'):'Supabase account · profile setup required'}</small></div></div><div className="people-toolbar"><button onClick={()=>manage(a.id)} aria-label={'Modify '+a.email}>Modify</button>{a.profile&&!a.profile.disabled&&<><button onClick={()=>manage(a.id,'apps')}>Applications</button><button onClick={()=>manage(a.id,'profiles')}>Profile</button></>}</div></article>)}
 <div className="people-toolbar"><button disabled={!page} onClick={()=>setPage(n=>n-1)}>Previous</button><small>Page {page+1} of {Math.max(1,Math.ceil(filtered.length/12))}</small><button disabled={(page+1)*12>=filtered.length} onClick={()=>setPage(n=>n+1)}>Next</button></div></section>;
}
function PictureQueue({accounts,reload,selected,pendingOnly=false}:{accounts:MemberAccount[];reload():void;selected?:string;pendingOnly?:boolean}){
 const [filter,setFilter]=useState(selected?'':'pending');
 const items=accounts.filter(a=>a.profile&&(pendingOnly?a.profile.picture_state==='pending':(!filter||a.profile.picture_state===filter)));
 return <section className="people-panel"><h2>Profile pictures</h2>{!pendingOnly&&<label>Picture status<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="">All</option><option value="pending">Pending</option><option value="published">Published</option><option value="returned">Returned</option><option value="unset">Not submitted</option></select></label>}
 {!items.length&&<p>No matching profile pictures.</p>}{items.map(a=><article key={a.id} className="people-card"><div className="people-identity"><PersonAvatar name={a.profile!.full_name} url={a.profile!.approved_picture_url}/><div><strong>{a.profile!.full_name}</strong><p>{roleName[a.profile!.role]} · {a.profile!.picture_state}</p></div></div><details open={selected===a.id?true:undefined}><summary>View picture and review</summary><AdminPicture key={a.profile!.pending_picture??'none'} account={a} refreshed={reload}/></details></article>)}</section>;
}
export default function UsersPermissionsPage(){
 const [params,setParams]=useSearchParams();
 const section=params.get('section')??'overview';
 const selected=params.get('user')??'';
 const {accounts,error,reload}=useAccounts();
 const [notice,setNotice]=useState('');
 const account=accounts?.find(a=>a.id===selected);
 function go(s:string,id?:string){setParams({section:s,...(id?{user:id}:{})});setNotice('');}
 function done(message:string){go('users');setNotice(message);reload();}
 return <><ModuleTopbar title="Users & Permissions"><button type="button" onClick={reload}>Refresh</button></ModuleTopbar>
 <div className="module-body people-shell"><nav aria-label="User management" className="people-subnav">{sections.map(([s,label])=><button key={s} type="button" aria-current={section===s||section==='edit'&&s==='users'?'page':undefined} onClick={()=>go(s)}>{label}</button>)}</nav>
 <div className="people-page">{notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error}</p>}{!accounts&&!error&&<p role="status">Loading CMS accounts…</p>}
 {accounts&&<>
 {section==='overview'&&<section className="people-panel"><h2>User Management</h2><p>Manage accounts, permissions, assignments and tasks independently.</p><div className="people-stats">{[['Users',accounts.length],['Authors',accounts.filter(a=>a.profile?.role==='author').length],['Developers',accounts.filter(a=>a.profile?.role==='developer').length],['Advisors',accounts.filter(a=>a.profile?.role==='advisor').length],['Profile reviews',accounts.filter(a=>a.profile?.picture_state==='pending').length]].map(([n,v])=><div className="people-stat" key={n}><small>{n}</small><strong>{v}</strong></div>)}</div><div className="people-toolbar"><button className="people-primary" onClick={()=>go('new')}>Add New User</button><button onClick={()=>go('users')}>All Users</button><Link to="/pending-reviews">Pending Reviews</Link></div></section>}
 {section==='users'&&<><button className="people-primary" onClick={()=>go('new')}>Add New User</button><Directory accounts={accounts} manage={(id,s)=>go(s??'edit',id)}/></>}
 {section==='new'&&<AdminAccountPanel key="new" account={null} finished={done} cancelled={()=>go('users')} standalone/>}
 {section==='edit'&&(account?<AdminAccountPanel key={account.id} account={account} finished={done} cancelled={()=>go('users')} standalone/>:<p>Account not found.</p>)}
 {section==='profiles'&&<PictureQueue key={selected} accounts={accounts} reload={reload} selected={selected}/>}
 {section==='apps'&&<><section className="people-panel"><h2>Application Access</h2><label>Choose user<select value={selected} onChange={e=>go('apps',e.target.value)}><option value="">Select a user</option>{accounts.filter(a=>a.profile&&!a.profile.disabled).map(a=><option key={a.id} value={a.id}>{a.profile!.full_name} ({roleName[a.profile!.role]})</option>)}</select></label></section>{account?.profile&&!account.profile.disabled&&<AdminAssignments key={account.id} userId={account.id}/>}</>}
 {section==='tasks'&&<AdminTasks key="manage" accounts={accounts} mode="manage"/>}
 {section==='terminated'&&<AdminTasks key="terminated" accounts={accounts} mode="terminated"/>}
 </>}</div></div></>;
}
export function PendingReviews(){
 const {accounts,error,reload}=useAccounts();
 const [params,setParams]=useSearchParams();
 const tab=params.get('tab')??'tasks';
 return <><ModuleTopbar title="Pending Reviews"><button onClick={reload}>Refresh</button></ModuleTopbar><div className="module-body people-page">
 <div className="people-toolbar"><button aria-pressed={tab==='tasks'} onClick={()=>setParams({tab:'tasks'})}>Task submissions</button><button aria-pressed={tab==='profiles'} onClick={()=>setParams({tab:'profiles'})}>Profile pictures {accounts?'('+accounts.filter(a=>a.profile?.picture_state==='pending').length+')':''}</button><button aria-pressed={tab==='history'} onClick={()=>setParams({tab:'history'})}>Review history</button></div>
 {error&&<p role="alert">{error}</p>}{!accounts&&!error&&<p role="status">Loading reviews…</p>}{accounts&&(tab==='profiles'?<PictureQueue accounts={accounts} reload={reload} pendingOnly/>:<AdminTasks key={tab} accounts={accounts} mode={tab==='history'?'history':'review'}/>)}
 </div></>;
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
    const interval = window.setInterval(()=>{if(!document.hidden)refresh();}, 30000);
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
    <Link className="people-notification" to="/pending-reviews">
      {count ? count + (count === 1 ? ' new submission' : ' new submissions') : 'Task submissions'}
    </Link>
  </ModuleTopbar>;
}
