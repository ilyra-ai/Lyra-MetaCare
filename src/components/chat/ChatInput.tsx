"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Mic, MicOff } from 'lucide-react';
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
  const [isTyping, setIsTyping] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const recognitionRef = React.useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
    setCharCount(0);
    setIsTyping(false);
    // Focus no input após enviar
    inputRef.current?.focus();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    setCharCount(newText.length);
    
    // Indicador de digitação
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
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
      toast.info("Escutando...", { description: "Fale agora" });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = "Erro no reconhecimento de voz";
      
      switch(event.error) {
        case 'no-speech':
          errorMessage = "Nenhuma fala detectada";
          break;
        case 'audio-capture':
          errorMessage = "Microfone não encontrado";
          break;
        case 'not-allowed':
          errorMessage = "Permissão de microfone negada";
          break;
        case 'network':
          errorMessage = "Erro de rede";
          break;
      }
      
      toast.error(errorMessage, { description: event.error });
      setIsListening(false);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      setText(transcript);
      setCharCount(transcript.length);
      
      if (event.results[0].isFinal) {
        onSendMessage(transcript);
        setText('');
        setCharCount(0);
        toast.success("Mensagem enviada");
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
    <div className="relative">
      {/* Container principal com animação de foco */}
      <div 
        className={`
          flex items-center gap-2 p-1.5
          rounded-2xl
          transition-all duration-300 ease-out
          ${isFocused || isListening 
            ? 'bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50 shadow-lg shadow-indigo-100/50' 
            : 'bg-transparent'
          }
        `}
      >
        {/* Input com efeitos melhorados */}
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Digite sua mensagem..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={`
              flex-1 pr-16
              rounded-xl
              border-[1.5px]
              transition-all duration-300
              ${isFocused 
                ? 'border-indigo-300 shadow-sm bg-white ring-2 ring-indigo-100/50' 
                : 'border-neutral-200 bg-white/80 hover:bg-white hover:border-neutral-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              backdrop-blur-sm
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-indigo-400/50
              focus-visible:ring-offset-0
              placeholder:text-neutral-400
              placeholder:transition-colors
              focus:placeholder:text-neutral-300
            `}
            maxLength={2000}
          />
          
          {/* Contador de caracteres sutil */}
          {charCount > 0 && (
            <span 
              className={`
                absolute right-3 top-1/2 -translate-y-1/2
                text-xs font-light
                transition-all duration-300
                ${charCount > 1800 ? 'text-orange-500' : 'text-neutral-400'}
                ${charCount > 1950 ? 'text-red-500 font-medium' : ''}
              `}
            >
              {charCount > 1500 ? `${charCount}/2000` : ''}
            </span>
          )}
          
          {/* Indicador de digitação */}
          {isTyping && !isListening && (
            <div className="absolute -bottom-5 left-2 flex items-center gap-1">
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-xs text-indigo-400 font-light ml-1">digitando</span>
            </div>
          )}
        </div>

        {/* Botão de voz melhorado */}
        <Button 
          onClick={handleVoiceInput} 
          variant="secondary" 
          size="icon"
          disabled={disabled}
          className={`
            relative
            rounded-xl
            transition-all duration-300
            ${isListening 
              ? 'bg-red-50 hover:bg-red-100 border-red-200 shadow-md shadow-red-100/50 scale-105' 
              : 'bg-white/80 hover:bg-white border-neutral-200 hover:border-neutral-300 hover:scale-105'
            }
            border-[1.5px]
            backdrop-blur-sm
            active:scale-95
            disabled:opacity-50
            disabled:cursor-not-allowed
            group
          `}
        >
          {/* Pulse effect quando escutando */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-xl bg-red-400 animate-ping opacity-20"></span>
              <span className="absolute inset-0 rounded-xl bg-red-400 animate-pulse opacity-10"></span>
            </>
          )}
          
          {isListening ? (
            <MicOff className="h-4 w-4 text-red-500 relative z-10 transition-transform group-hover:scale-110" />
          ) : (
            <Mic className="h-4 w-4 relative z-10 transition-transform group-hover:scale-110" />
          )}
        </Button>

        {/* Botão de enviar melhorado */}
        <Button 
          onClick={handleSend} 
          disabled={disabled || !text.trim()} 
          size="icon"
          className={`
            relative
            rounded-xl
            transition-all duration-300
            overflow-hidden
            ${!disabled && text.trim()
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-300/50 scale-100 hover:scale-105'
              : 'bg-neutral-100 border-neutral-200 border-[1.5px]'
            }
            active:scale-95
            disabled:opacity-50
            disabled:cursor-not-allowed
            group
            before:absolute
            before:inset-0
            before:bg-white/20
            before:translate-x-[-100%]
            before:transition-transform
            before:duration-300
            hover:before:translate-x-[100%]
          `}
        >
          <Send 
            className={`
              h-4 w-4 relative z-10
              transition-all duration-300
              ${!disabled && text.trim() 
                ? 'text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5' 
                : 'text-neutral-400'
              }
            `}
          />
          
          {/* Ripple effect ao hover */}
          {!disabled && text.trim() && (
            <span className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          )}
        </Button>
      </div>

      {/* Indicador de voz ativa */}
      {isListening && (
        <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-2 animate-fade-in">
          <div className="flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs text-red-600 font-medium">Gravando áudio</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}