export interface AppUser {
  id: string;
  email: string;
  role: string;
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
