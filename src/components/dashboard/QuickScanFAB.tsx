'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bot, HeartPulse, Sparkles, Watch, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';

import { useHealthOrchestrator } from '@/context/HealthOrchestratorContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function QuickScanFAB() {
  const router = useRouter();
  const { triggerManualSync, isSyncing } = useHealthOrchestrator();

  // O resultado da sincronização é tratado no próprio handler (evento do
  // usuário), sem efeito observando o estado do contexto.
  const handleSync = async () => {
    toast.info('Sincronizando leituras e céu do momento...');
    const { error } = await triggerManualSync();

    if (error) {
      toast.info('Sincronização concluída com contexto parcial.', {
        description: error,
      });
    } else {
      toast.success('Leituras do ecossistema atualizadas.', {
        description:
          'Os sinais disponíveis no seu dispositivo foram reavaliados junto do contexto astrológico atual.',
      });
    }
  };

  return (
    // Margem segura inferior (home indicator do iOS) e botão só com ícone no
    // celular; o dashboard reserva espaço no fim da página para que o FAB não
    // cubra conteúdo essencial.
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 md:bottom-8 md:right-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="accent"
            size="lg"
            className="size-14 animate-fade-in rounded-full p-0 shadow-lg md:h-12 md:w-auto md:px-5"
            aria-label="Ações rápidas da Lyra"
          >
            <WandSparkles aria-hidden="true" />
            <span className="hidden text-sm font-semibold md:inline">
              Ações rápidas
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[min(20rem,calc(100vw-2rem))] rounded-xl p-2"
        >
          <DropdownMenuLabel>Centro rápido da Lyra</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => void handleSync()}>
              <HeartPulse className="text-primary" />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  Sincronizar leituras
                </span>
                <span className="text-xs text-muted-foreground">
                  Atualiza sinais disponíveis e o contexto cósmico do momento.
                </span>
              </div>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {isSyncing ? 'Ao vivo' : 'Agora'}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push('/chat')}>
              <Bot className="text-cosmic" />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  Abrir chat de IA
                </span>
                <span className="text-xs text-muted-foreground">
                  Continue sua conversa com o copiloto de bem-estar.
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push('/plan')}>
              <Sparkles className="text-cosmic" />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  Ver plano do dia
                </span>
                <span className="text-xs text-muted-foreground">
                  Acesse recomendações, prioridades e rituais orientados por IA.
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => router.push('/connect')}>
              <Watch className="text-info" />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  Conectar wearables
                </span>
                <span className="text-xs text-muted-foreground">
                  Abra a central de conexão com sensores e dispositivos.
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
