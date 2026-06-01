import { getJournalEntries } from '@/actions/journal';

import { JournalPageClient } from '@/components/dashboard/journal/JournalPageClient';

export default async function JournalPage() {
  const entries = await getJournalEntries();

  return <JournalPageClient entries={entries} />;
}
