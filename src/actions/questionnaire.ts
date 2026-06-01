'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { questionnaireResponses } from '@/db/schema';

import { createClient } from '@/lib/supabase/server';

export async function saveQuestionnaireResponse(data: {
  answers: Record<string, string> | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  await db.insert(questionnaireResponses).values({
    userId: user.id,
    answers: data.answers,
  });

  revalidatePath('/dashboard/scanner');

  return { success: true };
}
