'use client';

import { Geist_Mono, Inter } from 'next/font/google';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  return (
    <html
      lang="id"
      className={cn(
        'antialiased',
        fontMono.variable,
        'font-sans',
        inter.variable
      )}
    >
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center text-foreground">
        <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          Chikology
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Maaf, terjadi kesalahan
        </h1>
        <p className="max-w-md text-muted-foreground">
          Aplikasi mengalami gangguan. Silakan coba lagi.
        </p>
        <Button onClick={() => reset()} className="mt-2">
          Coba Lagi
        </Button>
      </body>
    </html>
  );
}
