'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LoginPageConfig } from '@/lib/site-page-config/schema';

type SubmitMode = 'login' | 'register' | null;

type PublicLoginConfigPayload = {
  pageKey: 'login';
  config: LoginPageConfig;
  error?: string;
};

type LoginExperienceProps = {
  overrideConfig?: LoginPageConfig;
  previewMode?: boolean;
};

export function LoginExperience({
  overrideConfig,
  previewMode = false,
}: LoginExperienceProps) {
  const { session, db } = useAuth();
  const router = useRouter();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [submitMode, setSubmitMode] = useState<SubmitMode>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Toggle between Login and Register views
  const [isRegistering, setIsRegistering] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (!previewMode && session) {
      router.push('/');
    }
  }, [previewMode, router, session]);

  if (!previewMode && session) {
    return null;
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (previewMode) return;

    setSubmitMode('login');

    const { error } = await db.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
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

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
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
    <main className="relative min-h-screen w-full overflow-hidden bg-[#eaf4f4] font-sans flex items-center justify-center">
      {/* Background Decorativo - Premium 2026 */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Fundo gradiente Lyra */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#eaf4f4] via-[#f0f8f8] to-[#d6ece9] opacity-80" />

        {/* Nuvens e Elementos Celestes */}
        <div className="absolute top-10 left-[10%] w-32 h-10 bg-white/40 rounded-full blur-2xl" />
        <div className="absolute top-40 right-[15%] w-48 h-16 bg-white/30 rounded-full blur-3xl" />
        <div className="absolute top-20 left-1/3 w-2 h-2 bg-white rounded-full opacity-70 animate-pulse-slow" />
        <div className="absolute top-32 right-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-ping" />
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full opacity-40" />

        {/* Montanhas com as cores claras de tendência 2026 e tons da Lyra (Teal) */}
        <svg
          className="absolute bottom-0 w-full h-[55vh] min-h-[400px] text-[#bce3de]"
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

      {/* Container Principal do Login - Layout baseado na imagem de referência */}
      <div className="relative z-10 w-full max-w-[440px] px-4 flex flex-col my-12 animate-fade-in-up">
        {/* Bloco Superior (Glassmorphism + Textos) */}
        <div className="p-8 pb-10 bg-white/20 backdrop-blur-md border border-white/40 rounded-t-[32px] shadow-glass text-center relative overflow-hidden">
          {/* Logo / Marca d'água superior esquerda */}
          <div className="absolute top-6 left-6 flex items-center gap-2 opacity-80">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-sm tracking-wide text-foreground lowercase">
              lyra metacare
            </span>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <h1 className="font-display text-5xl font-light text-foreground mb-2 drop-shadow-sm">
              Bem-vindo
            </h1>
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 tracking-tight">
              ao seu Ecossistema
            </h2>
            <p className="text-sm leading-relaxed text-foreground/75 font-medium px-2 max-w-[320px]">
              Integração de saúde, inteligência artificial e sabedoria milenar
              para orquestrar o seu bem-estar diário com precisão e cuidado.
            </p>
          </div>
        </div>

        {/* Bloco Inferior (Formulário Branco) */}
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-b-[32px] rounded-t-xl -mt-4 shadow-[0_20px_60px_-15px_rgba(49,155,142,0.2)] relative z-20">
          <h3 className="text-center font-display text-primary font-bold tracking-[0.15em] text-sm mb-8 uppercase">
            {isRegistering ? 'CRIAR NOVA CONTA' : 'LOGIN DO USUÁRIO'}
          </h3>

          {/* Renderização Condicional: Login ou Register */}
          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username / Email */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-primary/45 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Seu e-mail"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-12 h-12 bg-secondary/80 border-transparent focus:bg-white focus:border-primary/40 rounded-full text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-all"
                  disabled={previewMode}
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-primary/45 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-secondary/80 border-transparent focus:bg-white focus:border-primary/40 rounded-full text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-all"
                  disabled={previewMode}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary/50 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between px-2 pt-1 pb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    className="border-primary/40 data-[state=checked]:bg-primary rounded-sm"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-primary font-medium cursor-pointer"
                  >
                    Lembrar-me
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={previewMode || submitMode === 'login'}
                  className="bg-gradient-coral hover:brightness-105 text-white rounded-full px-12 h-12 font-bold tracking-widest uppercase text-xs shadow-coral transition-all transform hover:scale-105"
                >
                  {submitMode === 'login' ? 'Entrando...' : 'Entrar'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <Input
                    id="reg-firstname"
                    placeholder="Nome"
                    required
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                    className="h-12 bg-secondary/80 border-transparent focus:bg-white focus:border-primary/40 rounded-2xl text-foreground placeholder:text-muted-foreground/70 shadow-sm"
                    disabled={previewMode}
                  />
                </div>
                <div className="relative group">
                  <Input
                    id="reg-lastname"
                    placeholder="Sobrenome"
                    required
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    className="h-12 bg-secondary/80 border-transparent focus:bg-white focus:border-primary/40 rounded-2xl text-foreground placeholder:text-muted-foreground/70 shadow-sm"
                    disabled={previewMode}
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-primary/45 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="E-mail"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="pl-12 h-12 bg-secondary/80 border-transparent focus:bg-white focus:border-primary/40 rounded-full text-foreground placeholder:text-muted-foreground/70 shadow-sm"
                  disabled={previewMode}
                />
              </div>

              <div className="relative group pb-2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-primary/45 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-secondary/80 border-transparent focus:bg-white focus:border-primary/40 rounded-full text-foreground placeholder:text-muted-foreground/70 shadow-sm"
                  disabled={previewMode}
                />
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={previewMode || submitMode === 'register'}
                  className="bg-gradient-to-r from-[#d97272] to-[#de8a8a] hover:from-[#c25f5f] hover:to-[#d97272] text-white rounded-full px-10 h-12 font-bold tracking-widest uppercase text-xs shadow-coral transition-all transform hover:scale-105 w-full"
                >
                  {submitMode === 'register' ? 'Criando...' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          )}

          {/* Toggle Login/Register */}
          <div className="mt-8 text-center border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-2 font-bold text-primary hover:text-primary/80 transition-colors"
              >
                {isRegistering ? 'Fazer login' : 'Cadastre-se'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center mt-6 text-muted-foreground font-medium text-xs tracking-wider flex items-center justify-center gap-1">
          <span>desenvolvido por</span>
          <ShieldCheck className="w-3 h-3" />
          <span className="font-bold">Lyra MetaCare</span>
        </div>
      </div>
    </main>
  );
}
