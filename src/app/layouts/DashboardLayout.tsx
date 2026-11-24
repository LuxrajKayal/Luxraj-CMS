import { NavLink, Outlet } from 'react-router';
import { dashboardNavigation } from './dashboardNavigation';
import './dashboard-layout.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../../core/auth/AuthProvider';
import { useEditBuffers } from '../../features/workspace/EditBuffers';
import { AppWindow, Braces, FileSearch, Folder, FolderUp, GitBranch, House, ListChecks, LogOut, PanelLeftClose, PanelLeftOpen, Settings, Users } from 'lucide-react';
import { Brand } from '../../shared/ui/Brand';
import { pendingChangesEvent, workspaceRequest } from '../../features/workspace/api';

const icons = [House, Folder, Braces, FolderUp, AppWindow, GitBranch, FileSearch, Users, ListChecks, Settings];

export function DashboardLayout() {
  const { signOut, message, session } = useAuth();
  const { buffers } = useEditBuffers();
  const [pending, setPending] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = sessionStorage.getItem('luxraj-sidebar');
      return saved === null ? window.matchMedia?.('(max-width: 48rem)').matches ?? false : saved === 'collapsed';
    } catch {
      return false;
    }
  });

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId || !(import.meta.env.DEV || import.meta.env.VITE_GITHUB_CONNECTION_ENABLED === 'true')) return;
    let controller: AbortController | undefined;
    let timeout: number;
    function refresh() {
      controller?.abort();
      window.clearTimeout(timeout);
      const request = new AbortController();
      controller = request;
      timeout = window.setTimeout(() => {
        workspaceRequest({ action: 'pending_count' }, request.signal).then(result => {
          if (!request.signal.aborted) setDraftCount(result.count);
        }).catch(() => { if (!request.signal.aborted) setDraftCount(0); });
      }, 150);
    }
    refresh();
    window.addEventListener(pendingChangesEvent, refresh);
    return () => {
      window.clearTimeout(timeout);
      controller?.abort();
      window.removeEventListener(pendingChangesEvent, refresh);
    };
  }, [userId]);

  useEffect(() => {
    const reset = () => setCollapsed(window.matchMedia?.('(max-width: 48rem)').matches ?? false);
    window.addEventListener('luxraj:presentation-reset', reset);
    return () => window.removeEventListener('luxraj:presentation-reset', reset);
  }, []);

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
              const count = path === '/source-control' ? draftCount : 0;
              const description = count ? label + ' (' + count + ' pending)' : label;
              return <li key={path}><NavLink to={path} title={description} aria-label={label}
                aria-description={count ? count + ' pending changes' : undefined} onClick={() => {
                if (!collapsed && window.matchMedia?.('(max-width: 48rem)').matches) toggle();
              }}>
                <Icon size={18} aria-hidden="true" /><span>{label}</span>
                {!!count && <small className="cms-draft-count" aria-hidden="true">{count > 99 ? '99+' : count}</small>}
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
