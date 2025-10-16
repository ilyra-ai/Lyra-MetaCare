"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import React from "react";
import { MobileSidebar } from "./MobileSidebar";

export function Header() {
  const { session, supabase } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  const fetchAvatar = React.useCallback(async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      setAvatarUrl(null);
      return;
    }

    setAvatarUrl(data?.avatar_url || null);
    }, [session, supabase]);

    React.useEffect(() => {
      fetchAvatar();
    }, [fetchAvatar]);


  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!session) return null;

  const userEmail = session.user.email || "";
  const initial = userEmail.charAt(0).toUpperCase();

  return (
    <header className="flex items-center h-16 px-4 md:px-8 border-b bg-white dark:bg-gray-950 dark:border-gray-800">
      <MobileSidebar />
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl || undefined} alt={userEmail} />
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Signed in as</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}