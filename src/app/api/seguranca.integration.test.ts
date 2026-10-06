import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { executeStatement, queryRows } from '@/lib/mysql/pool';
import {
  LIMITE_CADASTRO_POR_IP,
  LIMITE_LOGIN_POR_CONTA,
  LIMITE_LOGIN_POR_IP,
  registrarOcorrencia,
} from '@/lib/security/rate-limit';

import { criarUsuario } from '../../../tests/integration/fixtures';
import { chamar, entrarComo } from '../../../tests/integration/http';

import * as adminUsuarios from './admin/users/route';
import * as login from './auth/login/route';
import * as register from './auth/register/route';
import * as sessao from './auth/session/route';

// Cada teste usa o próprio IP (X-Forwarded-For) para não dividir janelas.
function ipNovo() {
  const n = () => Math.floor(Math.random() * 250) + 1;
  return `10.${n()}.${n()}.${n()}`;
}

async function cadastrar(email: string, senha: string, ip = ipNovo()) {
  return chamar(register.POST, {
    method: 'POST',
    body: { email, password: senha },
    headers: { 'x-forwarded-for': ip },
    usuario: null,
  });
}

async function entrar(email: string, senha: string, ip: string) {
  return chamar(login.POST, {
    method: 'POST',
    body: { email, password: senha },
    headers: { 'x-forwarded-for': ip },
    usuario: null,
  });
}

describe('limite de tentativas de login', () => {
  it('bloqueia a conta após 10 falhas, inclusive para a senha certa, e informa Retry-After', async () => {
    const email = `forca-bruta-${randomUUID().slice(0, 8)}@teste.lyra.local`;
    const senha = 'Senha-Forte-2026';
    expect((await cadastrar(email, senha)).status).toBe(200);

    // Falhas vindas de IPs diferentes: o limite por conta não depende do IP.
    for (
      let tentativa = 0;
      tentativa < LIMITE_LOGIN_POR_CONTA.limite;
      tentativa++
    ) {
      const resposta = await entrar(email, 'senha-errada', ipNovo());
      expect(resposta.status).toBe(401);
    }

    const bloqueada = await entrar(email, senha, ipNovo());
    expect(bloqueada.status).toBe(429);
    expect(bloqueada.json).toEqual({
      error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    });
    const retryAfter = Number(bloqueada.headers.get('retry-after'));
    expect(retryAfter).toBeGreaterThan(14 * 60);
    expect(retryAfter).toBeLessThanOrEqual(15 * 60);

    // A chave gravada é um hash: o e-mail não aparece na tabela.
    const linhas = await queryRows<{ bucket_key: string }>(
      'SELECT bucket_key FROM rate_limit_buckets'
    );
    expect(
      linhas.every((linha) => /^[0-9a-f]{64}$/.test(linha.bucket_key))
    ).toBe(true);
  });

  it('login correto zera as falhas da conta', async () => {
    const email = `zera-${randomUUID().slice(0, 8)}@teste.lyra.local`;
    const senha = 'Senha-Forte-2026';
    expect((await cadastrar(email, senha)).status).toBe(200);

    for (
      let tentativa = 0;
      tentativa < LIMITE_LOGIN_POR_CONTA.limite - 1;
      tentativa++
    ) {
      expect((await entrar(email, 'errada', ipNovo())).status).toBe(401);
    }
    expect((await entrar(email, senha, ipNovo())).status).toBe(200);
    // Depois do acerto, a contagem recomeça do zero.
    for (
      let tentativa = 0;
      tentativa < LIMITE_LOGIN_POR_CONTA.limite - 1;
      tentativa++
    ) {
      expect((await entrar(email, 'errada', ipNovo())).status).toBe(401);
    }
    expect((await entrar(email, senha, ipNovo())).status).toBe(200);
  });

  it('limita as tentativas por IP', async () => {
    const ip = ipNovo();
    for (let i = 0; i < LIMITE_LOGIN_POR_IP.limite; i++) {
      await registrarOcorrencia(LIMITE_LOGIN_POR_IP, ip);
    }
    const resposta = await entrar('qualquer@teste.lyra.local', 'x', ip);
    expect(resposta.status).toBe(429);
    // Outro IP continua livre.
    expect(
      (await entrar('qualquer@teste.lyra.local', 'x', ipNovo())).status
    ).toBe(401);
  });

  it('limita cadastros por IP', async () => {
    const ip = ipNovo();
    for (let i = 0; i < LIMITE_CADASTRO_POR_IP.limite; i++) {
      await registrarOcorrencia(LIMITE_CADASTRO_POR_IP, ip);
    }
    const email = `limite-${randomUUID().slice(0, 8)}@teste.lyra.local`;
    const resposta = await cadastrar(email, 'Senha-Forte-2026', ip);
    expect(resposta.status).toBe(429);
    const contas = await queryRows('SELECT id FROM users WHERE email = ?', [
      email,
    ]);
    expect(contas).toHaveLength(0);
  });

  it('conta ocorrências simultâneas sem perder nenhuma', async () => {
    const regra = {
      escopo: 'teste-concorrencia',
      limite: 1000,
      janelaSegundos: 60,
    };
    const valor = randomUUID();
    const estados = await Promise.all(
      Array.from({ length: 25 }, () => registrarOcorrencia(regra, valor))
    );
    expect(Math.max(...estados.map((estado) => estado.ocorrencias))).toBe(25);
    expect(new Set(estados.map((estado) => estado.ocorrencias)).size).toBe(25);
  });
});

describe('sessão', () => {
  it('não expõe o JWT no corpo da resposta', async () => {
    const usuario = await criarUsuario('patient');
    await entrarComo(usuario);
    const resposta = await chamar(sessao.GET);
    expect(resposta.status).toBe(200);
    expect(resposta.json).toEqual({ session: usuario.session });
    expect(resposta.texto).not.toContain('access_token');
    expect(resposta.texto).not.toMatch(/eyJ[\w-]+\.[\w-]+\.[\w-]+/);
  });

  it('usa o papel atual do banco: admin rebaixado perde o acesso com o token antigo', async () => {
    const admin = await criarUsuario('admin');
    await entrarComo(admin);
    expect(
      (await chamar(adminUsuarios.GET, { path: '/api/admin/users' })).status
    ).toBe(200);

    await executeStatement(
      "UPDATE profiles SET role = 'patient' WHERE id = ?",
      [admin.id]
    );
    // Mesmo cookie (o JWT ainda diz `admin`).
    expect(
      (await chamar(adminUsuarios.GET, { path: '/api/admin/users' })).status
    ).toBe(403);
    const atual = await chamar(sessao.GET);
    expect(atual.json).toMatchObject({
      session: { user: { role: 'patient' } },
    });
  });

  it('conta removida deixa de ter sessão', async () => {
    const usuario = await criarUsuario('patient');
    await entrarComo(usuario);
    await executeStatement('DELETE FROM users WHERE id = ?', [usuario.id]);
    const resposta = await chamar(sessao.GET);
    expect(resposta.json).toEqual({ session: null });
  });
});
