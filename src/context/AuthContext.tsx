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

    const handleRedirects = async (currentSession: Session | null) => {
      if (!currentSession) {
        if (window.location.pathname !== "/login") {
          router.push("/login");
        }
        return;
      }

      // User is logged in, check if onboarding is complete
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", currentSession.user.id);
        // Removed .single() to avoid 406 errors

      if (error) {
        console.error("Error fetching profile for redirect:", error);
        return;
      }
      
      const profile = profiles?.[0]; // Get the first profile if it exists

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