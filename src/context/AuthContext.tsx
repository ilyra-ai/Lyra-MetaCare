"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";

type AuthContextType = {
  session: Session | null;
  supabase: SupabaseClient;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Função de fallback para criar o perfil se o trigger falhar ou não tiver rodado
  const ensureProfileExists = async (currentSession: Session) => {
    const { data: profiles, error: fetchError } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", currentSession.user.id);

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching profile:", fetchError);
        return null;
    }
    
    const profile = profiles?.[0];

    if (!profile) {
        console.warn("Profile not found. Attempting client-side creation fallback.");
        
        // Tenta extrair nome/sobrenome do metadata (útil para OAuth)
        const metadata = currentSession.user.user_metadata;
        const firstName = metadata?.first_name || (metadata?.full_name?.split(' ')[0] || null);
        const lastName = metadata?.last_name || (metadata?.full_name?.split(' ').slice(1).join(' ') || null);

        const { error: insertError } = await supabase
            .from("profiles")
            .insert({
                id: currentSession.user.id,
                first_name: firstName,
                last_name: lastName,
                onboarding_completed: false,
            });

        if (insertError) {
            console.error("Client-side profile creation failed:", insertError);
            // Se a inserção falhar (ex: RLS bloqueando, ou perfil já existe mas não foi buscado), 
            // ainda assim retornamos um objeto para evitar loop de redirecionamento.
            return { onboarding_completed: false };
        }
        
        // Se a inserção for bem-sucedida, retornamos o novo perfil
        return { onboarding_completed: false };
    }

    return profile;
  }


  const handleRedirects = async (currentSession: Session | null) => {
    if (!currentSession) {
      if (window.location.pathname !== "/login") {
        router.push("/login");
      }
      return;
    }

    // 1. Garantir que o perfil exista (fallback) e buscar o status de onboarding
    const profile = await ensureProfileExists(currentSession);

    const isOnboardingPage = window.location.pathname === "/onboarding";
    const isLoginPage = window.location.pathname === "/login";

    if (!profile || !profile.onboarding_completed) {
      if (!isOnboardingPage) {
        router.push("/onboarding");
      }
    } else if (profile && profile.onboarding_completed) {
      if (isLoginPage || isOnboardingPage) {
        router.push("/");
      }
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      // Initial check after loading session
      if (session) {
        handleRedirects(session);
      } else {
        if (window.location.pathname !== "/login") {
          router.push("/login");
        }
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        handleRedirects(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <AuthContext.Provider value={{ session, supabase }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};