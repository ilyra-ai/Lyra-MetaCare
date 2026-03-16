'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { db } from '@/integrations/mysql/client';
import { useRouter } from 'next/navigation';
import { AppSession } from '@/types/app-session';

type AuthContextType = {
  session: AppSession | null;
  db: typeof db;
  userRole: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AppSession | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Função de fallback para criar o perfil se o trigger falhar ou não tiver rodado
  const ensureProfileExists = useCallback(
    async (currentSession: AppSession) => {
      const { data: profiles, error: fetchError } = await db
        .from('profiles')
        .select('onboarding_completed, role')
        .eq('id', currentSession.user.id);

      if (fetchError) {
        console.error('Erro ao consultar perfil do usuário:', fetchError);
        return null;
      }

      const profile = profiles?.[0];

      if (!profile) {
        console.warn(
          'Perfil ausente. Iniciando recuperação consistente no banco MySQL.'
        );

        const metadata = currentSession.user.user_metadata;
        const firstName =
          metadata?.first_name || metadata?.full_name?.split(' ')[0] || null;
        const lastName =
          metadata?.last_name ||
          metadata?.full_name?.split(' ').slice(1).join(' ') ||
          null;

        const { error: insertError } = await db.from('profiles').insert({
          id: currentSession.user.id,
          email: currentSession.user.email,
          first_name: firstName,
          last_name: lastName,
          onboarding_completed: false,
          role: currentSession.user.role || 'patient',
        });

        if (insertError) {
          console.error('Falha ao recriar perfil no banco MySQL:', insertError);
          return null;
        }

        return {
          onboarding_completed: false,
          role: currentSession.user.role || 'patient',
        };
      }

      return profile;
    },
    []
  );

  const handleRedirects = useCallback(
    async (currentSession: AppSession | null) => {
      if (!currentSession) {
        setUserRole(null);
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/'
        ) {
          router.push('/login');
        }
        return;
      }

      // Usa a role já assinada na sessão para evitar estados transitórios
      // em que páginas administrativas renderizam "Acesso Negado" antes de
      // a leitura do perfil terminar.
      setUserRole(currentSession.user.role || null);

      // 1. Garantir que o perfil exista e buscar o status real de onboarding
      const profile = await ensureProfileExists(currentSession);
      setUserRole(profile?.role || null);

      const isOnboardingPage = window.location.pathname === '/onboarding';
      const isLoginPage = window.location.pathname === '/login';

      if (!profile || !profile.onboarding_completed) {
        if (!isOnboardingPage) {
          router.push('/onboarding');
        }
      } else if (profile && profile.onboarding_completed) {
        if (isLoginPage || isOnboardingPage) {
          router.push('/');
        }
      }
    },
    [ensureProfileExists, router]
  );

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await db.auth.getSession();
      setSession(session);
      setUserRole(session?.user.role || null);
      setLoading(false);

      if (session) {
        handleRedirects(session);
      } else {
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/'
        ) {
          router.push('/login');
        }
      }
    };

    getInitialSession();

    const { data: authListener } = db.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        handleRedirects(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [handleRedirects, router]);

  return (
    <AuthContext.Provider value={{ session, db, userRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
