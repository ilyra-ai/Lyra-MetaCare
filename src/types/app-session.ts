export interface AppUser {
  id: string;
  email: string;
  role: string;
  // Lido do banco a cada sessão: o cliente decide o acesso ao app (e o
  // envio imediato ao onboarding) sem uma consulta extra ao perfil.
  onboarding_completed: boolean;
  user_metadata: {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
  };
}

export interface AppSession {
  user: AppUser;
}

export interface AppSessionResponse {
  session: AppSession | null;
}
