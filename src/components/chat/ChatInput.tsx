"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Send, Mic, MicOff, ArrowUp } from "lucide-react";
import { toast } from "sonner";

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
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
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
}

// ===== Defaults =====
const DEFAULT_MAX_LENGTH = 4000;
const HIGH_CHAR_THRESHOLD = 0.75;
const CRITICAL_CHAR_THRESHOLD = 0.95;

function ChatInput({
  onSendMessage,
  disabled = false,
  maxLength = DEFAULT_MAX_LENGTH,
}: ChatInputProps) {
  const [text, setText] = useState("");
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
      toast.error("Reconhecimento de voz não suportado", {
        description: "Seu navegador não suporta a Web Speech API",
      });
      return;
    }

    try {
      const rec = new SR();
      rec.lang = "pt-BR";
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (e: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        const map: Record<string, string> = {
          "no-speech": "Nenhuma fala detectada",
          "audio-capture": "Erro ao capturar áudio",
          "not-allowed": "Permissão de microfone negada",
          network: "Erro de rede",
        };
        toast.error("Erro no reconhecimento de voz", {
          description: map[e.error] || e.error,
        });
      };

      rec.onresult = (ev: SpeechRecognitionEvent) => {
        const transcript = Array.from(ev.results)
          .map((r) => r[0].transcript)
          .join("");
        setText(transcript);

        const last = ev.results[ev.results.length - 1];
        if (last && last.isFinal) {
          const t = transcript.trim();
          if (t) {
            onSendMessage(t);
            setText("");
            inputRef.current?.focus();
            toast.success("Mensagem enviada");
          }
          stopRecognition();
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      setIsListening(false);
      toast.error("Falha ao iniciar o microfone");
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
    setText("");
    inputRef.current?.focus();
    toast.success("Mensagem enviada");
  }, [text, disabled, onSendMessage]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !disabled) {
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
    <div className="relative w-full max-w-4xl mx-auto px-2 md:px-4">
      <div
        className={`relative flex items-end gap-2 px-3 py-1 rounded-[22px] border bg-white ${
          disabled ? "opacity-50 cursor-not-allowed" : "shadow-sm"
        }`}
        role="group"
        aria-labelledby={helperId}
      >
        {/* Textarea */}
        <div className="flex-1 relative z-10">
          <TextareaAutosize
            ref={inputRef}
            id={inputId}
            placeholder={isListening ? "Escutando..." : "Digite ou fale sua mensagem..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            maxLength={maxLength}
            minRows={1}
            maxRows={5}
            aria-label="Campo de mensagem"
            aria-describedby={`${helperId} ${statusId}`}
            className="w-full px-0 py-1 border-0 bg-transparent resize-none focus:outline-none placeholder:text-neutral-400 text-sm leading-5"
          />

          {showCounter && (
            <div className="absolute -bottom-6 right-0 text-xs font-medium">
              <span className={isCritical ? "text-red-500" : "text-neutral-400"}>
                {text.length}/{maxLength}
              </span>
            </div>
          )}
        </div>

        {/* === BUTTONS (mantidos iguais ao original) === */}
        <div className="flex items-center gap-1.5 relative z-10">
          {/* Botão de voz (igual ao original) */}
          {text.trim().length === 0 && (
            <Button
              onClick={toggleVoice}
              variant="ghost"
              size="icon"
              disabled={disabled}
              aria-label={isListening ? "Parar gravação de voz" : "Iniciar gravação de voz"}
              aria-pressed={isListening}
              className={`
                h-7 w-7 rounded-[14px] transition-all duration-300 relative overflow-hidden group
                ${
                  isListening
                    ? "bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/30 scale-110"
                    : "bg-gradient-to-br from-neutral-100 to-neutral-50 hover:from-violet-100 hover:to-fuchsia-100 hover:scale-105 border-[1.5px] border-neutral-200/60"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isListening && (
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping"
                      style={{ animationDelay: `${i * 0.3}s`, animationDuration: "1.5s" }}
                    />
                  ))}
                </div>
              )}

              {isListening ? (
                <MicOff className="h-4 w-4 text-white relative z-10" aria-hidden="true" />
              ) : (
                <Mic className="h-4 w-4 text-neutral-600 relative z-10 transition-colors group-hover:text-violet-600" aria-hidden="true" />
              )}
            </Button>
          )}

          {/* Botão enviar (igual ao original) */}
          <Button
            onClick={send}
            disabled={disabled || !text.trim()}
            size="icon"
            aria-label="Enviar mensagem"
            className={`
              relative h-7 w-7 rounded-[14px] transition-all duration-300 overflow-hidden group
              ${
                !disabled && text.trim()
                  ? "bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 shadow-lg shadow-violet-500/40 hover:shadow-xl hover:shadow-violet-500/50 scale-100 hover:scale-110 hover:rotate-6"
                  : "bg-gradient-to-br from-neutral-100 to-neutral-50 border-[1.5px] border-neutral-200/60"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent
              before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
            `}
          >
            {!disabled && text.trim() && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-particle"
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
              <ArrowUp className="h-4 w-4 text-white relative z-10 transition-transform group-hover:scale-110" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4 text-neutral-400 relative z-10" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Status */}
      {(isListening || text.length > 0) && (
        <div id={statusId} className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs font-medium" role="status" aria-live="polite">
          {isListening ? (
            <span className="text-red-600">Gravando áudio</span>
          ) : (
            <span className="text-neutral-500">Pressione Enter para enviar</span>
          )}
        </div>
      )}

      {/* Helper para leitores de tela */}
      <div id={helperId} className="sr-only">
        Digite sua mensagem ou use o botão de microfone para gravar áudio. Pressione Enter para enviar.
      </div>

      {/* Animações usadas pelos botões (iguais às do original) */}
      <style jsx>{`
        @keyframes particle {
          0% { opacity: 0; transform: translate(0, 0) scale(0); }
          50% { opacity: 1; transform: translate(var(--tx, 10px), var(--ty, -10px)) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx, 20px), var(--ty, -20px)) scale(0); }
        }
        .animate-particle { animation: particle 1.5s ease-out infinite; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
      `}</style>
    </div>
  );
}

export default ChatInput;
export { ChatInput };