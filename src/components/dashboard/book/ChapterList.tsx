'use client';

import Link from 'next/link';

import { BookOpen, Clock, Lock, ShoppingCart, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { ChapterWithState } from '@/lib/chapters';

type Props = {
  chapters: ChapterWithState[];
  onPurchase: (chapter: ChapterWithState) => void;
};

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function ChapterList({ chapters, onPurchase }: Props) {
  if (chapters.length === 0) {
    return (
      <p
        data-testid="chapter-list-empty"
        className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground"
      >
        Belum ada bab tersedia.
      </p>
    );
  }

  return (
    <div
      data-testid="chapter-list"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {chapters.map((chapter) => (
        <ChapterCard
          key={chapter.id}
          chapter={chapter}
          onPurchase={onPurchase}
        />
      ))}
    </div>
  );
}

function ChapterCard({
  chapter,
  onPurchase,
}: {
  chapter: ChapterWithState;
  onPurchase: (chapter: ChapterWithState) => void;
}) {
  return (
    <article
      data-testid="chapter-card"
      data-state={chapter.state}
      className="flex flex-col gap-4 rounded-xl border-2 border-border bg-card p-5 shadow-sm"
    >
      <header className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          <span className="uppercase tracking-wider">Bab</span>{' '}
          <span
            data-testid="chapter-number"
            className="font-semibold text-foreground"
          >
            {chapter.chapterNumber}
          </span>
        </p>
        <h3 className="text-lg font-semibold text-foreground">
          {chapter.title}
        </h3>
      </header>
      <ChapterAction chapter={chapter} onPurchase={onPurchase} />
    </article>
  );
}

function ChapterAction({
  chapter,
  onPurchase,
}: {
  chapter: ChapterWithState;
  onPurchase: (chapter: ChapterWithState) => void;
}) {
  switch (chapter.state) {
    case 'unreleased':
      return (
        <div
          data-testid="chapter-state-unreleased"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Lock className="size-4" />
          <span>Segera hadir</span>
        </div>
      );
    case 'locked':
      return (
        <div
          data-testid="chapter-state-locked"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Lock className="size-4" />
          <span>Selesaikan bab sebelumnya terlebih dahulu</span>
        </div>
      );
    case 'owned':
      return (
        <Button
          asChild
          variant="outline"
          className="border-green-600 text-green-700 hover:bg-green-50"
        >
          <Link href={`/dashboard/book/${chapter.id}`}>
            <BookOpen />
            Baca
          </Link>
        </Button>
      );
    case 'buyable':
      if (chapter.proofStatus === 'pending') {
        return (
          <div
            data-testid="chapter-state-pending-proof"
            className="flex items-center gap-2 text-sm text-amber-600"
          >
            <Clock className="size-4" />
            <span>Menunggu Verifikasi</span>
          </div>
        );
      }
      if (chapter.isFree) {
        return (
          <Button onClick={() => onPurchase(chapter)}>
            <Sparkles />
            Buka Gratis
          </Button>
        );
      }
      return (
        <Button onClick={() => onPurchase(chapter)}>
          <ShoppingCart />
          Beli {idrFormatter.format(chapter.priceIdr)}
        </Button>
      );
  }
}
