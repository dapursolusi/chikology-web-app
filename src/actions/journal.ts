'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { journalEntries } from '@/db/schema';

import { mapToMood } from '@/lib/stressAnalyzer';
import { createClient } from '@/lib/supabase/server';

export async function saveJournalEntry(data: {
  stressTier: number;
  recommendation: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const tier = Math.max(1, Math.min(5, Math.round(data.stressTier))) as
    | 1
    | 2
    | 3
    | 4
    | 5;

  await db.insert(journalEntries).values({
    userId: user.id,
    stressTier: tier,
    mood: mapToMood(tier),
    recommendation: data.recommendation,
  });

  revalidatePath('/dashboard');

  return { success: true };
}
