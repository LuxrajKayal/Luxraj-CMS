import type { ReactNode } from 'react';
import './page-panel.css';

export function PagePanel({ children }: { children: ReactNode }) {
  return (
    <main className="page-panel">
      <div className="page-panel__body">{children}</div>
    </main>
  );
}
