import { Outlet } from 'react-router';
import { PagePanel } from '../../shared/ui/PagePanel';

export function AuthLayout() {
  return (
    <PagePanel>
      <Outlet />
    </PagePanel>
  );
}
