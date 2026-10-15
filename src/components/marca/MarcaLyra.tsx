import Image from 'next/image';

import logoDaLyra from '@/assets/marca/lyra-logo.png';
import { cn } from '@/lib/utils';

/*
  Marca oficial da Lyra (tarefa 47): o "L" em teal abraçando o coração coral.
  O arquivo é o logo oficial com o fundo branco convertido em transparência.
  Como o desenho original foi feito sobre branco, seus brilhos somem sobre
  fundo escuro; no tema escuro a marca fica num ladrilho claro arredondado,
  o mesmo usado no favicon, para manter as cores reais do logo.
*/

interface MarcaLyraProps {
  /** Lado da marca em qualquer medida CSS (ex.: `'32px'`, `'3rem'`). */
  tamanho: string;
  /**
   * Texto alternativo. Sem ele a marca é decorativa (`alt=""`), o caso comum
   * quando o nome "lyra" já aparece escrito ao lado.
   */
  rotulo?: string;
  /** Carrega a imagem com prioridade (marca acima da dobra, ex.: login). */
  prioridade?: boolean;
  className?: string;
}

export function MarcaLyra({
  tamanho,
  rotulo,
  prioridade = false,
  className,
}: MarcaLyraProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[22%] dark:bg-white',
        className
      )}
      style={{ width: tamanho, height: tamanho }}
    >
      {/* O respiro do ladrilho escuro vem de `scale`, e não de `padding` em
          %, que seria calculado sobre a largura do elemento pai. */}
      <Image
        src={logoDaLyra}
        alt={rotulo ?? ''}
        sizes={tamanho}
        priority={prioridade}
        className="h-full w-full object-contain dark:scale-[0.86]"
      />
    </span>
  );
}
