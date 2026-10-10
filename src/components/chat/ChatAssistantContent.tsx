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
import { usePrivacyMode } from '@/hooks/use-privacy-mode';
import { useLocalStorageValue } from '@/hooks/use-local-storage-value';
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

const WELCOME_MESSAGE_ID = 0;
const BYOK_STORAGE_KEY = 'lyra_byok_api_key';

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
  const { privacyMode } = usePrivacyMode();
  const chatConfig = appConfig.chat;

  // A conversa guarda apenas as mensagens trocadas; a mensagem de boas-vindas
  // é derivada da configuração publicada e sempre aparece em primeiro lugar.
  const [conversation, setConversation] = useState<Message[]>([]);
  const messages = useMemo<Message[]>(
    () => [
      { id: WELCOME_MESSAGE_ID, text: chatConfig.welcomeMessage, sender: 'ai' },
      ...conversation,
    ],
    [chatConfig.welcomeMessage, conversation]
  );
  // Identificadores sequenciais das mensagens (gerados apenas em handlers).
  const nextMessageIdRef = useRef(WELCOME_MESSAGE_ID + 1);
  const createMessageId = () => {
    const id = nextMessageIdRef.current;
    nextMessageIdRef.current += 1;
    return id;
  };
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [storedApiKey, setStoredApiKey] =
    useLocalStorageValue(BYOK_STORAGE_KEY);
  const userApiKey = storedApiKey ?? '';
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleSaveApiKey = (val: string) => {
    setStoredApiKey(val.length > 0 ? val : null);
  };

  const quickReplies = useMemo(
    () =>
      chatConfig.quickReplies
        .filter((item) => item.trim().length > 0)
        .slice(0, 6),
    [chatConfig.quickReplies]
  );

  // Rola só a lista de mensagens: `scrollIntoView` também rolava a janela e
  // escondia o topo da página ao abrir o chat.
  const scrollToBottom = (smooth = true) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
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
      // Modo Privacidade: não enviar a chave externa (BYOK); a conversa é
      // atendida apenas pelo motor determinístico local, sem LLM externo.
      const { data, error } = await db.functions.invoke<{ response: string }>(
        'ask-ai-assistant',
        {
          body: { query, userApiKey: privacyMode ? '' : userApiKey },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      const newAiMessage: Message = {
        id: createMessageId(),
        text: data.response,
        sender: 'ai',
      };

      setConversation((prev) => [...prev, newAiMessage]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido.';

      toast.error('Erro ao contatar o assistente.', {
        description: errorMessage,
      });

      const errorAiMessage: Message = {
        id: createMessageId(),
        text: `Desculpe, ocorreu um erro ao processar sua solicitação: ${errorMessage}`,
        sender: 'ai',
      };

      setConversation((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) {
      return;
    }

    const newUserMessage: Message = {
      id: createMessageId(),
      text,
      sender: 'user',
    };

    setConversation((prev) => [...prev, newUserMessage]);
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

    setConversation((prev) => prev.filter((m) => m.id !== aiMessageId));
    await askAssistant(previousUserMessage.text);
  };

  return (
    <section className="flex flex-col gap-4">
      <Card className="min-w-0">
        <CardHeader className="gap-4 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-cosmic-light text-cosmic-strong">
                <Brain className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <p
                  className="text-sm font-medium text-muted-foreground"
                  style={{
                    fontSize: scaleRem(0.875, appConfig.typography.navLabel),
                  }}
                >
                  {chatConfig.pageEyebrow}
                </p>
                <CardTitle
                  className="text-2xl tracking-[-0.02em]"
                  style={{
                    fontSize: scaleRem(1.5, appConfig.typography.pageTitle),
                  }}
                >
                  {chatConfig.pageTitle}
                </CardTitle>
                <CardDescription
                  className="max-w-3xl leading-relaxed"
                  style={{
                    fontSize: scaleRem(0.95, appConfig.typography.pageBody),
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
                    className="w-full shrink-0 sm:w-fit"
                  >
                    <Cpu className="text-cosmic" aria-hidden="true" />
                    {chatConfig.integrationsButtonLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-[min(22rem,calc(100vw-2rem))] border-border bg-popover p-0"
                >
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
                      {chatConfig.integrationsTitle}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {chatConfig.integrationsDescription}
                    </p>
                  </div>
                  <div className="max-h-[50dvh] space-y-3 overflow-y-auto px-5 py-4">
                    {integrations.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.title}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cosmic-light text-cosmic-strong">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {item.title}
                            </p>
                            <p className="text-xs leading-5 text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-border bg-background px-5 py-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Sparkles
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />{' '}
                      BYOK (sua própria chave)
                    </p>
                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                      Use a sua chave do Google AI Studio (Gemini). Ela fica
                      salva só neste navegador e acompanha cada pergunta até o
                      servidor da Lyra, que a repassa ao Gemini sem gravá-la.
                    </p>
                    <Input
                      type="password"
                      placeholder="AIza..."
                      aria-label="Chave da API do modelo de linguagem (BYOK)"
                      autoComplete="off"
                      value={userApiKey}
                      onChange={(e) => handleSaveApiKey(e.target.value)}
                      className="h-9 bg-card text-xs"
                    />
                    <p
                      className="mt-2 text-xs text-muted-foreground"
                      aria-live="polite"
                    >
                      {userApiKey
                        ? privacyMode
                          ? 'Chave salva neste navegador, mas não enviada: o Modo Privacidade está ativo.'
                          : 'Chave salva neste navegador.'
                        : 'Nenhuma chave salva.'}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/*
          Altura amarrada à janela: no celular o cartão ocupa quase toda a
          tela (o cabeçalho rola acima dele); no desktop, cabeçalho da página
          + cartão de conversa cabem juntos. Só a lista de mensagens rola.
        */}
        <Card className="relative flex h-[calc(100dvh-6rem)] min-h-[26rem] min-w-0 flex-col overflow-hidden lg:h-[calc(100dvh-15rem)]">
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cosmic-light text-cosmic-strong">
                <Brain className="h-5 w-5" aria-hidden="true" />
                <span
                  className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-success"
                  aria-hidden="true"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <h2
                    className="truncate font-display font-semibold tracking-tight text-foreground"
                    style={{
                      fontSize: scaleRem(1.05, appConfig.typography.cardTitle),
                    }}
                  >
                    {chatConfig.assistantTitle}
                  </h2>
                  <Sparkles
                    className="h-4 w-4 shrink-0 text-cosmic"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className="h-2 w-2 rounded-full bg-success"
                      aria-hidden="true"
                    />
                    {chatConfig.assistantStatusLabel}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{chatConfig.assistantStatusNote}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--control)) transparent',
            }}
          >
            <div className="mx-auto flex max-w-4xl flex-col gap-4">
              {messages.length === 1 ? (
                <div className="rounded-md border border-border bg-background p-4">
                  <p className="text-sm leading-6 text-muted-foreground">
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
            </div>
          </div>

          {showScrollButton ? (
            <button
              onClick={() => {
                scrollToBottom();
                setIsNearBottom(true);
              }}
              type="button"
              className="absolute bottom-32 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-muted"
              aria-label="Voltar para o final da conversa"
            >
              <ChevronDown className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}

          <div className="border-t border-border bg-card px-3 py-3 sm:px-5">
            {chatConfig.showQuickReplies && messages.length <= 2 ? (
              <div className="mb-3 space-y-2">
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
                    className="hidden text-xs leading-5 text-muted-foreground sm:block"
                    style={{
                      fontSize: scaleRem(0.8, appConfig.typography.cardBody),
                    }}
                  >
                    {chatConfig.quickRepliesDescription}
                  </p>
                </div>
                <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
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

        <aside className="flex min-w-0 flex-col gap-4 xl:h-[calc(100dvh-15rem)] xl:min-h-[26rem] xl:overflow-y-auto">
          <Card>
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
                    'rounded-md border border-border bg-background px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-input hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  {reply}
                </button>
              ))}
            </CardContent>
          </Card>

          {chatConfig.showIntegrations ? (
            <Card>
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
                      className="rounded-md border border-border bg-background p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cosmic-light text-cosmic-strong">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
