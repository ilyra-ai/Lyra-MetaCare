'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Puck } from '@puckeditor/core';
import { Eye, Save, Sparkles, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { PuckPreviewRenderer } from '@/components/admin/puck/PuckPreviewRenderer';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MadeWithIlyra } from '@/components/made-with-ilyra';
import { SplashScreen } from '@/components/SplashScreen';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { obterConfigPuckLyra } from '@/lib/puck/config/base';
import { getInitialPuckData } from '@/lib/puck/config/initial-data';
import { normalizarDadosPuck } from '@/lib/puck/data-utils';
import { aplicarResolveAllDataLyra } from '@/lib/puck/dynamic/resolve-data';
import { obterPermissoesPuckLyra } from '@/lib/puck/permissions/config';
import { lyraPuckViewports } from '@/lib/puck/viewports/config';
import {
  defaultLyraPuckDocumentKey,
  LyraPuckData,
  LyraPuckDocumentKey,
  lyraPuckDocuments,
} from '@/lib/puck/types';

type AdminPuckResponse = {
  documentKey: LyraPuckDocumentKey;
  draftData: LyraPuckData;
  publishedData: LyraPuckData;
  createdAt: string | null;
  updatedAt: string | null;
  updatedByUserId: string | null;
  error?: string;
};

function PuckDeniedState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 p-4">
      <Card className="w-full max-w-md border-destructive/20 text-center">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription className="text-sm leading-7">
            Somente administradores podem acessar o editor visual Puck da Lyra.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export function PuckEditorShell({
  documentKey = defaultLyraPuckDocumentKey,
}: {
  documentKey?: LyraPuckDocumentKey;
}) {
  const router = useRouter();
  const { session } = useAuth();
  const isAdmin = useIsAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [draftData, setDraftData] = useState<LyraPuckData>(
    getInitialPuckData(documentKey)
  );
  const [publishedData, setPublishedData] = useState<LyraPuckData>(
    getInitialPuckData(documentKey)
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedByUserId, setUpdatedByUserId] = useState<string | null>(null);

  const documentDefinition = useMemo(
    () => lyraPuckDocuments.find((item) => item.key === documentKey),
    [documentKey]
  );
  const configAtual = useMemo(
    () => obterConfigPuckLyra(documentKey),
    [documentKey]
  );
  const permissoesDocumento = useMemo(
    () => obterPermissoesPuckLyra(documentKey),
    [documentKey]
  );
  const normalizarDadosEditor = useCallback(
    (nextData: unknown) =>
      normalizarDadosPuck(nextData, getInitialPuckData(documentKey)),
    [documentKey]
  );
  const resolverDadosDocumento = useCallback(
    async (nextData: LyraPuckData) =>
      normalizarDadosEditor(
        await aplicarResolveAllDataLyra(
          normalizarDadosEditor(nextData),
          configAtual
        )
      ),
    [configAtual, normalizarDadosEditor]
  );

  const hydrateFromResponse = useCallback((payload: AdminPuckResponse) => {
    setDraftData(payload.draftData);
    setPublishedData(payload.publishedData);
    setUpdatedAt(payload.updatedAt);
    setUpdatedByUserId(payload.updatedByUserId);
  }, []);

  // Busca o documento e resolve os dados dinâmicos, sem alterar estado.
  const requestDocument = useCallback(async () => {
    const response = await fetch(`/api/admin/puck/documents/${documentKey}`, {
      method: 'GET',
      cache: 'no-store',
    });
    const payload = (await response.json()) as AdminPuckResponse;

    if (!response.ok) {
      throw new Error(
        payload.error || 'Não foi possível carregar o documento do Puck.'
      );
    }

    const [draftResolvido, publishedResolvido] = await Promise.all([
      resolverDadosDocumento(payload.draftData),
      resolverDadosDocumento(payload.publishedData),
    ]);

    return {
      ...payload,
      draftData: draftResolvido,
      publishedData: publishedResolvido,
    };
  }, [documentKey, resolverDadosDocumento]);

  const notifyLoadError = useCallback((error: unknown) => {
    toast.error(
      error instanceof Error
        ? error.message
        : 'Falha inesperada ao carregar o documento Puck.'
    );
  }, []);

  // Botão "Recarregar": mostra o carregamento e reidrata o editor.
  const loadDocument = useCallback(() => {
    setLoading(true);
    return requestDocument()
      .then(hydrateFromResponse)
      .catch(notifyLoadError)
      .finally(() => setLoading(false));
  }, [hydrateFromResponse, notifyLoadError, requestDocument]);

  // Carga inicial (o estado inicial já é "carregando").
  useEffect(() => {
    if (!session || !isAdmin) {
      return;
    }

    let active = true;
    requestDocument()
      .then((resolved) => {
        if (active) hydrateFromResponse(resolved);
      })
      .catch((error: unknown) => {
        if (active) notifyLoadError(error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hydrateFromResponse, isAdmin, notifyLoadError, requestDocument, session]);

  const handleSaveDraft = useCallback(async () => {
    setSaving(true);

    try {
      const draftResolvido = await resolverDadosDocumento(draftData);
      const response = await fetch(`/api/admin/puck/documents/${documentKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draftData: draftResolvido,
        }),
      });
      const payload = (await response.json()) as AdminPuckResponse;

      if (!response.ok) {
        throw new Error(
          payload.error || 'Não foi possível salvar o rascunho do Puck.'
        );
      }

      const publishedResolvido = await resolverDadosDocumento(
        payload.publishedData
      );

      hydrateFromResponse({
        ...payload,
        draftData: draftResolvido,
        publishedData: publishedResolvido,
      });
      toast.success('Rascunho do Puck salvo com sucesso.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Falha inesperada ao salvar o rascunho do Puck.'
      );
    } finally {
      setSaving(false);
    }
  }, [documentKey, draftData, hydrateFromResponse, resolverDadosDocumento]);

  const handlePublish = useCallback(
    async (nextData: LyraPuckData) => {
      setPublishing(true);

      try {
        const draftResolvido = await resolverDadosDocumento(nextData);
        const response = await fetch(
          `/api/admin/puck/documents/${documentKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'publish',
              draftData: draftResolvido,
            }),
          }
        );
        const payload = (await response.json()) as AdminPuckResponse;

        if (!response.ok) {
          throw new Error(
            payload.error || 'Não foi possível publicar o documento do Puck.'
          );
        }

        hydrateFromResponse({
          ...payload,
          draftData: draftResolvido,
          publishedData: draftResolvido,
        });
        toast.success('Documento Puck publicado com sucesso.');
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Falha inesperada ao publicar o documento do Puck.'
        );
      } finally {
        setPublishing(false);
      }
    },
    [documentKey, hydrateFromResponse, resolverDadosDocumento]
  );

  const handleTrocaDocumento = useCallback(
    (nextDocumentKey: string) => {
      if (!session || !isAdmin) {
        return;
      }

      router.push(`/admin/puck?documentKey=${nextDocumentKey}`);
    },
    [isAdmin, router, session]
  );

  if (session === undefined) {
    return <SplashScreen />;
  }

  if (!session || !isAdmin) {
    return <PuckDeniedState />;
  }

  return (
    <div className="flex min-h-screen bg-background/80">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main id="conteudo-principal" className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6">
            <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(249,248,252,0.92),rgba(237,233,254,0.24),rgba(255,255,255,0.96))]">
              <CardHeader className="gap-4">
                <Badge className="w-fit rounded-full border-cosmic/20 bg-cosmic/10 px-4 py-1.5 text-cosmic">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  puck integrado ao lyra customaze ui ux
                </Badge>

                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="max-w-4xl space-y-3">
                    <CardTitle
                      className="text-3xl"
                      role="heading"
                      aria-level={2}
                    >
                      Lyra Customaze UI UX — Editor Visual
                    </CardTitle>
                    <CardDescription className="text-sm leading-7">
                      Editor visual premium da Lyra com suporte a fontes de
                      dados externas, viewports responsivos, permissões por
                      papel, migração de dados, componentes de servidor e
                      portais de overlay. Persistência real em MySQL.
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={documentKey}
                      onValueChange={handleTrocaDocumento}
                    >
                      <label htmlFor="puck-superficie" className="sr-only">
                        Superfície em edição
                      </label>
                      <SelectTrigger
                        id="puck-superficie"
                        className="min-w-[240px] bg-white/90"
                      >
                        <SelectValue placeholder="Escolha a superfície" />
                      </SelectTrigger>
                      <SelectContent>
                        {lyraPuckDocuments.map((item) => (
                          <SelectItem key={item.key} value={item.key}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="secondary"
                      onClick={() => void loadDocument()}
                      disabled={loading || saving || publishing}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Recarregar documento
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => void handleSaveDraft()}
                      disabled={loading || saving || publishing}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Salvando rascunho...' : 'Salvar rascunho'}
                    </Button>
                    <Button
                      onClick={() => void handlePublish(draftData)}
                      disabled={loading || saving || publishing}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {publishing ? 'Publicando...' : 'Publicar agora'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-4 border-t border-border/70 bg-white/70 p-6 xl:grid-cols-3">
                <div className="rounded-[24px] border border-border/70 bg-white/88 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Documento
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {documentDefinition?.label ?? documentKey}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    {documentDefinition?.description ??
                      'Documento inicial do editor Puck.'}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Chave estrutural: {documentDefinition?.surfaceKey ?? 'n/d'}
                  </p>
                </div>

                <div className="rounded-[24px] border border-border/70 bg-white/88 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Última atualização
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {updatedAt ?? 'Ainda não persistido em banco'}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    Usuário responsável: {updatedByUserId ?? 'não identificado'}
                  </p>
                </div>

                <div className="rounded-[24px] border border-border/70 bg-white/88 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Estado atual
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="default">editor ativo</Badge>
                    <Badge variant="info">preview com render</Badge>
                    <Badge variant="success">mysql persistente</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <Card>
                <CardContent className="px-6 py-10 text-sm leading-7 text-muted-foreground">
                  Carregando documento do Puck...
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="overflow-hidden border-border/70 bg-white/92">
                  <CardHeader className="border-b border-border/70">
                    <CardTitle className="text-xl">
                      Canvas do editor Puck
                    </CardTitle>
                    <CardDescription className="text-sm leading-7">
                      O bloco abaixo é o editor oficial do Puck rodando dentro
                      da Lyra. O botão publicar do próprio editor e os botões do
                      topo persistem o documento de forma real.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="min-h-[860px]">
                      <Puck
                        config={configAtual}
                        data={draftData}
                        headerTitle="Lyra Customaze UI UX"
                        headerPath={documentKey}
                        viewports={[...lyraPuckViewports]}
                        permissions={permissoesDocumento}
                        onChange={(nextData) =>
                          setDraftData(normalizarDadosEditor(nextData))
                        }
                        onAction={(_action, appState) =>
                          setDraftData(normalizarDadosEditor(appState.data))
                        }
                        onPublish={(nextData) => {
                          const nextDataNormalizado =
                            normalizarDadosEditor(nextData);

                          setDraftData(nextDataNormalizado);
                          void handlePublish(nextDataNormalizado);
                        }}
                        height="860px"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-2">
                  <PuckPreviewRenderer
                    title="Preview do rascunho atual"
                    description="Este painel usa o componente oficial Render com o rascunho em memória do editor."
                    badgeLabel="rascunho atual"
                    data={draftData}
                    documentKey={documentKey}
                  />

                  <PuckPreviewRenderer
                    title="Preview do último publicado"
                    description="Este painel usa o mesmo Render, mas aponta para o último documento efetivamente publicado."
                    badgeLabel="último publicado"
                    data={publishedData}
                    documentKey={documentKey}
                  />
                </div>
              </>
            )}
          </div>
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}
