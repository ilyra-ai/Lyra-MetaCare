'use client';

import * as React from 'react';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

/**
 * Troca do e-mail de login. Fica fora do formulário de dados pessoais porque
 * exige a senha atual e passa por uma rota própria (/api/account/email), que
 * atualiza a conta e o perfil juntos e recusa e-mail de outra conta (409).
 */
export function AccountEmailCard() {
  const { db, session } = useAuth();
  const [novoEmail, setNovoEmail] = React.useState('');
  const [senhaAtual, setSenhaAtual] = React.useState('');
  const [enviando, setEnviando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const emailAtual = session?.user.email ?? '';

  async function trocarEmail(evento: React.SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch('/api/account/email', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: novoEmail,
          currentPassword: senhaAtual,
        }),
      });
      const corpo = (await resposta.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!resposta.ok) {
        setErro(corpo?.error ?? 'Não foi possível trocar o e-mail agora.');
        return;
      }

      // A sessão (com o novo e-mail) é relida para o app inteiro.
      await db.auth.refreshSession();
      setNovoEmail('');
      setSenhaAtual('');
      toast.success('E-mail de login atualizado.', {
        description: 'Use o novo e-mail na próxima vez que entrar.',
      });
    } catch (falha: unknown) {
      console.error('Falha ao trocar o e-mail:', falha);
      setErro('Sem conexão com o servidor. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
          E-mail de login
        </CardTitle>
        <CardDescription className="break-words">
          Atual:{' '}
          <span className="font-medium text-foreground">{emailAtual}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={trocarEmail} className="flex flex-col gap-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="novo-email">Novo e-mail</Label>
            <Input
              id="novo-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? 'erro-troca-email' : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha-atual-email">Senha atual</Label>
            <Input
              id="senha-atual-email"
              type="password"
              autoComplete="current-password"
              required
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
          </div>
          {erro ? (
            <p
              id="erro-troca-email"
              role="alert"
              className="text-sm font-medium text-destructive"
            >
              {erro}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="outline"
            disabled={
              enviando ||
              novoEmail.trim().length === 0 ||
              senhaAtual.trim().length === 0
            }
          >
            {enviando ? 'Atualizando...' : 'Trocar e-mail'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
