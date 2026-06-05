'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { ChapterList } from '@/components/dashboard/book/ChapterList';
import { PurchaseModal } from '@/components/dashboard/book/PurchaseModal';

import type { ChapterWithState } from '@/lib/chapters';

export function BookPageClient({ chapters }: { chapters: ChapterWithState[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [chapter, setChapter] = useState<ChapterWithState | null>(null);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            E-Book
          </h1>
          <p className="text-muted-foreground">
            Baca bab-bab Mas Chiko dan lanjutkan perjalananmu.
          </p>
        </div>
        <ChapterList
          chapters={chapters}
          onPurchase={(c) => {
            setChapter(c);
            setOpen(true);
          }}
        />
      </div>
      <PurchaseModal
        open={open}
        onOpenChange={setOpen}
        chapter={chapter}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
