'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ArrowLeft, Download } from 'lucide-react';

import { NextChapterButton } from '@/components/dashboard/book/NextChapterButton';
import { Button } from '@/components/ui/button';

import type { NextChapterAction } from '@/lib/chapters';

const WA_LINK = 'https://wa.me/6287853186759';
const PDFJS_VIEWER = '/pdfjs/web/viewer.html';

function useIsSafari() {
  const [isSafari] = useState(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent;
    return /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);
  });
  return isSafari;
}

export function ReaderClient({
  chapter,
  nextAction,
  isPreview,
}: {
  chapter: { id: string; title: string; chapterNumber: number };
  nextAction: NextChapterAction;
  isPreview?: boolean;
}) {
  const isSafari = useIsSafari();
  const viewerUrl = `${PDFJS_VIEWER}?file=${encodeURIComponent(`/api/chapters/${chapter.id}/view`)}`;
  const downloadUrl = `/api/chapters/${chapter.id}/download`;

  return (
    <div className="flex flex-1 flex-col gap-4 px-0 pt-0 md:p-6">
      <header className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Kembali">
          <Link href={isPreview ? '/dashboard/admin/book' : '/dashboard/book'}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">
          {chapter.title}
        </h1>
        <div className="ml-auto">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Button variant="outline" size="sm">
              <Download className="mr-2 size-4" />
              Download PDF
            </Button>
          </a>
        </div>
      </header>

      {isSafari && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Jika dokumen tidak bisa dibuka atau tidak muncul di browser anda,
          silahkan buka dengan{' '}
          <a
            href="https://www.google.com/chrome/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            Google Chrome
          </a>
          .
        </div>
      )}

      <iframe
        title={`PDF ${chapter.title}`}
        src={viewerUrl}
        className="-mx-4 h-[calc(100vh-12rem)] w-[calc(100%+2rem)] rounded-none border-0 md:mx-0 md:w-full md:rounded-md md:border bg-white"
      />

      {isPreview ? (
        <Link
          href="/dashboard/admin/book"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Kembali ke Panel Admin
        </Link>
      ) : (
        <>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Butuh rekomendasi lebih dalam? Jadwalkan konsultasi dengan Mas Chiko
          </a>

          <NextChapterButton action={nextAction} />
        </>
      )}
    </div>
  );
}
