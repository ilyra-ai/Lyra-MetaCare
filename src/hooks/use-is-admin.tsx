"use client";

import { useAuth } from "@/context/AuthContext";

const ADMIN_EMAIL = "douglas@ilyra.com.br";

export function useIsAdmin() {
  const { session } = useAuth();
  
  if (!session) {
    return false;
  }

  return session.user.email === ADMIN_EMAIL;
}