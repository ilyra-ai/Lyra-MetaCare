import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { getHttpErrorStatus, HttpError } from '@/lib/http-error';

describe('http error helpers', () => {
  it('preserva o status de HttpError', () => {
    expect(getHttpErrorStatus(new HttpError('Falha controlada', 418))).toBe(
      418
    );
  });

  it('mapeia ZodError para 400', () => {
    const schema = z.object({
      planKey: z.enum(['free', 'meta', 'care']),
    });
    const parsed = schema.safeParse({ planKey: 'enterprise' });

    if (parsed.success) {
      throw new Error('O teste precisava produzir um ZodError real.');
    }

    expect(getHttpErrorStatus(parsed.error)).toBe(400);
  });
});
