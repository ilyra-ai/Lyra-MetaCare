"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BrainCircuit, User, Sparkles, Copy, Check, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
}

export function ChatBubble({ message, isUser }: ChatBubbleProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isTyping, setIsTyping] = useState(!isUser);
  const [displayedText, setDisplayedText] = useState('');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Efeito de digitação para mensagens da AI
  useEffect(() => {
    if (!isUser && message) {
      setIsTyping(true);
      setDisplayedText('');
      
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex < message.length) {
          setDisplayedText(message.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
        }
      }, 20);

      return () => clearInterval(typingInterval);
    } else {
      setDisplayedText(message);
      setIsTyping(false);
    }
  }, [message, isUser]);

  // Gerar partículas aleatórias para avatar AI
  useEffect(() => {
    if (!isUser && isHovering) {
      const interval = setInterval(() => {
        const newParticle = {
          id: Date.now(),
          x: Math.random() * 40 - 20,
          y: Math.random() * 40 - 20
        };
        setParticles(prev => [...prev.slice(-5), newParticle]);
      }, 300);

      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [isUser, isHovering]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setIsCopied(true);
      toast.success('Mensagem copiada!', {
        icon: <Check className="h-4 w-4" />,
        duration: 2000
      });
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar mensagem');
    }
  };

  return (
    <div 
      className={cn(
        "group flex items-end gap-3 max-w-2xl transition-all duration-300",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
      onMouseEnter={() => {
        setIsHovering(true);
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        setTimeout(() => setShowActions(false), 200);
      }}
    >
      {/* Avatar com efeitos avançados */}
      <div className="relative">
        {/* Partículas flutuantes para AI */}
        {!isUser && particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-violet-400 rounded-full animate-particle-float"
            style={{
              left: `${particle.x + 16}px`,
              top: `${particle.y + 16}px`,
            }}
          />
        ))}

        {/* Anel pulsante para AI */}
        {!isUser && isHovering && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 opacity-30 blur-md animate-pulse-slow"></div>
            <div className="absolute inset-0 rounded-full border-2 border-violet-400/40 animate-ping-slow"></div>
          </div>
        )}

        <Avatar className={cn(
          "h-7 w-7 transition-all duration-300 relative z-10",
          isHovering && "scale-110 shadow-lg",
          !isUser && isHovering && "shadow-violet-500/50"
        )}>
          <AvatarFallback className={cn(
            "transition-all duration-500",
            isUser 
              ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white" 
              : "bg-gradient-to-br from-violet-600 via-fuchsia-600 to-purple-600 text-white"
          )}>
            {isUser ? (
              <User size={14} className="transition-transform group-hover:scale-110" />
            ) : (
              <BrainCircuit size={14} className={cn(
                "transition-transform",
                isTyping && "animate-pulse"
              )} />
            )}
          </AvatarFallback>
        </Avatar>

        {/* Badge "AI" flutuante */}
        {!isUser && isHovering && (
          <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full shadow-lg animate-slide-in">
            <Sparkles className="h-2.5 w-2.5 text-white" />
            <span className="text-[8px] font-bold text-white">AI</span>
          </div>
        )}
      </div>

      {/* Container da mensagem */}
      <div className="flex-1 relative">
        {/* Bubble principal com gradientes e efeitos */}
        <div className={cn(
          "relative p-4 rounded-3xl transition-all duration-300",
          "animate-in fade-in-50 slide-in-from-bottom-3 duration-500",
          isUser 
            ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-br-md shadow-lg shadow-blue-500/20" 
            : "bg-gradient-to-br from-white via-violet-50/30 to-fuchsia-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 text-foreground rounded-bl-md shadow-xl border border-violet-100/50 dark:border-violet-900/30 backdrop-blur-sm",
          isHovering && !isUser && "shadow-2xl shadow-violet-500/20 border-violet-200/70",
          isHovering && isUser && "shadow-2xl shadow-blue-500/30"
        )}>
          {/* Brilho superior sutil */}
          <div className={cn(
            "absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-50",
            isUser 
              ? "from-transparent via-white to-transparent" 
              : "from-transparent via-violet-300 to-transparent"
          )}></div>

          {/* Conteúdo da mensagem */}
          <div className="relative z-10">
            <p className={cn(
              "text-sm leading-relaxed",
              isUser ? "font-medium" : ""
            )}>
              {displayedText}
              {isTyping && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse"></span>
              )}
            </p>
          </div>

          {/* Indicador de "pensando" para AI */}
          {!isUser && isTyping && (
            <div className="absolute -bottom-6 left-4 flex items-center gap-1.5 text-xs text-violet-500 animate-fade-in">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="font-medium">processando</span>
            </div>
          )}
        </div>

        {/* Ações rápidas ao hover */}
        {showActions && !isTyping && (
          <div className={cn(
            "absolute -bottom-8 flex items-center gap-1 animate-slide-up",
            isUser ? "right-0" : "left-0"
          )}>
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200",
                "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
                "border border-neutral-200/60 dark:border-gray-700",
                "hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:scale-105",
                "active:scale-95"
              )}
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Copiar</span>
                </>
              )}
            </button>

            {!isUser && (
              <button
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200",
                  "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
                  "border border-neutral-200/60 dark:border-gray-700",
                  "hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:scale-105",
                  "active:scale-95"
                )}
                title="Regenerar resposta"
              >
                <RotateCw className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Regenerar</span>
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes particle-float {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(var(--tx), var(--ty)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--tx) * 2), calc(var(--ty) * 2)) scale(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
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

        .animate-particle-float {
          animation: particle-float 2s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s ease-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}