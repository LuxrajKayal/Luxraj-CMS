import type { ReactNode } from 'react';

export function ModuleTopbar({ title, children }: { title: string; children?: ReactNode }) {
  return <header className="module-topbar"><h1>{title}</h1>{children}</header>;
}

export function ModulePanel({ title, children, hidden }: { title: string; children: ReactNode; hidden?: boolean }) {
  return (
    <aside className="module-panel" aria-label={title} hidden={hidden}>
      <h2>{title}</h2>
      <div className="module-panel__body">{children}</div>
    </aside>
  );
}
