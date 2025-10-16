"use client";

import { MadeWithIlyra } from "@/components/made-with-ilyra";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/context/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";
import { ChatAssistantContent } from "@/components/chat/ChatAssistantContent";
import { useState, useEffect } from "react";

export default function ChatPage() {
  const { session } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (session === undefined) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        
        <main className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatAssistantContent />
          </div>
        </main>
        
        <MadeWithIlyra />
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}