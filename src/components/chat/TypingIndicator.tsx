'use client';

export function TypingIndicator() {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-cosmic/15 bg-card/90 px-4 py-2.5 shadow-sm backdrop-blur-xs"
      role="status"
      aria-label="Lyra está digitando"
    >
      <div className="h-2 w-2 animate-bounce rounded-full bg-cosmic [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
    </div>
  );
}
