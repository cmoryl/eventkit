import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: isSupabaseConfigured,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthState({ user: null, session: null, isLoading: false });
      return;
    }

    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
        });
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    }).catch((error) => {
      console.warn('Unable to read Supabase session:', error);
      setAuthState({ user: null, session: null, isLoading: false });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.user,
    isSupabaseConfigured,
  };
};
