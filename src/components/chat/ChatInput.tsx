'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Send, Mic, MicOff, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ===== SpeechRecognition types (TS 5.x friendly) =====
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror:
    ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult:
    ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

// ===== Props =====
interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
}

// ===== Defaults =====
const DEFAULT_MAX_LENGTH = 4000;
const HIGH_CHAR_THRESHOLD = 0.75;
const CRITICAL_CHAR_THRESHOLD = 0.95;

function ChatInput({
  onSendMessage,
  disabled = false,
  maxLength = DEFAULT_MAX_LENGTH,
  placeholder = 'Digite ou fale sua mensagem...',
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const inputId = useId();
  const statusId = useId();
  const helperId = useId();

  // ===== Voice Recognition =====
  const stopRecognition = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error('Reconhecimento de voz não suportado', {
        description: 'Seu navegador não suporta a Web Speech API',
      });
      return;
    }

    try {
      const rec = new SR();
      rec.lang = 'pt-BR';
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (e: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        const map: Record<string, string> = {
          'no-speech': 'Nenhuma fala detectada',
          'audio-capture': 'Erro ao capturar áudio',
          'not-allowed': 'Permissão de microfone negada',
          network: 'Erro de rede',
        };
        toast.error('Erro no reconhecimento de voz', {
          description: map[e.error] || e.error,
        });
      };

      rec.onresult = (ev: SpeechRecognitionEvent) => {
        const transcript = Array.from(ev.results)
          .map((r) => r[0].transcript)
          .join('');
        setText(transcript);

        const last = ev.results[ev.results.length - 1];
        if (last && last.isFinal) {
          const t = transcript.trim();
          if (t) {
            onSendMessage(t);
            setText('');
            inputRef.current?.focus();
            toast.success('Mensagem enviada');
          }
          stopRecognition();
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
      toast.error('Falha ao iniciar o microfone');
    }
  }, [onSendMessage, stopRecognition]);

  const toggleVoice = useCallback(() => {
    if (isListening) return stopRecognition();
    startRecognition();
  }, [isListening, startRecognition, stopRecognition]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  // ===== Send helpers =====
  const send = useCallback(() => {
    const t = text.trim();
    if (!t || disabled) return;
    onSendMessage(t);
    setText('');
    inputRef.current?.focus();
    toast.success('Mensagem enviada');
  }, [text, disabled, onSendMessage]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !disabled) {
        e.preventDefault();
        send();
      }
    },
    [disabled, send]
  );

  // ===== Derived =====
  const charProgress = text.length / maxLength;
  const showCounter = charProgress >= HIGH_CHAR_THRESHOLD;
  const isCritical = charProgress >= CRITICAL_CHAR_THRESHOLD;

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div
        className={cn(
          'relative flex items-end gap-2 rounded-xl border border-input bg-card px-3 py-1.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        role="group"
        aria-labelledby={helperId}
      >
        {/* Textarea */}
        <div className="min-w-0 flex-1">
          <TextareaAutosize
            ref={inputRef}
            id={inputId}
            placeholder={isListening ? 'Escutando...' : placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            maxLength={maxLength}
            minRows={1}
            maxRows={5}
            aria-label="Campo de mensagem"
            aria-describedby={`${helperId} ${statusId}`}
            className="w-full resize-none border-0 bg-transparent px-1 py-2 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus:outline-hidden"
          />
        </div>

        {/* Botões de ação */}
        <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
          {/* Botão de voz */}
          {text.trim().length === 0 && (
            <Button
              onClick={toggleVoice}
              variant="ghost"
              size="icon"
              disabled={disabled}
              aria-label={
                isListening
                  ? 'Parar gravação de voz'
                  : 'Iniciar gravação de voz'
              }
              aria-pressed={isListening}
              className={cn(
                'h-9 w-9 rounded-full disabled:cursor-not-allowed disabled:opacity-50',
                isListening
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive-hover hover:text-destructive-foreground'
                  : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Mic className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          )}

          {/* Botão enviar */}
          <Button
            onClick={send}
            disabled={disabled || !text.trim()}
            size="icon"
            aria-label="Enviar mensagem"
            className={cn(
              'h-9 w-9 rounded-full disabled:cursor-not-allowed',
              !disabled && text.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                : 'border border-border bg-background text-muted-foreground disabled:opacity-100'
            )}
          >
            {!disabled && text.trim() ? (
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Status e contador ficam no fluxo (não vazam do cartão do chat). */}
      {isListening || text.length > 0 || showCounter ? (
        <div className="mt-1.5 flex min-h-4 items-center justify-between gap-3 px-1 text-xs font-medium">
          <div id={statusId} role="status" aria-live="polite">
            {isListening ? (
              <span className="inline-flex items-center gap-1.5 text-destructive">
                <span
                  className="h-2 w-2 animate-pulse rounded-full bg-destructive"
                  aria-hidden="true"
                />
                Gravando áudio
              </span>
            ) : text.length > 0 ? (
              <span className="text-muted-foreground">
                Pressione Enter para enviar
              </span>
            ) : null}
          </div>
          {showCounter ? (
            <span
              className={
                isCritical ? 'text-destructive' : 'text-muted-foreground'
              }
            >
              {text.length}/{maxLength}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Helper para leitores de tela */}
      <div id={helperId} className="sr-only">
        Digite sua mensagem ou use o botão de microfone para gravar áudio.
        Pressione Enter para enviar.
      </div>
    </div>
  );
}

export default ChatInput;
export { ChatInput };
