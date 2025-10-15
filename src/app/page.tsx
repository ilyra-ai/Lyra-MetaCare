"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SplashScreen } from "@/components/SplashScreen";

export default function Home() {
  const { session } = useAuth();
  const router = useRouter();

  // The AuthProvider handles the initial loading state and redirects.
  // We rely on the AuthProvider's internal loading state (which is hidden 
  // by the AuthProvider itself) and the session status here.

  // If session is null, the AuthProvider is either loading or redirecting to /login.
  // We show the splash screen until the session is definitively established or the redirect happens.
  
  // Note: Since AuthProvider handles the redirect, if session is null, we assume 
  // the redirect to /login is imminent or already happening. We show the splash screen 
  // to cover the transition.

  if (session === undefined) {
    // This state shouldn't happen if AuthProvider is working correctly, 
    // but we keep the loading state safe.
    return <SplashScreen />;
  }

  if (!session) {
    // If session is null, the AuthContext useEffect should have already triggered 
    // the router.push("/login"). We display the splash screen during this brief moment.
    return <SplashScreen />;
  }

  // If authenticated, show the main dashboard layout
  return (
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <div className="flex flex-col flex-1">
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {session.user.email}. This is your personalized health dashboard.
            </p>
            {/* Dashboard content will go here */}
          </main>
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );
}