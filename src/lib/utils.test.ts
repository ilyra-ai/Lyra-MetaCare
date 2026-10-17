import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn com as escalas do tema (tarefa 59)', () => {
  it('tamanho de fonte do tema não apaga a cor do texto', () => {
    expect(cn('text-primary-foreground', 'text-body')).toBe(
      'text-primary-foreground text-body'
    );
    expect(cn('text-muted-foreground text-caption')).toBe(
      'text-muted-foreground text-caption'
    );
  });

  it('tamanhos do tema ainda substituem outros tamanhos', () => {
    expect(cn('text-sm', 'text-micro')).toBe('text-micro');
    expect(cn('rounded-xl', 'rounded-3xl')).toBe('rounded-3xl');
  });
});
