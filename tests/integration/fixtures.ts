import { randomUUID } from 'node:crypto';

import { executeStatement, queryRows } from '@/lib/mysql/pool';
import type { AppSession } from '@/types/app-session';

export interface UsuarioDeTeste {
  id: string;
  email: string;
  role: string;
  session: AppSession;
}

/**
 * Cria uma conta real (users + profiles) no banco de teste e devolve a sessão
 * equivalente à que o login emitiria. O hash não corresponde a nenhuma senha:
 * os testes de integração usam a sessão diretamente.
 */
export async function criarUsuario(
  role: 'patient' | 'admin' = 'patient',
  nome = 'Pessoa'
): Promise<UsuarioDeTeste> {
  const id = randomUUID();
  const email = `${role}-${id.slice(0, 8)}@teste.lyra.local`;
  await executeStatement(
    'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
    [id, email, '$2b$12$hashinvalidohashinvalidohashinvalidohashinvalidoxxxx']
  );
  await executeStatement(
    `INSERT INTO profiles (id, first_name, last_name, email, onboarding_completed, role)
     VALUES (?, ?, 'Teste', ?, TRUE, ?)`,
    [id, nome, email, role]
  );
  return {
    id,
    email,
    role,
    session: {
      access_token: 'token-de-teste',
      user: {
        id,
        email,
        role,
        user_metadata: {
          first_name: nome,
          last_name: 'Teste',
          full_name: `${nome} Teste`,
        },
      },
    },
  };
}

export async function contar(
  sql: string,
  params: readonly unknown[] = []
): Promise<number> {
  const linhas = await queryRows<{ total: number }>(sql, params);
  return Number(linhas[0]?.total ?? 0);
}
