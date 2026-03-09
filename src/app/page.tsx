"use client";

import { MadeWithIlyra } from "@/components/made-with-ilyra";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SplashScreen } from "@/components/SplashScreen";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickScanFAB } from "@/components/dashboard/QuickScanFAB";

// Define a type for the user profile for better type safety
type UserProfile = {
  first_name: string | null;
  // Add other profile fields as needed
};

export default function Home() {
  const { session, supabase } = useAuth();
  const router = useRouter();
  const [isMinimumTimeElapsed, setIsMinimumTimeElapsed] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Minimum splash screen time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimumTimeElapsed(true);
    }, 1500); // Reduced time for better UX after first load
    return () => clearTimeout(timer);
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (session?.user) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", session.user.id);
          // Removed .single()

        if (error) {
          console.error("Error fetching profile:", error);
        } else if (profiles && profiles.length > 0) {
          setProfile(profiles[0]);
        }
        setProfileLoading(false);
      };
      fetchProfile();
    }
  }, [session, supabase]);

  const isLoading =
    session === undefined || !isMinimumTimeElapsed || (session && profileLoading);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!session) {
    // AuthContext handles redirect, return null to avoid flicker
    return null;
  }

  const firstName = profile?.first_name || "Usuário";

  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-indigo-950 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1 z-10">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <h1 className="text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 animate-pulse-slow">
            Olá, {firstName}!
          </h1>
          <Dashboard />
        </main>
        <MadeWithIlyra />
      </div>
      <QuickScanFAB />
    </div>
  );
}