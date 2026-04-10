import type { RichText } from '@puckeditor/core';

import { sanitizarHtmlRichTextLyra } from '@/lib/puck/sanitization/rich-text';
import { cn } from '@/lib/utils';

const classesBaseRichTextLyra = [
  'prose prose-slate max-w-none text-pretty',
  'prose-p:my-0 prose-p:text-inherit',
  'prose-headings:mb-0 prose-headings:mt-0 prose-headings:font-display prose-headings:text-foreground',
  'prose-h1:text-4xl prose-h1:leading-[1.05]',
  'prose-h2:text-3xl prose-h2:leading-[1.08]',
  'prose-h3:text-2xl prose-h3:leading-[1.12]',
  'prose-h4:text-xl prose-h4:leading-[1.2]',
  'prose-strong:text-foreground',
  'prose-a:text-primary prose-a:underline prose-a:underline-offset-4',
  'prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.92em] prose-code:text-foreground',
  'prose-pre:border prose-pre:border-border/70 prose-pre:bg-muted/70 prose-pre:text-foreground',
  'prose-blockquote:border-l-4 prose-blockquote:border-primary/20 prose-blockquote:text-foreground/80',
  'prose-li:my-1',
  '[&_ul]:my-0 [&_ol]:my-0 [&_blockquote]:my-0 [&_pre]:my-0',
].join(' ');

export function LyraRichTextRenderer({
  value,
  className,
}: {
  value: RichText;
  className?: string;
}) {
  if (!value) {
    return null;
  }

  if (typeof value !== 'string') {
    return (
      <div className={cn(classesBaseRichTextLyra, className)}>{value}</div>
    );
  }

  const htmlSeguro = sanitizarHtmlRichTextLyra(value);

  if (!htmlSeguro.trim()) {
    return null;
  }

  return (
    <div
      className={cn(classesBaseRichTextLyra, className)}
      dangerouslySetInnerHTML={{ __html: htmlSeguro }}
    />
  );
}
