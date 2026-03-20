'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Eye, LayoutTemplate, Save, Sparkles, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Editor JSON simples para o builder (já que precisamos permitir editar QUAISQUER componentes, e a estrutura é flexível)
export function PageBuilderContent() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [landingJson, setLandingJson] = React.useState<string>('{}');
  const [loginJson, setLoginJson] = React.useState<string>('{}');

  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/public/ui-config');
        const data = await res.json();
        if (data.config) {
          setLandingJson(JSON.stringify(data.config.landing, null, 2));
          setLoginJson(JSON.stringify(data.config.login, null, 2));
        }
      } catch (e) {
        toast.error('Erro ao carregar a configuração atual.');
      } finally {
        setLoading(false);
      }
    };
    void fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedLanding = JSON.parse(landingJson);
      const parsedLogin = JSON.parse(loginJson);

      const payload = {
        landing: parsedLanding,
        login: parsedLogin,
      };

      const res = await fetch('/api/admin/ui-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na requisição');
      }

      toast.success('Páginas atualizadas com sucesso!', {
        description: 'As alterações na landing page e login já estão ao vivo.',
      });
    } catch (e) {
      toast.error('Não foi possível salvar', {
        description:
          e instanceof SyntaxError
            ? 'O JSON inserido é inválido'
            : e instanceof Error
              ? e.message
              : 'Erro desconhecido',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[36px] border border-dashed border-border/80 bg-white/50">
        <Sparkles className="h-8 w-8 animate-pulse text-primary/50" />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-white/80 bg-white/70 shadow-[0_26px_80px_-42px_rgba(22,21,48,0.1)] rounded-[32px]">
      <Tabs defaultValue="landing">
        <div className="border-b border-border/60 bg-white/40 px-6 py-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-2xl p-1 shadow-sm">
            <TabsTrigger
              value="landing"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Landing Page
            </TabsTrigger>
            <TabsTrigger
              value="login"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Tela de Login
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="landing"
          className="m-0 p-6 space-y-4 animate-fade-in"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Editor de Layout em JSON (Landing)
              </h3>
              <p className="text-sm text-muted-foreground">
                O JSON Data Builder permite ao administrador controle estrito e
                total da página modificando propriedades e features do painel em
                tempo real.
              </p>
            </div>

            <textarea
              className="w-full h-[500px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={landingJson}
              onChange={(e) => setLandingJson(e.target.value)}
              spellCheck={false}
            />
          </div>
        </TabsContent>

        <TabsContent
          value="login"
          className="m-0 p-6 space-y-4 animate-fade-in"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Editor de Layout em JSON (Login)
              </h3>
              <p className="text-sm text-muted-foreground">
                Modifique o design da página de autenticação na íntegra editando
                a configuração JSON raiz.
              </p>
            </div>

            <textarea
              className="w-full h-[500px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={loginJson}
              onChange={(e) => setLoginJson(e.target.value)}
              spellCheck={false}
            />
          </div>
        </TabsContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 bg-white/50 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>
              O conteúdo refletirá instantaneamente nas rotas públicas.
            </span>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="rounded-full shadow-teal"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Aplicando mágica...' : 'Salvar Arquitetura Visual'}
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  );
}
