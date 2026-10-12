'use client';

import * as React from 'react';
import Link from 'next/link';
import { Download, FileCheck2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import {
  FRASE_DE_EXCLUSAO,
  ROTA_POLITICA_DE_PRIVACIDADE,
  ROTA_TERMOS_DE_USO,
  ROTULO_DO_CONSENTIMENTO,
  type TipoDeConsentimento,
} from '@/lib/lgpd/documentos';

interface Consentimento {
  consent_type: TipoDeConsentimento;
  document_version: string;
  accepted_at: string;
}

function dataBr(valor: string) {
  // "AAAA-MM-DD..." vindo do banco (UTC) ou da versão do documento.
  const [ano, mes, dia] = valor.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

/**
 * Direitos do titular (LGPD, art. 18) na própria conta: consentimentos dados,
 * cópia de todos os dados (portabilidade) e exclusão da conta.
 */
export function PrivacyDataCard() {
  const { db } = useAuth();
  const [consentimentos, setConsentimentos] = React.useState<
    Consentimento[] | null
  >(null);
  const [erroAoCarregar, setErroAoCarregar] = React.useState(false);
  const [exportando, setExportando] = React.useState(false);
  const [dialogoAberto, setDialogoAberto] = React.useState(false);
  const [senha, setSenha] = React.useState('');
  const [frase, setFrase] = React.useState('');
  const [excluindo, setExcluindo] = React.useState(false);
  const [erroDeExclusao, setErroDeExclusao] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    let ativo = true;
    fetch('/api/account/consents', { credentials: 'include' })
      .then(async (resposta) => {
        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`);
        }
        const corpo = (await resposta.json()) as {
          consentimentos: Consentimento[];
        };
        if (ativo) setConsentimentos(corpo.consentimentos);
      })
      .catch((falha: unknown) => {
        console.error('Falha ao carregar os consentimentos:', falha);
        if (ativo) setErroAoCarregar(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function baixarDados() {
    setExportando(true);
    try {
      const resposta = await fetch('/api/account/export', {
        credentials: 'include',
      });
      if (!resposta.ok) {
        const corpo = (await resposta.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(corpo?.error ?? `HTTP ${resposta.status}`);
      }
      const arquivo = await resposta.blob();
      const nome =
        /filename="([^"]+)"/.exec(
          resposta.headers.get('content-disposition') ?? ''
        )?.[1] ?? 'lyra-meus-dados.json';
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement('a');
      link.href = url;
      link.download = nome;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Arquivo com os seus dados baixado.');
    } catch (falha: unknown) {
      console.error('Falha ao exportar os dados:', falha);
      toast.error('Não foi possível baixar os seus dados agora.');
    } finally {
      setExportando(false);
    }
  }

  async function excluirConta(evento: React.SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroDeExclusao(null);
    setExcluindo(true);
    try {
      const resposta = await fetch('/api/account', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: senha, confirmation: frase }),
      });
      const corpo = (await resposta.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!resposta.ok) {
        setErroDeExclusao(
          corpo?.error ?? 'Não foi possível excluir a conta agora.'
        );
        return;
      }
      toast.success('Sua conta e os seus dados foram excluídos.');
      setDialogoAberto(false);
      // A sessão já foi encerrada no servidor; o app volta para a entrada.
      await db.auth.signOut();
    } catch (falha: unknown) {
      console.error('Falha ao excluir a conta:', falha);
      setErroDeExclusao('Sem conexão com o servidor. Tente novamente.');
    } finally {
      setExcluindo(false);
    }
  }

  const fraseConfere = frase.trim().toUpperCase() === FRASE_DE_EXCLUSAO;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-primary" aria-hidden="true" />
          Privacidade e dados
        </CardTitle>
        <CardDescription>
          Seus direitos pela LGPD. Os seus dados de saúde são só seus; leia a{' '}
          <Link
            href={ROTA_POLITICA_DE_PRIVACIDADE}
            className="font-medium text-primary underline underline-offset-2"
          >
            política de privacidade
          </Link>{' '}
          e os{' '}
          <Link
            href={ROTA_TERMOS_DE_USO}
            className="font-medium text-primary underline underline-offset-2"
          >
            termos de uso
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <section aria-labelledby="titulo-consentimentos">
          <h3
            id="titulo-consentimentos"
            className="text-sm font-semibold text-foreground"
          >
            Consentimentos
          </h3>
          {erroAoCarregar ? (
            <p className="mt-2 text-sm text-destructive">
              Não foi possível carregar os consentimentos.
            </p>
          ) : consentimentos === null ? (
            <Skeleton className="mt-2 h-16 w-full" />
          ) : consentimentos.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum consentimento registrado nesta conta.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-border rounded-md border border-border">
              {consentimentos.map((item) => (
                <li
                  key={`${item.consent_type}-${item.document_version}`}
                  className="flex flex-col gap-0.5 px-3 py-2.5 text-sm"
                >
                  <span className="font-medium text-foreground">
                    {ROTULO_DO_CONSENTIMENTO[item.consent_type]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Versão de {dataBr(item.document_version)} · aceito em{' '}
                    {dataBr(item.accepted_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={baixarDados}
            disabled={exportando}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {exportando ? 'Preparando arquivo...' : 'Baixar meus dados'}
          </Button>
          <p className="text-xs leading-5 text-muted-foreground">
            Um arquivo JSON com todos os dados da sua conta (perfil, métricas,
            metas, hábitos, planos, agenda, assinaturas, compras e
            consentimentos).
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setErroDeExclusao(null);
              setDialogoAberto(true);
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Excluir minha conta
          </Button>
          <p className="text-xs leading-5 text-muted-foreground">
            Apaga a conta e todos os dados pessoais e de saúde. Ficam só os
            registros fiscais das compras, exigidos por lei e sem ligação com a
            sua saúde.
          </p>
        </div>
      </CardContent>

      <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={excluirConta} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Excluir a conta definitivamente?</DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita. Perfil, métricas, metas,
                hábitos, planos, agenda, assinaturas e consentimentos são
                apagados agora. Se houver uma assinatura paga com renovação
                ativa, cancele a renovação no portal de cobrança antes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="exclusao-senha">Senha atual</Label>
              <Input
                id="exclusao-senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exclusao-frase">
                Digite <strong>{FRASE_DE_EXCLUSAO}</strong> para confirmar
              </Label>
              <Input
                id="exclusao-frase"
                autoComplete="off"
                required
                value={frase}
                onChange={(e) => setFrase(e.target.value)}
              />
            </div>
            {erroDeExclusao ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {erroDeExclusao}
              </p>
            ) : null}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogoAberto(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={excluindo || !fraseConfere || senha.trim() === ''}
              >
                {excluindo ? 'Excluindo...' : 'Excluir definitivamente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
