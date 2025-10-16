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
import { LogOut } from "lucide-react";
import React from "react";

export function Header() {
  const { session, supabase } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  const fetchAvatar = React.useCallback(async () => {
    if (!session?.user) return;

    // Fetch avatar_url from the profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", session.user.id)
      .limit(1) // Adicionando limit(1) para garantir que a consulta seja eficiente
      .single();

    // O erro PGRST116 (No rows found) é esperado se o perfil não for encontrado,
    // mas como o AuthContext garante a criação, vamos focar em erros reais.
    // No entanto, o .single() pode retornar um erro se a linha for nula ou não existir.
    
    if (error) {
        // Se o erro for 'PGRST116' (No rows found), ignoramos, pois o perfil deve existir.
        // Se for outro erro, logamos.
        if (error.code !== 'PGRST116') {
            console.error("Error fetching avatar:", error);
        }
        setAvatarUrl(null); // Garante que o avatar seja nulo em caso de erro
    } else if (data) {
      setAvatarUrl(data.avatar_url);
    }
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
    <header className="flex items-center justify-end h-16 px-8 border-b bg-white dark:bg-gray-950 dark:border-gray-800">
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
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}