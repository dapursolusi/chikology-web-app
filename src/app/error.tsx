'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
        Chikology
      </div>
      <h1 className="text-2xl font-bold tracking-tight">
        Maaf, terjadi kesalahan
      </h1>
      <p className="max-w-md text-muted-foreground">
        Ada yang tidak beres. Jangan khawatir, tim kami sudah mendapat
        notifikasi.
      </p>
      <Button onClick={() => reset()} className="mt-2">
        Coba Lagi
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">
        Datamu aman, privasi terjamin
      </p>
    </div>
  );
}
