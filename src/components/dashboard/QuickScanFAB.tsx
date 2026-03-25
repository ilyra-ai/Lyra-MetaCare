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
  const { triggerManualSync, isSyncing, syncError } = useHealthOrchestrator();
  const [requestedSync, setRequestedSync] = React.useState(false);

  React.useEffect(() => {
    if (!requestedSync || isSyncing) {
      return;
    }

    if (syncError) {
      toast.info('Sincronização concluída com contexto parcial.', {
        description: syncError,
      });
    } else {
      toast.success('Leituras do ecossistema atualizadas.', {
        description:
          'Os sinais disponíveis no seu dispositivo foram reavaliados junto do contexto astrológico atual.',
      });
    }

    setRequestedSync(false);
  }, [isSyncing, requestedSync, syncError]);

  const handleSync = async () => {
    setRequestedSync(true);
    toast.info('Sincronizando leituras e céu do momento...');
    await triggerManualSync();
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 md:bottom-8 md:right-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="accent"
            size="lg"
            className="h-14 rounded-full px-5 shadow-coral animate-fade-in-up"
            aria-label="Abrir ações rápidas da Lyra"
          >
            <WandSparkles />
            <span className="hidden text-sm font-semibold md:inline">
              Ações rápidas
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[20rem] rounded-[28px] border-primary/10 p-3"
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
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {isSyncing ? 'AO VIVO' : 'AGORA'}
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
              <Sparkles className="text-accent" />
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
