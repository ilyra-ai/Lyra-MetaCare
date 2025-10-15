"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/context/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";
import { AIPlanContent } from "@/components/ai-plan/AIPlanContent";

export default function AIPlanPage() {
  const { session } = useAuth();

  // Use SplashScreen while session is loading
  if (session === undefined) {
    return <SplashScreen />;
  }

  // AuthContext handles redirect if not logged in
  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-8">Seu Plano de IA</h1>
          <AIPlanContent />
        </main>
        <MadeWithDyad />
      </div>
    </div>
  );
}