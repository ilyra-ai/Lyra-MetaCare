import { PuckEditorShell } from '@/components/admin/puck/PuckEditorShell';
import { defaultLyraPuckDocumentKey } from '@/lib/puck/types';

export default function AdminPuckPage() {
  return <PuckEditorShell documentKey={defaultLyraPuckDocumentKey} />;
}
