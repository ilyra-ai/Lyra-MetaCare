import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import { ThemeToggleButton } from '@/components/theme/ThemeControls';
import {
  ROTA_POLITICA_DE_PRIVACIDADE,
  ROTA_TERMOS_DE_USO,
} from '@/lib/lgpd/documentos';

export interface SecaoDoDocumento {
  id: string;
  titulo: string;
  conteudo: React.ReactNode;
}

/**
 * Página de documento legal (política de privacidade e termos de uso):
 * leitura confortável, índice com âncoras e versão em vigor visível.
 */
export function DocumentoLegal({
  titulo,
  resumo,
  versao,
  secoes,
}: {
  titulo: string;
  resumo: string;
  versao: string;
  secoes: SecaoDoDocumento[];
}) {
  const [ano, mes, dia] = versao.split('-');

  return (
    <main
      id="conteudo-principal"
      className="min-h-dvh bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2.5 rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary">
              <ShieldCheck
                className="h-5 w-5 text-primary-foreground"
                aria-hidden
              />
            </span>
            <span className="font-display text-xl font-semibold lowercase tracking-tight">
              lyra
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <nav
              aria-label="Documentos legais"
              className="flex flex-wrap gap-x-4 text-sm"
            >
              <Link
                href={ROTA_POLITICA_DE_PRIVACIDADE}
                className="inline-flex min-h-11 items-center text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Privacidade
              </Link>
              <Link
                href={ROTA_TERMOS_DE_USO}
                className="inline-flex min-h-11 items-center text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Termos de uso
              </Link>
            </nav>
            <ThemeToggleButton />
          </div>
        </div>

        <header className="mt-10 border-b border-border pb-8">
          <p className="text-sm font-medium text-primary">
            Lyra MetaCare · versão de {dia}/{mes}/{ano}
          </p>
          <h1 className="mt-3 text-balance font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            {titulo}
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            {resumo}
          </p>
        </header>

        <nav aria-label="Seções" className="mt-8">
          <p className="text-sm font-semibold">Nesta página</p>
          <ol className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
            {secoes.map((secao, indice) => (
              <li key={secao.id}>
                <a
                  href={`#${secao.id}`}
                  className="inline-flex min-h-9 items-center text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {indice + 1}. {secao.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {secoes.map((secao, indice) => (
            <section
              key={secao.id}
              id={secao.id}
              aria-labelledby={`${secao.id}-titulo`}
              className="scroll-mt-6"
            >
              <h2
                id={`${secao.id}-titulo`}
                className="font-display text-xl font-semibold tracking-tight"
              >
                {indice + 1}. {secao.titulo}
              </h2>
              <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-foreground/85 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:space-y-1.5">
                {secao.conteudo}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar para a Lyra
          </Link>
        </div>
      </div>
    </main>
  );
}
