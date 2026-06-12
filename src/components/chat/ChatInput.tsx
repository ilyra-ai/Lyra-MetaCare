'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Send, Mic, MicOff, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';

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
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
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
    <div className="relative mx-auto w-full max-w-4xl px-2 md:px-4">
      <div
        className={`relative flex items-end gap-2 rounded-[24px] border border-input bg-card/95 px-3 py-1.5 transition-all duration-200 focus-within:border-primary/55 focus-within:shadow-[0_0_0_4px_hsl(var(--primary)/0.12)] ${
          disabled ? 'cursor-not-allowed opacity-50' : 'shadow-sm'
        }`}
        role="group"
        aria-labelledby={helperId}
      >
        {/* Textarea */}
        <div className="relative z-10 flex-1">
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
            className="w-full resize-none border-0 bg-transparent px-1 py-2 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          {showCounter && (
            <div className="absolute -bottom-6 right-0 text-xs font-medium">
              <span
                className={
                  isCritical ? 'text-destructive' : 'text-muted-foreground'
                }
              >
                {text.length}/{maxLength}
              </span>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="relative z-10 flex items-center gap-1.5 pb-0.5">
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
              className={`
                group relative h-9 w-9 overflow-hidden rounded-full transition-all duration-300
                ${
                  isListening
                    ? 'scale-110 bg-gradient-coral shadow-coral hover:brightness-105'
                    : 'border border-border/70 bg-secondary hover:scale-105 hover:bg-cosmic-light/60'
                }
                disabled:cursor-not-allowed disabled:opacity-50
              `}
            >
              {isListening && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 animate-ping rounded-full border-2 border-white/30"
                      style={{
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '1.5s',
                      }}
                    />
                  ))}
                </div>
              )}

              {isListening ? (
                <MicOff
                  className="relative z-10 h-4 w-4 text-white"
                  aria-hidden="true"
                />
              ) : (
                <Mic
                  className="relative z-10 h-4 w-4 text-muted-foreground transition-colors group-hover:text-cosmic"
                  aria-hidden="true"
                />
              )}
            </Button>
          )}

          {/* Botão enviar */}
          <Button
            onClick={send}
            disabled={disabled || !text.trim()}
            size="icon"
            aria-label="Enviar mensagem"
            className={`
              group relative h-9 w-9 overflow-hidden rounded-full transition-all duration-300
              ${
                !disabled && text.trim()
                  ? 'scale-100 bg-[linear-gradient(135deg,hsl(var(--cosmic)),hsl(var(--primary)))] shadow-cosmic hover:scale-110 hover:rotate-6 hover:brightness-110'
                  : 'border border-border/70 bg-secondary'
              }
              disabled:cursor-not-allowed disabled:opacity-50
              before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent
              before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
            `}
          >
            {!disabled && text.trim() && (
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              >
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-particle absolute h-1 w-1 rounded-full bg-white"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {!disabled && text.trim() ? (
              <ArrowUp
                className="relative z-10 h-4 w-4 text-white transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
            ) : (
              <Send
                className="relative z-10 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </Button>
        </div>
      </div>

      {/* Status */}
      {(isListening || text.length > 0) && (
        <div
          id={statusId}
          className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 text-xs font-medium"
          role="status"
          aria-live="polite"
        >
          {isListening ? (
            <span className="text-accent">Gravando áudio</span>
          ) : (
            <span className="text-muted-foreground">
              Pressione Enter para enviar
            </span>
          )}
        </div>
      )}

      {/* Helper para leitores de tela */}
      <div id={helperId} className="sr-only">
        Digite sua mensagem ou use o botão de microfone para gravar áudio.
        Pressione Enter para enviar.
      </div>

      {/* Animação das partículas do botão enviar */}
      <style jsx>{`
        @keyframes particle {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(var(--tx, 10px), var(--ty, -10px)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx, 20px), var(--ty, -20px)) scale(0);
          }
        }
        .animate-particle {
          animation: particle 1.5s ease-out infinite;
        }
      `}</style>
    </div>
  );
}

export default ChatInput;
export { ChatInput };
