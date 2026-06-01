'use client';

import { useActionState } from 'react';
import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { type Mood as MoodType, saveJournalEntry } from '@/actions/journal';
import {
  MOOD_MAP,
  type Mood,
  type StressTier,
  stressLevels,
} from '@/data/stressLevels';
import { toast } from 'sonner';

import { JournalEditor } from '@/components/dashboard/journal/JournalEditor';
import { JournalHistory } from '@/components/dashboard/journal/JournalHistory';
import { MoodSelector } from '@/components/dashboard/journal/MoodSelector';
import { ScanResultAccordion } from '@/components/dashboard/journal/ScanResultAccordion';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier');
  const tier =
    tierParam !== null
      ? (Math.max(1, Math.min(5, Math.round(Number(tierParam)))) as StressTier)
      : null;
  const hasTier = tier !== null;

  const defaultMood: MoodType | undefined =
    hasTier && tier ? (MOOD_MAP[tier] as MoodType) : undefined;

  const [preselectedMood, setPreselectedMood] = useState<MoodType | undefined>(
    defaultMood
  );
  const [editorContent, setEditorContent] = useState('');
  const [historyEntries, setHistoryEntries] = useState(entries);
  const moodRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasTier) {
      toast.success('Hasil scan telah diteruskan ke jurnal.');
    }
    if (defaultMood && moodRef.current) {
      moodRef.current.value = defaultMood;
    }
  }, [hasTier, defaultMood]);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    (_state, formData) => {
      const mood = formData.get('mood') as MoodType | null;
      if (!mood) return { error: 'Mood wajib dipilih' };
      return saveJournalEntry({
        mood,
        content: editorContent || undefined,
        stressTier: tier ?? undefined,
        recommendation: tier ? stressLevels[tier].messages : undefined,
      });
    },
    null
  );

  const lastSavedIdRef = useRef<string | null>(null);

  // Sync historyEntries with fresh server data when entries prop changes
  // (e.g. after router.refresh() completes)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistoryEntries(entries);
  }, [entries]);

  // Handle successful save: toast, optimistic update, then refresh server data
  useEffect(() => {
    if (
      state &&
      'success' in state &&
      state.entryId !== lastSavedIdRef.current
    ) {
      const newId = state.entryId;
      lastSavedIdRef.current = newId;

      toast.success('Jurnal berhasil disimpan!');
      setEditorContent('');

      // Optimistically prepend the saved entry
      const savedEntry = entries.find((e) => e.id === newId);
      if (savedEntry) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHistoryEntries((prev) => [savedEntry, ...prev]);
      } else {
        setHistoryEntries((prev) => {
          const newEntry = {
            id: newId,
            mood: preselectedMood ?? null,
            content: editorContent || null,
            stressTier: tier ?? null,
            recommendation: tier ? stressLevels[tier].messages : null,
            createdAt: new Date(),
          };
          return [newEntry, ...prev];
        });
      }

      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

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

      {hasTier && tier && <ScanResultAccordion tier={tier} />}

      <Card>
        <CardHeader>
          <CardTitle>Bagaimana perasaanmu sekarang?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="mood" ref={moodRef} />
            <MoodSelector
              value={preselectedMood}
              onChange={(mood) => {
                setPreselectedMood(mood);
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

      <JournalHistory entries={historyEntries} />
    </div>
  );
}
