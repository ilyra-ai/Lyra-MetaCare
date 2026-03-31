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
import { lyraPuckConfig } from '@/lib/puck/config/base';
import type { LyraPuckData } from '@/lib/puck/types';

export function PuckPreviewRenderer({
  title,
  description,
  badgeLabel,
  data,
}: {
  title: string;
  description: string;
  badgeLabel: string;
  data: LyraPuckData;
}) {
  const rootTitle =
    data.root &&
    typeof data.root === 'object' &&
    'props' in data.root &&
    data.root.props &&
    typeof data.root.props === 'object' &&
    'title' in data.root.props &&
    typeof data.root.props.title === 'string'
      ? data.root.props.title
      : null;

  return (
    <Card className="overflow-hidden border-border/70 bg-white/90 shadow-sm">
      <CardHeader className="gap-3 border-b border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(237,233,254,0.24),rgba(255,255,255,0.96))]">
        <Badge className="w-fit rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary">
          {badgeLabel}
        </Badge>
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-sm leading-7">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="bg-[linear-gradient(180deg,rgba(249,248,252,0.98),rgba(255,255,255,1))] p-6">
        {rootTitle ? (
          <div className="mb-4 rounded-[22px] border border-border/70 bg-cosmic-light/40 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              título raiz do documento
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {rootTitle}
            </p>
          </div>
        ) : null}
        <div className="rounded-[28px] border border-border/70 bg-white p-4 shadow-[0_24px_80px_-48px_rgba(22,21,48,0.34)]">
          <Render config={lyraPuckConfig} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
