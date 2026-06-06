'use client';

import { useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { purchaseChapter } from '@/actions/chapters';

import { Button } from '@/components/ui/button';

import type { NextChapterAction } from '@/lib/chapters';

export function NextChapterButton({ action }: { action: NextChapterAction }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  switch (action.kind) {
    case 'navigate':
      return (
        <Button asChild variant="outline">
          <Link href={`/dashboard/book/${action.nextChapter.id}`}>
            Lanjut ke Bab {action.nextChapter.chapterNumber} —{' '}
            {action.nextChapter.title}
          </Link>
        </Button>
      );

    case 'redirect-to-list':
      return (
        <Button asChild variant="outline">
          <Link href="/dashboard/book">Buka daftar bab</Link>
        </Button>
      );

    case 'locked':
      return (
        <p data-testid="next-locked" className="text-sm text-muted-foreground">
          Selesaikan Bab {action.previousChapterNumber} terlebih dahulu
        </p>
      );

    case 'unreleased':
      return (
        <p
          data-testid="next-unreleased"
          className="text-sm text-muted-foreground"
        >
          Segera hadir
        </p>
      );

    case 'end-of-book':
      return null;

    case 'auto-claim': {
      const next = action.nextChapter;
      function handleClaim() {
        startTransition(async () => {
          const result = await purchaseChapter(next.id);
          if ('chapter' in result) {
            router.push(`/dashboard/book/${next.id}`);
          }
        });
      }
      return (
        <Button onClick={handleClaim} disabled={isPending}>
          Klaim &amp; buka Bab {next.chapterNumber} — {next.title}
        </Button>
      );
    }
  }
}
