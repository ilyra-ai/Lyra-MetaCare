'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import {
  ArrowRight,
  Bot,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
  MoonStar,
  Sparkles,
  User,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SubmitMode = 'login' | 'register' | null;

export default function LoginPage() {
  const { session, db } = useAuth();
  const router = useRouter();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [submitMode, setSubmitMode] = useState<SubmitMode>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [router, session]);

  if (session) {
    return null;
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMode('login');

    const { error } = await db.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    setSubmitMode(null);

    if (error) {
      toast.error('Nao foi possivel entrar agora.', {
        description: error.message,
      });
      return;
    }

    toast.success('Boas-vindas de volta. Sua jornada foi aberta com sucesso.');
    router.push('/');
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMode('register');

    const { error } = await db.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      firstName: registerFirstName,
      lastName: registerLastName,
    });

    setSubmitMode(null);

    if (error) {
      toast.error('Nao foi possivel criar sua conta agora.', {
        description: error.message,
      });
      return;
    }

    toast.success('Conta criada com sucesso. Vamos preparar a sua jornada.');
    router.push('/');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background)),#ffffff_45%,#fcfbff_100%)] text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="cosmic-orb left-[-8rem] top-[-4rem] h-80 w-80 bg-primary/16" />
        <div className="cosmic-orb right-[-5rem] top-20 h-72 w-72 bg-cosmic/16" />
        <div className="cosmic-orb bottom-[-6rem] left-1/3 h-72 w-72 bg-accent/10" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-10">
        <section className="order-2 lg:order-1">
          <div className="mx-auto max-w-2xl rounded-[36px] border border-white/70 bg-white/70 p-6 shadow-[0_26px_80px_-42px_rgba(22,21,48,0.3)] backdrop-blur-2xl sm:p-8 lg:p-10">
            <Badge className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary shadow-sm">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              um espaco clarinho, cosmico e acolhedor
            </Badge>

            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Que bom te ver por aqui.
              <span className="mt-2 block text-gradient-aurora">
                A sua orbita Lyra espera por voce.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              Entre no seu cantinho cosmico para acompanhar sinais, ciclos,
              planos guiados por IA e uma rotina visualmente mais leve, bonita e
              gostosa de usar.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <article className="rounded-[28px] border border-primary/12 bg-[linear-gradient(145deg,rgba(49,155,142,0.12),rgba(255,255,255,0.95))] p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-sm">
                  <MoonStar className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                  Seu ritual digital
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Um visual luminoso para acompanhar sua energia, seus ciclos e
                  os pequenos ajustes que fazem diferenca ao longo da semana.
                </p>
              </article>

              <article className="rounded-[28px] border border-cosmic/12 bg-[linear-gradient(145deg,rgba(139,92,246,0.12),rgba(255,255,255,0.95))] p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-cosmic shadow-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                  IA com presenca gentil
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  A tecnologia entra para organizar, orientar e apoiar, sem
                  roubar a delicadeza da experiencia.
                </p>
              </article>
            </div>

            <div className="mt-6 rounded-[28px] border border-accent/12 bg-[linear-gradient(145deg,rgba(240,101,67,0.11),rgba(255,255,255,0.96))] p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/85 text-accent shadow-sm">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    mensagem da casa
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-foreground">
                    Beleza, clareza e acolhimento tambem sao parte do cuidado.
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    A Lyra foi pensada para unir profundidade simbolica,
                    inteligencia aplicada e uma atmosfera suave o suficiente
                    para voce querer voltar todos os dias.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="mx-auto w-full max-w-xl rounded-[36px] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.9),rgba(255,255,255,0.72))] p-6 shadow-[0_30px_90px_-46px_rgba(22,21,48,0.34)] backdrop-blur-2xl sm:p-8">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-teal text-white shadow-teal">
                <Sparkles className="h-7 w-7" />
              </div>
              <p className="mt-4 font-display text-3xl font-bold lowercase text-gradient-hero">
                lyra
              </p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Entre para continuar sua jornada ou crie sua conta para abrir um
                novo mapa de contexto com a gente.
              </p>
            </div>

            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid h-auto grid-cols-2 rounded-[20px] border border-border/70 bg-white/85 p-1 shadow-sm">
                <TabsTrigger value="login" className="rounded-[16px]">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-[16px]">
                  Criar conta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-5">
                <form className="space-y-5" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        className="pl-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="login-password">Senha</Label>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(event) =>
                          setLoginPassword(event.target.value)
                        }
                        className="pl-11 pr-12"
                      />
                      <button
                        type="button"
                        aria-label={
                          showLoginPassword
                            ? 'Ocultar senha de login'
                            : 'Mostrar senha de login'
                        }
                        onClick={() =>
                          setShowLoginPassword((current) => !current)
                        }
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={
                      submitMode === 'login' ||
                      loginEmail.trim().length === 0 ||
                      loginPassword.trim().length === 0
                    }
                  >
                    {submitMode === 'login' ? 'Entrando...' : 'Entrar na Lyra'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-5">
                <form className="space-y-5" onSubmit={handleRegister}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="register-first-name">Nome</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="register-first-name"
                          autoComplete="given-name"
                          value={registerFirstName}
                          onChange={(event) =>
                            setRegisterFirstName(event.target.value)
                          }
                          className="pl-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-last-name">Sobrenome</Label>
                      <Input
                        id="register-last-name"
                        autoComplete="family-name"
                        value={registerLastName}
                        onChange={(event) =>
                          setRegisterLastName(event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        value={registerEmail}
                        onChange={(event) =>
                          setRegisterEmail(event.target.value)
                        }
                        className="pl-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={registerPassword}
                        onChange={(event) =>
                          setRegisterPassword(event.target.value)
                        }
                        className="pl-11 pr-12"
                      />
                      <button
                        type="button"
                        aria-label={
                          showRegisterPassword
                            ? 'Ocultar senha de cadastro'
                            : 'Mostrar senha de cadastro'
                        }
                        onClick={() =>
                          setShowRegisterPassword((current) => !current)
                        }
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {showRegisterPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    variant="accent"
                    className="w-full"
                    disabled={
                      submitMode === 'register' ||
                      registerFirstName.trim().length === 0 ||
                      registerLastName.trim().length === 0 ||
                      registerEmail.trim().length === 0 ||
                      registerPassword.trim().length === 0
                    }
                  >
                    {submitMode === 'register'
                      ? 'Criando sua conta...'
                      : 'Criar minha conta'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-8 rounded-[24px] border border-border/70 bg-white/80 px-5 py-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                Lyra MetaCare
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Seu bem-estar orquestrado com astrologia moderna, IA e um tema
                claro feito para acolher.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
