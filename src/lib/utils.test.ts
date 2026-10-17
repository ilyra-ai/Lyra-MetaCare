import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('utilitário cn', () => {
  it('junta nomes de classe', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('aceita classes condicionais', () => {
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
  });

  it('aceita listas de classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('descarta valores falsos', () => {
    expect(cn('class1', null, undefined, false, '')).toBe('class1');
  });

  it('resolve conflitos do Tailwind com o twMerge (a última vence)', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('combinações complexas', () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cn(
        'base-style',
        isActive && 'active-style',
        isDisabled ? 'disabled-style' : 'enabled-style',
        { 'extra-class': true },
        ['array-class-1', 'array-class-2']
      )
    ).toBe(
      'base-style active-style enabled-style extra-class array-class-1 array-class-2'
    );
  });
});

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
