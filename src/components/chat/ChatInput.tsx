"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send } from "lucide-react";
import { toast } from "sonner";

// ---- SpeechRecognition types (minimal, TS 5.x friendly) ----
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

// ---- Props ----
interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

// ---- Defaults ----
const DEFAULT_MAX_LENGTH = 4000;
const HIGH_CHAR_THRESHOLD = 0.75; // start showing counter
const CRITICAL_CHAR_THRESHOLD = 0.95; // critical style

export default function ChatInput({
  onSendMessage,
  disabled = false,
  maxLength = DEFAULT_MAX_LENGTH,
}: ChatInputProps) {
  // state
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);

  // refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // a11y ids
  const inputId = useId();
  const statusId = useId();

  // ---- Voice recognition handlers ----
  const stopRecognition = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Reconhecimento de voz indisponível", {
        description: "Seu navegador não suporta a Web Speech API.",
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
          "audio-capture": "Não foi possível capturar o áudio",
          "not-allowed": "Permissão de microfone negada",
          network: "Problema de conexão",
        };
        toast.error("Erro no reconhecimento de voz", {
          description: map[e.error] || e.error,
        });
      };

      rec.onresult = (ev: SpeechRecognitionEvent) => {
        // concat interim results
        const transcript = Array.from(ev.results)
          .map((r) => r[0].transcript)
          .join("");
        setText(transcript);

        // send when final
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

  // cleanup
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // ---- Send helpers ----
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
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  // ---- UI derived ----
  const charProgress = text.length / maxLength;
  const showCounter = charProgress >= HIGH_CHAR_THRESHOLD;
  const isCritical = charProgress >= CRITICAL_CHAR_THRESHOLD;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`flex items-end gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm ${
          disabled ? "opacity-60" : ""
        }`}
        role="group"
        aria-describedby={statusId}
      >
        {/* Textarea */}
        <div className="flex-1">
          <TextareaAutosize
            ref={inputRef}
            id={inputId}
            placeholder={isListening ? "Escutando…" : "Escreva sua mensagem…"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            maxLength={maxLength}
            minRows={1}
            maxRows={6}
            aria-label="Mensagem"
            className="w-full resize-none border-0 bg-transparent text-sm leading-5 placeholder:text-neutral-400 focus:outline-none"
          />
          {showCounter && (
            <div className="mt-1 text-right text-xs">
              <span className={isCritical ? "text-red-600" : "text-neutral-400"}>
                {text.length}/{maxLength}
              </span>
            </div>
          )}
        </div>

        {/* Mic */}
        {text.trim().length === 0 && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={toggleVoice}
            disabled={disabled}
            aria-label={isListening ? "Parar gravação" : "Iniciar gravação"}
            aria-pressed={isListening}
            className="h-8 w-8"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}

        {/* Send */}
        <Button
          type="button"
          size="icon"
          onClick={send}
          disabled={disabled || text.trim().length === 0}
          aria-label="Enviar"
          className="h-8 w-8"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Status line (a11y-friendly, minimal) */}
      {(isListening || text.length > 0) && (
        <div id={statusId} role="status" aria-live="polite" className="mt-2 text-center text-xs text-neutral-500">
          {isListening ? "Gravando áudio…" : "Pressione Enter para enviar."}
        </div>
      )}
    </div>
  );
}
