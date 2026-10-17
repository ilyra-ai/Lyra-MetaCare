'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

    // A leitura da sessão não lança (tarefa 58): uma falha volta em `error`.
    // Com falha, tenta de novo duas vezes (1 s e 3 s) antes de seguir como
    // visitante, avisando a pessoa: antes, um único erro do servidor fazia
    // quem estava logado ver a landing sem explicação.
    const esperas = [1000, 3000];
    const lerSessao = async (tentativa: number): Promise<void> => {
      const { data, error } = await db.auth.getSession();
      if (!ativo || recebeuEvento) return;
      if (!error) {
        setSession(data.session);
        return;
      }
      // Página saindo: o navegador cancelou a busca (não é falha).
      if (error.motivo === 'cancelada' || paginaSaindo()) return;
      if (tentativa < esperas.length) {
        await new Promise((fim) => setTimeout(fim, esperas[tentativa]));
        return lerSessao(tentativa + 1);
      }
      console.error('Falha ao consultar a sessão:', error.message);
      toast.warning('Não foi possível confirmar a sua sessão.', {
        description: `${error.message} Recarregue a página para tentar de novo.`,
      });
      setSession(null);
    };
    void lerSessao(0).finally(() => {
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
