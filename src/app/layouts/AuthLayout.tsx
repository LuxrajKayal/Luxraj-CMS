import { Outlet } from 'react-router';
import { PagePanel } from '../../shared/ui/PagePanel';
import { Brand } from '../../shared/ui/Brand';

export function AuthLayout() {
  return (
    <PagePanel>
      <Brand />
      <Outlet />
    </PagePanel>
  );
}
