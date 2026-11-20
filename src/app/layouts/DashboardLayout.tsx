import { NavLink, Outlet } from 'react-router';
import { dashboardNavigation } from './dashboardNavigation';
import './dashboard-layout.css';
import { useState } from 'react';
import { useAuth } from '../../core/auth/AuthProvider';
import { useEditBuffers } from '../../features/workspace/EditBuffers';
import { Braces, FileSearch, Folder, GitBranch, House, ListChecks, LogOut, PanelLeftClose, PanelLeftOpen, Settings, Users } from 'lucide-react';
import { Brand } from '../../shared/ui/Brand';

const icons = [House, Folder, Braces, GitBranch, FileSearch, Users, ListChecks, Settings];

export function DashboardLayout() {
  const { signOut, message, session } = useAuth();
  const { buffers } = useEditBuffers();
  const [pending, setPending] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = sessionStorage.getItem('luxraj-sidebar');
      return saved === null ? window.matchMedia?.('(max-width: 48rem)').matches ?? false : saved === 'collapsed';
    } catch {
      return false;
    }
  });

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try { sessionStorage.setItem('luxraj-sidebar', next ? 'collapsed' : 'expanded'); } catch { /* optional display preference */ }
  }

  async function logout() {
    if (Object.keys(buffers).length && !window.confirm('Sign out and discard unsaved edits? Saved drafts will stay in Supabase.')) return;
    setPending(true);
    await signOut();
    setPending(false);
  }

  return (
    <div className={collapsed ? 'dashboard-layout dashboard-layout--rail' : 'dashboard-layout'}>
      <aside className="dashboard-layout__sidebar">
        <div className="cms-sidebar-header">
          <Brand compact={collapsed} />
          <button type="button" aria-label={collapsed ? 'Expand main sidebar' : 'Collapse main sidebar'}
            aria-expanded={!collapsed} title={collapsed ? 'Expand main sidebar' : 'Collapse main sidebar'} onClick={toggle}>
            {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          </button>
        </div>
        <nav aria-label="CMS navigation">
          <ul>
            {dashboardNavigation.map(({ label, path }, index) => {
              const Icon = icons[index];
              return <li key={path}><NavLink to={path} title={label} aria-label={label} onClick={() => {
                if (!collapsed && window.matchMedia?.('(max-width: 48rem)').matches) toggle();
              }}>
                <Icon size={18} aria-hidden="true" /><span>{label}</span>
              </NavLink></li>;
            })}
          </ul>
        </nav>
        <div className="cms-account">
          {!collapsed && <small title={session?.user.email}>{session?.user.email || 'Super Admin'}</small>}
          <button type="button" disabled={pending} onClick={logout} aria-label="Logout" title="Logout">
            <LogOut size={18} aria-hidden="true" /><span>{pending ? 'Signing out…' : 'Logout'}</span>
          </button>
        </div>
      </aside>
      <main className="dashboard-layout__content">
        {message && <p role="alert">{message}</p>}
        <Outlet />
      </main>
    </div>
  );
}
