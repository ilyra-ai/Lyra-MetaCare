'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { db } from '@/integrations/mysql/client';
import { destinoObrigatorio } from '@/lib/auth/destino-de-acesso';
import { paginaSaindo } from '@/lib/navegador/saida-da-pagina';
import { AppSession } from '@/types/app-session';

type AuthContextType = {
  session: AppSession | null;
  db: typeof db;
  userRole: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let ativo = true;
    // Um login, cadastro ou saída que aconteça antes de a leitura inicial
    // terminar vale mais do que ela (que já estaria desatualizada).
    let recebeuEvento = false;

    const { data: authListener } = db.auth.onAuthStateChange(
      (_event, novaSessao) => {
        recebeuEvento = true;
        setSession(novaSessao);
        setLoading(false);
      }
    );

    db.auth
      .getSession()
      .then(({ data }) => {
        if (ativo && !recebeuEvento) {
          setSession(data.session);
        }
      })
      .catch((error: unknown) => {
        // Página saindo: o navegador cancelou a busca (não é falha).
        if (paginaSaindo()) return;
        // Sem resposta válida de /api/auth/session não há como confirmar a
        // sessão: o app segue como visitante em vez de ficar em branco.
        console.error('Falha ao consultar a sessão:', error);
        if (ativo && !recebeuEvento) {
          setSession(null);
        }
      })
      .finally(() => {
        if (ativo) {
          setLoading(false);
        }
      });

    return () => {
      ativo = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // A decisão é refeita a cada troca de rota, inclusive na navegação feita
  // só no cliente (links, `router.push` e o botão "voltar"): antes ela só
  // rodava quando a sessão mudava, e o "voltar" a partir do onboarding abria
  // o painel de uma conta que ainda não tinha concluído o cadastro.
  const destino = loading ? null : destinoObrigatorio(session, pathname);

  useEffect(() => {
    if (destino) {
      // `replace` para que o "voltar" não retorne à rota bloqueada.
      router.replace(destino);
    }
  }, [destino, router]);

  // Nada da rota bloqueada é montado (nem as consultas dela) enquanto o
  // redirecionamento acontece.
  const podeRenderizar = !loading && destino === null;

  return (
    <AuthContext.Provider
      value={{ session, db, userRole: session?.user.role ?? null }}
    >
      {podeRenderizar && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider.');
  }
  return context;
};
