'use client';

export function TypingIndicator() {
  return (
    <div
      className="ml-10 inline-flex items-center gap-1.5 rounded-xl rounded-tl-md border border-border bg-card px-4 py-3 sm:ml-11"
      role="status"
      aria-label="Lyra está digitando"
    >
      <div className="h-2 w-2 animate-pulse rounded-full bg-cosmic [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-cosmic [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-cosmic"></div>
    </div>
  );
}
