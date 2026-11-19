import { NavLink, Outlet } from 'react-router';
import { dashboardNavigation } from './dashboardNavigation';
import './dashboard-layout.css';

export function DashboardLayout() {
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
              <button type="button" disabled>Logout</button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="dashboard-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
