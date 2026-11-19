import { Navigate, Route, Routes } from 'react-router';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginPage } from './LoginPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { RequireSession } from './RequireSession';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireSession />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<h1>Dashboard</h1>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
