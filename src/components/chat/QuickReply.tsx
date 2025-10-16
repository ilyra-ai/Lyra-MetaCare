"use client";

import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface QuickReplyProps {
  text: string;
  onSelect: (text: string) => void;
}

export function QuickReply({ text, onSelect }: QuickReplyProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Efeito ripple moderno (tendência 2025)
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
    
    onSelect(text);
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <Button
      variant="outline"
      size="sm"
      className={`
        group
        relative
        overflow-hidden
        whitespace-nowrap
        rounded-full
        px-5
        py-2.5
        font-medium
        text-sm
        transition-all
        duration-300
        ease-out
        bg-white/80
        hover:bg-white
        backdrop-blur-sm
        border-neutral-200/60
        hover:border-neutral-300
        border-[1.5px]
        text-neutral-700
        shadow-sm
        hover:shadow-md
        cursor-pointer
        hover:scale-105
        active:scale-95
        hover:-translate-y-0.5
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-indigo-400/50
        focus-visible:ring-offset-2
        focus-visible:ring-offset-white
        before:absolute
        before:inset-0
        before:rounded-full
        before:bg-gradient-to-br
        before:from-white/40
        before:to-transparent
        before:opacity-0
        before:transition-opacity
        before:duration-300
        hover:before:opacity-100
        after:absolute
        after:bottom-0
        after:left-0
        after:h-[2px]
        after:w-0
        after:rounded-full
        after:bg-gradient-to-r
        after:from-indigo-400
        after:to-purple-400
        after:transition-all
        after:duration-500
        after:ease-out
        hover:after:w-full
        ${isPressed ? 'scale-95' : 'scale-100'}
      `}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Efeitos ripple */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '0px',
            height: '0px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Texto com microinteração */}
      <span className="relative inline-block transition-all duration-300 group-hover:tracking-wide">
        {text}
      </span>

      {/* Indicador de interatividade sutil */}
      <span 
        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          w-1.5
          h-1.5
          rounded-full
          bg-current
          opacity-0
          transition-all
          duration-300
          group-hover:opacity-30
          group-hover:scale-110
        "
      />

      <style jsx>{`
        @keyframes ripple {
          to {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
        
        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }
      `}</style>
    </Button>
  );
}