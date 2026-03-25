import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
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

export const metadata: Metadata = {
  metadataBase: new URL('https://lyra-metacare.local'),
  title: {
    default: 'Lyra MetaCare',
    template: '%s | Lyra MetaCare',
  },
  description:
    'Super-app premium de saúde preventiva personalizada com IA, monitoramento biométrico e sabedoria ancestral em uma experiência luminosa e acolhedora.',
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
  maximumScale: 1,
  themeColor: '#f9f8fc',
  colorScheme: 'light',
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
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
                    'group rounded-[20px] border border-white/80 bg-card/95 text-card-foreground shadow-xl backdrop-blur-xl',
                  title: 'font-semibold text-foreground',
                  description: 'text-sm text-muted-foreground',
                  actionButton:
                    'rounded-full bg-primary text-primary-foreground shadow-teal',
                  cancelButton:
                    'rounded-full border border-border bg-secondary text-secondary-foreground',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
