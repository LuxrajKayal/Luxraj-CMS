import { HashRouter } from 'react-router';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';
import { AppErrorFallback } from './AppErrorFallback';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from '../core/auth/AuthProvider';
import { EditBuffers } from '../features/workspace/EditBuffers';

export function App() {
  return (
    <ErrorBoundary fallback={<AppErrorFallback />}>
      <AuthProvider>
        <EditBuffers>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </EditBuffers>
      </AuthProvider>
    </ErrorBoundary>
  );
}
