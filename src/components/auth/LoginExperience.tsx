'use client';

import { CSSProperties, SubmitEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { LoginPageConfig, ToneKey } from '@/lib/site-page-config/schema';
import { getBuilderIcon } from '@/lib/site-page-config/ui';

type SubmitMode = 'login' | 'register' | null;

// No visual "Lyra Clean" o violeta fica reservado ao que é astral/IA; os
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

export function LoginExperience({
  overrideConfig,
  previewMode = false,
}: LoginExperienceProps) {
  const { session, db } = useAuth();
  const router = useRouter();
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

  useEffect(() => {
    if (!previewMode && session) {
      router.push('/');
    }
  }, [previewMode, router, session]);

  if (!previewMode && session) {
    return null;
  }

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
    router.push('/');
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
    });

    setSubmitMode(null);

    if (error) {
      toast.error('Não foi possível criar sua conta agora.', {
        description: error.message,
      });
      return;
    }

    toast.success('Conta criada com sucesso. Vamos abrir sua jornada.');
    router.push('/');
  }

  // Ícone à esquerda dentro do campo (decorativo; o rótulo é o nome acessível).
  const fieldIconWrapperClass =
    'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5';
  const fieldIconClass =
    'text-muted-foreground transition-colors group-focus-within:text-primary';

  return (
    <main
      id={previewMode ? undefined : 'conteudo-principal'}
      className="grid min-h-screen w-full bg-background font-sans text-foreground lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
    >
      {/* Coluna esquerda: marca, introdução configurável e volta à landing */}
      <section className="flex min-w-0 flex-col gap-10 bg-background px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-14">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary">
            <ShieldCheck
              className="h-5 w-5 text-primary-foreground"
              aria-hidden
            />
          </span>
          <span className="font-display text-xl font-semibold lowercase tracking-tight text-foreground">
            {auth.brandText}
          </span>
        </div>

        {intro.visible ? (
          <div
            className="flex min-w-0 flex-1 flex-col justify-center"
            style={{ maxWidth: `${Math.round(560 * sizing.introCard)}px` }}
          >
            <p className="mb-4 text-sm font-medium text-primary">
              {intro.badgeText}
            </p>
            <h1
              className="font-display font-semibold leading-[1.08] tracking-[-0.03em] text-foreground break-words"
              style={escalaFluida(3, typography.introTitle)}
            >
              {intro.title}
            </h1>
            <p
              className="mt-4 font-display font-medium tracking-tight text-foreground/80"
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
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {auth.backToLandingLabel}
        </Link>
      </section>

      {/* Coluna direita: formulário */}
      <section className="flex min-w-0 items-center justify-center border-t border-border bg-card px-6 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-12 lg:py-14">
        <div
          className="w-full"
          style={{ maxWidth: `${Math.round(400 * sizing.authCard)}px` }}
        >
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

                <div className="flex items-center gap-2.5">
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
                    className="cursor-pointer text-sm font-normal text-foreground"
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

                <Button
                  type="submit"
                  disabled={previewMode || submitMode === 'register'}
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
              className="ml-2 rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
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
    </main>
  );
}
