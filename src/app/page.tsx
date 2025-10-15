"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SplashScreen } from "@/components/SplashScreen";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

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
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setProfile(data);
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

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {profile ? (
            <h1 className="text-3xl font-bold mb-8">
              Olá, {profile.first_name}!
            </h1>
          ) : (
            <Skeleton className="h-9 w-48 mb-8" />
          )}
          <Dashboard />
        </main>
        <MadeWithDyad />
      </div>
    </div>
  );
}