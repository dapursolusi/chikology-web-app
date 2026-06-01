'use client';

import { useActionState } from 'react';
import { useRef } from 'react';

import { type Mood, saveJournalEntry } from '@/actions/journal';

import { MoodSelector } from '@/components/dashboard/journal/MoodSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface JournalEntry {
  id: string;
  mood: Mood | null;
  content: string | null;
  stressTier: number | null;
  recommendation: string | null;
  createdAt: Date;
}

interface JournalPageClientProps {
  entries: JournalEntry[];
}

type ActionState =
  | { success: true; entryId: string }
  | { error: string }
  | null;

export function JournalPageClient({ entries }: JournalPageClientProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    (_state, formData) => {
      const mood = formData.get('mood') as Mood | null;
      const content = formData.get('content') as string | null;
      if (!mood) return { error: 'Mood wajib dipilih' };
      return saveJournalEntry({
        mood,
        content: content ?? undefined,
      });
    },
    null
  );
  const moodRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Jurnal Mood
        </h1>
        <p className="text-muted-foreground">
          Catat perasaanmu hari ini. Mood terlahir tanpa kata — tapi kata-kata
          membantu.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bagaimana perasaanmu sekarang?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="mood" ref={moodRef} />
            <MoodSelector
              onChange={(mood) => {
                if (moodRef.current) {
                  moodRef.current.value = mood;
                }
              }}
            />
            {state && 'error' in state && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Textarea
              name="content"
              placeholder="Tulis perasaanmu di sini... (opsional)"
              rows={4}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {entries.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Jurnal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <span className="text-2xl">
                  {MOOD_EMOJI[entry.mood ?? 'neutral']}
                </span>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </p>
                  {entry.content && (
                    <p className="text-sm">
                      {entry.content.length > 120
                        ? entry.content.slice(0, 120) + '...'
                        : entry.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          Belum ada entri jurnal. Pilih mood dan klik Simpan untuk memulai.
        </p>
      )}
    </div>
  );
}

const MOOD_EMOJI: Record<string, string> = {
  very_calm: '😌',
  calm: '😊',
  neutral: '😐',
  stressed: '😟',
  very_stressed: '😰',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
