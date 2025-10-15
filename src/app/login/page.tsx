"use client";

import { useAuth } from "@/context/AuthContext";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { session, supabase } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-green-50 p-4">
      <div className="max-w-md w-full p-8 space-y-8 bg-white rounded-xl shadow-2xl border border-gray-100/50 transition-all duration-500">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Acesse sua Jornada
        </h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
          // Customização para alinhar com o design minimalista e calmo
          // O ThemeSupa já é bem limpo, mas garantimos que o container se encaixe.
        />
      </div>
    </div>
  );
}