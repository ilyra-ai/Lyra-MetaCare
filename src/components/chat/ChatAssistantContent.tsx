'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Brain,
  Calendar,
  ChevronDown,
  Cpu,
  HeartPulse,
  Sparkles,
  Waves,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/context/AuthContext';
import { usePublicSitePageConfig } from '@/hooks/use-public-site-page-config';
import { scaleRem } from '@/lib/site-page-config/runtime';
import { cn } from '@/lib/utils';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { QuickReply } from './QuickReply';
import { TypingIndicator } from './TypingIndicator';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

type IntegrationItem = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const integrations: IntegrationItem[] = [
  {
    icon: Cpu,
    title: 'API local Next.js',
    description:
      'Camada interna responsável pela autenticação, pelas rotas protegidas e pela orquestração do backend MySQL.',
  },
  {
    icon: HeartPulse,
    title: 'Contexto fisiológico vivo',
    description:
      'Métricas recentes, sinais do dia e leituras de monitoramento ajudam a compor respostas mais situadas.',
  },
  {
    icon: Brain,
    title: 'Orquestração Lyra',
    description:
      'A conversa cruza IA, preferências, astrologia computacional e histórico recente de forma local e contextual.',
  },
  {
    icon: Calendar,
    title: 'Agenda sincronizada',
    description:
      'Consultas, profissionais e próximos compromissos ajudam a guiar respostas práticas dentro do fluxo do app.',
  },
  {
    icon: BookOpen,
    title: 'Perfil e hábitos',
    description:
      'Dados de perfil, hábitos e preferências do usuário moldam a linguagem e a direção das orientações.',
  },
  {
    icon: Waves,
    title: 'Camada de ritmo diário',
    description:
      'Sono, energia e percepção de ritmo ajudam a priorizar respostas mais gentis e realistas.',
  },
];

export function ChatAssistantContent() {
  const { db } = useAuth();
  const { config: appConfig } = usePublicSitePageConfig('app');
  const chatConfig = appConfig.chat;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: chatConfig.welcomeMessage,
      sender: 'ai',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [userApiKey, setUserApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserApiKey(localStorage.getItem('lyra_byok_api_key') || '');
  }, []);

  const handleSaveApiKey = (val: string) => {
    setUserApiKey(val);
    localStorage.setItem('lyra_byok_api_key', val);
    if (val) {
      toast.success('Chave de API (BYOK) configurada com sucesso on-device.');
    }
  };

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0]?.sender !== 'ai') {
        return current;
      }

      if (current[0].text === chatConfig.welcomeMessage) {
        return current;
      }

      return [
        {
          ...current[0],
          text: chatConfig.welcomeMessage,
        },
      ];
    });
  }, [chatConfig.welcomeMessage]);

  const quickReplies = useMemo(
    () =>
      chatConfig.quickReplies
        .filter((item) => item.trim().length > 0)
        .slice(0, 6),
    [chatConfig.quickReplies]
  );

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [isNearBottom, isTyping, messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      setShowScrollButton(distanceFromBottom > 100);
      setIsNearBottom(distanceFromBottom < 50);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const askAssistant = async (query: string) => {
    setIsTyping(true);
    setIsNearBottom(true);

    try {
      const { data, error } = await db.functions.invoke<{ response: string }>(
        'ask-ai-assistant',
        {
          body: { query, userApiKey },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      const newAiMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai',
      };

      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      const errorMessage = (error as Error).message;

      toast.error('Erro ao contatar o assistente.', {
        description: errorMessage,
      });

      const errorAiMessage: Message = {
        id: Date.now() + 1,
        text: `Desculpe, ocorreu um erro ao processar sua solicitação: ${errorMessage}`,
        sender: 'ai',
      };

      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) {
      return;
    }

    const newUserMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
    };

    setMessages((prev) => [...prev, newUserMessage]);
    await askAssistant(text);
  };

  const handleRegenerate = async (aiMessageId: number) => {
    const messageIndex = messages.findIndex((m) => m.id === aiMessageId);
    if (messageIndex < 0) {
      return;
    }

    const previousUserMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((m) => m.sender === 'user');

    if (!previousUserMessage) {
      toast.error('Não há pergunta anterior para regenerar esta resposta.');
      return;
    }

    setMessages((prev) => prev.filter((m) => m.id !== aiMessageId));
    await askAssistant(previousUserMessage.text);
  };

  return (
    <section className="flex h-full flex-col gap-4">
      <Card className="overflow-hidden border-border/70 bg-white/88 shadow-sm backdrop-blur-xl">
        <CardHeader className="gap-4 border-b border-border/60 bg-[radial-gradient(circle_at_top_left,hsl(var(--cosmic)/0.10)_0%,transparent_38%),radial-gradient(circle_at_top_right,hsl(var(--primary)/0.14)_0%,transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,248,252,0.92))]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-cosmic/45 via-accent/20 to-primary/45 blur-xl" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/80 bg-[linear-gradient(135deg,hsl(var(--cosmic)),hsl(var(--primary)))] text-white shadow-cosmic">
                  <Brain className="h-6 w-6" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground"
                  style={{
                    fontSize: scaleRem(0.68, appConfig.typography.navLabel),
                  }}
                >
                  {chatConfig.pageEyebrow}
                </p>
                <CardTitle
                  className="text-2xl md:text-3xl"
                  style={{
                    fontSize: scaleRem(1.8, appConfig.typography.pageTitle),
                  }}
                >
                  {chatConfig.pageTitle}
                </CardTitle>
                <CardDescription
                  className="max-w-3xl leading-7"
                  style={{
                    fontSize: scaleRem(0.98, appConfig.typography.pageBody),
                  }}
                >
                  {chatConfig.pageDescription}
                </CardDescription>
              </div>
            </div>

            {chatConfig.showIntegrations ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full border-cosmic/20 bg-cosmic-light/50 px-4"
                  >
                    <Cpu className="text-cosmic" />
                    {chatConfig.integrationsButtonLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[22rem] border-border/70 bg-white/92 p-0 backdrop-blur-xl">
                  <div className="border-b border-border/60 px-5 py-4">
                    <h4 className="text-base font-semibold text-foreground">
                      {chatConfig.integrationsTitle}
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {chatConfig.integrationsDescription}
                    </p>
                  </div>
                  <div className="space-y-3 px-5 py-4">
                    {integrations.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.title}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-cosmic-light text-cosmic">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item.title}
                            </p>
                            <p className="text-xs leading-6 text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-border/60 bg-muted/10 px-5 py-4">
                    <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" /> BYOK
                      (Privacidade On-Device)
                    </p>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      Insira sua chave do modelo LLM para processamento privado.
                      A chave fica apenas no seu navegador.
                    </p>
                    <Input
                      type="password"
                      placeholder="sk-..."
                      value={userApiKey}
                      onChange={(e) => handleSaveApiKey(e.target.value)}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="relative flex min-h-[44rem] flex-col overflow-hidden border-border/70 bg-[radial-gradient(circle_at_top_left,hsl(var(--cosmic)/0.08)_0%,transparent_30%),radial-gradient(circle_at_top_right,hsl(var(--primary)/0.10)_0%,transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(249,248,252,0.96))] shadow-sm backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:22px_22px] opacity-40" />

          <div className="relative z-10 flex items-center justify-between gap-4 border-b border-border/60 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,hsl(var(--cosmic)),hsl(var(--primary)))] text-white shadow-cosmic">
                <Brain className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-success text-[9px] font-bold text-white">
                  •
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3
                    className="font-semibold text-foreground"
                    style={{
                      fontSize: scaleRem(1.12, appConfig.typography.cardTitle),
                    }}
                  >
                    {chatConfig.assistantTitle}
                  </h3>
                  <Sparkles className="h-4 w-4 text-cosmic" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    {chatConfig.assistantStatusLabel}
                  </span>
                  <span className="text-border">•</span>
                  <span>{chatConfig.assistantStatusNote}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="relative z-10 flex-1 overflow-y-auto px-4 py-5"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(139, 92, 246, 0.28) transparent',
            }}
          >
            <div className="mx-auto flex max-w-4xl flex-col gap-6">
              {messages.length === 1 ? (
                <div className="rounded-[24px] border border-border/70 bg-white/84 p-5 shadow-sm">
                  <p className="text-sm leading-7 text-muted-foreground">
                    {chatConfig.emptyStateHint}
                  </p>
                </div>
              ) : null}

              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className="animate-in fade-in-50 slide-in-from-bottom-4"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <ChatBubble
                    message={msg.text}
                    isUser={msg.sender === 'user'}
                    onRegenerate={
                      msg.sender === 'ai' && index > 0
                        ? () => void handleRegenerate(msg.id)
                        : undefined
                    }
                  />
                </div>
              ))}

              {isTyping ? (
                <div className="animate-in fade-in-50 slide-in-from-bottom-4">
                  <TypingIndicator />
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {showScrollButton ? (
            <button
              onClick={() => {
                scrollToBottom();
                setIsNearBottom(true);
              }}
              className="absolute bottom-32 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-cosmic/20 bg-white/92 shadow-xl transition-all duration-300 hover:scale-110"
              aria-label="Voltar para o final da conversa"
            >
              <ChevronDown className="h-5 w-5 text-cosmic" />
            </button>
          ) : null}

          <div className="relative z-10 border-t border-border/60 bg-white/88 px-4 py-4 backdrop-blur-xl">
            {chatConfig.showQuickReplies && messages.length <= 2 ? (
              <div className="mb-4 space-y-3">
                <div className="flex flex-col gap-1">
                  <p
                    className="text-sm font-semibold text-foreground"
                    style={{
                      fontSize: scaleRem(0.95, appConfig.typography.cardTitle),
                    }}
                  >
                    {chatConfig.quickRepliesTitle}
                  </p>
                  <p
                    className="text-xs leading-6 text-muted-foreground"
                    style={{
                      fontSize: scaleRem(0.8, appConfig.typography.cardBody),
                    }}
                  >
                    {chatConfig.quickRepliesDescription}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <div
                      key={reply}
                      className="animate-in fade-in-50 slide-in-from-left-4"
                      style={{
                        animationDelay: `${index * 90}ms`,
                        animationFillMode: 'backwards',
                      }}
                    >
                      <QuickReply text={reply} onSelect={handleSendMessage} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              placeholder={chatConfig.inputPlaceholder}
            />
          </div>
        </Card>

        <aside className="flex flex-col gap-4">
          <Card className="border-border/70 bg-white/88 shadow-sm">
            <CardHeader className="gap-2">
              <CardTitle
                className="text-lg"
                style={{
                  fontSize: scaleRem(1.02, appConfig.typography.cardTitle),
                }}
              >
                {chatConfig.quickRepliesTitle}
              </CardTitle>
              <CardDescription
                style={{
                  fontSize: scaleRem(0.84, appConfig.typography.cardBody),
                }}
              >
                {chatConfig.quickRepliesDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => void handleSendMessage(reply)}
                  className={cn(
                    'rounded-[18px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,248,252,0.96))] px-4 py-3 text-left text-sm text-foreground transition hover:border-cosmic/25 hover:bg-cosmic-light/40'
                  )}
                >
                  {reply}
                </button>
              ))}
            </CardContent>
          </Card>

          {chatConfig.showIntegrations ? (
            <Card className="border-border/70 bg-white/88 shadow-sm">
              <CardHeader className="gap-2">
                <CardTitle
                  className="text-lg"
                  style={{
                    fontSize: scaleRem(1.02, appConfig.typography.cardTitle),
                  }}
                >
                  {chatConfig.integrationsTitle}
                </CardTitle>
                <CardDescription
                  style={{
                    fontSize: scaleRem(0.84, appConfig.typography.cardBody),
                  }}
                >
                  {chatConfig.integrationsDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {integrations.slice(0, 4).map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[20px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,248,252,0.94))] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-6 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
