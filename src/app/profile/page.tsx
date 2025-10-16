"use client";

import { MadeWithIlyra } from "@/components/made-with-ilyra";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useAuth } from "@/context/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";

export default function ProfilePage() {
  const { session } = useAuth();

  // Use SplashScreen while session is loading
  if (session === undefined) {
    return <SplashScreen />;
  }

  // AuthContext handles redirect if not logged in, so we just render the layout
  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-8">Seu Perfil</h1>
          <ProfileForm />
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}