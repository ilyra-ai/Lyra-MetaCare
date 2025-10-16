"use client";

import { MadeWithIlyra } from "@/components/made-with-ilyra";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/context/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";
import { ChatAssistantContent } from "@/components/chat/ChatAssistantContent";
import { useState, useEffect } from "react";
import { Sparkles, Zap, Bot } from "lucide-react";

export default function ChatPage() {
  const { session } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlow, setCursorGlow] = useState({ x: 0, y: 0, active: false });

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setCursorGlow({ x: e.clientX, y: e.clientY, active: true });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (session === undefined) {
    return <SplashScreen />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 font-[family-name:var(--font-geist-sans)]">
      {/* Animated Background Effects - Trending 2025 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Organic Floating Shapes */}
        <div 
          className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"
          style={{
            animation: "float 20s ease-in-out infinite",
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"
          style={{
            animation: "float 25s ease-in-out infinite reverse",
            transform: `translate(${-mousePosition.x * 0.015}px, ${-mousePosition.y * 0.015}px)`
          }}
        />
        
        {/* Dynamic Cursor Glow Effect */}
        {cursorGlow.active && (
          <div
            className="absolute w-64 h-64 rounded-full pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: cursorGlow.x - 128,
              top: cursorGlow.y - 128,
              background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
              filter: "blur(40px)"
            }}
          />
        )}

        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px"
          }}
        />
      </div>

      {/* Sidebar with Enhanced Glassmorphism */}
      <div className={`relative z-10 transition-all duration-700 ease-out ${isLoaded ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className={`relative z-10 flex flex-col flex-1 transition-all duration-700 delay-100 ease-out ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
        {/* Header with Micro-interactions */}
        <div className="relative backdrop-blur-sm bg-white/40 border-b border-white/20 shadow-sm">
          <Header />
        </div>

        {/* Main Chat Area with Advanced Layout */}
        <main className="flex-1 flex flex-col min-h-0 p-4 sm:p-6 md:p-8 relative">
          {/* Hero Title Section with Kinetic Typography */}
          <div className="mb-6 space-y-2 group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-105 transform origin-left">
                Assistente de IA
              </h1>
              
              {/* Animated Sparkle Icons */}
              <div className="flex gap-1 ml-2">
                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" style={{ animationDelay: "0s" }} />
                <Zap className="w-5 h-5 text-blue-500 animate-pulse" style={{ animationDelay: "0.3s" }} />
                <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" style={{ animationDelay: "0.6s" }} />
              </div>
            </div>
            
            {/* Subtle Tagline with Fade-in Animation */}
            <p className="text-sm text-gray-600 ml-16 transition-all duration-500 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
              Experiência de próxima geração com IA avançada
            </p>
          </div>

          {/* Chat Content with Enhanced Card Design */}
          <div className="flex-1 relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl transition-all duration-500 hover:shadow-purple-200/50 hover:bg-white/70">
            {/* Subtle Inner Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            
            {/* Content Container */}
            <div className="relative h-full p-4 sm:p-6">
              <ChatAssistantContent />
            </div>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
          </div>

          {/* Floating Action Hints - Micro-interactions */}
          <div className="absolute bottom-8 right-8 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </main>

        {/* Footer with Enhanced Design */}
        <div className="relative backdrop-blur-sm bg-white/40 border-t border-white/20">
          <MadeWithIlyra />
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        /* Smooth scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #8b5cf6);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5, #7c3aed);
        }

        /* Enhanced focus states */
        *:focus-visible {
          outline: 2px solid rgba(99, 102, 241, 0.5);
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Smooth transitions for all interactive elements */
        button, a, input, textarea {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        button:active {
          transform: scale(0.98);
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Dark mode support for future implementation */
        @media (prefers-color-scheme: dark) {
          .bg-gray-50 {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          }
        }
      `}</style>
    </div>
  );
}