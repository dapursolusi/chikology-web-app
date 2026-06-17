'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { questionnaireResponses } from '@/db/schema';

import type { QuestionnaireAnswers } from '@/components/dashboard/scanner/questionData';

import { getAuthUser } from '@/lib/supabase/server';

export async function saveQuestionnaireResponse(data: {
  answers: QuestionnaireAnswers | null;
}) {
  const user = await getAuthUser();
  if (!user) return { error: 'Not authenticated' };

  await db.insert(questionnaireResponses).values({
    userId: user.id,
    answers: data.answers,
  });

  revalidatePath('/dashboard/scanner');

  return { success: true };
}
