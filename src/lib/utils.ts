import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * `tailwind-merge` com as escalas próprias do tema (tarefa 59). Sem isto,
 * `text-body` (tamanho de fonte do `@theme`) era tratado como cor de texto e
 * apagava `text-primary-foreground` no mesmo elemento: o botão grande ficava
 * com texto escuro sobre o teal (3,19:1).
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['micro', 'caption', 'body'],
      radius: ['xs', '3xl', '4xl'],
      shadow: ['2xs', 'xs', '2xl'],
      ease: ['saida', 'entrada'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
