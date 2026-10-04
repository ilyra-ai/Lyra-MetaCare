import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  SEGREDOS_GERADOS,
  completarEnv,
  gerarSegredo,
  parseEnvContents,
} from './env-file.mjs';

const raiz = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const exemploReal = readFileSync(path.join(raiz, '.env.example'), 'utf8');
const geradorFixo = (chave) => `gerado-${chave}`;

describe('.env.example', () => {
  it('não contém nenhum segredo preenchido', () => {
    const valores = parseEnvContents(exemploReal);
    for (const chave of Object.keys(SEGREDOS_GERADOS)) {
      expect(valores[chave]).toBe('');
    }
    for (const chave of [
      'GEMINI_API_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'SENTRY_AUTH_TOKEN',
    ]) {
      expect(valores[chave]).toBe('');
    }
  });
});

describe('completarEnv', () => {
  it('cria o .env.local com todas as chaves do exemplo e segredos gerados', () => {
    const resultado = completarEnv(null, exemploReal, geradorFixo);
    const valores = parseEnvContents(resultado.conteudo);
    const exemplo = parseEnvContents(exemploReal);

    expect(Object.keys(valores)).toEqual(Object.keys(exemplo));
    expect(resultado.adicionadas).toEqual(Object.keys(exemplo));
    for (const chave of Object.keys(SEGREDOS_GERADOS)) {
      expect(valores[chave]).toBe(`gerado-${chave}`);
    }
    expect(valores.MYSQL_HOST_PORT).toBe(exemplo.MYSQL_HOST_PORT);
    expect(resultado.conteudo).toContain('não versione');
    expect(resultado.erros).toEqual([]);
  });

  it('é idempotente: uma segunda execução não altera nada', () => {
    const primeira = completarEnv(null, exemploReal, geradorFixo);
    const segunda = completarEnv(primeira.conteudo, exemploReal, () => {
      throw new Error('não deveria gerar segredo');
    });

    expect(segunda.adicionadas).toEqual([]);
    expect(segunda.preenchidas).toEqual([]);
    expect(segunda.conteudo).toBe(primeira.conteudo);
  });

  it('preserva valores, comentários e chaves extras existentes', () => {
    const atual = [
      '# configuração manual',
      'MYSQL_PASSWORD=senha-existente-do-banco',
      'MYSQL_HOST_PORT=3399',
      'CHAVE_EXTRA=valor',
    ].join('\n');

    const resultado = completarEnv(atual, exemploReal, geradorFixo);
    const valores = parseEnvContents(resultado.conteudo);

    expect(resultado.conteudo.startsWith(`${atual}\n`)).toBe(true);
    expect(valores.MYSQL_PASSWORD).toBe('senha-existente-do-banco');
    expect(valores.MYSQL_HOST_PORT).toBe('3399');
    expect(valores.CHAVE_EXTRA).toBe('valor');
    expect(resultado.adicionadas).not.toContain('MYSQL_PASSWORD');
    expect(valores.AUTH_SECRET).toBe('gerado-AUTH_SECRET');
  });

  it('preenche no lugar um segredo existente porém vazio', () => {
    const atual = 'MYSQL_ROOT_PASSWORD=\nAUTH_SECRET=""\n';
    const resultado = completarEnv(atual, exemploReal, geradorFixo);
    const linhas = resultado.conteudo.split('\n');

    expect(resultado.preenchidas).toEqual([
      'MYSQL_ROOT_PASSWORD',
      'AUTH_SECRET',
    ]);
    expect(linhas[0]).toBe('MYSQL_ROOT_PASSWORD=gerado-MYSQL_ROOT_PASSWORD');
    expect(linhas[1]).toBe('AUTH_SECRET=gerado-AUTH_SECRET');
  });

  it('reporta AUTH_SECRET fraco sem substituí-lo', () => {
    const resultado = completarEnv(
      'AUTH_SECRET=curto\n',
      exemploReal,
      geradorFixo
    );

    expect(parseEnvContents(resultado.conteudo).AUTH_SECRET).toBe('curto');
    expect(resultado.erros).toHaveLength(1);
    expect(resultado.erros[0]).toContain('mínimo para HS256 é 32');
  });
});

describe('gerarSegredo', () => {
  it('gera base64url com a entropia pedida e sem caracteres especiais', () => {
    for (const [chave, bytes] of Object.entries(SEGREDOS_GERADOS)) {
      const segredo = gerarSegredo(bytes);
      expect(segredo, chave).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(Buffer.from(segredo, 'base64url')).toHaveLength(bytes);
    }
    expect(gerarSegredo(32)).not.toBe(gerarSegredo(32));
  });
});
