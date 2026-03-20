'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowRight,
  Bot,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MoonStar,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SubmitMode = 'login' | 'register' | null;

type LoginDataConfig = {
  hero?: {
    title: string;
    subtitle: string;
  };
};

export default function LoginPage() {
  const { session, db } = useAuth();
  const router = useRouter();

  const [uiConfig, setUiConfig] = useState<LoginDataConfig | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/public/ui-config');
        const data = await res.json();
        if (data.config && data.config.login) {
          setUiConfig(data.config.login);
        }
      } catch (err) {
        console.error('Falha ao obter config', err);
      }
    }
    void fetchConfig();
  }, []);

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

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
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

    toast.success('Que bom te receber de novo.');
    router.push('/');
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
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

    toast.success('Conta criada com sucesso. Vamos abrir sua jornada.');
    router.push('/');
  }

  const heroTitle =
    uiConfig?.hero?.title || 'Entre ou crie sua conta com calma.';
  const heroSubtitle =
    uiConfig?.hero?.subtitle ||
    'Tudo aqui foi reorganizado para ficar mais fluido, mais fofo e mais convidativo, sem perder o rigor do fluxo real de auth.';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background)),#ffffff_48%,#fcfbff_100%)] text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="cosmic-orb left-[-8rem] top-[-4rem] h-80 w-80 bg-primary/16" />
        <div className="cosmic-orb right-[-5rem] top-20 h-72 w-72 bg-cosmic/16" />
        <div className="cosmic-orb bottom-[-6rem] left-1/3 h-72 w-72 bg-accent/10" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-10">
        <section className="order-2 lg:order-1">
          <Card className="overflow-hidden rounded-[36px] border-white/80 bg-white/74 shadow-[0_26px_80px_-42px_rgba(22,21,48,0.3)]">
            <CardHeader className="pb-5">
              <Badge className="w-fit rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-primary shadow-sm">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                uma entrada mais doce, clara e acolhedora
              </Badge>
              <CardTitle className="max-w-2xl text-4xl leading-tight sm:text-5xl">
                Que bom te ver por aqui.
                <span className="mt-2 block text-gradient-aurora">
                  Sua orbita Lyra esta pronta para receber voce.
                </span>
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-8 sm:text-lg">
                Esta tela foi redesenhada para parecer mais harmoniosa,
                organizada e carinhosa: menos dureza visual, mais respiro, mais
                vontade de entrar e continuar a jornada.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: MoonStar,
                  title: 'Atmosfera clara',
                  description:
                    'A experiencia visual foi puxada para um tema luminoso e sereno.',
                },
                {
                  icon: Bot,
                  title: 'IA com delicadeza',
                  description:
                    'Tecnologia presente para orientar sem pesar o ambiente.',
                },
                {
                  icon: Zap,
                  title: 'Fluxo organizado',
                  description:
                    'Entrar, criar conta e seguir para a jornada com menos atrito.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-border/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,255,255,0.78))] p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-display text-xl font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </CardContent>

            <CardFooter className="flex-col items-start gap-3 border-t border-border/70 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Lyra MetaCare
              </p>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Um espaco para unir simbolismo, tecnologia e bem-estar em uma
                experiencia mais bonita e facil de habitar.
              </p>
            </CardFooter>
          </Card>
        </section>

        <section className="order-1 lg:order-2">
          <Card className="mx-auto w-full max-w-xl rounded-[36px] border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.92),rgba(255,255,255,0.76))] shadow-[0_30px_90px_-46px_rgba(22,21,48,0.34)]">
            <CardHeader className="items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-teal text-white shadow-teal">
                <Sparkles className="h-7 w-7" />
              </div>
              <p className="mt-4 font-display text-3xl font-bold lowercase text-gradient-hero">
                lyra
              </p>
              <CardTitle className="text-3xl">{heroTitle}</CardTitle>
              <CardDescription className="max-w-sm text-sm leading-7 whitespace-pre-line">
                {heroSubtitle}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="login" className="space-y-6">
                <TabsList className="grid h-auto grid-cols-2 rounded-[20px] border border-border/70 bg-white/88 p-1 shadow-sm">
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
                          onChange={(event) =>
                            setLoginEmail(event.target.value)
                          }
                          className="pl-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
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
                      {submitMode === 'login'
                        ? 'Entrando...'
                        : 'Entrar na Lyra'}
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
            </CardContent>

            <CardFooter className="flex-col items-start gap-3 border-t border-border/70 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                entrada organizada
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                Sem atalhos vazios, sem botao sem funcao e sem ruido visual
                desnecessario. Apenas o fluxo real, com mais beleza e
                acolhimento.
              </p>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
}
