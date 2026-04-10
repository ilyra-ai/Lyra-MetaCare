import { lyraPuckDocuments, type LyraPuckDocumentKey } from '@/lib/puck/types';

export type LyraExternalDocumentData = {
  key: LyraPuckDocumentKey;
  label: string;
  description: string;
  publicRoute: string;
};

export function fetchListDocumentos(): LyraExternalDocumentData[] {
  return lyraPuckDocuments.map((doc) => ({
    key: doc.key,
    label: doc.label,
    description: doc.description,
    publicRoute: doc.publicRoute,
  }));
}
