'use client';

import { CSSProperties, SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { MarcaLyra } from '@/components/marca/MarcaLyra';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { LoginPageConfig, ToneKey } from '@/lib/site-page-config/schema';
import { getBuilderIcon } from '@/lib/site-page-config/ui';
import { ThemeToggleButton } from '@/components/theme/ThemeControls';
import { PuckClientRenderer } from '@/components/puck/PuckClientRenderer';
import {
  ROTA_POLITICA_DE_PRIVACIDADE,
  ROTA_TERMOS_DE_USO,
} from '@/lib/lgpd/documentos';

type SubmitMode = 'login' | 'register' | null;

// No visual "Lyra Clean" o coral fica reservado ao que é astral/IA; os
// demais destaques usam o teal da marca.
function corDoIconeDestaque(tone: ToneKey): string {
  return tone === 'cosmic' ? 'text-cosmic' : 'text-primary';
}

type LoginExperienceProps = {
  // Configuração em edição no Site Experience Builder (pré-visualização).
  overrideConfig?: LoginPageConfig;
  previewMode?: boolean;
};

// Converte a escala tipográfica configurada pelo admin (0,8 a 1,4) em um
// tamanho fluido, mantendo a proporção do design base.
function escalaFluida(
  baseRem: number,
  escala: number
): Pick<CSSProperties, 'fontSize'> {
  const min = (baseRem * 0.85 * escala).toFixed(3);
  const ideal = (baseRem * escala).toFixed(3);
  const max = (baseRem * 1.12 * escala).toFixed(3);
  return { fontSize: `clamp(${min}rem, ${ideal}rem, ${max}rem)` };
}

// Para o título grande: acompanha a largura da tela (≈ 2/3 do tamanho base
// em 390px, o tamanho base perto de 1280px), para que no celular ele não
// ocupe metade da primeira dobra. A escala do admin continua valendo.
function escalaResponsiva(
  baseRem: number,
  escala: number
): Pick<CSSProperties, 'fontSize'> {
  const min = (baseRem * 0.66 * escala).toFixed(3);
  const fixo = (baseRem * 0.52 * escala).toFixed(3);
  const proporcional = (baseRem * 0.6 * escala).toFixed(3);
  const max = (baseRem * 1.12 * escala).toFixed(3);
  return {
    fontSize: `clamp(${min}rem, calc(${fixo}rem + ${proporcional}vw), ${max}rem)`,
  };
}

export function LoginExperience({
  overrideConfig,
  previewMode = false,
}: LoginExperienceProps) {
  // Depois do login ou do cadastro, o AuthProvider leva a sessão ao destino
  // certo (onboarding para conta nova, painel para as demais) numa única
  // navegação; antes esta tela ia ao painel e só então ao onboarding.
  const { db } = useAuth();
  const { config: publicConfig } = usePublicSitePageConfig('login');
  const config = overrideConfig ?? publicConfig;
  const { intro, auth, typography, sizing } = config;

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [submitMode, setSubmitMode] = useState<SubmitMode>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Alterna entre as visões de login e cadastro.
  const [isRegistering, setIsRegistering] = useState(false);
  // "Lembrar-me": sessão de 7 dias quando marcado; sessão de navegador quando
  // desmarcado (ver src/lib/auth/session.ts).
  const [rememberMe, setRememberMe] = useState(false);
  // LGPD: o cadastro exige o aceite dos termos e da política de privacidade.
  const [aceiteDosTermos, setAceiteDosTermos] = useState(false);

  const iconStyle: CSSProperties = {
    width: `${(1.125 * sizing.iconScale).toFixed(3)}rem`,
    height: `${(1.125 * sizing.iconScale).toFixed(3)}rem`,
  };
  const buttonStyle: CSSProperties = {
    height: `${(3 * sizing.buttonScale).toFixed(3)}rem`,
    ...escalaFluida(0.9375, typography.buttonLabel),
  };
  const fieldStyle = escalaFluida(0.9375, typography.fieldLabel);
  const labelStyle = escalaFluida(0.875, typography.fieldLabel);

  async function handleLogin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (previewMode) return;

    setSubmitMode('login');

    const { error } = await db.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
      remember: rememberMe,
    });

    setSubmitMode(null);

    if (error) {
      toast.error('Não foi possível entrar agora.', {
        description: error.message,
      });
      return;
    }

    toast.success('Que bom te receber de novo.');
  }

  async function handleRegister(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (previewMode) return;

    setSubmitMode('register');

    const { error } = await db.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      firstName: registerFirstName,
      lastName: registerLastName,
      acceptTerms: aceiteDosTermos,
    });

    setSubmitMode(null);

    if (error) {
      toast.error('Não foi possível criar sua conta agora.', {
        description: error.message,
      });
      return;
    }

    toast.success('Conta criada com sucesso. Vamos abrir sua jornada.');
  }

  // Ícone à esquerda dentro do campo (decorativo; o rótulo é o nome acessível).
  const fieldIconWrapperClass =
    'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5';
  const fieldIconClass =
    'text-muted-foreground transition-colors group-focus-within:text-primary';

  const larguraDaIntroducao = {
    maxWidth: `${Math.round(560 * sizing.introCard)}px`,
  };
  const paddingDaColunaEsquerda = 'px-6 sm:px-10 lg:px-16';

  // Ordem do conteúdo (DOM e leitura): marca → título → formulário →
  // detalhes da introdução → volta à landing. No celular é exatamente essa a
  // ordem na tela, então o formulário aparece logo na primeira dobra (antes
  // vinha depois de todo o texto de apresentação). A partir de `lg`, a grade
  // devolve o desenho em duas colunas: apresentação à esquerda (título e
  // detalhes centralizados na altura) e formulário à direita.
  return (
    <main
      id={previewMode ? undefined : 'conteudo-principal'}
      className="grid min-h-dvh w-full grid-cols-1 content-start bg-background font-sans text-foreground lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] lg:content-stretch"
    >
      <div
        className={cn(
          'flex min-w-0 items-center gap-2.5 pt-6 sm:pt-10 lg:col-start-1 lg:row-start-1 lg:pt-14',
          paddingDaColunaEsquerda
        )}
      >
        <MarcaLyra tamanho="40px" prioridade />
        <span className="font-display text-xl font-semibold lowercase tracking-tight text-foreground">
          {auth.brandText}
        </span>
        {/* Na pré-visualização do construtor o botão mudaria o tema do
            próprio painel administrativo. */}
        {previewMode ? null : <ThemeToggleButton className="ml-auto" />}
      </div>

      {intro.visible ? (
        <div
          className={cn(
            'min-w-0 pb-6 pt-6 lg:col-start-1 lg:row-start-2 lg:self-end lg:pb-0 lg:pt-10',
            paddingDaColunaEsquerda
          )}
        >
          <div style={larguraDaIntroducao}>
            <p className="mb-3 text-sm font-medium text-primary lg:mb-4">
              {intro.badgeText}
            </p>
            <h1
              className="font-display font-semibold leading-[1.08] tracking-[-0.03em] text-foreground break-words"
              style={escalaResponsiva(3, typography.introTitle)}
            >
              {intro.title}
            </h1>
          </div>
        </div>
      ) : null}

      {/* Formulário: logo após o título no celular; coluna direita no desktop */}
      <section className="flex min-w-0 items-start justify-center border-y border-border bg-card px-6 py-8 sm:px-10 sm:py-10 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:items-center lg:border-y-0 lg:border-l lg:px-12 lg:py-14">
        <div
          className="w-full"
          style={{ maxWidth: `${Math.round(400 * sizing.authCard)}px` }}
        >
          {/* Selo e descrição do bloco de acesso, editáveis no construtor de
              UI (login.auth.badgeText e login.auth.description). */}
          <p className="mb-2 text-sm font-medium text-primary">
            {auth.badgeText}
          </p>
          <h2
            className="font-display font-semibold tracking-tight text-foreground"
            style={escalaFluida(1.75, typography.authTitle)}
          >
            {isRegistering ? auth.registerTabLabel : auth.loginTabLabel}
          </h2>
          <p
            className="mt-2 leading-relaxed text-muted-foreground"
            style={escalaFluida(0.9375, typography.authBody)}
          >
            {auth.title}
          </p>
          <p
            className="mt-1 leading-relaxed text-muted-foreground"
            style={escalaFluida(0.8125, typography.authBody)}
          >
            {auth.description}
          </p>

          <Tabs
            value={isRegistering ? 'register' : 'login'}
            onValueChange={(value) => setIsRegistering(value === 'register')}
            className="mt-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{auth.loginTabLabel}</TabsTrigger>
              <TabsTrigger value="register">
                {auth.registerTabLabel}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="login-email"
                    className="font-medium text-foreground"
                    style={labelStyle}
                  >
                    {auth.emailLabel}
                  </Label>
                  <div className="group relative">
                    <div className={fieldIconWrapperClass}>
                      <User
                        className={fieldIconClass}
                        style={iconStyle}
                        aria-hidden
                      />
                    </div>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder={auth.emailLabel}
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-11"
                      style={fieldStyle}
                      disabled={previewMode}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="login-password"
                    className="font-medium text-foreground"
                    style={labelStyle}
                  >
                    {auth.passwordLabel}
                  </Label>
                  <div className="group relative">
                    <div className={fieldIconWrapperClass}>
                      <Lock
                        className={fieldIconClass}
                        style={iconStyle}
                        aria-hidden
                      />
                    </div>
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder={auth.passwordLabel}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-11 pr-11"
                      style={fieldStyle}
                      disabled={previewMode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[10px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {showPassword ? (
                        <EyeOff className="h-[18px] w-[18px]" aria-hidden />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" aria-hidden />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex min-h-11 items-center gap-2.5">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                    disabled={previewMode}
                  />
                  <Label
                    htmlFor="remember"
                    className="flex min-h-11 cursor-pointer items-center text-sm font-normal text-foreground"
                  >
                    Lembrar-me por 7 dias
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={previewMode || submitMode === 'login'}
                  className="w-full rounded-md font-semibold"
                  style={buttonStyle}
                >
                  {submitMode === 'login'
                    ? 'Entrando...'
                    : auth.loginButtonLabel}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="reg-firstname"
                      className="font-medium text-foreground"
                      style={labelStyle}
                    >
                      {auth.firstNameLabel}
                    </Label>
                    <Input
                      id="reg-firstname"
                      autoComplete="given-name"
                      placeholder={auth.firstNameLabel}
                      required
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                      style={fieldStyle}
                      disabled={previewMode}
                    />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="reg-lastname"
                      className="font-medium text-foreground"
                      style={labelStyle}
                    >
                      {auth.lastNameLabel}
                    </Label>
                    <Input
                      id="reg-lastname"
                      autoComplete="family-name"
                      placeholder={auth.lastNameLabel}
                      required
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                      style={fieldStyle}
                      disabled={previewMode}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reg-email"
                    className="font-medium text-foreground"
                    style={labelStyle}
                  >
                    {auth.emailLabel}
                  </Label>
                  <div className="group relative">
                    <div className={fieldIconWrapperClass}>
                      <Mail
                        className={fieldIconClass}
                        style={iconStyle}
                        aria-hidden
                      />
                    </div>
                    <Input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      placeholder={auth.emailLabel}
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-11"
                      style={fieldStyle}
                      disabled={previewMode}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reg-password"
                    className="font-medium text-foreground"
                    style={labelStyle}
                  >
                    {auth.passwordLabel}
                  </Label>
                  <div className="group relative">
                    <div className={fieldIconWrapperClass}>
                      <Lock
                        className={fieldIconClass}
                        style={iconStyle}
                        aria-hidden
                      />
                    </div>
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={auth.passwordLabel}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-11"
                      style={fieldStyle}
                      disabled={previewMode}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="aceite-termos"
                    checked={aceiteDosTermos}
                    onCheckedChange={(checked) =>
                      setAceiteDosTermos(checked === true)
                    }
                    disabled={previewMode}
                    className="mt-3"
                    aria-describedby="aceite-termos-ajuda"
                  />
                  <div className="min-w-0">
                    <Label
                      htmlFor="aceite-termos"
                      className="flex min-h-11 cursor-pointer items-center text-sm font-normal leading-snug text-foreground"
                    >
                      Li e aceito os termos de uso e a política de privacidade.
                    </Label>
                    <p
                      id="aceite-termos-ajuda"
                      className="text-xs leading-5 text-muted-foreground"
                    >
                      Leia os{' '}
                      <Link
                        href={ROTA_TERMOS_DE_USO}
                        target="_blank"
                        className="font-medium text-primary underline underline-offset-2"
                      >
                        termos de uso
                        <span className="sr-only"> (abre em nova aba)</span>
                      </Link>{' '}
                      e a{' '}
                      <Link
                        href={ROTA_POLITICA_DE_PRIVACIDADE}
                        target="_blank"
                        className="font-medium text-primary underline underline-offset-2"
                      >
                        política de privacidade
                        <span className="sr-only"> (abre em nova aba)</span>
                      </Link>
                      .
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    previewMode || submitMode === 'register' || !aceiteDosTermos
                  }
                  className="w-full rounded-md font-semibold"
                  style={buttonStyle}
                >
                  {submitMode === 'register'
                    ? 'Criando...'
                    : auth.registerButtonLabel}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-1 inline-flex min-h-11 items-center rounded-sm px-1 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isRegistering ? auth.loginTabLabel : auth.registerTabLabel}
            </button>
          </p>

          <p
            className="mt-6 border-t border-border pt-5 text-center leading-5 text-muted-foreground"
            style={escalaFluida(0.8125, typography.footerText)}
          >
            <span className="font-medium text-foreground">
              {auth.footerEyebrow}
            </span>{' '}
            · {auth.footerText}
          </p>
        </div>
      </section>

      {intro.visible ? (
        <div
          className={cn(
            'min-w-0 pt-8 lg:col-start-1 lg:row-start-3 lg:self-start lg:pt-4',
            paddingDaColunaEsquerda
          )}
        >
          <div style={larguraDaIntroducao}>
            <p
              className="font-display font-medium tracking-tight text-foreground/80"
              style={escalaFluida(1.375, typography.introTitle)}
            >
              {intro.accentTitle}
            </p>
            <p
              className="mt-5 leading-relaxed text-muted-foreground"
              style={escalaFluida(1.125, typography.introBody)}
            >
              {intro.description}
            </p>

            {intro.highlights.length > 0 ? (
              <ul className="mt-8 flex flex-col gap-4">
                {intro.highlights.map((highlight) => {
                  const HighlightIcon = getBuilderIcon(highlight.icon);
                  return (
                    <li
                      key={highlight.id}
                      className="flex items-start gap-3 leading-6"
                      style={escalaFluida(0.9375, typography.highlightBody)}
                    >
                      <HighlightIcon
                        className={cn(
                          'mt-0.5 h-5 w-5 shrink-0',
                          corDoIconeDestaque(highlight.tone)
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <strong
                          className="font-semibold text-foreground"
                          style={escalaFluida(
                            0.9375,
                            typography.highlightTitle
                          )}
                        >
                          {highlight.title}
                        </strong>
                        <span className="sr-only">:</span>{' '}
                        <span className="text-muted-foreground">
                          {highlight.description}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {/* Nota da introdução (login.intro.noteEyebrow e noteText). */}
            <p
              className="mt-8 border-l-2 border-primary pl-4 leading-6 text-muted-foreground"
              style={escalaFluida(0.875, typography.introBody)}
            >
              <span className="block font-medium text-foreground">
                {intro.noteEyebrow}
              </span>
              {intro.noteText}
            </p>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          'pb-8 pt-6 sm:pb-10 lg:col-start-1 lg:row-start-4 lg:pb-14 lg:pt-8',
          paddingDaColunaEsquerda
        )}
      >
        <Link
          href="/"
          className="-mx-1 inline-flex min-h-11 w-fit items-center gap-2 rounded-sm px-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {auth.backToLandingLabel}
        </Link>
        <nav
          aria-label="Documentos legais"
          className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground"
        >
          <Link
            href={ROTA_POLITICA_DE_PRIVACIDADE}
            className="inline-flex min-h-11 items-center underline-offset-4 hover:text-foreground hover:underline"
          >
            Política de privacidade
          </Link>
          <Link
            href={ROTA_TERMOS_DE_USO}
            className="inline-flex min-h-11 items-center underline-offset-4 hover:text-foreground hover:underline"
          >
            Termos de uso
          </Link>
        </nav>
      </div>

      {/* Blocos publicados no editor Puck (documento "login-experience"),
          em largura total abaixo da tela de acesso. Sem blocos publicados,
          nada é exibido. */}
      <PuckClientRenderer
        documentKey="login-experience"
        className="w-full border-t border-border lg:col-span-2 lg:row-start-5"
      />
    </main>
  );
}
