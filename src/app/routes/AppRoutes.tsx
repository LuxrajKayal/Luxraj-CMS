import { Navigate, Route, Routes } from 'react-router';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginPage } from './LoginPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Task 4 will mount the dashboard layout behind a real session check. */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
