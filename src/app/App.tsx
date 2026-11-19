import { HashRouter } from 'react-router';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';
import { AppErrorFallback } from './AppErrorFallback';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <ErrorBoundary fallback={<AppErrorFallback />}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ErrorBoundary>
  );
}
