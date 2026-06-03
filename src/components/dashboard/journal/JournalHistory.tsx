'use client';

import { useEffect, useState } from 'react';

import { type Mood, deleteJournalEntry } from '@/actions/journal';
import { stressLevels } from '@/data/stressLevels';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JournalEntry {
  id: string;
  mood: Mood | null;
  content: string | null;
  stressTier: number | null;
  recommendation: string | null;
  createdAt: Date;
}

interface JournalHistoryProps {
  entries: JournalEntry[];
}

const MOOD_EMOJI: Record<string, string> = {
  very_calm: '😌',
  calm: '😊',
  neutral: '😐',
  stressed: '😟',
  very_stressed: '😰',
};

export function JournalHistory({ entries }: JournalHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localEntries, setLocalEntries] = useState(entries);

  useEffect(() => {
    const seen = new Set<string>();
    const deduped = entries.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalEntries(deduped);
  }, [entries]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteJournalEntry(id);
    if ('error' in result) {
      toast.error('Gagal menghapus entri');
      setDeletingId(null);
    } else {
      setLocalEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success('Entri berhasil dihapus');
    }
  };

  if (localEntries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada entri jurnal. Pilih mood dan klik Simpan untuk memulai.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Jurnal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {localEntries.map((entry) => (
          <JournalHistoryItem
            key={entry.id}
            entry={entry}
            onDelete={() => handleDelete(entry.id)}
            isDeleting={deletingId === entry.id}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function JournalHistoryItem({
  entry,
  onDelete,
  isDeleting,
}: {
  entry: JournalEntry;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const isScanOnly = entry.stressTier !== null && !entry.content;

  const preview = isScanOnly
    ? `${stressLevels[entry.stressTier as 1 | 2 | 3 | 4 | 5]?.label ?? 'Stres'} (dari scan wajah)`
    : entry.content
      ? stripHtml(entry.content)
      : '';

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start gap-3 p-3 text-left"
      >
        <span className="text-2xl">{MOOD_EMOJI[entry.mood ?? 'neutral']}</span>
        <div className="flex-1 space-y-1">
          <p className="text-sm text-muted-foreground">
            {formatDate(entry.createdAt)}
          </p>
          <p className="text-sm">
            {preview.length > 120 ? preview.slice(0, 120) + '...' : preview}
          </p>
        </div>
        <span
          className={`ml-auto shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t px-3 pb-3 pt-2">
          {entry.content && (
            <div>
              <p className="mb-1 text-sm font-medium">Catatan:</p>
              <div
                className="journal-content text-sm"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            </div>
          )}
          {entry.recommendation && (
            <div>
              <p className="mb-1 text-sm font-medium">Rekomendasi:</p>
              <p className="text-sm text-muted-foreground">
                {entry.recommendation}
              </p>
            </div>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus entri?</AlertDialogTitle>
                <AlertDialogDescription>
                  Entri ini akan dihapus secara permanen dari jurnalmu. Tindakan
                  ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Menghapus...' : 'Hapus'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(date));
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/?ul[^>]*>/g, '\n')
    .replace(/<\/?ol[^>]*>/g, '\n')
    .replace(/<li[^>]*>/g, '• ')
    .replace(/<\/li>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
