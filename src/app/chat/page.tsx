"use client";

import { MadeWithIlyra } from "@/components/made-with-ilyra";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/context/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";
import { ChatAssistantContent } from "@/components/chat/ChatAssistantContent";

export default function ChatPage() {
  const { session } = useAuth();

  if (session === undefined) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 animate-in fade-in duration-500">
         
          </div>
        </main>

      </div>
    </div>
  );
}