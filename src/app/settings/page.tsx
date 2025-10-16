"use client";

import { MadeWithIlyra } from "@/components/made-with-ilyra";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/context/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";
import { SettingsContent } from "@/components/settings/SettingsContent";

export default function SettingsPage() {
  const { session } = useAuth();

  if (session === undefined) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-8">Configurações e Relatórios</h1>
          <SettingsContent />
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}