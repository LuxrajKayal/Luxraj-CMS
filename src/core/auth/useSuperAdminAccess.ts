import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type Decision = 'allowed' | 'denied' | 'unavailable';
type AccessCheck = {
  userId: string;
  accessToken: string;
  decision: Decision;
};

export function useSuperAdminAccess(session: Session | null) {
  const userId = session?.user.id;
  const accessToken = session?.access_token;
  const [check, setCheck] = useState<AccessCheck | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client || !userId || !accessToken) return;
    const controller = new AbortController();

    const checkAccess = async () => {
      let decision: Decision = 'unavailable';
      try {
        const { data, error } = await client
          .from('cms_user_roles')
          .select('role')
          .eq('user_id', userId)
          .abortSignal(controller.signal)
          .maybeSingle();

        if (!error) decision = data?.role === 'super_admin' ? 'allowed' : 'denied';
      } catch {
        // Keep database errors and credentials out of the UI.
      }
      if (!controller.signal.aborted) {
        setCheck({ userId, accessToken, decision });
      }
    };

    void checkAccess();
    return () => controller.abort();
  }, [userId, accessToken]);

  if (!supabase) return 'unavailable';
  if (check && check.userId === userId && check.accessToken === accessToken) {
    return check.decision;
  }
  return 'checking';
}
