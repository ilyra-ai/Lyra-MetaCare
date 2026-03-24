'use client';

import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function QuickScanFAB() {
  const handleScan = () => {
    toast.info('Funcionalidade em desenvolvimento', {
      description:
        'O scanner de alimentos (via câmera) estará disponível em breve para análise nutricional instantânea.',
    });
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40 animate-fade-in-up">
      <Button
        onClick={handleScan}
        className="h-14 w-14 rounded-full shadow-lg bg-gradient-teal text-white hover:shadow-teal transition-all duration-200 group"
        aria-label="Quick Scan"
      >
        <Camera className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </Button>
    </div>
  );
}
