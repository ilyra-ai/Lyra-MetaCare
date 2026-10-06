'use client';

import { CSSProperties, SubmitEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { LoginPageConfig } from '@/lib/site-page-config/schema';
import { getBuilderIcon, getToneBadgeClass } from '@/lib/site-page-config/ui';

type SubmitMode = 'login' | 'register' | null;

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
    width: `${(1.25 * sizing.iconScale).toFixed(3)}rem`,
    height: `${(1.25 * sizing.iconScale).toFixed(3)}rem`,
  };
  const buttonStyle: CSSProperties = {
    height: `${(3 * sizing.buttonScale).toFixed(3)}rem`,
    ...escalaFluida(0.75, typography.buttonLabel),
  };
  const fieldStyle = escalaFluida(0.95, typography.fieldLabel);

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

  return (
    <main
      id="conteudo-principal"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#eaf4f4] font-sans"
    >
      {/* Fundo decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-b from-[#eaf4f4] via-[#f0f8f8] to-[#d6ece9] opacity-80" />
        <div className="absolute left-[10%] top-10 h-10 w-32 rounded-full bg-white/40 blur-2xl" />
        <div className="absolute right-[15%] top-40 h-16 w-48 rounded-full bg-white/30 blur-3xl" />
        <div className="animate-pulse-slow absolute left-1/3 top-20 h-2 w-2 rounded-full bg-white opacity-70" />
        <div className="absolute right-1/4 top-32 h-1 w-1 animate-ping rounded-full bg-white opacity-60" />
        <div className="absolute left-1/4 top-1/4 h-3 w-3 rounded-full bg-white opacity-40" />

        <svg
          className="absolute bottom-0 h-[55vh] min-h-[400px] w-full text-[#bce3de]"
          preserveAspectRatio="none"
          viewBox="0 0 1440 400"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 400L0 150L200 50L450 180L700 80L1000 220L1250 100L1440 250L1440 400Z"
            opacity="0.4"
          />
          <path
            d="M0 400L0 220L250 120L550 250L850 150L1150 280L1440 180L1440 400Z"
            className="text-[#a1d6cf]"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M0 400L0 300L300 180L600 320L950 200L1300 350L1440 280L1440 400Z"
            className="text-[#84c7be]"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M0 400L150 280L450 380L750 280L1050 400L1440 320L1440 400Z"
            className="text-[#64b8ac]"
            fill="currentColor"
          />
        </svg>
      </div>

      <div
        className="animate-fade-in-up relative z-10 my-12 flex w-full flex-col px-4"
        style={{ maxWidth: `${Math.round(440 * sizing.authCard)}px` }}
      >
        {/* Bloco superior: introdução configurável */}
        {intro.visible ? (
          <div
            className="relative overflow-hidden rounded-t-[32px] border border-white/40 bg-white/20 text-center shadow-glass backdrop-blur-md"
            style={{
              padding: `${(2 * sizing.introCard).toFixed(3)}rem ${(2 * sizing.introCard).toFixed(3)}rem ${(2.5 * sizing.introCard).toFixed(3)}rem`,
            }}
          >
            <div className="absolute left-6 top-6 flex items-center gap-2 opacity-80">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
              <span className="font-display text-sm font-semibold lowercase tracking-wide text-foreground">
                {auth.brandText}
              </span>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <p className="mb-4 rounded-full border border-white/60 bg-white/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/70">
                {intro.badgeText}
              </p>
              <h1
                className="mb-2 font-display font-light text-foreground drop-shadow-xs"
                style={escalaFluida(3, typography.introTitle)}
              >
                {intro.title}
              </h1>
              <p
                className="mb-6 font-display font-bold tracking-tight text-foreground"
                style={escalaFluida(1.5, typography.introTitle)}
              >
                {intro.accentTitle}
              </p>
              <p
                className="max-w-[320px] px-2 font-medium leading-relaxed text-foreground/75"
                style={escalaFluida(0.875, typography.introBody)}
              >
                {intro.description}
              </p>

              {intro.highlights.length > 0 ? (
                <ul className="mt-6 flex flex-wrap justify-center gap-2">
                  {intro.highlights.map((highlight) => {
                    const HighlightIcon = getBuilderIcon(highlight.icon);
                    return (
                      <li
                        key={highlight.id}
                        title={highlight.description}
                        className={cn(
                          'flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold',
                          getToneBadgeClass(highlight.tone)
                        )}
                        style={escalaFluida(0.72, typography.highlightTitle)}
                      >
                        <HighlightIcon className="h-3.5 w-3.5" aria-hidden />
                        <span>{highlight.title}</span>
                        <span className="sr-only">
                          : {highlight.description}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Bloco inferior: formulário */}
        <div
          className={cn(
            'relative z-20 bg-white/95 p-8 shadow-[0_20px_60px_-15px_rgba(49,155,142,0.2)] backdrop-blur-xl',
            intro.visible
              ? '-mt-4 rounded-b-[32px] rounded-t-xl'
              : 'rounded-[32px]'
          )}
        >
          <h2
            className="mb-2 text-center font-display font-bold uppercase tracking-[0.15em] text-primary"
            style={escalaFluida(0.875, typography.authTitle)}
          >
            {isRegistering ? auth.registerTabLabel : auth.loginTabLabel}
          </h2>
          <p
            className="mb-8 text-center text-muted-foreground"
            style={escalaFluida(0.85, typography.authBody)}
          >
            {auth.title}
          </p>

          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="group relative">
                <Label htmlFor="login-email" className="sr-only">
                  {auth.emailLabel}
                </Label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User
                    className="text-primary/45 transition-colors group-focus-within:text-primary"
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
                  className="h-12 rounded-full border-transparent bg-secondary/80 pl-12 text-foreground shadow-sm transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:bg-white"
                  style={fieldStyle}
                  disabled={previewMode}
                />
              </div>

              <div className="group relative">
                <Label htmlFor="login-password" className="sr-only">
                  {auth.passwordLabel}
                </Label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock
                    className="text-primary/45 transition-colors group-focus-within:text-primary"
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
                  className="h-12 rounded-full border-transparent bg-secondary/80 pl-12 pr-12 text-foreground shadow-sm transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:bg-white"
                  style={fieldStyle}
                  disabled={previewMode}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center rounded-full pr-4 text-primary/50 transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between px-2 pb-4 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                    disabled={previewMode}
                    className="rounded-sm border-primary/40 data-[state=checked]:bg-primary"
                  />
                  <Label
                    htmlFor="remember"
                    className="cursor-pointer text-sm font-medium text-primary"
                  >
                    Lembrar-me por 7 dias
                  </Label>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={previewMode || submitMode === 'login'}
                  className="transform rounded-full bg-gradient-coral px-12 font-bold uppercase tracking-widest text-white shadow-coral transition-all hover:scale-105 hover:brightness-105"
                  style={buttonStyle}
                >
                  {submitMode === 'login'
                    ? 'Entrando...'
                    : auth.loginButtonLabel}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="group relative">
                  <Label htmlFor="reg-firstname" className="sr-only">
                    {auth.firstNameLabel}
                  </Label>
                  <Input
                    id="reg-firstname"
                    autoComplete="given-name"
                    placeholder={auth.firstNameLabel}
                    required
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                    className="h-12 rounded-2xl border-transparent bg-secondary/80 text-foreground shadow-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:bg-white"
                    style={fieldStyle}
                    disabled={previewMode}
                  />
                </div>
                <div className="group relative">
                  <Label htmlFor="reg-lastname" className="sr-only">
                    {auth.lastNameLabel}
                  </Label>
                  <Input
                    id="reg-lastname"
                    autoComplete="family-name"
                    placeholder={auth.lastNameLabel}
                    required
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    className="h-12 rounded-2xl border-transparent bg-secondary/80 text-foreground shadow-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:bg-white"
                    style={fieldStyle}
                    disabled={previewMode}
                  />
                </div>
              </div>

              <div className="group relative">
                <Label htmlFor="reg-email" className="sr-only">
                  {auth.emailLabel}
                </Label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail
                    className="text-primary/45 transition-colors group-focus-within:text-primary"
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
                  className="h-12 rounded-full border-transparent bg-secondary/80 pl-12 text-foreground shadow-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:bg-white"
                  style={fieldStyle}
                  disabled={previewMode}
                />
              </div>

              <div className="group relative pb-2">
                <Label htmlFor="reg-password" className="sr-only">
                  {auth.passwordLabel}
                </Label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock
                    className="text-primary/45 transition-colors group-focus-within:text-primary"
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
                  className="h-12 rounded-full border-transparent bg-secondary/80 pl-12 pr-12 text-foreground shadow-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:bg-white"
                  style={fieldStyle}
                  disabled={previewMode}
                />
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={previewMode || submitMode === 'register'}
                  className="w-full transform rounded-full bg-linear-to-r from-[#d97272] to-[#de8a8a] px-10 font-bold uppercase tracking-widest text-white shadow-coral transition-all hover:scale-105 hover:from-[#c25f5f] hover:to-[#d97272]"
                  style={buttonStyle}
                >
                  {submitMode === 'register'
                    ? 'Criando...'
                    : auth.registerButtonLabel}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-2 rounded font-bold text-primary transition-colors hover:text-primary/80 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                {isRegistering ? auth.loginTabLabel : auth.registerTabLabel}
              </button>
            </p>
          </div>
        </div>

        <div
          className="mt-6 flex flex-col items-center gap-2 text-center font-medium tracking-wider text-muted-foreground"
          style={escalaFluida(0.75, typography.footerText)}
        >
          <p>
            <span className="font-semibold uppercase">
              {auth.footerEyebrow}
            </span>{' '}
            · {auth.footerText}
          </p>
          <Link
            href="/"
            className="rounded font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            {auth.backToLandingLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
