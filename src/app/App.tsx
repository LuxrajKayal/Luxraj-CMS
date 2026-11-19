import { HashRouter } from 'react-router';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
