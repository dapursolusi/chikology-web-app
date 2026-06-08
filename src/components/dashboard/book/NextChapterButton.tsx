'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { purchaseChapter } from '@/actions/chapters';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { NextChapterAction } from '@/lib/chapters';

export function NextChapterButton({ action }: { action: NextChapterAction }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Auto-claim confirmation modal state
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimChapter, setClaimChapter] = useState<{
    id: string;
    chapterNumber: number;
    title: string;
  } | null>(null);

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
        setClaimChapter(next);
        setClaimOpen(true);
      }
      function handleConfirmClaim() {
        if (!claimChapter) return;
        startTransition(async () => {
          const result = await purchaseChapter(claimChapter.id);
          if ('chapter' in result) {
            setClaimOpen(false);
            router.push(`/dashboard/book/${claimChapter.id}`);
          }
          // Error handling: could add toast here, but modal will show error from purchaseChapter
        });
      }
      return (
        <>
          <Button onClick={handleClaim} disabled={isPending}>
            Klaim &amp; buka Bab {next.chapterNumber} — {next.title}
          </Button>
          <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Klaim Bab Gratis</DialogTitle>
                <DialogDescription>
                  Bab {claimChapter?.chapterNumber} — {claimChapter?.title}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setClaimOpen(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmClaim}
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="animate-spin" />}
                  Ya, Klaim Gratis
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    }
  }
}
