'use client';

import type { ReactNode } from 'react';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scaleRem } from '@/lib/site-page-config/runtime';
import { cn } from '@/lib/utils';

type PageIntroProps = {
  /** Linha curta acima do título (texto comum, sem caixa alta). */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Ações principais da página, alinhadas à direita no desktop. */
  actions?: ReactNode;
  className?: string;
};

/*
  Abertura padrão das páginas: título em `<h2>` (o `<h1>` é o título do
  cabeçalho), descrição opcional e ações. As escalas de tipografia vêm do
  construtor de UI (`typography.pageTitle` e `typography.pageBody`).
*/
export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageIntroProps) {
  const { config: appConfig } = usePublicSitePageConfig('app');

  return (
    <section
      className={cn(
        'flex flex-wrap items-end justify-between gap-4',
        className
      )}
    >
      <div className="min-w-0 flex-[1_1_360px]">
        {eyebrow ? (
          <p className="mb-1 text-sm text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h2
          className="font-display font-semibold tracking-[-0.02em] text-foreground"
          style={{ fontSize: scaleRem(1.75, appConfig.typography.pageTitle) }}
        >
          {title}
        </h2>
        {description ? (
          <p
            className="mt-1.5 max-w-3xl leading-relaxed text-muted-foreground"
            style={{
              fontSize: scaleRem(0.9375, appConfig.typography.pageBody),
            }}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </section>
  );
}
