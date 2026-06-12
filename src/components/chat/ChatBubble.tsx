'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BrainCircuit,
  User,
  Sparkles,
  Copy,
  Check,
  RotateCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  onRegenerate?: () => void;
}

export function ChatBubble({ message, isUser, onRegenerate }: ChatBubbleProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isTyping, setIsTyping] = useState(!isUser);
  const [displayedText, setDisplayedText] = useState('');
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  // Efeito de digitação para mensagens da IA
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

  // Gerar partículas etéreas ao redor do avatar da IA
  useEffect(() => {
    if (!isUser && isHovering) {
      const interval = setInterval(() => {
        const newParticle = {
          id: Date.now(),
          x: Math.random() * 40 - 20,
          y: Math.random() * 40 - 20,
        };
        setParticles((prev) => [...prev.slice(-5), newParticle]);
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
        duration: 2000,
      });

      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar mensagem');
    }
  };

  return (
    <div
      className={cn(
        'group flex max-w-2xl items-end gap-3 transition-all duration-300',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
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
      {/* Avatar com aura luminosa */}
      <div className="relative">
        {!isUser &&
          particles.map((particle) => (
            <div
              key={particle.id}
              className="animate-particle-float absolute h-1 w-1 rounded-full bg-cosmic"
              style={{
                left: `${particle.x + 16}px`,
                top: `${particle.y + 16}px`,
              }}
            />
          ))}

        {!isUser && isHovering && (
          <div className="absolute inset-0 rounded-full">
            <div className="animate-pulse-slow absolute inset-0 rounded-full bg-[linear-gradient(135deg,hsl(var(--cosmic)),hsl(var(--primary)),hsl(var(--accent)))] opacity-30 blur-md"></div>
            <div className="animate-ping-slow absolute inset-0 rounded-full border-2 border-cosmic/40"></div>
          </div>
        )}

        <Avatar
          className={cn(
            'relative z-10 h-7 w-7 transition-all duration-300',
            isHovering && 'scale-110 shadow-lg',
            !isUser && isHovering && 'shadow-cosmic'
          )}
        >
          <AvatarFallback
            className={cn(
              'transition-all duration-500',
              isUser
                ? 'bg-gradient-teal text-white'
                : 'bg-[linear-gradient(135deg,hsl(var(--cosmic)),hsl(var(--primary)))] text-white'
            )}
          >
            {isUser ? (
              <User
                size={14}
                className="transition-transform group-hover:scale-110"
              />
            ) : (
              <BrainCircuit
                size={14}
                className={cn(
                  'transition-transform',
                  isTyping && 'animate-pulse'
                )}
              />
            )}
          </AvatarFallback>
        </Avatar>

        {/* Selo IA flutuante */}
        {!isUser && isHovering && (
          <div className="animate-slide-in absolute -right-1 -top-1 flex items-center gap-0.5 rounded-full bg-[linear-gradient(135deg,hsl(var(--cosmic)),hsl(var(--accent)))] px-1.5 py-0.5 shadow-cosmic">
            <Sparkles className="h-2.5 w-2.5 text-white" />
            <span className="text-[8px] font-bold text-white">IA</span>
          </div>
        )}
      </div>

      {/* Container da mensagem */}
      <div className="relative flex-1">
        <div
          className={cn(
            'relative rounded-3xl px-4 py-3 transition-all duration-300',
            'animate-in fade-in-50 slide-in-from-bottom-3 duration-500',
            isUser
              ? 'rounded-br-md bg-gradient-teal text-white shadow-teal'
              : 'rounded-bl-md border border-cosmic/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),hsl(var(--cosmic-light)/0.4))] text-foreground shadow-md backdrop-blur-sm',
            isHovering && !isUser && 'border-cosmic/25 shadow-cosmic',
            isHovering && isUser && 'shadow-lg'
          )}
        >
          {/* Brilho superior sutil */}
          <div
            className={cn(
              'absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-50',
              isUser
                ? 'from-transparent via-white to-transparent'
                : 'from-transparent via-cosmic/40 to-transparent'
            )}
          ></div>

          {/* Conteúdo da mensagem */}
          <div className="relative z-10">
            <p
              className={cn(
                'text-sm leading-relaxed',
                isUser ? 'font-medium' : ''
              )}
            >
              {displayedText}
              {isTyping && (
                <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-current"></span>
              )}
            </p>
          </div>

          {/* Indicador de "pensando" da IA */}
          {!isUser && isTyping && (
            <div className="animate-fade-in absolute -bottom-6 left-4 flex items-center gap-1.5 text-xs text-cosmic">
              <div className="flex gap-1">
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-cosmic"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
              <span className="font-medium">processando</span>
            </div>
          )}
        </div>

        {/* Ações rápidas ao hover */}
        {showActions && !isTyping && (
          <div
            className={cn(
              'animate-slide-up absolute -bottom-8 flex items-center gap-1',
              isUser ? 'right-0' : 'left-0'
            )}
          >
            <button
              onClick={handleCopy}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-all duration-200',
                'border border-border/70 bg-card/90 backdrop-blur-sm',
                'hover:scale-105 hover:bg-card hover:shadow-md',
                'active:scale-95'
              )}
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 text-success" />
                  <span className="text-xs font-medium text-success">
                    Copiado!
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Copiar
                  </span>
                </>
              )}
            </button>

            {!isUser && onRegenerate && (
              <button
                onClick={onRegenerate}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-all duration-200',
                  'border border-border/70 bg-card/90 backdrop-blur-sm',
                  'hover:scale-105 hover:bg-card hover:shadow-md',
                  'active:scale-95'
                )}
                title="Regenerar resposta"
              >
                <RotateCw className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Regenerar
                </span>
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
            transform: translate(var(--tx, 8px), var(--ty, -8px)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(
                calc(var(--tx, 8px) * 2),
                calc(var(--ty, -8px) * 2)
              )
              scale(0);
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

        .animate-particle-float {
          animation: particle-float 2s ease-out forwards;
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
      `}</style>
    </div>
  );
}
