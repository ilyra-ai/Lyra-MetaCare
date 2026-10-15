import { describe, expect, it } from 'vitest';

import { SESSION_COOKIE_NAME } from '@/lib/auth/session';
import {
  VERSAO_POLITICA_DE_PRIVACIDADE,
  VERSAO_TERMOS_DE_USO,
} from '@/lib/lgpd/documentos';
import { executeStatement, queryRows } from '@/lib/mysql/pool';

import { criarUsuario } from '../../../tests/integration/fixtures';
import { chamar, cookieJar } from '../../../tests/integration/http';

import * as login from './auth/login/route';
import * as logout from './auth/logout/route';
import * as register from './auth/register/route';
import * as sessao from './auth/session/route';
import * as health from './health/route';
import * as arquivo from './storage/[bucket]/[...filePath]/route';
import * as upload from './storage/upload/route';

// PNG 1×1 válido (assinatura + IHDR + IDAT + IEND).
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

function multipart(campos: Record<string, string | Blob>) {
  const formulario = new FormData();
  for (const [nome, valor] of Object.entries(campos)) {
    formulario.append(nome, valor);
  }
  return formulario;
}

describe('POST /api/auth/register e /api/auth/login', () => {
  const email = `cadastro-${Date.now()}@teste.lyra.local`;
  const senha = 'Senha-Forte-2026';

  it('valida o cadastro', async () => {
    for (const body of [
      { email: 'invalido', password: senha, acceptTerms: true },
      { email, password: 'curta', acceptTerms: true },
      // LGPD: sem o aceite dos termos e da política, a conta não é criada.
      { email, password: senha },
      { email, password: senha, acceptTerms: false },
      {},
    ]) {
      const resposta = await chamar(register.POST, {
        method: 'POST',
        body,
        usuario: null,
      });
      expect(resposta.status).toBe(400);
    }
    const malformado = await chamar(register.POST, {
      method: 'POST',
      rawBody: '{',
      headers: { 'content-type': 'application/json' },
      usuario: null,
    });
    expect(malformado.status).toBe(400);
    expect(malformado.json).toEqual({
      error: 'Corpo da requisição não é um JSON válido.',
    });
  });

  it('cadastra como paciente, abre sessão e recusa e-mail repetido', async () => {
    const resposta = await chamar(register.POST, {
      method: 'POST',
      body: {
        email: email.toUpperCase(),
        password: senha,
        firstName: 'Nova',
        acceptTerms: true,
      },
      usuario: null,
    });
    expect(resposta.status).toBe(200);
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(true);
    // Conta nova abre direto no onboarding: a sessão já informa o status.
    expect(
      (
        resposta.json as {
          session: { user: { onboarding_completed: boolean } };
        }
      ).session.user.onboarding_completed
    ).toBe(false);
    const perfil = await queryRows<{ role: string; email: string }>(
      'SELECT role, email FROM profiles WHERE email = ?',
      [email]
    );
    expect(perfil).toEqual([{ role: 'patient', email }]);
    // O cadastro público nunca cria administrador nem plano pago.
    const plano = await queryRows<{ plan_key: string }>(
      `SELECT p.plan_key FROM user_subscriptions s
         JOIN subscription_plans p ON p.id = s.plan_id
         JOIN users u ON u.id = s.user_id
        WHERE u.email = ?`,
      [email]
    );
    expect(plano).toEqual([{ plan_key: 'free' }]);
    // O aceite fica registrado com a versão vigente de cada documento.
    const consentimentos = await queryRows<{
      consent_type: string;
      document_version: string;
    }>(
      `SELECT c.consent_type, c.document_version FROM consent_records c
         JOIN users u ON u.id = c.user_id
        WHERE u.email = ? ORDER BY c.consent_type`,
      [email]
    );
    expect(consentimentos).toEqual([
      {
        consent_type: 'privacy_policy',
        document_version: VERSAO_POLITICA_DE_PRIVACIDADE,
      },
      { consent_type: 'terms_of_use', document_version: VERSAO_TERMOS_DE_USO },
    ]);

    const repetido = await chamar(register.POST, {
      method: 'POST',
      body: { email, password: senha, acceptTerms: true },
      usuario: null,
    });
    expect(repetido.status).toBe(409);
  });

  it('não revela se o e-mail existe: mesma resposta para e-mail e senha errados', async () => {
    const semConta = await chamar(login.POST, {
      method: 'POST',
      body: { email: 'ninguem@teste.lyra.local', password: senha },
      usuario: null,
    });
    const senhaErrada = await chamar(login.POST, {
      method: 'POST',
      body: { email, password: 'outra-senha-123' },
      usuario: null,
    });
    expect(semConta.status).toBe(401);
    expect(senhaErrada.status).toBe(401);
    expect(semConta.json).toEqual(senhaErrada.json);
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(false);
  });

  it('login válido abre sessão; session devolve o usuário; logout encerra', async () => {
    const entrada = await chamar(login.POST, {
      method: 'POST',
      body: { email, password: senha, remember: true },
      usuario: null,
    });
    expect(entrada.status).toBe(200);
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(true);
    type RespostaDeSessao = {
      session: { user: { email: string; onboarding_completed: boolean } };
    };
    expect(
      (entrada.json as RespostaDeSessao).session.user.onboarding_completed
    ).toBe(false);

    const atual = await chamar(sessao.GET);
    const usuarioAtual = (atual.json as RespostaDeSessao).session.user;
    expect(usuarioAtual.email).toBe(email);
    expect(usuarioAtual.onboarding_completed).toBe(false);

    // O status do onboarding vale pelo banco a cada leitura da sessão: ao
    // concluir, a próxima leitura libera o app sem novo login.
    await executeStatement(
      'UPDATE profiles SET onboarding_completed = 1 WHERE email = ?',
      [email]
    );
    const concluido = await chamar(sessao.GET);
    expect(
      (concluido.json as RespostaDeSessao).session.user.onboarding_completed
    ).toBe(true);

    await chamar(logout.POST, { method: 'POST' });
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(false);
    const depois = await chamar(sessao.GET);
    expect(depois.json).toEqual({ session: null });
  });
});

describe('storage de imagens', () => {
  it('exige sessão para enviar', async () => {
    const resposta = await chamar(upload.POST, {
      method: 'POST',
      rawBody: multipart({
        bucket: 'avatars',
        path: 'x/a.png',
        file: new Blob([PNG_1X1]),
      }),
      usuario: null,
    });
    expect(resposta.status).toBe(401);
  });

  it('aceita PNG no próprio caminho e serve com tipo e nosniff', async () => {
    const dono = await criarUsuario('patient', 'Avatar');
    const caminho = `${dono.id}/foto.png`;
    const envio = await chamar(upload.POST, {
      method: 'POST',
      rawBody: multipart({
        bucket: 'avatars',
        path: caminho,
        upsert: 'true',
        file: new Blob([PNG_1X1], { type: 'image/png' }),
      }),
      usuario: dono,
    });
    expect(envio.status).toBe(200);
    expect(envio.json).toEqual({
      data: { path: caminho, publicUrl: `/api/storage/avatars/${caminho}` },
      error: null,
    });

    const leitura = await chamar(arquivo.GET, {
      params: { bucket: 'avatars', filePath: caminho.split('/') },
      usuario: null,
    });
    expect(leitura.status).toBe(200);
    expect(leitura.headers.get('content-type')).toBe('image/png');
    expect(leitura.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('recusa SVG/HTML, extensão divergente, caminho alheio e travessia', async () => {
    const dono = await criarUsuario('patient', 'Upload');
    const casos: Array<[Record<string, string | Blob>, number]> = [
      [
        {
          bucket: 'avatars',
          path: `${dono.id}/x.svg`,
          file: new Blob(['<svg onload="alert(1)"/>']),
        },
        415,
      ],
      [
        {
          bucket: 'avatars',
          path: `${dono.id}/x.png`,
          file: new Blob(['<html><script>alert(1)</script></html>']),
        },
        415,
      ],
      [
        {
          bucket: 'avatars',
          path: `${dono.id}/x.jpg`,
          file: new Blob([PNG_1X1]),
        },
        415,
      ],
      [
        {
          bucket: 'avatars',
          path: 'outro-usuario/x.png',
          file: new Blob([PNG_1X1]),
        },
        403,
      ],
      [
        {
          bucket: 'avatars',
          path: `${dono.id}/../../x.png`,
          file: new Blob([PNG_1X1]),
        },
        400,
      ],
      [
        {
          bucket: '../segredos',
          path: `${dono.id}/x.png`,
          file: new Blob([PNG_1X1]),
        },
        404,
      ],
    ];
    for (const [campos, status] of casos) {
      const resposta = await chamar(upload.POST, {
        method: 'POST',
        rawBody: multipart(campos),
        usuario: dono,
      });
      expect({ caminho: campos.path, status: resposta.status }).toEqual({
        caminho: campos.path,
        status,
      });
    }
  });

  it('nunca lê arquivos fora do storage', async () => {
    for (const filePath of [
      ['..', '..', '.env.local'],
      ['..%2F..%2F.env.local'],
      ['x', '..', '..', 'package.json'],
    ]) {
      const resposta = await chamar(arquivo.GET, {
        params: { bucket: 'avatars', filePath },
        usuario: null,
      });
      expect(resposta.status).toBe(404);
      expect(resposta.json).toEqual({ error: 'Arquivo não encontrado.' });
    }
    const outroBucket = await chamar(arquivo.GET, {
      params: { bucket: '..', filePath: ['.env.local'] },
      usuario: null,
    });
    expect(outroBucket.status).toBe(404);
  });
});

describe('GET /api/health', () => {
  it('informa banco e migrations', async () => {
    const resposta = await chamar(health.GET);
    expect(resposta.status).toBe(200);
    expect(resposta.json).toMatchObject({ status: 'ok', database: 'ok' });
  });
});
