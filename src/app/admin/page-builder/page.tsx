import { Metadata } from 'next';
import { PageBuilderContent } from '@/components/admin/page-builder/PageBuilderContent';
import { Sparkles, ShieldCheck, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Construtor UI (GenUI) | Lyra Admin',
  description: 'Motor de arquitetura visual para Landing Page e Hub de Autenticação. Tendência Premium 2026.',
};

export default function PageBuilderAdminPage() {
  return (
    <div className="flex w-full min-h-screen flex-col bg-gradient-to-br from-background/50 via-muted/30 to-background/50 p-6 md:p-10 lg:p-14 gap-10">

      {/* Premium Header Section */}
      <div className="relative flex flex-col gap-6 w-full max-w-[1400px] mx-auto">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-20 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-3 max-w-2xl relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm border border-primary/20 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>GenUI Engine 2026</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm border border-emerald-500/20 backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin Exclusive</span>
              </span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-foreground/90 leading-[1.1]">
              Construtor de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Experiências</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mt-2 font-medium">
              A arquitetura visual na palma da sua mão. Modele a Landing Page e a Interface de Login
              na íntegra através de um motor JSON robusto. Layouts adaptativos renderizados em tempo real
              via Server Components de alta performance.
            </p>
          </div>

          <div className="hidden lg:flex flex-col gap-4 bg-white/40 p-5 rounded-3xl border border-white/60 shadow-glass backdrop-blur-xl relative z-10 w-72">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center shadow-inner-sm">
                 <Cpu className="h-5 w-5 text-primary" />
               </div>
               <div className="flex flex-col">
                 <span className="text-sm font-bold text-foreground">Motor de Renderização</span>
                 <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   Online & Sincronizado
                 </span>
               </div>
             </div>
             <div className="text-xs text-muted-foreground border-t border-border/50 pt-3">
               Todas as alterações propagam globalmente instantaneamente. Estrutura sem limites rígidos.
             </div>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="w-full max-w-[1400px] mx-auto relative z-10">
        <PageBuilderContent />
      </div>

    </div>
  );
}