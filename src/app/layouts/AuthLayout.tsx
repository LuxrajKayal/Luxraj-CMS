import { Outlet } from 'react-router';
import './auth-layout.css';

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <div className="auth-layout__panel">
        <Outlet />
      </div>
    </main>
  );
}
