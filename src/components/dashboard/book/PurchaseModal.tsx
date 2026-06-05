'use client';

import { useState, useTransition } from 'react';

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

import type { ChapterWithState } from '@/lib/chapters';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter: ChapterWithState | null;
  onSuccess?: (chapter: ChapterWithState) => void;
};

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function PurchaseModal({
  open,
  onOpenChange,
  chapter,
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!chapter) return null;

  const isFree = chapter.isFree;
  const priceLabel = isFree ? 'Gratis' : idrFormatter.format(chapter.priceIdr);
  const confirmLabel = isFree ? 'Ya, Klaim Gratis' : 'Ya, Beli';

  function handleConfirm() {
    if (!chapter) return;
    setError(null);
    startTransition(async () => {
      const result = await purchaseChapter(chapter.id);
      if ('chapter' in result) {
        onOpenChange(false);
        onSuccess?.(chapter);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{chapter.title}</DialogTitle>
          <DialogDescription>
            Bab {chapter.chapterNumber} · {priceLabel}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p
            data-testid="purchase-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
