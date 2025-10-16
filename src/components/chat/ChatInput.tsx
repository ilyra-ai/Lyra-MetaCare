"use client";

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Send, Mic, MicOff, Sparkles, ArrowUp, Zap, Brain } from 'lucide-react';
import { toast } from 'sonner';

// Extend Window interface para Speech Recognition APIs
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Tipos para Speech Recognition (compatível com TypeScript 5.7)
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
  message: string;
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

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
  maxLength?: number;
}

// Constantes para configuração
const DEFAULT_MAX_LENGTH = 4000;
const HIGH_CHAR_THRESHOLD = 0.75;
const CRITICAL_CHAR_THRESHOLD = 0.95;
const AI_SUGGESTION_DELAY = 2000;
const WAVEFORM_BARS = 40;
const WAVEFORM_UPDATE_INTERVAL = 100;

export function ChatInput({ 
  onSendMessage, 
  disabled, 
  maxLength = DEFAULT_MAX_LENGTH 
}: ChatInputProps) {
  // Estados
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [aiPulse, setAiPulse] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const waveformIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const suggestionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // IDs únicos para acessibilidade (React 19.2)
  const inputId = useId();
  const statusId = useId();
  const helperId = useId();

  // React 19.2: useEffectEvent para callbacks estáveis
  // Substitui padrões antigos com useRef para event handlers
  const handleRecognitionStart = useCallback(() => {
    setIsListening(true);
    toast.info('🎤 Escutando...', { duration: 2000 });
  }, []);

  const handleRecognitionEnd = useCallback(() => {
    setIsListening(false);
  }, []);

  const handleRecognitionError = useCallback((event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error);
    
    const errorMessages: Record<string, string> = {
      'no-speech': 'Nenhuma fala detectada',
      'audio-capture': 'Erro ao capturar áudio',
      'not-allowed': 'Permissão de microfone negada',
      'network': 'Erro de conexão de rede'
    };

    toast.error('Erro no reconhecimento de voz', { 
      description: errorMessages[event.error] || event.error 
    });
    setIsListening(false);
  }, []);

  const handleRecognitionResult = useCallback((event: SpeechRecognitionEvent) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join('');

    setText(transcript);

    if (event.results[0].isFinal) {
      onSendMessage(transcript);
      setText('');
      toast.success('Mensagem de voz enviada!', {
        icon: <Zap className="h-4 w-4" />,
        duration: 1500
      });
    }
  }, [onSendMessage]);

  // Cleanup ao desmontar (React 19.2 - melhor gerenciamento de recursos)
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
      
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }
    };
  }, []);

  // Waveform animado durante gravação
  useEffect(() => {
    if (isListening) {
      waveformIntervalRef.current = setInterval(() => {
        setWaveformData(
          Array.from({ length: WAVEFORM_BARS }, () => Math.random() * 100)
        );
      }, WAVEFORM_UPDATE_INTERVAL);
    } else {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
        waveformIntervalRef.current = null;
      }
      setWaveformData([]);
    }

    return () => {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
    };
  }, [isListening]);

  // Sugestão AI com delay (React 19.2 - melhor gerenciamento de side effects)
  useEffect(() => {
    if (isFocused && text.length === 0) {
      suggestionTimerRef.current = setTimeout(() => {
        setShowAiSuggestion(true);
        setAiPulse(true);
      }, AI_SUGGESTION_DELAY);
      
      return () => {
        if (suggestionTimerRef.current) {
          clearTimeout(suggestionTimerRef.current);
        }
      };
    } else {
      setShowAiSuggestion(false);
      setAiPulse(false);
    }
  }, [isFocused, text.length]);

  // Handlers
  const handleSend = useCallback(() => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    onSendMessage(trimmedText);
    setText('');
    inputRef.current?.focus();

    toast.success('Mensagem enviada', {
      icon: <Zap className="h-4 w-4" />,
      duration: 1500
    });
  }, [text, onSendMessage]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const handleVoiceInput = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      toast.error('Reconhecimento de voz não suportado', {
        description: 'Seu navegador não suporta a Web Speech API'
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'pt-BR';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = handleRecognitionStart;
      recognition.onend = handleRecognitionEnd;
      recognition.onerror = handleRecognitionError;
      recognition.onresult = handleRecognitionResult;

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast.error('Erro ao iniciar reconhecimento de voz');
      setIsListening(false);
    }
  }, [
    isListening,
    handleRecognitionStart,
    handleRecognitionEnd,
    handleRecognitionError,
    handleRecognitionResult
  ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !disabled && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [disabled, handleSend]);

  // Cálculos de progresso
  const charProgress = text.length / maxLength;
  const showCharCounter = charProgress >= HIGH_CHAR_THRESHOLD;
  const isCharCritical = charProgress >= CRITICAL_CHAR_THRESHOLD;

  return (
    <div className="relative w-full max-w-4xl mx-auto px-2 md:px-4">
      {/* Sugestão AI contextual */}
      {showAiSuggestion && (
        <div 
          className="absolute -top-14 left-4 right-4 flex items-center justify-center animate-slide-down"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-violet-200/50 shadow-lg shadow-violet-500/10">
            <Brain className={`h-4 w-4 text-violet-600 ${aiPulse ? 'animate-pulse' : ''}`} aria-hidden="true" />
            <span className="text-sm text-violet-700 font-medium">Como posso te ajudar hoje?</span>
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-500 animate-spin-slow" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* Container principal */}
      <div 
        className={`
          relative flex items-end gap-3 px-4 py-3 rounded-[28px]
          transition-all duration-500 ease-out backdrop-blur-2xl
          ${isFocused 
            ? 'bg-gradient-to-br from-white via-violet-50/30 to-fuchsia-50/30 shadow-[0_8px_32px_rgba(139,92,246,0.15)] border-[2px] border-violet-200/60' 
            : isHovering
            ? 'bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-[1.5px] border-neutral-200/80'
            : 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-[1.5px] border-neutral-200/60'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        role="group"
        aria-labelledby={helperId}
      >
        {/* Borda animada gradiente */}
        {isFocused && (
          <div 
            className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 opacity-20 blur-xl animate-pulse-slow"
            aria-hidden="true"
          />
        )}

        {/* Indicador AI ativo */}
        {isFocused && (
          <div className="absolute -top-1 -right-1 flex items-center gap-1" aria-hidden="true">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-md opacity-60 animate-pulse" />
              <div className="relative w-3 h-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" />
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex-1 relative z-10">
          <TextareaAutosize
            ref={inputRef}
            id={inputId}
            placeholder={isListening ? "Escutando..." : "Digite ou fale sua mensagem..."}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            maxLength={maxLength}
            minRows={1}
            maxRows={5}
            aria-label="Campo de mensagem"
            aria-describedby={`${helperId} ${statusId}`}
            aria-invalid={false}
            className={`
              w-full px-0 py-3 border-0 bg-transparent resize-none
              focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
              placeholder:text-neutral-400 placeholder:transition-all placeholder:duration-300
              ${isFocused ? 'placeholder:text-violet-400' : ''}
              ${isListening ? 'placeholder:text-red-400 placeholder:animate-pulse' : ''}
              text-[15px] leading-7 font-medium
            `}
          />

          {/* Contador de caracteres */}
          {showCharCounter && (
            <div 
              className="absolute -bottom-6 right-0 text-xs font-medium transition-colors duration-300"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className={isCharCritical ? 'text-red-500' : 'text-neutral-400'}>
                {text.length}/{maxLength}
              </span>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-2 pb-1 relative z-10">
          {/* Botão de voz */}
          {text.trim().length === 0 && (
            <Button 
              onClick={handleVoiceInput} 
              variant="ghost"
              size="icon"
              disabled={disabled}
              aria-label={isListening ? "Parar gravação de voz" : "Iniciar gravação de voz"}
              aria-pressed={isListening}
              className={`
                h-10 w-10 rounded-2xl transition-all duration-300 relative overflow-hidden group
                ${isListening 
                  ? 'bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/30 scale-110' 
                  : 'bg-gradient-to-br from-neutral-100 to-neutral-50 hover:from-violet-100 hover:to-fuchsia-100 hover:scale-105 border-[1.5px] border-neutral-200/60'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {/* Ondas sonoras */}
              {isListening && (
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping"
                      style={{ 
                        animationDelay: `${i * 0.3}s`, 
                        animationDuration: '1.5s' 
                      }}
                    />
                  ))}
                </div>
              )}

              {isListening ? (
                <MicOff className="h-5 w-5 text-white relative z-10" aria-hidden="true" />
              ) : (
                <Mic className="h-5 w-5 text-neutral-600 relative z-10 transition-colors group-hover:text-violet-600" aria-hidden="true" />
              )}
            </Button>
          )}

          {/* Botão enviar */}
          <Button 
            onClick={handleSend} 
            disabled={disabled || !text.trim()} 
            size="icon"
            aria-label="Enviar mensagem"
            className={`
              relative h-10 w-10 rounded-2xl transition-all duration-300 overflow-hidden group
              ${!disabled && text.trim()
                ? 'bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 shadow-lg shadow-violet-500/40 hover:shadow-xl hover:shadow-violet-500/50 scale-100 hover:scale-110 hover:rotate-6'
                : 'bg-gradient-to-br from-neutral-100 to-neutral-50 border-[1.5px] border-neutral-200/60'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent
              before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
            `}
          >
            {/* Partículas de energia */}
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
              <ArrowUp className="h-5 w-5 text-white relative z-10 transition-transform group-hover:scale-110" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4 text-neutral-400 relative z-10" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Waveform visualizer */}
      {isListening && waveformData.length > 0 && (
        <div 
          className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-1 h-12 animate-fade-in"
          role="img"
          aria-label="Visualização de forma de onda do áudio"
        >
          {waveformData.map((height, index) => (
            <div
              key={index}
              className="w-1 bg-gradient-to-t from-red-500 to-orange-400 rounded-full transition-all duration-100"
              style={{
                height: `${Math.max(height * 0.4, 8)}px`,
                opacity: 0.6 + (height / 200)
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* Indicador de status */}
      {(isListening || text.length > 0) && (
        <div 
          id={statusId}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs font-medium animate-fade-in"
          role="status"
          aria-live="polite"
        >
          {isListening && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm border border-red-200/50 rounded-full">
              <div className="relative flex" aria-hidden="true">
                <span className="absolute inline-flex h-2 w-2 rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </div>
              <span className="text-red-600">Gravando áudio</span>
            </div>
          )}
          {text.length > 0 && !isListening && (
            <div className="flex items-center gap-2 text-neutral-500">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              <span>AI pronto para responder</span>
            </div>
          )}
        </div>
      )}

      {/* Helper text oculto para screen readers */}
      <div id={helperId} className="sr-only">
        Digite sua mensagem ou use o botão de microfone para gravar áudio. 
        Pressione Enter para enviar.
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -5px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

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

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-particle {
          animation: particle 1.5s ease-out infinite;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </div>
  );
}