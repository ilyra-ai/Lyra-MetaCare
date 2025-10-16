"use client";

import { MadeWithIlyra } from "@/components/made-with-ilyra";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function AdminContentPage() {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <Construction className="h-12 w-12 mx-auto text-amber-500" />
              <CardTitle className="mt-4">Página em Construção</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A ferramenta de gestão de conteúdo do app está sendo desenvolvida.
              </p>
            </CardContent>
          </Card>
        </main>
        <MadeWithIlyra />
      </div>
    </div>
  );
}