import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../core/auth/AuthProvider';
import { useSuperAdminAccess } from '../../core/auth/useSuperAdminAccess';
import { PagePanel } from '../../shared/ui/PagePanel';
import { memberRequest } from '../../features/workspace/api';

export function RequireSuperAdmin() {
  const { loading, session, message, signOut } = useAuth();
  const access = useSuperAdminAccess(session);
  const [signingOut, setSigningOut] = useState(false);
  const [member, setMember] = useState<{user:string; token:string; decision:'allowed'|'denied'|'unavailable'; onboarding?:boolean}>();
  const token = session?.access_token ?? '';
  const { pathname } = useLocation();
  const userId = session?.user.id;
  useEffect(() => {
    if (access !== 'denied' || pathname !== '/dashboard' || !userId) return;
    const request = new AbortController();
    void (async () => {
      try {
        const { profile } = await memberRequest({ action: 'member_context' }, request.signal);
        if (!request.signal.aborted) setMember({user:userId,token,decision:profile.user_id===userId?'allowed':'denied',onboarding:profile.onboarding_completed});
      } catch (failure) { if (!request.signal.aborted) setMember({user:userId,token,decision:failure instanceof Error && ['member_forbidden','forbidden'].includes(failure.message)?'denied':'unavailable'}); }
    })();
    return () => request.abort();
  }, [access, pathname, userId, token]);

  if (loading) return <PagePanel><p role="status">Checking your session…</p></PagePanel>;
  if (!session) return <Navigate to="/login" replace />;
  if (access === 'checking') return <PagePanel><p role="status">Checking dashboard access…</p></PagePanel>;
  if (access === 'allowed') return <Outlet />;
  if (access === 'denied' && pathname === '/dashboard') {
    if (member?.user !== userId || member?.token !== token) return <PagePanel><p role="status">Checking workspace access…</p></PagePanel>;
    if (member.decision === 'allowed') return <Navigate to={member.onboarding?'/member/dashboard':'/member/profile'} replace />;
  }
  const denied=access==='denied' && (pathname!=='/dashboard'||member?.decision==='denied');

  async function logout() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  }

  return (
    <PagePanel>
      <div role="alert">
        <h1>{denied ? 'Dashboard access denied' : 'Dashboard access could not be verified'}</h1>
        <p>{denied
          ? 'Your account is not approved to access the dashboard.'
          : 'Reload the page to try the access check again.'}</p>
      </div>
      {message && <p role="alert">{message}</p>}
      <p>
        <button type="button" onClick={logout} disabled={signingOut}>
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </p>
    </PagePanel>
  );
}
