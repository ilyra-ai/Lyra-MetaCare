"use client";

import { Button } from '@/components/ui/button';

interface QuickReplyProps {
  text: string;
  onSelect: (text: string) => void;
}

export function QuickReply({ text, onSelect }: QuickReplyProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="whitespace-nowrap rounded-full"
      onClick={() => onSelect(text)}
    >
      {text}
    </Button>
  );
}