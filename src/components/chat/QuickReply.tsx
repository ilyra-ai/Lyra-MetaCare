'use client';

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
      className="h-8 whitespace-nowrap rounded-full border-cosmic/20 bg-card/85 px-3 text-xs text-foreground transition-colors hover:border-cosmic/35 hover:bg-cosmic-light/50"
      onClick={() => onSelect(text)}
    >
      {text}
    </Button>
  );
}
