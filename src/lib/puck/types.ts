import type { Data } from '@puckeditor/core';

export const lyraPuckDocumentKeys = ['landing-home'] as const;

export type LyraPuckDocumentKey = (typeof lyraPuckDocumentKeys)[number];

export const defaultLyraPuckDocumentKey: LyraPuckDocumentKey = 'landing-home';

export type LyraHeroBlockProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  note: string;
};

export type LyraPuckData = Data;

export type LyraPuckDocumentMeta = {
  documentKey: LyraPuckDocumentKey;
  createdAt: string | null;
  updatedAt: string | null;
  updatedByUserId: string | null;
};

export type LyraPuckDocumentRecord = LyraPuckDocumentMeta & {
  draftData: LyraPuckData;
  publishedData: LyraPuckData;
};

export const lyraPuckDocuments: Array<{
  key: LyraPuckDocumentKey;
  label: string;
  description: string;
  route: string;
}> = [
  {
    key: 'landing-home',
    label: 'Landing Home',
    description:
      'Primeiro documento oficial do Puck para a Lyra, usado para validar o editor visual com persistência real.',
    route: '/admin/puck',
  },
];

export function isLyraPuckDocumentKey(
  value: string
): value is LyraPuckDocumentKey {
  return (lyraPuckDocumentKeys as readonly string[]).includes(value);
}
