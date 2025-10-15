"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { session, supabase } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[1fr_auto] min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center gap-8">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Welcome, {session.user.email}
          </h1>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
        <p>This is your personalized health dashboard. More features coming soon!</p>
      </main>
      <MadeWithDyad />
    </div>
  );
}