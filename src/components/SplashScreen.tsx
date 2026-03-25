'use client';

import { MoonStar, Orbit, Sparkles } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="orchestrated-orb left-[-8rem] top-[-4rem] h-64 w-64 bg-primary animate-pulse-slow" />
      <div className="orchestrated-orb right-[-5rem] top-[12%] h-56 w-56 bg-cosmic animate-float" />
      <div className="orchestrated-orb bottom-[-4rem] left-[18%] h-52 w-52 bg-accent animate-pulse-slow" />

      <div className="surface-panel relative w-full max-w-xl overflow-hidden px-10 py-14 text-center animate-scale-in">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-aurora" />

        <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cosmic/20 bg-cosmic-light animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border border-primary/20 bg-primary/5" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-teal text-white shadow-teal animate-glow-pulse">
            <Sparkles className="h-9 w-9" strokeWidth={1.9} />
          </div>
          <Orbit
            className="absolute -right-3 top-4 h-5 w-5 text-cosmic animate-float"
            strokeWidth={1.9}
          />
          <MoonStar
            className="absolute -left-2 bottom-4 h-5 w-5 text-accent animate-float"
            strokeWidth={1.9}
          />
        </div>

        <p className="eyebrow mx-auto w-fit">
          <Sparkles className="h-3.5 w-3.5" />
          Preparando sua leitura do dia
        </p>

        <h1 className="mt-5 font-display text-4xl font-bold lowercase tracking-tight text-gradient-hero">
          lyra
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
          Carregando biometria, contexto cósmico e protocolos personalizados
          para entregar uma experiência clara, serena e precisa.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse-slow" />
          <span className="h-2.5 w-2.5 rounded-full bg-cosmic animate-pulse-slow animate-delay-150" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse-slow animate-delay-300" />
        </div>
      </div>
    </div>
  );
}
