"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { QuickReply } from './QuickReply';
import { getMockAIResponse } from './mock-ai';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newUserMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    // Simula a resposta da IA
    setTimeout(() => {
      const aiResponseText = getMockAIResponse(text);
      const newAiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
      };
      setIsTyping(false);
      setMessages(prev => [...prev, newAiMessage]);
    }, 1500 + Math.random() * 1000);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-220px)] bg-white dark:bg-gray-900 border rounded-lg shadow-md">
      {/* Área de Mensagens */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg.text} isUser={msg.sender === 'user'} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões e Input */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-800/50">
        <div className="flex space-x-2 mb-2 overflow-x-auto pb-2">
            {quickReplies.map(reply => (
                <QuickReply key={reply} text={reply} onSelect={handleSendMessage} />
            ))}
        </div>
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}