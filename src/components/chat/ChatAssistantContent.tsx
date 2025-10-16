"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { QuickReply } from './QuickReply';
import { getMockAIResponse } from './mock-ai';
import { Sparkles, Brain, TrendingUp, Zap, ChevronDown, Cpu, Stethoscope, HeartPulse, Calendar, BookOpen } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const quickReplies = ["Como posso melhorar meu sono?", "Qual meu resumo de ontem?", "Agendar consulta"];

const integrations = [
    { icon: Cpu, title: "Dialogflow", description: "Processamento de Linguagem Natural (NLP) para entender suas perguntas." },
    { icon: Stethoscope, title: "Google Med-PaLM 2", description: "Modelo de linguagem médica para insights de saúde seguros e precisos." },
    { icon: HeartPulse, title: "Health Connect & HealthKit", description: "Integração em tempo real com dados de wearables (Apple, Google, etc.)." },
    { icon: Brain, title: "Lyra's Longevity Engine", description: "Modelo proprietário para análise preditiva e criação de planos personalizados." },
    { icon: Calendar, title: "Google Calendar API", description: "Agendamento inteligente de consultas e lembretes de saúde." },
    { icon: BookOpen, title: "PubMed API", description: "Acesso a estudos científicos para fornecer as informações mais recentes." },
];

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
    <div className="relative flex flex-col h-full rounded-2xl overflow-hidden">
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
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-purple-600 rounded-xl shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {/* Indicador online */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
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

        {/* Stats e Integrações */}
        <div className="flex items-center gap-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-auto px-3 py-1.5 bg-violet-50/80 dark:bg-violet-900/20 rounded-xl border-violet-100/50 dark:border-violet-800/30 hover:bg-violet-100/90">
                        <Cpu className="h-3.5 w-3.5 mr-2 text-violet-600 dark:text-violet-400" />
                        <span className="text-xs font-medium text-violet-700 dark:text-violet-300">Tecnologias</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="space-y-4">
                        <h4 className="font-medium leading-none">Integrações Ativas</h4>
                        <p className="text-sm text-muted-foreground">
                            Este assistente é alimentado por uma combinação de tecnologias de ponta.
                        </p>
                        <div className="space-y-3">
                            {integrations.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="flex items-start gap-3">
                                        <Icon className="h-4 w-4 mt-1 text-violet-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
      </div>

      {/* Área de Mensagens com scroll customizado */}
      <div 
        ref={messagesContainerRef}
        className="relative flex-1 overflow-y-auto scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent'
        }}
      >
        <div className="max-w-4xl mx-auto p-6 space-y-6">
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