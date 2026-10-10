'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BrainCircuit, User, Copy, Check, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  onRegenerate?: () => void;
}

export function ChatBubble({ message, isUser, onRegenerate }: ChatBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  // Efeito de digitação das mensagens da IA: guarda quantos caracteres já
  // foram revelados. Quando o texto muda, a contagem recomeça durante a
  // renderização (estado derivado), sem setState síncrono em efeito.
  const [revealedCount, setRevealedCount] = useState(0);
  const [typedMessage, setTypedMessage] = useState(message);
  if (typedMessage !== message) {
    setTypedMessage(message);
    setRevealedCount(0);
  }
  const displayedText = isUser ? message : message.slice(0, revealedCount);
  const isTyping = !isUser && revealedCount < message.length;

  useEffect(() => {
    if (isUser || !message) {
      return;
    }

    const typingInterval = setInterval(() => {
      setRevealedCount((current) => {
        if (current >= message.length) {
          clearInterval(typingInterval);
          return current;
        }
        return current + 1;
      });
    }, 20);

    return () => clearInterval(typingInterval);
  }, [message, isUser]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setIsCopied(true);
      toast.success('Mensagem copiada!', {
        icon: <Check className="h-4 w-4" aria-hidden="true" />,
        duration: 2000,
      });

      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar mensagem');
    }
  };

  const actionClassName =
    'inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

  return (
    <div
      className={cn(
        'group flex max-w-[min(42rem,100%)] items-start gap-2.5 sm:gap-3',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar: usuário em teal suave; assistente (IA) em violeta suave. */}
      <Avatar className="mt-0.5 h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            isUser
              ? 'bg-sidebar-accent text-primary'
              : 'bg-cosmic-light text-cosmic-strong'
          )}
        >
          {isUser ? (
            <User size={14} aria-hidden="true" />
          ) : (
            <BrainCircuit size={14} aria-hidden="true" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'flex min-w-0 flex-col gap-1.5',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'max-w-full rounded-xl px-4 py-3',
            isUser
              ? 'rounded-tr-md bg-primary text-primary-foreground'
              : 'rounded-tl-md border border-border bg-card text-foreground'
          )}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {displayedText}
            {isTyping && (
              <span
                className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-current align-middle"
                aria-hidden="true"
              ></span>
            )}
          </p>
        </div>

        {/* Indicador de "pensando" da IA */}
        {!isUser && isTyping && (
          <div className="flex items-center gap-1.5 text-xs text-cosmic-strong">
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cosmic" />
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-cosmic"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-cosmic"
                style={{ animationDelay: '300ms' }}
              />
            </span>
            <span className="font-medium">processando</span>
          </div>
        )}

        {/*
          Ações rápidas: aparecem no hover e também no foco do teclado; em
          telas de toque (sem hover) ficam sempre visíveis.
        */}
        {!isTyping && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            <button
              type="button"
              onClick={handleCopy}
              className={actionClassName}
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 text-success" aria-hidden="true" />
                  <span className="text-success">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" aria-hidden="true" />
                  <span>Copiar</span>
                </>
              )}
            </button>

            {!isUser && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className={actionClassName}
                title="Regenerar resposta"
              >
                <RotateCw className="h-3 w-3" aria-hidden="true" />
                <span>Regenerar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
