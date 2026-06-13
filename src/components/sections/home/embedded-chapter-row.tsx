import Link from 'next/link';

import { Lock } from 'lucide-react';

import type { ChapterWithState } from '@/lib/chapters';
import { idrFormatter } from '@/lib/currency';

const baseButtonClass =
  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors';

export function EmbeddedChapterRow({
  chapters,
}: {
  chapters: ChapterWithState[];
}) {
  if (chapters.length === 0) {
    return (
      <p
        data-testid="embedded-chapter-row-empty"
        className="text-sm text-muted-foreground"
      >
        Belum ada bab yang dirilis.
      </p>
    );
  }

  return (
    <div data-testid="embedded-chapter-row" className="flex flex-wrap gap-2">
      {chapters.map((chapter) => (
        <ChapterItem key={chapter.id} chapter={chapter} />
      ))}
    </div>
  );
}

function ChapterItem({ chapter }: { chapter: ChapterWithState }) {
  switch (chapter.state) {
    case 'owned':
      return (
        <Link
          href={`/dashboard/book/${chapter.id}`}
          data-testid={`embedded-chapter-${chapter.id}`}
          data-state="owned"
          className={`${baseButtonClass} border-green-600 bg-green-50 text-green-700 hover:bg-green-100`}
        >
          Bab {chapter.chapterNumber} · Baca
        </Link>
      );
    case 'buyable':
      return (
        <Link
          href="/dashboard/book"
          data-testid={`embedded-chapter-${chapter.id}`}
          data-state="buyable"
          className={`${baseButtonClass} border-teal-600 bg-teal-50 text-teal-700 hover:bg-teal-100`}
        >
          Bab {chapter.chapterNumber} ·{' '}
          {chapter.isFree
            ? 'Buka Gratis'
            : `Beli ${idrFormatter.format(chapter.priceIdr)}`}
        </Link>
      );
    case 'locked':
      return (
        <span
          data-testid={`embedded-chapter-${chapter.id}`}
          data-state="locked"
          title="Selesaikan bab sebelumnya terlebih dahulu"
          className={`${baseButtonClass} border-teal-600 bg-card text-teal-700`}
        >
          <Lock className="size-3.5" />
          Bab {chapter.chapterNumber} · Selesaikan bab sebelumnya
        </span>
      );
    case 'unreleased':
      return (
        <span
          data-testid={`embedded-chapter-${chapter.id}`}
          data-state="unreleased"
          className={`${baseButtonClass} cursor-not-allowed border-border bg-muted text-muted-foreground`}
        >
          Bab {chapter.chapterNumber} · Segera hadir
        </span>
      );
  }
}
