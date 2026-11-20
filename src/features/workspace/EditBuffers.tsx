import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../../core/auth/AuthProvider';

export type EditBuffer = { source: string; commit: string; revision: string | null };
type Buffers = Record<string, EditBuffer>;
const Context = createContext<{
  buffers: Buffers;
  put(key: string, buffer: EditBuffer): void;
  remove(key: string, expected?: EditBuffer): void;
} | null>(null);

function SessionBuffers({ children }: { children: ReactNode }) {
  const [buffers, setBuffers] = useState<Buffers>({});
  const dirty = Object.keys(buffers).length > 0;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  return <Context.Provider value={{
    buffers,
    put: (key, buffer) => setBuffers(current => ({ ...current, [key]: buffer })),
    remove: (key, expected) => setBuffers(current => {
      if (!current[key] || (expected && current[key] !== expected)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    }),
  }}>{children}</Context.Provider>;
}

export function EditBuffers({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  return <SessionBuffers key={session?.user.id ?? 'signed-out'}>{children}</SessionBuffers>;
}

export function useEditBuffers() {
  const buffers = useContext(Context);
  if (!buffers) throw new Error('Edit buffers are unavailable.');
  return buffers;
}
