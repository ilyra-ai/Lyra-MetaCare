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
      className="h-auto min-h-8 max-w-full whitespace-normal rounded-full border-border bg-card px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:border-input hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      onClick={() => onSelect(text)}
    >
      {text}
    </Button>
  );
}
