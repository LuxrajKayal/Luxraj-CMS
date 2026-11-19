import { useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../core/auth/AuthProvider';
import { useSuperAdminAccess } from '../../core/auth/useSuperAdminAccess';
import { PagePanel } from '../../shared/ui/PagePanel';

export function RequireSuperAdmin() {
  const { loading, session, message, signOut } = useAuth();
  const access = useSuperAdminAccess(session);
  const [signingOut, setSigningOut] = useState(false);

  if (loading) return <PagePanel><p role="status">Checking your session…</p></PagePanel>;
  if (!session) return <Navigate to="/login" replace />;
  if (access === 'checking') return <PagePanel><p role="status">Checking dashboard access…</p></PagePanel>;
  if (access === 'allowed') return <Outlet />;

  async function logout() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  }

  return (
    <PagePanel>
      <div role="alert">
        <h1>{access === 'denied' ? 'Dashboard access denied' : 'Dashboard access could not be verified'}</h1>
        <p>{access === 'denied'
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
