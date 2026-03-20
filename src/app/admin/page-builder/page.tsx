import { Metadata } from 'next';
import { PageBuilderContent } from '@/components/admin/page-builder/PageBuilderContent';

export const metadata: Metadata = {
  title: 'Construtor UI | Admin',
  description: 'Gestão visual da Landing Page e da Tela de Login',
};

export default function PageBuilderAdminPage() {
  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Construtor UI (Premium 2026)
        </h1>
        <p className="text-muted-foreground">
          Gerencie layouts, textos e a visibilidade de blocos da página pública
          e de login na íntegra.
        </p>
      </div>

      <PageBuilderContent />
    </div>
  );
}
