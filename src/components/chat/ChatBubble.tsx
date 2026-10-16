'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

import { MarcaLyra } from '@/components/marca/MarcaLyra';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  onRegenerate?: () => void;
}

// Revelação da resposta: alguns caracteres por quadro, para respostas longas
// não demorarem (antes: 1 caractere a cada 20 ms).
const CARACTERES_POR_PASSO = 4;
const INTERVALO_MS = 16;

/**
 * Mensagem do chat (redesenho da tarefa 52): a pergunta da pessoa num balão
 * à direita; a resposta da Lyra como texto corrido, com a marca ao lado,
 * sem caixa, como nas interfaces de conversa de 2026. Copiar e refazer
 * aparecem no hover, no foco do teclado e sempre nas telas de toque.
 */
export function ChatBubble({ message, isUser, onRegenerate }: ChatBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  // Quantos caracteres da resposta já apareceram. Quando o texto muda, a
  // contagem recomeça durante a renderização (estado derivado).
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
    // Movimento reduzido: a resposta aparece inteira.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const imediato = setTimeout(() => setRevealedCount(message.length), 0);
      return () => clearTimeout(imediato);
    }

    const typingInterval = setInterval(() => {
      setRevealedCount((current) => {
        if (current >= message.length) {
          clearInterval(typingInterval);
          return current;
        }
        return Math.min(message.length, current + CARACTERES_POR_PASSO);
      });
    }, INTERVALO_MS);

    return () => clearInterval(typingInterval);
  }, [message, isUser]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar a mensagem.');
    }
  };

  const actionClassName =
    'inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

  const acoes = !isTyping ? (
    <div className="flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
      <button
        type="button"
        onClick={() => void handleCopy()}
        className={actionClassName}
      >
        {isCopied ? (
          <>
            <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            <span>Copiado</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Copiar</span>
          </>
        )}
      </button>
      {!isUser && onRegenerate ? (
        <button
          type="button"
          onClick={onRegenerate}
          className={actionClassName}
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Refazer</span>
        </button>
      ) : null}
    </div>
  ) : null;

  if (isUser) {
    return (
      <div className="group ml-auto flex max-w-[min(36rem,88%)] flex-col items-end gap-1">
        <p className="sr-only">Você disse:</p>
        <div className="rounded-3xl rounded-br-lg bg-primary px-4 py-2.5 text-primary-foreground">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message}
          </p>
        </div>
        {acoes}
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3">
      <MarcaLyra tamanho="1.75rem" className="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="sr-only">A Lyra disse:</p>
        <p className="whitespace-pre-wrap break-words text-[0.9375rem] leading-7 text-foreground">
          {displayedText}
          {isTyping ? (
            <span
              className="ml-0.5 inline-block h-4 w-1 animate-pulse rounded-full bg-primary align-middle"
              aria-hidden="true"
            />
          ) : null}
        </p>
        {acoes}
      </div>
    </div>
  );
}
