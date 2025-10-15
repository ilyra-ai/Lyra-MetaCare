"use client";

import { Camera, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function QuickScanFAB() {
  const handleScan = () => {
    toast.info("Funcionalidade em desenvolvimento", {
      description: "O scanner de alimentos (via câmera) estará disponível em breve para análise nutricional instantânea.",
    });
  };

  return (
    <div className={cn(
        "fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40",
        "animate-in slide-in-from-bottom-10 duration-500"
    )}>
      <Button
        onClick={handleScan}
        className="h-14 w-14 rounded-full shadow-xl bg-green-600 hover:bg-green-700 transition-all duration-300 group"
        aria-label="Quick Scan"
      >
        <Camera className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
      </Button>
    </div>
  );
}