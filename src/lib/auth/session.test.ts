import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  AUTH_SECRET_MIN_BYTES,
  getSecret,
  signSessionToken,
  verifySessionToken,
} from './session';

const SEGREDO_ORIGINAL = process.env.AUTH_SECRET;
const payload = { sub: 'usuario-1', email: 'ana@lyra.local', role: 'user' };

describe('segredo de sessão (AUTH_SECRET)', () => {
  beforeEach(() => {
    delete process.env.AUTH_SECRET;
  });

  afterEach(() => {
    if (SEGREDO_ORIGINAL === undefined) {
      delete process.env.AUTH_SECRET;
    } else {
      process.env.AUTH_SECRET = SEGREDO_ORIGINAL;
    }
  });

  it('falha quando o AUTH_SECRET está ausente', () => {
    expect(() => getSecret()).toThrow(
      'Variável de ambiente obrigatória ausente: AUTH_SECRET'
    );
  });

  it('recusa AUTH_SECRET com menos de 256 bits', () => {
    process.env.AUTH_SECRET = 'x'.repeat(AUTH_SECRET_MIN_BYTES - 1);
    expect(() => getSecret()).toThrow('AUTH_SECRET muito curto (31 bytes');
  });

  it('mede o tamanho em bytes UTF-8, não em caracteres', () => {
    // 16 caracteres "ç" ocupam 32 bytes em UTF-8.
    process.env.AUTH_SECRET = 'ç'.repeat(16);
    expect(getSecret().byteLength).toBe(32);
  });

  it('assina e valida um token com segredo de 32 bytes', async () => {
    process.env.AUTH_SECRET = 'a'.repeat(AUTH_SECRET_MIN_BYTES);
    const token = await signSessionToken(payload);
    const verificado = await verifySessionToken(token);
    expect(verificado).toMatchObject(payload);
  });

  it('propaga erro de configuração em vez de tratar como sessão inválida', async () => {
    process.env.AUTH_SECRET = 'a'.repeat(AUTH_SECRET_MIN_BYTES);
    const token = await signSessionToken(payload);
    process.env.AUTH_SECRET = 'curto';
    await expect(verifySessionToken(token)).rejects.toThrow(
      'AUTH_SECRET muito curto'
    );
  });

  it('não aceita token assinado com outro segredo', async () => {
    process.env.AUTH_SECRET = 'a'.repeat(AUTH_SECRET_MIN_BYTES);
    const token = await signSessionToken(payload);
    process.env.AUTH_SECRET = 'b'.repeat(AUTH_SECRET_MIN_BYTES);
    await expect(verifySessionToken(token)).resolves.toBeNull();
  });
});
