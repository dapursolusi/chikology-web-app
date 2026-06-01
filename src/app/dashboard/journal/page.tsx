import { Suspense } from 'react';

import { getJournalEntries } from '@/actions/journal';

import { JournalPageClient } from '@/components/dashboard/journal/JournalPageClient';

export default async function JournalPage() {
  const entries = await getJournalEntries();

  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Memuat...</div>
      }
    >
      <JournalPageClient entries={entries} />
    </Suspense>
  );
}
