import { createServerDatabaseClient } from '@/integrations/mysql/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';

export default async function InstrumentsPage() {
  const database = await createServerDatabaseClient();

  const { data: instruments, error } = await database
    .from('instruments')
    .select();

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-950">
        <PuckClientRenderer documentKey="instruments" className="w-full flex-shrink-0" />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">
            Demonstração de Consulta SSR (Server Component)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Dados buscados diretamente no servidor Next.js usando a camada MySQL
            server-side:
          </p>
          {error ? (
            <div className="text-red-500">
              Erro ao buscar instrumentos: {error?.message}
            </div>
          ) : (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(instruments, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
