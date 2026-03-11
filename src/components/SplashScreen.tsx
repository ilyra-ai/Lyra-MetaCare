"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Applying Brand Guide: Lyra Teal (Primary) and Warm Coral (Secondary)


export function SplashScreen() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-screen overflow-hidden", // Added overflow-hidden to prevent scrollbars
        // Soft gradient reflecting the brand identity (Teal to transparent)
        "bg-gradient-to-b from-teal-50 to-rose-50 dark:from-gray-900 dark:to-gray-800",
        "animate-in fade-in duration-1000" // Animation: fadeIn 1s ease-in
      )}
    >
      {/* Logo Animado com deslocamento para a esquerda */}
      <div className="p-6 rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl transform -translate-x-4 md:-translate-x-8">
        <Loader2 className="h-16 w-16 text-teal-600 dark:text-teal-400 animate-spin" />
      </div>

      {/* Slogan */}
      <h1 className="mt-8 text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight text-center">
        Sua Jornada para Longevidade
      </h1>

      {/* Barra de progresso circular (Loader2 serves this purpose visually) */}
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Carregando dados...
      </p>
    </div>
  );
}