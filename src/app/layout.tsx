import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeColorSync } from '@/components/theme/ThemeControls';
import { COR_DA_BARRA_DO_NAVEGADOR } from '@/components/theme/tema';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
});

/**
 * Origem pública para as URLs absolutas dos metadados (Open Graph, canônica).
 * Vem de APP_BASE_URL ou NEXT_PUBLIC_APP_URL (tarefa 58); antes era um
 * domínio fixo inexistente. Sem as duas, o endereço local do servidor.
 */
function origemPublica() {
  const configurada =
    process.env.APP_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  try {
    if (configurada) return new URL(configurada);
  } catch {
    // Valor inválido: segue para o endereço local, que é sempre válido.
  }
  return new URL(`http://localhost:${process.env.PORT?.trim() || '3000'}`);
}

export const metadata: Metadata = {
  metadataBase: origemPublica(),
  title: {
    default: 'Lyra MetaCare',
    template: '%s | Lyra MetaCare',
  },
  description:
    'Plataforma de bem-estar, longevidade e autoconhecimento: seus sinais do dia, o seu mapa védico e uma IA que orienta a rotina. Não substitui avaliação profissional de saúde.',
  keywords: [
    'Lyra MetaCare',
    'saúde preventiva',
    'bem-estar',
    'inteligência artificial',
    'astrologia védica',
    'longevidade',
    'monitoramento',
    'wellness premium',
  ],
  applicationName: 'Lyra MetaCare',
  authors: [{ name: 'iLyra AI' }],
  creator: 'iLyra AI',
  publisher: 'iLyra AI',
  category: 'health',
  openGraph: {
    title: 'Lyra MetaCare',
    description:
      'Seu bem-estar orquestrado com inteligência artificial, métricas vitais e sabedoria ancestral.',
    siteName: 'Lyra MetaCare',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lyra MetaCare',
    description:
      'Bem-estar preventivo premium com IA, biometria e uma experiência clara, serena e sofisticada.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Sem maximumScale: o zoom do navegador precisa continuar disponível
  // (WCAG 1.4.4, redimensionar texto).
  // Valor inicial (tema claro, o padrão); o `ThemeColorSync` troca a cor
  // quando o tema escuro é aplicado.
  themeColor: COR_DA_BARRA_DO_NAVEGADOR.light,
  // A aplicação oferece os dois esquemas; o `next-themes` grava no <html> o
  // `color-scheme` do tema escolhido.
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen font-sans antialiased">
        <a href="#conteudo-principal" className="skip-nav">
          Pular para o conteúdo principal
        </a>
        {/* Claro por padrão; a pessoa pode escolher Escuro ou Do sistema
            (menu do perfil ou botão das telas públicas). */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeColorSync />
          <AuthProvider>
            <div className="page-shell">{children}</div>
            <Toaster
              position="top-right"
              richColors
              expand={false}
              closeButton
              toastOptions={{
                classNames: {
                  toast:
                    'group rounded-xl border border-border bg-card text-card-foreground shadow-lg',
                  title: 'font-semibold text-foreground',
                  description: 'text-sm text-muted-foreground',
                  actionButton: 'rounded bg-primary text-primary-foreground',
                  cancelButton:
                    'rounded border border-border bg-secondary text-secondary-foreground',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
