import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types';

export async function createServerSupabaseClient() {
  // Usando 'as any' para resolver o erro de tipagem do compilador que infere 'cookies()' como Promise.
  const cookieStore = cookies() as any;
  
  // Certifique-se de que as variáveis de ambiente estão disponíveis
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not set.");
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // O setAll foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver middleware atualizando a sessão.
          }
        },
      },
    }
  )
}