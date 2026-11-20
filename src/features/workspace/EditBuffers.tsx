import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../../core/auth/AuthProvider';

export type EditBuffer = { source: string; commit: string; revision: string | null };
export type EditorPosition = {
  selection: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number };
  scrollTop: number; scrollLeft: number;
};
export type WorkspaceView = {
  file: string[] | null;
  diff: string | null;
  historyDiff: { sha: string; path: string } | null;
  tab: 'changes' | 'history';
  showFiles: boolean; showChanges: boolean; focus: boolean;
};
type Snapshot = {
  buffers: Record<string, EditBuffer>;
  views: Record<string, WorkspaceView>;
  positions: Record<string, EditorPosition>;
  editing: Record<string, boolean>;
};
const prefix = 'luxraj-cms-editor-session-v1:';
const empty = (): Snapshot => ({ buffers: {}, views: {}, positions: {}, editing: {} });
const storageKey = (userId: string) => prefix + userId;

export function readEditorRecovery(userId: string): Snapshot {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(storageKey(userId)) || 'null');
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const object = (field: string) => value[field] && typeof value[field] === 'object' &&
        !Array.isArray(value[field]) ? value[field] : {};
      return { buffers: object('buffers'), views: object('views'),
        positions: object('positions'), editing: object('editing') };
    }
  } catch {
    // Session storage might be unavailable or a previous snapshot corrupted.
  }
  return empty();
}

const Context = createContext<{
  buffers: Snapshot['buffers'];
  put(key: string, buffer: EditBuffer): void;
  remove(key: string, expected?: EditBuffer): void;
  views: Snapshot['views'];
  putView(key: string, view: WorkspaceView): void;
  positions: Snapshot['positions'];
  putPosition(key: string, position: EditorPosition): void;
  editing: Snapshot['editing'];
  setEditing(key: string, enabled: boolean): void;
  recoveryError: boolean;
} | null>(null);

function SessionBuffers({ userId, children }: { userId: string | null; children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => userId ? readEditorRecovery(userId) : empty());
  const [recoveryError, setRecoveryError] = useState(false);
  const latest = useRef(snapshot);
  latest.current = snapshot;
  const dirty = Object.keys(snapshot.buffers).length > 0;
  const flush = useCallback(() => {
    if (!userId) return;
    try {
      window.sessionStorage.setItem(storageKey(userId), JSON.stringify(latest.current));
      setRecoveryError(false);
    } catch {
      setRecoveryError(true);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const timeout = window.setTimeout(flush, 250);
    return () => window.clearTimeout(timeout);
  }, [userId, snapshot, flush]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      flush();
      if (Object.keys(latest.current.buffers).length) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [flush]);

  const put = useCallback((key: string, buffer: EditBuffer) => {
    setSnapshot(current => ({ ...current, buffers: { ...current.buffers, [key]: buffer } }));
  }, []);
  const remove = useCallback((key: string, expected?: EditBuffer) => {
    setSnapshot(current => {
      if (!current.buffers[key] || (expected && current.buffers[key] !== expected)) return current;
      const buffers = { ...current.buffers };
      delete buffers[key];
      return { ...current, buffers };
    });
  }, []);
  const putView = useCallback((key: string, view: WorkspaceView) => {
    setSnapshot(current => ({ ...current, views: { ...current.views, [key]: view } }));
  }, []);
  const putPosition = useCallback((key: string, position: EditorPosition) => {
    setSnapshot(current => ({ ...current, positions: { ...current.positions, [key]: position } }));
  }, []);
  const setEditing = useCallback((key: string, enabled: boolean) => {
    setSnapshot(current => ({ ...current, editing: { ...current.editing, [key]: enabled } }));
  }, []);

  return <Context.Provider value={{
    buffers: snapshot.buffers, put, remove, views: snapshot.views, putView,
    positions: snapshot.positions, putPosition, editing: snapshot.editing, setEditing, recoveryError,
  }}>{children}</Context.Provider>;
}

export function EditBuffers({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const previousUser = useRef<string | null>(userId);
  useEffect(() => {
    if (previousUser.current && previousUser.current !== userId) {
      try { window.sessionStorage.removeItem(storageKey(previousUser.current)); } catch { /* unavailable */ }
    }
    previousUser.current = userId;
  }, [userId]);
  return <SessionBuffers key={userId ?? 'signed-out'} userId={userId}>{children}</SessionBuffers>;
}

export function useEditBuffers() {
  const buffers = useContext(Context);
  if (!buffers) throw new Error('Edit buffers are unavailable.');
  return buffers;
}
