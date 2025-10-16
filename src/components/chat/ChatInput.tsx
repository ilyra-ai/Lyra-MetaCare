"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Mic, MicOff, Sparkles, ArrowUp, Zap, Brain } from 'lucide-react';
import { toast } from 'sonner';

// Extend the Window interface for SpeechRecognition APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [aiPulse, setAiPulse] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const recognitionRef = React.useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const waveformIntervalRef = useRef<NodeJS.Timeout>();

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
    };
  }, []);

  // Gerar waveform animado durante gravação
  useEffect(() => {
    if (isListening) {
      waveformIntervalRef.current = setInterval(() => {
        const newWave = Array.from({ length: 40 }, () => Math.random() * 100);
        setWaveformData(newWave);
      }, 100);
    } else {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
      setWaveformData([]);
    }
    return () => {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
    };
  }, [isListening]);

  // Simular sugestão de AI após alguns segundos de foco
  useEffect(() => {
    if (isFocused && text.length === 0) {
      const timer = setTimeout(() => {
        setShowAiSuggestion(true);
        setAiPulse(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowAiSuggestion(false);
      setAiPulse(false);
    }
  }, [isFocused, text]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
    inputRef.current?.focus();
    
    // Feedback visual de sucesso
    toast.success('Mensagem enviada', {
      icon: <Zap className="h-4 w-4" />,
      duration: 1500
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Reconhecimento de voz não é suportado neste navegador.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('🎤 Escutando...', { duration: 2000 });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error("Erro no reconhecimento de voz", { description: event.error });
      setIsListening(false);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      setText(transcript);
      
      if (event.results[0].isFinal) {
        onSendMessage(transcript);
        setText('');
        toast.success('Mensagem de voz enviada!');
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast.error("Erro ao iniciar reconhecimento de voz");
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-2 md:px-4">
      {/* Sugestão AI contextual flutuante */}
      {showAiSuggestion && (
        <div className="absolute -top-14 left-4 right-4 flex items-center justify-center animate-slide-down">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-violet-200/50 shadow-lg shadow-violet-500/10">
            <Brain className={`h-4 w-4 text-violet-600 ${aiPulse ? 'animate-pulse' : ''}`} />
            <span className="text-sm text-violet-700 font-medium">Como posso te ajudar hoje?</span>
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-500 animate-spin-slow" />
          </div>
        </div>
      )}

      {/* Container principal com design futurista */}
      <div 
        className={`
          relative
          flex items-end gap-3
          px-4 py-3
          rounded-[28px]
          transition-all duration-500 ease-out
          ${isFocused 
            ? 'bg-gradient-to-br from-white via-violet-50/30 to-fuchsia-50/30 shadow-[0_8px_32px_rgba(139,92,246,0.15)] border-[2px] border-violet-200/60' 
            : isHovering
            ? 'bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-[1.5px] border-neutral-200/80'
            : 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-[1.5px] border-neutral-200/60'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          backdrop-blur-2xl
        `}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Borda animada gradiente */}
        {isFocused && (
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 opacity-20 blur-xl animate-pulse-slow"></div>
        )}

        {/* Indicador de AI ativo */}
        {isFocused && (
          <div className="absolute -top-1 -right-1 flex items-center gap-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-md opacity-60 animate-pulse"></div>
              <div className="relative w-3 h-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Input com contexto visual */}
        <div className="flex-1 min-h-[48px] relative z-10">
          <Input
            ref={inputRef}
            type="text"
            placeholder={isListening ? "Escutando..." : "Digite ou fale sua mensagem..."}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={`
              w-full
              min-h-[48px]
              px-0
              py-3
              border-0
              bg-transparent
              resize-none
              focus-visible:outline-none
              focus-visible:ring-0
              focus-visible:ring-offset-0
              placeholder:text-neutral-400
              placeholder:transition-all
              placeholder:duration-300
              ${isFocused ? 'placeholder:text-violet-400' : ''}
              ${isListening ? 'placeholder:text-red-400 placeholder:animate-pulse' : ''}
              text-[15px]
              leading-7
              font-medium
            `}
            maxLength={4000}
          />
          
          {/* Contador de caracteres progressivo */}
          {text.length > 3000 && (
            <div className="absolute -bottom-6 right-0 text-xs font-medium transition-colors duration-300">
              <span className={text.length > 3800 ? 'text-red-500' : 'text-neutral-400'}>
                {text.length}/4000
              </span>
            </div>
          )}
        </div>

        {/* Botões de ação modernos */}
        <div className="flex items-center gap-2 pb-1 relative z-10">
          {/* Botão de voz com waveform */}
          {text.trim().length === 0 && (
            <div className="relative">
              <Button 
                onClick={handleVoiceInput} 
                variant="ghost"
                size="icon"
                disabled={disabled}
                className={`
                  h-10 w-10
                  rounded-2xl
                  transition-all duration-300
                  relative
                  overflow-hidden
                  ${isListening 
                    ? 'bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/30 scale-110' 
                    : 'bg-gradient-to-br from-neutral-100 to-neutral-50 hover:from-violet-100 hover:to-fuchsia-100 hover:scale-105 border-[1.5px] border-neutral-200/60'
                  }
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  group
                `}
              >
                {/* Efeito de ondas sonoras */}
                {isListening && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping"
                        style={{ animationDelay: `${i * 0.3}s`, animationDuration: '1.5s' }}
                      ></div>
                    ))}
                  </div>
                )}
                
                {isListening ? (
                  <MicOff className="h-5 w-5 text-white relative z-10" />
                ) : (
                  <Mic className="h-5 w-5 text-neutral-600 relative z-10 transition-colors group-hover:text-violet-600" />
                )}
              </Button>
            </div>
          )}

          {/* Botão de enviar futurista */}
          <Button 
            onClick={handleSend} 
            disabled={disabled || !text.trim()} 
            size="icon"
            className={`
              relative
              h-10 w-10
              rounded-2xl
              transition-all duration-300
              overflow-hidden
              group
              ${!disabled && text.trim()
                ? 'bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 shadow-lg shadow-violet-500/40 hover:shadow-xl hover:shadow-violet-500/50 scale-100 hover:scale-110 hover:rotate-6'
                : 'bg-gradient-to-br from-neutral-100 to-neutral-50 border-[1.5px] border-neutral-200/60'
              }
              disabled:opacity-50
              disabled:cursor-not-allowed
              before:absolute
              before:inset-0
              before:bg-gradient-to-br
              before:from-white/40
              before:to-transparent
              before:opacity-0
              before:transition-opacity
              before:duration-300
              hover:before:opacity-100
            `}
          >
            {/* Partículas de energia ao hover */}
            {!disabled && text.trim() && (
              <>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full animate-particle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.5}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </>
            )}
            
            {!disabled && text.trim() ? (
              <ArrowUp className="h-5 w-5 text-white relative z-10 transition-transform group-hover:scale-110" />
            ) : (
              <Send className="h-4 w-4 text-neutral-400 relative z-10" />
            )}
          </Button>
        </div>
      </div>

      {/* Waveform visualizer durante gravação */}
      {isListening && waveformData.length > 0 && (
        <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-1 h-12 animate-fade-in">
          {waveformData.map((height, index) => (
            <div
              key={index}
              className="w-1 bg-gradient-to-t from-red-500 to-orange-400 rounded-full transition-all duration-100"
              style={{
                height: `${Math.max(height * 0.4, 8)}px`,
                opacity: 0.6 + (height / 200)
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Indicador de status inteligente */}
      {(isListening || text.length > 0) && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs font-medium animate-fade-in">
          {isListening && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm border border-red-200/50 rounded-full">
              <div className="relative flex">
                <span className="absolute inline-flex h-2 w-2 rounded-full bg-red-500 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </div>
              <span className="text-red-600">Gravando áudio</span>
            </div>
          )}
          {text.length > 0 && !isListening && (
            <div className="flex items-center gap-2 text-neutral-500">
              <Sparkles className="h-3 w-3" />
              <span>AI pronto para responder</span>
            </div>
          )}
        </div>
      )}

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
          --tx: ${Math.random() * 40 - 20}px;
          --ty: ${Math.random() * 40 - 20}px;
        }
      `}</style>
    </div>
  );
}