import { createServerDatabaseClient } from '@/integrations/mysql/server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';

export default async function InstrumentsPage() {
  const database = await createServerDatabaseClient();

  const { data: instruments, error } = await database
    .from('instruments')
    .select();

  return (
    <main id="conteudo-principal" className="page-shell min-h-screen p-8">
      <PuckClientRenderer
        documentKey="instruments"
        className="w-full shrink-0"
      />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <h1 className="font-display text-2xl font-semibold leading-none tracking-tight">
            Demonstração de Consulta SSR (Server Component)
          </h1>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Dados buscados diretamente no servidor Next.js usando a camada MySQL
            server-side:
          </p>
          {error ? (
            <div className="text-destructive">
              Erro ao buscar instrumentos: {error?.message}
            </div>
          ) : (
            <pre className="overflow-x-auto rounded-[18px] border border-border/70 bg-muted/60 p-4 text-sm text-foreground">
              {JSON.stringify(instruments, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
