'use client';

import { useState, useTransition } from 'react';

import { setEbookLiveState } from '@/actions/settings';
import { toast } from 'sonner';

import { Toggle } from '@/components/ui/toggle';

type Props = { initialLive: boolean };

export function EbookLiveToggle({ initialLive }: Props) {
  const [isLive, setIsLive] = useState(initialLive);
  const [isPending, startTransition] = useTransition();

  function handleChange(pressed: boolean) {
    const previous = isLive;
    setIsLive(pressed);
    startTransition(async () => {
      const result = await setEbookLiveState(pressed);
      if ('error' in result) {
        setIsLive(previous);
        toast.error(result.error);
      } else {
        toast.success(pressed ? 'E-Book diaktifkan' : 'E-Book dinonaktifkan');
      }
    });
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex flex-col gap-1">
        <span className="font-medium">E-Book Live</span>
        <span className="text-sm text-muted-foreground">
          {isLive
            ? 'Aktif — tampil untuk semua user'
            : 'Non-aktif — hanya countdown yang tampil'}
        </span>
      </div>
      <Toggle
        pressed={isLive}
        onPressedChange={handleChange}
        disabled={isPending}
        aria-label="E-Book Live"
        data-testid="ebook-live-toggle"
      >
        {isLive ? 'Aktif' : 'Non-aktif'}
      </Toggle>
    </div>
  );
}
