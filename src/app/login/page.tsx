'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(20,77,86,0.22),_transparent_40%),linear-gradient(160deg,#f4fbfb_0%,#fff6f1_48%,#f3fbf9_100%)] p-4">
      <div className="max-w-md w-full p-8 space-y-8 bg-white/90 backdrop-blur-xl rounded-[1.75rem] shadow-[0_24px_80px_rgba(20,77,86,0.16)] border border-white/70 transition-all duration-500">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Acesse sua Jornada
        </h2>
        <div className="flex justify-center mb-6">
          <svg
            className="h-10 w-10 text-teal-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>

        <Tabs defaultValue="login" className="space-y-6">
          <TabsList className="grid grid-cols-2 bg-teal-50">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Senha</Label>
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </div>
            <Button
              className="w-full bg-teal-700 hover:bg-teal-800"
              disabled={submitting}
              onClick={handleLogin}
            >
              Entrar
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="register-first-name">Nome</Label>
                <Input
                  id="register-first-name"
                  value={registerFirstName}
                  onChange={(event) => setRegisterFirstName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-last-name">Sobrenome</Label>
                <Input
                  id="register-last-name"
                  value={registerLastName}
                  onChange={(event) => setRegisterLastName(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Senha</Label>
              <Input
                id="register-password"
                type="password"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
              />
            </div>
            <Button
              className="w-full bg-coral-600 hover:bg-coral-700"
              disabled={submitting}
              onClick={handleRegister}
            >
              Criar conta
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
