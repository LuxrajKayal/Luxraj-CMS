import { Navigate, Route, Routes } from 'react-router';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginPage } from './LoginPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { RequireSuperAdmin } from './RequireSuperAdmin';
import {
  GithubCallback, GithubOnboarding, GithubSettings, RequireGithubConnection,
} from '../../features/github-connection/GithubConnectionPages';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireSuperAdmin />}>
        <Route path="/github/connect" element={<GithubOnboarding />} />
        <Route path="/github/callback" element={<GithubCallback />} />
        <Route element={<RequireGithubConnection />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          </Route>
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/settings" element={<GithubSettings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
