'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Eye, LayoutTemplate, Save, Sparkles, UserCircle, Code2, PenTool, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Editor from '@monaco-editor/react';

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

      toast.success('Experiência Visual Atualizada!', {
        description: 'As configurações de inteligência adaptativa e layout premium 2026 foram sincronizadas com sucesso. Os usuários finais já estão visualizando.',
        icon: <Sparkles className="h-4 w-4 text-primary" />,
      });
    } catch (e) {
      toast.error('Erro de Validação Semântica', {
        description:
          e instanceof SyntaxError
            ? 'O JSON inserido possui erros de sintaxe. Verifique chaves e vírgulas (Monaco indicará a linha exata).'
            : e instanceof Error
              ? e.message
              : 'Ocorreu um erro crítico durante a persistência do layout.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditorChangeLanding = (value: string | undefined) => {
    if (value !== undefined) setLandingJson(value);
  };

  const handleEditorChangeLogin = (value: string | undefined) => {
    if (value !== undefined) setLoginJson(value);
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-border/80 bg-white/50 backdrop-blur-xl">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 shadow-glass">
          <Sparkles className="h-8 w-8 animate-pulse text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Carregando motores de renderização adaptativa...</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-white/80 bg-white/70 shadow-glass rounded-[2rem] backdrop-blur-3xl transition-all duration-500 hover:shadow-glass-hover">
      <Tabs defaultValue="landing" className="flex flex-col">
        <div className="border-b border-border/60 bg-gradient-to-r from-white/40 to-white/10 px-6 py-5 backdrop-blur-md">
          <TabsList className="grid w-full max-w-2xl grid-cols-2 rounded-2xl p-1 shadow-inner-sm bg-background/50">
            <TabsTrigger
              value="landing"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-300"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Landing Page (GenUI)
            </TabsTrigger>
            <TabsTrigger
              value="login"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-300"
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Hub de Autenticação
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="landing"
          className="m-0 p-8 space-y-6 animate-fade-in bg-gradient-to-b from-white/30 to-transparent"
        >
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <PenTool className="h-6 w-6 text-primary" />
              Engenharia de Layout: Landing Page
            </h3>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Utilize o editor <strong>Monaco (VS Code Engine)</strong> abaixo para gerenciar a arquitetura de dados (JSON) da página de destino. O sistema renderizará componentes Premium de forma adaptativa. Adicione seções como <code>features</code>, modifique <code>hero.title</code> ou altere estilos do <code>cta</code> na íntegra.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/50 shadow-inner-sm bg-[#1e1e1e]">
            <div className="flex items-center gap-2 border-b border-white/10 bg-[#252526] px-4 py-2 text-xs font-mono text-white/50">
              <Code2 className="h-3 w-3" />
              <span>landing.config.json</span>
            </div>
            <Editor
              height="550px"
              defaultLanguage="json"
              theme="vs-dark"
              value={landingJson}
              onChange={handleEditorChangeLanding}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                formatOnPaste: true,
                smoothScrolling: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </TabsContent>

        <TabsContent
          value="login"
          className="m-0 p-8 space-y-6 animate-fade-in bg-gradient-to-b from-white/30 to-transparent"
        >
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <PenTool className="h-6 w-6 text-primary" />
              Engenharia de Layout: Login Hub
            </h3>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Personalize a experiência de entrada do usuário. Defina títulos, subtítulos, textos de botões de provedores (Google, Apple) e a inteligência visual exibida no painel lateral do bento grid de login.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/50 shadow-inner-sm bg-[#1e1e1e]">
             <div className="flex items-center gap-2 border-b border-white/10 bg-[#252526] px-4 py-2 text-xs font-mono text-white/50">
              <Code2 className="h-3 w-3" />
              <span>login.config.json</span>
            </div>
            <Editor
              height="550px"
              defaultLanguage="json"
              theme="vs-dark"
              value={loginJson}
              onChange={handleEditorChangeLogin}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                formatOnPaste: true,
                smoothScrolling: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </TabsContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 bg-white/40 p-6 backdrop-blur-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Eye className="h-4 w-4 text-primary" />
              <span>As alterações refletirão globalmente e em tempo real.</span>
            </div>
            <span className="text-xs text-muted-foreground pl-6">O motor de IA otimizará a entrega dos componentes via CDN Edge.</span>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="rounded-full shadow-teal font-semibold px-8 hover:scale-105 transition-transform duration-300"
          >
            {saving ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Publicar Arquitetura
              </>
            )}
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  );
}