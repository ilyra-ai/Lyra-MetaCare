"use client";

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BrainCircuit, User } from 'lucide-react';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
}

export function ChatBubble({ message, isUser }: ChatBubbleProps) {
  return (
    <div className={cn(
      "flex items-end gap-2 max-w-lg",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className={cn(isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white")}>
          {isUser ? <User size={18} /> : <BrainCircuit size={18} />}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        "p-3 rounded-2xl animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
        isUser 
          ? "bg-blue-600 text-white rounded-br-none" 
          : "bg-gray-200 dark:bg-gray-700 text-foreground rounded-bl-none"
      )}>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}