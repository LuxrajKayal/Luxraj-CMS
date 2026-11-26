import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import type { MemberAccount, MemberFields } from '../../../supabase/functions/_shared/member-contracts';
import { memberRequest, workspaceError } from '../workspace/api';
import { AccountDetails } from './AccountDetails';
import { memberFile } from './memberFiles';
import { usePeopleConfirm } from './PeopleConfirm';

export function AdminAccountPanel({ account, finished, cancelled, standalone=false }: { account: MemberAccount | null; finished(message: string): void; cancelled?():void; standalone?:boolean }) {
  const {confirm,confirmation}=usePeopleConfirm();
  const [fields, setFields] = useState<MemberFields>({
    full_name: '', birth_date: '', gender: '', role: 'author', qualifications: '', description: '',
    ...account?.profile, email: account?.email ?? '',
  });
  const [initialFields]=useState(()=>JSON.stringify(fields));
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      // Send only fields operated by this form. Picture and authorization state are backend-controlled.
      const { full_name, birth_date, gender, role, qualifications, description, email } = fields;
      await memberRequest({ action: 'people_save', id: account?.id,
        fields: { full_name, birth_date, gender, role, qualifications, description, email }, ...(account ? {} : { password }) });
      setPassword('');
      finished(account ? 'Account updated.' : 'Account created. Share the credentials with the user yourself.');
    } catch (failure) { setError(workspaceError(failure)); }
    finally { setBusy(false); }
  }
  async function erase() {
    if (!account || !await confirm('Permanently delete ' + account.email + ' and their profile, assignments, tasks and private work? Committed GitHub files are kept.')) return;
    setBusy(true);
    setError('');
    try {
      await memberRequest({ action: 'people_delete', id: account.id });
      finished('Account deleted.');
    } catch (failure) { setError(workspaceError(failure)); }
    finally { setBusy(false); }
  }
  async function cancel(){if(JSON.stringify(fields)!==initialFields||password){if(!await confirm('Discard unsaved account changes?'))return;}setPassword('');cancelled?.();}
  return <section className="people-panel">
    <h2>{account ? 'Modify Existing User' : 'Add New User'}</h2>
    {account?.profile?.disabled && <p>Workspace disabled pending account deletion.</p>}
    <form onSubmit={event => void save(event)}>
      <fieldset disabled={busy || account?.profile?.disabled}>
        <AccountDetails fields={fields} update={setFields} />
        {!account && <label>Assigned password<input type="password" required minLength={8} maxLength={256}
          autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /></label>}
        <div className="people-toolbar">{cancelled&&<button type="button" onClick={()=>void cancel()}>Cancel</button>}<button type="submit" className="people-primary">{account ? 'Save account' : 'Create account'}</button></div>
      </fieldset>
    </form>
    {error && <p role="alert">{error}</p>}
    {account&&<section className="people-picture"><h3>Account deletion</h3><p>Only delete accounts when their private work and profile are no longer needed.</p><button className="people-danger" type="button" disabled={busy} onClick={()=>void erase()}>Delete account</button></section>}
    {!standalone&&account?.profile&&<AdminPicture key={account.profile.pending_picture??'none'} account={account}/>}
    {confirmation}
  </section>;
}

export function AdminPicture({ account, refreshed }: { account: MemberAccount; refreshed?():void }) {
  const picture = account.profile?.pending_picture;
  const state = account.profile?.picture_state;
  const [preview, setPreview] = useState<Blob | null>(null);
  const [url, setUrl] = useState('');
  const [decoded, setDecoded] = useState(false);
  const [comment, setComment] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!preview) return;
    const object = URL.createObjectURL(preview);
    setUrl(object);
    return () => URL.revokeObjectURL(object);
  }, [preview]);
  async function run(action: 'view' | 'stage' | 'return') {
    if (!picture) return;
    setBusy(true);
    setError('');
    try {
      if (action === 'view') {
        const { file } = await memberRequest({ action: 'people_picture', userId: account.id, pictureId: picture });
        setDecoded(false);
        setPreview(await memberFile(file));
      } else if (action === 'stage') {
        await memberRequest({ action: 'people_stage_picture', userId: account.id, pictureId: picture });
        setNotice('Approved picture staged. Select it in Source Control and explicitly confirm the commit.');
      } else {
        await memberRequest({ action: 'people_return_picture', userId: account.id, pictureId: picture, comment });
        setNotice('Picture returned for correction.'); refreshed?.();
      }
    } catch (failure) { setError(workspaceError(failure)); }
    finally { setBusy(false); }
  }
  return <section className="people-picture">
    <h3>Profile picture</h3>
    {account.profile?.approved_picture_url && <img className="people-avatar" src={account.profile.approved_picture_url}
      alt="Published profile picture" referrerPolicy="no-referrer" />}
    {state === 'returned' && <p>Returned. {account.profile?.picture_comment}</p>}
    {state === 'unset' && <p>No picture submitted.</p>}
    {account.profile?.picture_review && <p>GitHub review in progress. <Link to={'/source-control?recover=' + account.profile.picture_review}>Verify in Source Control</Link></p>}
    {state === 'pending' && !notice && !account.profile?.picture_review && <>
      {url && <img className="people-avatar" src={url} alt="Pending profile picture" onLoad={() => setDecoded(true)}
        onError={() => { setDecoded(false); setError('This WebP could not be displayed. Return it for correction.'); }} />}
      <div className="workspace-actions">
        <button type="button" disabled={busy} onClick={() => void run('view')}>View pending picture</button>
        <button type="button" disabled={busy || !decoded} onClick={() => void run('stage')}>Approve and stage picture</button>
        <Link to="/settings/profile-picture-location">Profile picture destination</Link>
      </div>
      <p>Select the configured picture repository and branch in Repositories before staging.</p>
      <label>Picture correction comment <input value={comment} maxLength={2000} onChange={event => setComment(event.target.value)} /></label>
      <button type="button" disabled={busy || !comment.trim()} onClick={() => void run('return')}>Return picture</button>
    </>}
    {notice && <p role="status">{notice} <Link to="/source-control">Open Source Control</Link></p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
