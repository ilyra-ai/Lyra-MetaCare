"use client";

import { useAuth } from "@/context/AuthContext";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const { session, supabase } = useAuth();
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (session) {
    return null;
  }

  // Determine the theme for Supabase Auth UI based on the resolved theme
  const authTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full p-8 space-y-8 bg-white dark:bg-gray-950 rounded-xl shadow-2xl border border-gray-100/50 dark:border-gray-800 transition-all duration-500">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Acesse sua Jornada
        </h2>
        {/* Logo Placeholder */}
        <div className="flex justify-center mb-6">
            <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google", "apple"]} // Habilitando provedores OAuth
          theme={authTheme}
          // Configurações para exibir apenas o login/registro
          view="sign_in" 
          // Removendo o logo padrão do Supabase para manter o minimalismo
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Senha',
                button_label: 'Entrar',
                social_provider_text: 'Ou continue com',
                link_text: 'Já tem uma conta? Entrar',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Crie uma senha',
                button_label: 'Registrar',
                social_provider_text: 'Ou continue com',
                link_text: 'Não tem uma conta? Registrar',
              },
              forgotten_password: {
                link_text: 'Esqueceu sua senha?',
              }
            }
          }}
        />
      </div>
    </div>
  );
}