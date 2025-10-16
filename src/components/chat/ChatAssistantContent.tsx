"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { QuickReply } from './QuickReply';
import { getMockAIResponse } from './mock-ai';
import { Sparkles, Brain, TrendingUp, Zap, ChevronDown } from 'lucide-react';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const quickReplies = ["Como posso melhorar meu sono?", "Qual meu resumo de ontem?", "Agendar consulta"];

export function ChatAssistantContent() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Olá! Sou seu assistente de saúde. Como posso ajudar hoje?", sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [messageCount, setMessageCount] = useState(1);
  const [sessionStartTime] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  // Scroll automático e detecção de posição
  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isTyping, isNearBottom]);

  // Monitorar scroll para mostrar botão
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      setShowScrollButton(distanceFromBottom > 100);
      setIsNearBottom(distanceFromBottom < 50);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newUserMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
    };
    setMessages(prev => [...prev, newUserMessage]);
    setMessageCount(prev => prev + 1);
    setIsTyping(true);
    setIsNearBottom(true);

    // Simula a resposta da IA com variação mais natural
    const typingDelay = 1500 + Math.random() * 1000;
    setTimeout(() => {
      const aiResponseText = getMockAIResponse(text);
      const newAiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
      };
      setIsTyping(false);
      setMessageCount(prev => prev + 1);
      setMessages(prev => [...prev, newAiMessage]);
    }, typingDelay);
  };

  // Calcular tempo de sessão
  const getSessionDuration = () => {
    const duration = Math.floor((Date.now() - sessionStartTime) / 60000);
    return duration < 1 ? '< 1 min' : `${duration} min`;
  };

  return (
    <div className="relative flex flex-col h-full max-h-[calc(100vh-220px)] rounded-2xl overflow-hidden shadow-2xl">
      {/* Background gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-gray-900 dark:via-gray-900 dark:to-violet-950 opacity-60"></div>
      
      {/* Padrão de grade sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* Header melhorado */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-violet-100/50 dark:border-violet-900/30">
        <div className="flex items-center gap-3">
          {/* Avatar AI com efeitos */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl blur-md opacity-50 animate-pulse-slow"></div>
            <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-purple-600 rounded-2xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            {/* Indicador online */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Assistente de Saúde
              </h3>
              <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Online
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <span>Responde em segundos</span>
            </div>
          </div>
        </div>

        {/* Stats da conversa */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50/80 dark:bg-violet-900/20 rounded-xl border border-violet-100/50 dark:border-violet-800/30">
            <TrendingUp className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
              {messageCount} mensagens
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-fuchsia-50/80 dark:bg-fuchsia-900/20 rounded-xl border border-fuchsia-100/50 dark:border-fuchsia-800/30">
            <Zap className="w-3.5 h-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
            <span className="text-xs font-medium text-fuchsia-700 dark:text-fuchsia-300">
              {getSessionDuration()}
            </span>
          </div>
        </div>
      </div>

      {/* Área de Mensagens com scroll customizado */}
      <div 
        ref={messagesContainerRef}
        className="relative flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent'
        }}
      >
        {/* Indicador de início da conversa */}
        <div className="flex flex-col items-center justify-center py-6 animate-fade-in">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-full mb-3">
            <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            Início da conversa • {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Mensagens */}
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className="animate-in fade-in-50 slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
          >
            <ChatBubble message={msg.text} isUser={msg.sender === 'user'} />
          </div>
        ))}
        
        {/* Indicador de digitação */}
        {isTyping && (
          <div className="animate-in fade-in-50 slide-in-from-bottom-4">
            <TypingIndicator />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Botão flutuante para scroll */}
      {showScrollButton && (
        <button
          onClick={() => {
            scrollToBottom();
            setIsNearBottom(true);
          }}
          className="absolute bottom-32 right-6 z-20 flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-violet-200 dark:border-violet-800 hover:scale-110 transition-all duration-300 group animate-bounce-subtle"
        >
          <ChevronDown className="w-5 h-5 text-violet-600 dark:text-violet-400 group-hover:translate-y-0.5 transition-transform" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-20 blur-md transition-opacity"></div>
        </button>
      )}

      {/* Footer com sugestões e input */}
      <div className="relative z-10 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-violet-100/50 dark:border-violet-900/30">
        {/* Quick Replies melhoradas */}
        {messages.length <= 2 && (
          <div className="mb-3 animate-in fade-in-50 slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Sugestões rápidas
              </span>
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickReplies.map((reply, index) => (
                <div
                  key={reply}
                  className="animate-in fade-in-50 slide-in-from-left-4"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                >
                  <QuickReply text={reply} onSelect={handleSendMessage} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Input principal */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-neutral-400 dark:text-neutral-600">
          <Zap className="w-3 h-3" />
          <span>Assistente alimentado por IA • Respostas instantâneas</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Custom scrollbar */
        *::-webkit-scrollbar {
          width: 6px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 10px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}