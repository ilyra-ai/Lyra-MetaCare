'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Loader2,
  Plus,
  ScrollText,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface AiKnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

const CATEGORY_OPTIONS = [
  { value: 'skill', label: 'Skill', icon: Sparkles },
  { value: 'treinamento', label: 'Treinamento', icon: GraduationCap },
  { value: 'instrucao', label: 'Instrução', icon: ScrollText },
  { value: 'conhecimento', label: 'Base de conhecimento', icon: BookOpen },
] as const;

function categoryMeta(value: string) {
  return (
    CATEGORY_OPTIONS.find((option) => option.value === value) ??
    CATEGORY_OPTIONS[0]
  );
}

export function AIKnowledgeManager() {
  const { db } = useAuth();
  const [documents, setDocuments] = React.useState<AiKnowledgeDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] =
    React.useState<AiKnowledgeDocument | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState<string>('skill');
  const [content, setContent] = React.useState('');
  const [priority, setPriority] = React.useState('0');

  // Busca pura (sem efeitos colaterais em estado) reutilizada na montagem e
  // nas recargas após criar/alterar documentos.
  const fetchDocuments = React.useCallback(
    () =>
      db
        .from('ai_knowledge_documents')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true }),
    [db]
  );

  const applyDocuments = React.useCallback(
    (result: Awaited<ReturnType<typeof fetchDocuments>>) => {
      if (result.error) {
        toast.error('Erro ao carregar documentos da IA.', {
          description: result.error.message,
        });
        setDocuments([]);
      } else {
        setDocuments((result.data as AiKnowledgeDocument[]) ?? []);
      }
      setLoading(false);
    },
    []
  );

  const loadDocuments = React.useCallback(async () => {
    applyDocuments(await fetchDocuments());
  }, [applyDocuments, fetchDocuments]);

  React.useEffect(() => {
    let active = true;
    fetchDocuments().then((result) => {
      if (active) applyDocuments(result);
    });
    return () => {
      active = false;
    };
  }, [applyDocuments, fetchDocuments]);

  const handleCreate = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length < 3) {
      toast.error('Informe um título com pelo menos 3 caracteres.');
      return;
    }
    if (trimmedContent.length < 10) {
      toast.error(
        'O conteúdo do documento precisa ter pelo menos 10 caracteres.'
      );
      return;
    }

    setIsSaving(true);
    const parsedPriority = Number.parseInt(priority, 10);
    const { error } = await db.from('ai_knowledge_documents').insert({
      title: trimmedTitle,
      category,
      content: trimmedContent,
      is_active: true,
      priority: Number.isFinite(parsedPriority) ? parsedPriority : 0,
    });
    setIsSaving(false);

    if (error) {
      toast.error('Não foi possível salvar o documento.', {
        description: error.message,
      });
      return;
    }

    toast.success('Documento adicionado ao conhecimento da IA.');
    setTitle('');
    setContent('');
    setPriority('0');
    setCategory('skill');
    void loadDocuments();
  };

  const handleToggle = async (
    doc: AiKnowledgeDocument,
    nextActive: boolean
  ) => {
    setTogglingId(doc.id);
    const { error } = await db
      .from('ai_knowledge_documents')
      .update({ is_active: nextActive })
      .eq('id', doc.id);
    setTogglingId(null);

    if (error) {
      toast.error('Falha ao atualizar o status do documento.', {
        description: error.message,
      });
      return;
    }

    setDocuments((prev) =>
      prev.map((item) =>
        item.id === doc.id ? { ...item, is_active: nextActive } : item
      )
    );
    toast.success(
      `Documento "${doc.title}" ${nextActive ? 'ativado' : 'desativado'}.`
    );
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;
    setIsDeleting(true);
    const { error } = await db
      .from('ai_knowledge_documents')
      .delete()
      .eq('id', documentToDelete.id);
    setIsDeleting(false);

    if (error) {
      toast.error('Falha ao remover o documento.', {
        description: error.message,
      });
      return;
    }

    setDocuments((prev) =>
      prev.filter((item) => item.id !== documentToDelete.id)
    );
    toast.success('Documento removido.');
    setDocumentToDelete(null);
  };

  const activeCount = documents.filter((doc) => doc.is_active).length;

  return (
    <>
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cosmic-light text-cosmic"
                aria-hidden="true"
              >
                <BookOpen className="h-5 w-5" />
              </span>
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-xl">
                  Documentos, Skills e Treinamentos da IA
                </CardTitle>
                <CardDescription className="max-w-2xl">
                  Adicione documentos que o modelo usará como habilidades,
                  treinamentos e base de conhecimento — definindo o que a IA
                  deve saber, fazer e executar no app. Apenas documentos ativos
                  são injetados em tempo real no contexto do assistente.
                </CardDescription>
              </div>
            </div>
            <Badge variant="cosmic">
              {activeCount} ativo{activeCount === 1 ? '' : 's'} /{' '}
              {documents.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Formulário de criação */}
          <form
            onSubmit={handleCreate}
            className="space-y-5 rounded-md border border-border bg-background p-5"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="ai-doc-title"
                  className="text-sm font-semibold text-foreground"
                >
                  Título do documento
                </label>
                <Input
                  id="ai-doc-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex: Protocolo de resposta para crises de ansiedade"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="ai-doc-category"
                  className="text-sm font-semibold text-foreground"
                >
                  Categoria
                </label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={isSaving}
                >
                  <SelectTrigger id="ai-doc-category">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <Icon
                              className="h-4 w-4 text-cosmic"
                              aria-hidden="true"
                            />
                            {option.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="ai-doc-content"
                className="text-sm font-semibold text-foreground"
              >
                Conteúdo (instruções, skill ou treinamento)
              </label>
              <Textarea
                id="ai-doc-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={6}
                placeholder="Descreva detalhadamente o que a IA deve saber, fazer ou executar. Ex: passos, regras, tom de voz, limites, ações no app, exemplos."
                className="resize-none"
                disabled={isSaving}
              />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="ai-doc-priority"
                  className="text-sm font-semibold text-foreground"
                >
                  Prioridade
                </label>
                <Input
                  id="ai-doc-priority"
                  type="number"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="w-28"
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  Maior = aplicada primeiro no contexto.
                </p>
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Adicionar documento
              </Button>
            </div>
          </form>

          {/* Lista de documentos */}
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-background p-10 text-center">
              <FileText
                className="h-10 w-10 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-base font-semibold text-foreground">
                Nenhum documento configurado
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Adicione o primeiro documento acima para começar a treinar e
                orientar o comportamento da IA no app.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const meta = categoryMeta(doc.category);
                const Icon = meta.icon;
                return (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-3 rounded-md border border-border bg-card p-5 transition-colors hover:border-cosmic/30 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span
                        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cosmic-light text-cosmic"
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="break-words font-semibold text-foreground">
                            {doc.title}
                          </p>
                          <Badge variant="outline">{meta.label}</Badge>
                          {!doc.is_active && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </div>
                        <p className="line-clamp-3 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-muted-foreground">
                          {doc.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                      <div className="flex items-center gap-2">
                        {togglingId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : null}
                        <Switch
                          checked={doc.is_active}
                          onCheckedChange={(checked) =>
                            void handleToggle(doc, checked)
                          }
                          disabled={togglingId === doc.id}
                          aria-label={
                            doc.is_active
                              ? 'Desativar documento'
                              : 'Ativar documento'
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive-light hover:text-destructive"
                        onClick={() => setDocumentToDelete(doc)}
                        aria-label="Remover documento"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={documentToDelete !== null}
        onOpenChange={(open) => !open && setDocumentToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover documento</DialogTitle>
            <DialogDescription>
              Esta ação remove permanentemente o documento &ldquo;
              {documentToDelete?.title}&rdquo; do conhecimento da IA. Deseja
              continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDocumentToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
