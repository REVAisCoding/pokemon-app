import { type Session, type User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const SUPABASE_NOT_CONFIGURED_MESSAGE =
  'Supabase não configurado. Crie o arquivo .env com EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error: string | null }>;
  updateDisplayName: (displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

export function getUserDisplayName(user: User | null): string {
  if (!user) {
    return 'Colecionador';
  }

  const name = user.user_metadata?.display_name;

  if (typeof name === 'string' && name.trim()) {
    return name.trim();
  }

  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'Colecionador';
}

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }

  if (message.includes('User already registered')) {
    return 'Este e-mail já está cadastrado.';
  }

  if (message.includes('Password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }

  return message;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setIsLoading(false);
        }

        return;
      }

      try {
        const { data } = await getSupabase().auth.getSession();

        if (isMounted) {
          setSession(data.session);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSession();

    if (!isSupabaseConfigured) {
      return () => {
        isMounted = false;
      };
    }

    const { data: authListener } = getSupabase().auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: SUPABASE_NOT_CONFIGURED_MESSAGE };
    }

    const { error } = await getSupabase().auth.signInWithPassword({ email, password });

    return { error: error ? mapAuthError(error.message) : null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (!isSupabaseConfigured) {
      return { error: SUPABASE_NOT_CONFIGURED_MESSAGE };
    }

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      return { error: 'Informe um nome de usuário.' };
    }

    const { error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: { display_name: trimmedName },
      },
    });

    return { error: error ? mapAuthError(error.message) : null };
  }, []);

  const updateDisplayName = useCallback(async (displayName: string) => {
    if (!isSupabaseConfigured) {
      return { error: SUPABASE_NOT_CONFIGURED_MESSAGE };
    }

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      return { error: 'Informe um nome de usuário.' };
    }

    const { error } = await getSupabase().auth.updateUser({
      data: { display_name: trimmedName },
    });

    return { error: error ? mapAuthError(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    await getSupabase().auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      signIn,
      signUp,
      updateDisplayName,
      signOut,
    }),
    [session, isLoading, signIn, signUp, updateDisplayName, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
