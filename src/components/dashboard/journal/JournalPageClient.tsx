'use client';

import { useActionState } from 'react';
import { useRef, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { type Mood, saveJournalEntry } from '@/actions/journal';

import { JournalEditor } from '@/components/dashboard/journal/JournalEditor';
import { MoodSelector } from '@/components/dashboard/journal/MoodSelector';
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

interface JournalPageClientProps {
  entries: JournalEntry[];
}

type ActionState =
  | { success: true; entryId: string }
  | { error: string }
  | null;

export function JournalPageClient({ entries }: JournalPageClientProps) {
  const searchParams = useSearchParams();
  const hasTier = searchParams.has('tier');
  const [editorContent, setEditorContent] = useState('');
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    (_state, formData) => {
      const mood = formData.get('mood') as Mood | null;
      if (!mood) return { error: 'Mood wajib dipilih' };
      return saveJournalEntry({
        mood,
        content: editorContent || undefined,
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
            <JournalEditor
              content={editorContent}
              onChange={setEditorContent}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {!hasTier && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Belum ada deteksi stres hari ini.{' '}
          </span>
          <Link href="/dashboard/scanner">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary"
            >
              Scan Wajah
            </Button>
          </Link>
        </div>
      )}

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
                    <p
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: truncateHtml(entry.content, 120),
                      }}
                    />
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

function truncateHtml(html: string, maxLength: number): string {
  const text = html.replace(/<[^>]*>/g, '');
  if (text.length <= maxLength) return html;
  return text.slice(0, maxLength) + '...';
}
