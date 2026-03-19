'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Lock, Mail, Sparkles, User } from 'lucide-react';

export default function LoginPage() {
  const { session, db } = useAuth();
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  if (session) {
    return null;
  }

  const handleLogin = async () => {
    setSubmitting(true);
    const { error } = await db.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setSubmitting(false);

    if (error) {
      toast.error('Falha no login.', { description: error.message });
      return;
    }

    toast.success('Sessão iniciada com sucesso.');
    router.push('/');
  };

  const handleRegister = async () => {
    setSubmitting(true);
    const { error } = await db.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      firstName: registerFirstName,
      lastName: registerLastName,
    });
    setSubmitting(false);

    if (error) {
      toast.error('Falha no cadastro.', { description: error.message });
      return;
    }

    toast.success('Conta criada com sucesso.');
    router.push('/');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Decorative orbs */}
      <div className="cosmic-orb w-80 h-80 bg-primary/15 -top-20 -left-20" />
      <div className="cosmic-orb w-64 h-64 bg-accent/15 -bottom-16 right-0" />
      <div className="cosmic-orb w-48 h-48 bg-cosmic/15 top-1/3 right-1/4" />

      <div className="relative z-10 max-w-md w-full">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg animate-scale-in">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-teal rounded-xl shadow-teal">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gradient-hero">
              lyra
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              Acesse sua jornada de bem-estar
            </p>
          </div>

          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid grid-cols-2 bg-secondary rounded-xl">
              <TabsTrigger value="login" className="rounded-lg">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg">
                Criar Conta
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 rounded-xl"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Sua senha"
                    className="pl-10 rounded-xl"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button
                className="w-full rounded-xl h-11 bg-gradient-teal text-white shadow-teal hover:shadow-md"
                disabled={submitting}
                onClick={handleLogin}
              >
                {submitting ? 'Entrando...' : 'Entrar'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Esqueceu sua senha?{' '}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                >
                  Recuperar
                </button>
              </p>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="register-first-name"
                    className="text-sm font-medium"
                  >
                    Nome
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-first-name"
                      placeholder="Nome"
                      className="pl-10 rounded-xl"
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="register-last-name"
                    className="text-sm font-medium"
                  >
                    Sobrenome
                  </Label>
                  <Input
                    id="register-last-name"
                    placeholder="Sobrenome"
                    className="rounded-xl"
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="register-email"
                  className="text-sm font-medium"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 rounded-xl"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="register-password"
                  className="text-sm font-medium"
                >
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Crie uma senha"
                    className="pl-10 rounded-xl"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button
                className="w-full rounded-xl h-11 bg-gradient-coral text-white shadow-coral hover:shadow-md"
                disabled={submitting}
                onClick={handleRegister}
              >
                {submitting ? 'Criando...' : 'Criar Conta'}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Lyra MetaCare
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Seu Bem-Estar Orquestrado
          </p>
        </div>
      </div>
    </div>
  );
}
