import { PuckEditorShell } from '@/components/admin/puck/PuckEditorShell';
import {
  defaultLyraPuckDocumentKey,
  isLyraPuckDocumentKey,
} from '@/lib/puck/types';

export default async function AdminPuckPage({
  searchParams,
}: {
  searchParams: Promise<{ documentKey?: string }>;
}) {
  const { documentKey } = await searchParams;

  return (
    <PuckEditorShell
      documentKey={
        documentKey && isLyraPuckDocumentKey(documentKey)
          ? documentKey
          : defaultLyraPuckDocumentKey
      }
    />
  );
}
