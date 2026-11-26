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
import { SettingsLayout } from '../../features/settings/SettingsLayout';
import { DraftManagementPage } from '../../features/settings/DraftManagementPage';
import { StorageManagementPage } from '../../features/settings/StorageManagementPage';
import { CommitLimitPage } from '../../features/settings/CommitLimitPage';
import { ProfilePictureLocationPage } from '../../features/settings/ProfilePictureLocationPage';
import { MaintenancePage } from '../../features/settings/MaintenancePage';
import { lazy, Suspense } from 'react';

const CodeInjectorPage = lazy(() => import('../../features/code-injector/CodeInjectorPage'));
const FileManagerPage = lazy(() => import('../../features/file-manager/FileManagerPage'));
const WebsiteControlsPage = lazy(() => import('../../features/website-controls/WebsiteControlsPage'));
const UsersPermissionsPage = lazy(() => import('../../features/people/UsersPermissionsPage'));
const AdminDashboard = lazy(() => import('../../features/people/UsersPermissionsPage').then(module => ({ default: module.AdminDashboard })));
const MemberLayout = lazy(() => import('../../features/people/MemberWorkspace').then(module => ({ default: module.MemberLayout })));
const MemberLanding = lazy(() => import('../../features/people/MemberWorkspace').then(module => ({ default: module.MemberLanding })));
const MemberDashboard = lazy(() => import('../../features/people/MemberWorkspace').then(module => ({ default: module.MemberDashboard })));
const MemberDraftsPage = lazy(() => import('../../features/people/MemberWorkspace').then(module => ({ default: module.MemberDraftsPage })));
const PendingReviews = lazy(() => import('../../features/people/UsersPermissionsPage').then(module => ({ default: module.PendingReviews })));
const MemberProfilePage = lazy(() => import('../../features/people/MemberWorkspace').then(module => ({ default: module.MemberProfilePage })));
const MemberTasksPage = lazy(() => import('../../features/people/MemberWorkspace').then(module => ({ default: module.MemberTasksPage })));
const MemberWorkstation = lazy(() => import('../../features/people/MemberWorkspace').then(module => ({ default: module.MemberWorkstation })));

// The live CMS stays usable with Task 5 authorization until the GitHub App backend is configured.
const githubConnectionEnabled = import.meta.env.DEV || import.meta.env.VITE_GITHUB_CONNECTION_ENABLED === 'true';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/member" element={<Suspense fallback={<p role="status">Loading member workspace…</p>}><MemberLayout /></Suspense>}>
        <Route index element={<MemberLanding />} />
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="drafts" element={<MemberDraftsPage />} />
        <Route path="profile" element={<MemberProfilePage />} />
        <Route path="workstation" element={<MemberWorkstation />} />
        <Route path="tasks" element={<MemberTasksPage />} />
      </Route>

      <Route element={<RequireSuperAdmin />}>
        {githubConnectionEnabled && <Route path="/github/connect" element={<GithubOnboarding />} />}
        {githubConnectionEnabled && <Route path="/github/callback" element={<GithubCallback />} />}
        <Route element={githubConnectionEnabled ? <RequireGithubConnection /> : <Outlet />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Suspense fallback={<p role="status">Loading dashboard…</p>}><AdminDashboard /></Suspense>} />
          </Route>
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/users-permissions" element={<Suspense fallback={<p role="status">Loading Users &amp; Permissions…</p>}>
            <UsersPermissionsPage />
          </Suspense>} />
          <Route path="/pending-reviews" element={<Suspense fallback={<p role="status">Loading reviews…</p>}><PendingReviews /></Suspense>} />
          {githubConnectionEnabled && (
            <Route element={<WorkspaceLayout />}>
              <Route path="/repositories" element={<RepositoriesPage />} />
              <Route path="/code-editor" element={<CodeEditorPage />} />
              <Route path="/source-control" element={<SourceControlPage />} />
              <Route path="/website-controls" element={<Suspense fallback={<p role="status">Loading Website Controls…</p>}>
                <WebsiteControlsPage />
              </Suspense>} />
              <Route path="/file-manager" element={<Suspense fallback={<p role="status">Loading File Manager…</p>}>
                <FileManagerPage />
              </Suspense>} />
              <Route path="/code-injector/*" element={<Suspense fallback={<p role="status">Loading Code Injector…</p>}>
                <CodeInjectorPage />
              </Suspense>} />
            </Route>
          )}
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={githubConnectionEnabled
              ? <GithubSettings />
              : <p>GitHub connection will be available after backend setup.</p>} />
            <Route path="drafts" element={<DraftManagementPage />} />
            <Route path="storage" element={<StorageManagementPage />} />
            <Route path="commit-limit" element={<CommitLimitPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            {githubConnectionEnabled && <Route element={<WorkspaceLayout />}>
              <Route path="profile-picture-location" element={<ProfilePictureLocationPage />} />
            </Route>}
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
