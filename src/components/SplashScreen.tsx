'use client';

import { Sparkles } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen overflow-hidden bg-background">
      {/* Decorative orbs */}
      <div className="cosmic-orb w-64 h-64 bg-primary/20 -top-20 -left-20" />
      <div className="cosmic-orb w-48 h-48 bg-accent/20 -bottom-16 -right-16" />
      <div className="cosmic-orb w-32 h-32 bg-cosmic/20 top-1/3 right-1/4" />

      {/* Logo */}
      <div className="relative animate-fade-in">
        <div className="p-5 rounded-2xl bg-gradient-teal shadow-teal animate-glow-pulse">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
      </div>

      {/* Brand name */}
      <h1 className="mt-6 text-3xl font-display font-bold text-gradient-hero animate-fade-in-up">
        lyra
      </h1>

      {/* Tagline */}
      <p className="mt-3 text-sm text-muted-foreground animate-fade-in-up">
        Seu Bem-Estar Orquestrado
      </p>

      {/* Loading indicator */}
      <div className="mt-8 flex gap-1.5 animate-fade-in">
        <span
          className="h-2 w-2 rounded-full bg-primary animate-pulse-slow"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-primary animate-pulse-slow"
          style={{ animationDelay: '300ms' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-primary animate-pulse-slow"
          style={{ animationDelay: '600ms' }}
        />
      </div>
    </div>
  );
}
