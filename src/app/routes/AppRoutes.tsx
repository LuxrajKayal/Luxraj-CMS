import { Navigate, Outlet, Route, Routes } from 'react-router';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginPage } from './LoginPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { RequireSuperAdmin } from './RequireSuperAdmin';
import {
  GithubCallback, GithubOnboarding, GithubSettings, RequireGithubConnection,
} from '../../features/github-connection/GithubConnectionPages';
import { WorkspaceLayout } from '../../features/workspace/WorkspaceLayout';
import { RepositoriesPage } from '../../features/workspace/RepositoriesPage';
import { CodeEditorPage } from '../../features/workspace/CodeEditorPage';
import { SourceControlPage } from '../../features/workspace/SourceControlPage';

// The live CMS stays usable with Task 5 authorization until the GitHub App backend is configured.
const githubConnectionEnabled = import.meta.env.DEV || import.meta.env.VITE_GITHUB_CONNECTION_ENABLED === 'true';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireSuperAdmin />}>
        {githubConnectionEnabled && <Route path="/github/connect" element={<GithubOnboarding />} />}
        {githubConnectionEnabled && <Route path="/github/callback" element={<GithubCallback />} />}
        <Route element={githubConnectionEnabled ? <RequireGithubConnection /> : <Outlet />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          </Route>
        </Route>
        <Route element={<DashboardLayout />}>
          {githubConnectionEnabled && (
            <Route element={<WorkspaceLayout />}>
              <Route path="/repositories" element={<RepositoriesPage />} />
              <Route path="/code-editor" element={<CodeEditorPage />} />
              <Route path="/source-control" element={<SourceControlPage />} />
            </Route>
          )}
          <Route path="/settings" element={githubConnectionEnabled
            ? <GithubSettings />
            : <p>GitHub connection will be available after backend setup.</p>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
