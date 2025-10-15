"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SplashScreen } from "@/components/SplashScreen";
import { Dashboard } from "@/components/dashboard/dashboard";

export default function Home() {
  const { session } = useAuth();
  const router = useRouter();
  const [isMinimumTimeElapsed, setIsMinimumTimeElapsed] = useState(false);

  // 1. Enforce minimum 3-second display time for the splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimumTimeElapsed(true);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  // 2. Determine if loading is complete
  // We consider loading complete only if the session check is done AND 3 seconds have passed.
  const isLoading = session === undefined || !isMinimumTimeElapsed;

  if (isLoading) {
    // Show the splash screen while waiting for session check AND minimum time
    return <SplashScreen />;
  }

  if (!session) {
    // If session is null and loading is complete, the AuthContext should handle the redirect to /login.
    // We return null here to prevent flickering, as the redirect is already in progress.
    return null;
  }

  // If authenticated, show the main dashboard layout
  return (
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <div className="flex flex-col flex-1">
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <Dashboard />
          </main>
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );
}