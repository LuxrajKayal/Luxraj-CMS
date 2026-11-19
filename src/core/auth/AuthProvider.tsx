import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthState = {
  session: Session | null;
  loading: boolean;
  message: string;
};

type AuthContextValue = AuthState & {
  configured: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const sessionMessage = 'Your session ended or could not be restored. Please sign in again.';
const configMessage = 'Sign-in is unavailable. Configure the Supabase URL and publishable key, then restart the app.';

function usable(session: Session | null) {
  return session && !session.user.is_anonymous &&
    (session.expires_at ?? 0) * 1000 > Date.now() ? session : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: Boolean(supabase),
    message: supabase ? '' : configMessage,
  });

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;
    let revision = 0;
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      // Initialization below verifies a stored session with the Auth server.
      if (event === 'INITIAL_SESSION') return;
      revision += 1;
      if (active) {
        setState({
          session: usable(session),
          loading: false,
          message: usable(session) ? '' : sessionMessage,
        });
      }
    });
    const initialRevision = revision;

    async function restore() {
      try {
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        let session = usable(data.session);
        if (session) {
          const result = await client.auth.getUser();
          if (result.error || result.data.user?.id !== session.user.id) session = null;
        }
        if (active && revision === initialRevision) {
          session = usable(session);
          setState({
            session,
            loading: false,
            message: data.session && !session ? sessionMessage : '',
          });
        }
      } catch {
        if (active && revision === initialRevision) {
          setState({ session: null, loading: false, message: sessionMessage });
        }
      }
    }
    void restore();
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!state.session) return;
    const timer = window.setTimeout(() => {
      setState({ session: null, loading: false, message: sessionMessage });
    }, Math.max(0, (state.session.expires_at ?? 0) * 1000 - Date.now()));
    return () => window.clearTimeout(timer);
  }, [state.session]);

  async function signIn(email: string, password: string) {
    if (!supabase) return false;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      const session = usable(data.session);
      if (error || !session) {
        setState({ session: null, loading: false, message: 'Sign-in failed. Check your email and password, then try again.' });
        return false;
      }
      setState({ session, loading: false, message: '' });
      return true;
    } catch {
      setState({ session: null, loading: false, message: 'Unable to reach sign-in. Check your connection and try again.' });
      return false;
    }
  }

  async function signOut() {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      setState({ session: null, loading: false, message: '' });
    } catch {
      setState(current => ({ ...current, message: 'Sign-out failed. Check your connection and try again.' }));
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, configured: Boolean(supabase), signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('Authentication provider is missing.');
  return auth;
}
