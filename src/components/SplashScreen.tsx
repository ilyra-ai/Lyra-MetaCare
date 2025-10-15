"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Simulating the calm color scheme using existing Tailwind classes or custom ones
// We'll use a light background and primary/accent colors for the theme.

export function SplashScreen() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-screen",
        // Simulating the soft gradient background (blue to green)
        "bg-gradient-to-b from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800",
        "animate-in fade-in duration-1000" // Animation: fadeIn 1s ease-in
      )}
    >
      {/* Logo Central Animado (Placeholder for 3D/Neumorphism effect) */}
      <div className="p-6 rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl">
        <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
      </div>

      {/* Slogan */}
      <h1 className="mt-8 text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
        Sua Jornada para Longevidade
      </h1>

      {/* Barra de progresso circular (Loader2 serves this purpose visually) */}
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Carregando dados...
      </p>
    </div>
  );
}