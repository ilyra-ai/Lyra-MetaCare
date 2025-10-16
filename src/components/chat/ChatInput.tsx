"use client";

import React, { useState, useRef } from 'react';
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
  const recognitionRef = React.useRef<any>(null);

  const handleSend = () => {
    onSendMessage(text);
    setText('');
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
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
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
      }
    };

    recognition.start();
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Digite sua mensagem..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && handleSend()}
        disabled={disabled}
        className="flex-1"
      />
      <Button onClick={handleVoiceInput} variant="secondary" size="icon" disabled={disabled}>
        {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
      </Button>
      <Button onClick={handleSend} disabled={disabled || !text.trim()} size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}