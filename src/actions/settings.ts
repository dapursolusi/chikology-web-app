'use server';

import { revalidatePath } from 'next/cache';

import { getAdminRole } from '@/actions/book';
import { db } from '@/db';
import { appSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function setEbookLiveState(
  value: boolean
): Promise<{ success: true } | { error: string }> {
  const role = await getAdminRole();
  if (role !== 'admin') {
    return { error: 'Hanya admin yang dapat mengubah status e-book' };
  }

  await db
    .update(appSettings)
    .set({ value: value ? 'true' : 'false' })
    .where(eq(appSettings.key, 'ebook_live'));

  revalidatePath('/dashboard/admin/book');
  return { success: true };
}
