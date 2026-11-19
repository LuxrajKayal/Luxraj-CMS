import { HashRouter } from 'react-router';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';
import { AppErrorFallback } from './AppErrorFallback';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from '../core/auth/AuthProvider';

export function App() {
  return (
    <ErrorBoundary fallback={<AppErrorFallback />}>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
