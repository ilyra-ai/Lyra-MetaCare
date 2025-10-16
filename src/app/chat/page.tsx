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
      {/* Sidebar */}
      <div className={`transition-all duration-500 ease-out ${isLoaded ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className={`transition-all duration-500 delay-75 ease-out ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}>
          <Header />
        </div>

        {/* Main Chat Container */}
        <main className={`flex-1 flex flex-col min-h-0 transition-all duration-500 delay-150 ease-out ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          {/* Content Wrapper with Max Width */}
          <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
            
            {/* Minimal Title */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
                Assistente de IA
              </h1>
            </div>

            {/* Clean Chat Interface */}
            <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
              <ChatAssistantContent />
            </div>

          </div>
        </main>

        {/* Footer */}
        <div className="border-t border-gray-100">
          <MadeWithIlyra />
        </div>
      </div>

      {/* Minimal Custom Styles */}
      <style jsx global>{`
        /* Smooth scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }

        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}