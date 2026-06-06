'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { getChapterSignedUrl } from '@/actions/chapters';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { NextChapterButton } from '@/components/dashboard/book/NextChapterButton';
import { Button } from '@/components/ui/button';

import type { NextChapterAction } from '@/lib/chapters';

const WA_LINK = 'https://wa.me/6287853186759';

export function ReaderClient({
  chapter,
  nextAction,
}: {
  chapter: { id: string; title: string; chapterNumber: number };
  nextAction: NextChapterAction;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getChapterSignedUrl(chapter.id);
      if (cancelled) return;
      if ('url' in result) {
        setSignedUrl(result.url);
      } else {
        setError(result.error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chapter.id]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6">
      <header className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Kembali">
          <Link href="/dashboard/book">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">
          {chapter.title}
        </h1>
      </header>

      {error ? (
        <div
          data-testid="reader-error"
          role="alert"
          className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      ) : signedUrl ? (
        <iframe
          title={`PDF ${chapter.title}`}
          src={signedUrl}
          className="h-[calc(100vh-12rem)] w-full rounded-md border bg-white"
        />
      ) : (
        <div
          data-testid="reader-skeleton"
          className="flex h-[calc(100vh-12rem)] w-full items-center justify-center rounded-md border bg-muted"
        >
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Butuh rekomendasi lebih dalam? Jadwalkan konsultasi dengan Mas Chiko
      </a>

      <NextChapterButton action={nextAction} />
    </div>
  );
}
