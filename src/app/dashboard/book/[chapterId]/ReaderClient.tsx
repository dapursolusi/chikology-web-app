'use client';

import Link from 'next/link';

import { ArrowLeft, Download } from 'lucide-react';

import { NextChapterButton } from '@/components/dashboard/book/NextChapterButton';
import { Button } from '@/components/ui/button';

import type { NextChapterAction } from '@/lib/chapters';

const WA_LINK = 'https://wa.me/6287853186759';
const PDFJS_VIEWER = '/pdfjs/web/viewer.html';

export function ReaderClient({
  chapter,
  nextAction,
  isPreview,
}: {
  chapter: { id: string; title: string; chapterNumber: number };
  nextAction: NextChapterAction;
  isPreview?: boolean;
}) {
  const viewerUrl = `${PDFJS_VIEWER}?file=${encodeURIComponent(`/api/chapters/${chapter.id}/view`)}`;
  const downloadUrl = `/api/chapters/${chapter.id}/download`;

  return (
    <div className="flex flex-1 flex-col gap-4 -m-4 md:m-0 md:p-6">
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

      <iframe
        title={`PDF ${chapter.title}`}
        src={viewerUrl}
        className="h-[calc(100vh-12rem)] w-full rounded-md border bg-white"
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
