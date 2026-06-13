'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { type Mood, type StressTier } from '@/data/stressLevels';

import { JournalEditor } from '@/components/dashboard/journal/JournalEditor';
import { JournalHistory } from '@/components/dashboard/journal/JournalHistory';
import { MoodSelector } from '@/components/dashboard/journal/MoodSelector';
import { ScanResultAccordion } from '@/components/dashboard/journal/ScanResultAccordion';
import { useJournalSave } from '@/components/dashboard/journal/useJournalSave';
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

export function JournalPageClient({ entries }: JournalPageClientProps) {
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier');
  const tier: StressTier | null =
    tierParam !== null
      ? (Math.max(1, Math.min(5, Math.round(Number(tierParam)))) as StressTier)
      : null;

  const {
    mood,
    setMood,
    content,
    setContent,
    entries: localEntries,
    formAction,
    isPending,
    error,
    moodRef,
    hasTier,
  } = useJournalSave({ entries, tier });

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
            <MoodSelector value={mood} onChange={setMood} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <JournalEditor content={content} onChange={setContent} />
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

      <JournalHistory entries={localEntries} />
    </div>
  );
}
