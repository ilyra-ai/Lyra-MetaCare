import { verifyPassword } from '@/lib/auth/password';
import { HttpError } from '@/lib/http-error';
import { queryRows } from '@/lib/mysql/pool';
import {
  LIMITE_LOGIN_POR_CONTA,
  exigirLimiteDisponivel,
  registrarOcorrencia,
  zerarLimite,
} from '@/lib/security/rate-limit';

/**
 * Confirma a senha atual antes de uma ação sensível da conta (trocar o
 * e-mail de login, excluir a conta). Uma sessão aberta num computador
 * emprestado não basta para essas ações. As falhas contam no mesmo limite de
 * tentativas do login da conta, então não servem para adivinhar a senha.
 */
export async function confirmarSenhaAtual(options: {
  userId: string;
  email: string;
  senha: string;
}) {
  await exigirLimiteDisponivel(LIMITE_LOGIN_POR_CONTA, options.email);

  const contas = await queryRows<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE id = ? LIMIT 1',
    [options.userId]
  );
  const hash = contas[0]?.password_hash;
  if (!hash) {
    throw new HttpError('Conta não encontrada.', 404);
  }
  if (!(await verifyPassword(options.senha, hash))) {
    await registrarOcorrencia(LIMITE_LOGIN_POR_CONTA, options.email);
    throw new HttpError('Senha atual incorreta.', 403);
  }
  await zerarLimite(LIMITE_LOGIN_POR_CONTA, options.email);
}
