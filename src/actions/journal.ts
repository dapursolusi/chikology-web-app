'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { journalEntries } from '@/db/schema';
import { and, desc, eq, isNull } from 'drizzle-orm';

import { createClient } from '@/lib/supabase/server';

export type Mood =
  | 'very_calm'
  | 'calm'
  | 'neutral'
  | 'stressed'
  | 'very_stressed';

export async function saveJournalEntry(data: {
  mood: Mood;
  content?: string;
  stressTier?: number;
  recommendation?: string;
}): Promise<{ success: true; entryId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  if (!data.mood) {
    return { error: 'Mood is required' };
  }

  if (!data.content && data.stressTier === undefined) {
    return { error: 'At least one of content or stressTier must be provided' };
  }

  let tier: 1 | 2 | 3 | 4 | 5 | undefined;
  if (data.stressTier !== undefined) {
    tier = Math.max(1, Math.min(5, Math.round(data.stressTier))) as
      | 1
      | 2
      | 3
      | 4
      | 5;
  }

  const [entry] = await db
    .insert(journalEntries)
    .values({
      userId: user.id,
      mood: data.mood,
      content: data.content ?? null,
      stressTier: tier,
      recommendation: data.recommendation ?? null,
    })
    .returning({ id: journalEntries.id });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/journal');

  return { success: true, entryId: entry.id };
}

export async function getJournalEntries() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const entries = await db
    .select({
      id: journalEntries.id,
      mood: journalEntries.mood,
      content: journalEntries.content,
      stressTier: journalEntries.stressTier,
      recommendation: journalEntries.recommendation,
      createdAt: journalEntries.createdAt,
    })
    .from(journalEntries)
    .where(
      and(eq(journalEntries.userId, user.id), isNull(journalEntries.deletedAt))
    )
    .orderBy(desc(journalEntries.createdAt));

  return entries;
}

export async function deleteJournalEntry(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  await db
    .update(journalEntries)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(journalEntries.id, id),
        eq(journalEntries.userId, user.id),
        isNull(journalEntries.deletedAt)
      )
    );

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/journal');

  return { success: true };
}
