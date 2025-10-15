import { createServerSupabaseClient } from '@/integrations/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Esta página é um Server Component
export default async function InstrumentsPage() {
  const supabase = await createServerSupabaseClient();
  
  // Consulta de dados no servidor
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-950">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Demonstração de Consulta SSR (Server Component)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Dados buscados diretamente no servidor Next.js usando o cliente Supabase SSR:
          </p>
          {error ? (
            <div className="text-red-500">
              Erro ao buscar instrumentos: {error.message}
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