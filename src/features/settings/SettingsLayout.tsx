import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { PanelLeft } from 'lucide-react';
import { ModulePanel, ModuleTopbar } from '../../shared/ui/ModuleChrome';

export function SettingsLayout() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="settings-shell">
      <ModuleTopbar title="Settings">
        <button type="button" aria-expanded={expanded} aria-label="Settings navigation" title="Settings navigation"
          onClick={() => setExpanded(value => !value)}><PanelLeft size={17} aria-hidden="true" /></button>
      </ModuleTopbar>
      <div className="settings-body">
        {expanded && <ModulePanel title="Settings sections">
          <nav className="settings-links" aria-label="Settings navigation">
            <NavLink to="/settings" end>GitHub Connection</NavLink>
            <NavLink to="/settings/drafts">Draft Management</NavLink>
            <NavLink to="/settings/storage">Storage Management</NavLink>
          </nav>
        </ModulePanel>}
        <div className="module-body module-scroll"><Outlet /></div>
      </div>
    </div>
  );
}
