import { describe, expect, it } from 'vitest';

import { SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { queryRows } from '@/lib/mysql/pool';

import { chamar, cookieJar, entrarComo } from '../../../tests/integration/http';

import * as trocaDeEmail from './account/email/route';
import * as login from './auth/login/route';
import * as register from './auth/register/route';

// IP próprio deste arquivo: o limite de cadastros por IP de outros testes não
// interfere aqui.
const ORIGEM = { 'x-forwarded-for': '203.0.113.36' };
const SENHA = 'Senha-Troca-2026';

async function cadastrar(email: string) {
  const resposta = await chamar(register.POST, {
    method: 'POST',
    body: { email, password: SENHA, firstName: 'Troca' },
    headers: ORIGEM,
    usuario: null,
  });
  expect(resposta.status).toBe(200);
  return (resposta.json as { session: { user: { id: string } } }).session.user
    .id;
}

async function emailsDaConta(id: string) {
  const linhas = await queryRows<{ conta: string; perfil: string }>(
    `SELECT u.email AS conta, p.email AS perfil
       FROM users u JOIN profiles p ON p.id = u.id
      WHERE u.id = ?`,
    [id]
  );
  return linhas[0];
}

describe('PATCH /api/account/email', () => {
  const sufixo = Date.now();
  const emailOutraConta = `outra-${sufixo}@teste.lyra.local`;
  const emailOriginal = `troca-${sufixo}@teste.lyra.local`;
  const emailNovo = `troca-nova-${sufixo}@teste.lyra.local`;

  it('exige sessão', async () => {
    const resposta = await chamar(trocaDeEmail.PATCH, {
      method: 'PATCH',
      body: { newEmail: emailNovo, currentPassword: SENHA },
      usuario: null,
    });
    expect(resposta.status).toBe(401);
  });

  it('valida, confirma a senha e recusa e-mail de outra conta', async () => {
    await cadastrar(emailOutraConta);
    const id = await cadastrar(emailOriginal); // a sessão fica nesta conta

    for (const body of [
      { newEmail: 'invalido', currentPassword: SENHA },
      { newEmail: emailNovo, currentPassword: '' },
      { newEmail: emailOriginal.toUpperCase(), currentPassword: SENHA },
    ]) {
      const resposta = await chamar(trocaDeEmail.PATCH, {
        method: 'PATCH',
        body,
      });
      expect(resposta.status).toBe(400);
    }

    const senhaErrada = await chamar(trocaDeEmail.PATCH, {
      method: 'PATCH',
      body: { newEmail: emailNovo, currentPassword: 'outra-senha-123' },
    });
    expect(senhaErrada.status).toBe(403);

    // Repetir o e-mail de outra conta (mesmo com maiúsculas) é recusado.
    const emUso = await chamar(trocaDeEmail.PATCH, {
      method: 'PATCH',
      body: {
        newEmail: ` ${emailOutraConta.toUpperCase()} `,
        currentPassword: SENHA,
      },
    });
    expect(emUso.status).toBe(409);
    expect(emUso.json).toEqual({
      error: 'Este e-mail já está em uso por outra conta.',
    });

    expect(await emailsDaConta(id)).toEqual({
      conta: emailOriginal,
      perfil: emailOriginal,
    });
  });

  it('troca o e-mail da conta e do perfil juntos e reemite a sessão', async () => {
    const linhas = await queryRows<{ id: string }>(
      'SELECT id FROM users WHERE email = ?',
      [emailOriginal]
    );
    const id = linhas[0].id;
    await entrarComo({
      id,
      email: emailOriginal,
      role: 'patient',
      session: {
        user: {
          id,
          email: emailOriginal,
          role: 'patient',
          onboarding_completed: false,
          user_metadata: {},
        },
      },
    });

    const resposta = await chamar(trocaDeEmail.PATCH, {
      method: 'PATCH',
      body: { newEmail: emailNovo.toUpperCase(), currentPassword: SENHA },
    });
    expect(resposta.status).toBe(200);
    expect(
      (resposta.json as { session: { user: { email: string } } }).session.user
        .email
    ).toBe(emailNovo);
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(true);
    expect(await emailsDaConta(id)).toEqual({
      conta: emailNovo,
      perfil: emailNovo,
    });

    // O login passa a valer só com o novo e-mail.
    const antigo = await chamar(login.POST, {
      method: 'POST',
      body: { email: emailOriginal, password: SENHA },
      headers: ORIGEM,
      usuario: null,
    });
    expect(antigo.status).toBe(401);
    const novo = await chamar(login.POST, {
      method: 'POST',
      body: { email: emailNovo, password: SENHA },
      headers: ORIGEM,
      usuario: null,
    });
    expect(novo.status).toBe(200);

    // O e-mail antigo fica livre para um novo cadastro.
    await cadastrar(emailOriginal);
  });
});
