'use client';

import { Render } from '@puckeditor/core';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { obterConfigPuckLyra } from '@/lib/puck/config/base';
import type {
  LyraPuckData,
  LyraPuckDocumentKey,
  LyraPuckRootProps,
} from '@/lib/puck/types';

export function PuckPreviewRenderer({
  title,
  description,
  badgeLabel,
  data,
  documentKey,
}: {
  title: string;
  description: string;
  badgeLabel: string;
  data: LyraPuckData;
  documentKey: LyraPuckDocumentKey;
}) {
  const rootProps =
    data.root &&
    typeof data.root === 'object' &&
    'props' in data.root &&
    data.root.props &&
    typeof data.root.props === 'object'
      ? (data.root.props as Partial<LyraPuckRootProps>)
      : null;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="gap-3 border-b border-border">
        <Badge className="w-fit">{badgeLabel}</Badge>
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="bg-background p-5 sm:p-6">
        {rootProps?.title ? (
          <div className="mb-4 rounded-md border border-border bg-card px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              Contexto raiz da superfície
            </p>
            <div className="mt-2 space-y-1">
              <p className="break-words text-sm font-semibold text-foreground">
                {rootProps.title}
              </p>
              <p className="break-words text-xs text-muted-foreground">
                {rootProps.surfaceTitle ?? 'Superfície sem título'}
              </p>
            </div>
          </div>
        ) : null}
        {/*
          Prévia só visual: o mesmo documento aparece no canvas do editor e
          nas duas prévias (rascunho e publicado). Fora da árvore de
          acessibilidade e do foco, para não triplicar títulos, regiões e
          botões para quem usa leitor de tela ou teclado.
        */}
        <div
          className="overflow-hidden rounded-xl border border-border bg-card p-4"
          inert
          aria-hidden="true"
        >
          <Render config={obterConfigPuckLyra(documentKey)} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
