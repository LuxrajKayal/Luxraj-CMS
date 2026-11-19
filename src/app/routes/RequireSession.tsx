import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../core/auth/AuthProvider';
import { PagePanel } from '../../shared/ui/PagePanel';

export function RequireSession() {
  const { loading, session } = useAuth();
  if (loading) return <PagePanel><p role="status">Checking your session…</p></PagePanel>;
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}
