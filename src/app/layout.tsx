import { Geist_Mono, Inter } from 'next/font/google';

import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Chikology — Kenali Stres, Kelola Lebih Baik',
    template: '%s · Chikology',
  },
  description:
    'Deteksi tingkat stres lewat scan wajah dengan AI. Pantau kesehatan mentalmu dan dapatkan rekomendasi personal setiap hari.',
  openGraph: {
    title: 'Chikology — Kenali Stres, Kelola Lebih Baik',
    description:
      'Deteksi tingkat stres lewat scan wajah dengan AI. Pantau kesehatan mentalmu dan dapatkan rekomendasi personal setiap hari.',
    siteName: 'Chikology',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        'antialiased',
        fontMono.variable,
        'font-sans',
        inter.variable
      )}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'new MutationObserver(function(m){for(var i=0;i<m.length;i++){var r=m[i];if(r.type==="childList"){for(var j=0;j<r.addedNodes.length;j++){var n=r.addedNodes[j];if(n.nodeType===1){n.removeAttribute("bis_skin_checked");var e=n.querySelectorAll("[bis_skin_checked]");for(var k=0;k<e.length;k++)e[k].removeAttribute("bis_skin_checked")}}}if(r.type==="attributes"&&r.attributeName==="bis_skin_checked")r.target.removeAttribute("bis_skin_checked")}}).observe(document.documentElement,{childList:true,attributes:true,subtree:true,attributeFilter:["bis_skin_checked"]})',
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-center" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
