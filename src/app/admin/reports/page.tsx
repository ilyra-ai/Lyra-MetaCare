"use client";

import { MadeWithIlyra } from "@/components/made-with-ilyra";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/context/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { AdminReportsContent } from "@/components/admin/AdminReportsContent";

export default function AdminReportsPage() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin();

  if (session === undefined) {
    return <SplashScreen />;
  }

  if (!session || !isAdmin) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-md text-center border-red-500/50">
                <CardHeader>
                    <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-2" />
                    <CardTitle>Acesso Negado</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Você não tem permissão para acessar esta página.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-[family-name:var(--font-geist-sans)]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-8">Relatórios e Exportação</h1>
          <AdminReportsContent />
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}