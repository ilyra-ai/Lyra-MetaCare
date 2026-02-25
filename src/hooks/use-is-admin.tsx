"use client";

import { useAuth } from "@/context/AuthContext";

/**
 * Hook para verificar se o usuário atual possui a role de administrador.
 * Agora utiliza o sistema de roles baseado no banco de dados, eliminando
 * a necessidade de e-mails hardcoded no código fonte.
 */
export function useIsAdmin() {
  const { userRole } = useAuth();
  
  return userRole === 'admin';
}
