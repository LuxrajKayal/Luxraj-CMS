import { NavLink, Outlet } from 'react-router';
import { dashboardNavigation } from './dashboardNavigation';
import './dashboard-layout.css';
import { useState } from 'react';
import { useAuth } from '../../core/auth/AuthProvider';
import { useEditBuffers } from '../../features/workspace/EditBuffers';

export function DashboardLayout() {
  const { signOut, message } = useAuth();
  const { buffers } = useEditBuffers();
  const [pending, setPending] = useState(false);

  async function logout() {
    if (Object.keys(buffers).length && !window.confirm('Sign out and discard unsaved edits? Saved drafts will stay in Supabase.')) return;
    setPending(true);
    await signOut();
    setPending(false);
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-layout__sidebar">
        <p className="dashboard-layout__title">Luxraj CMS</p>
        <nav aria-label="CMS navigation">
          <ul>
            {dashboardNavigation.map(({ label, path }) => (
              <li key={path}>
                <NavLink to={path}>{label}</NavLink>
              </li>
            ))}
            <li>
              <button type="button" disabled={pending} onClick={logout}>
                {pending ? 'Signing out…' : 'Logout'}
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="dashboard-layout__content">
        {message && <p role="alert">{message}</p>}
        <Outlet />
      </main>
    </div>
  );
}
