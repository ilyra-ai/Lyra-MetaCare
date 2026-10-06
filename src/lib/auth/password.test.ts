import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from './password';

describe('senhas', () => {
  it('gera hash bcrypt com custo 12 e sal aleatório', async () => {
    const senha = 'Senha-Forte-2026!';
    const primeiro = await hashPassword(senha);
    const segundo = await hashPassword(senha);
    expect(primeiro).toMatch(/^\$2[aby]\$12\$/);
    expect(primeiro).not.toBe(segundo);
    expect(primeiro).not.toContain(senha);
  });

  it('confere a senha correta e recusa as demais', async () => {
    const hash = await hashPassword('correta horse battery');
    expect(await verifyPassword('correta horse battery', hash)).toBe(true);
    expect(await verifyPassword('Correta horse battery', hash)).toBe(false);
    expect(await verifyPassword('', hash)).toBe(false);
  });
});
