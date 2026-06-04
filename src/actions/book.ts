'use server';

import { db } from '@/db';
import { bookChapters, users } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';

import { createClient } from '@/lib/supabase/server';

export async function getBookChapters() {
  return db
    .select()
    .from(bookChapters)
    .orderBy(asc(bookChapters.chapterNumber));
}

export async function getAdminRole(): Promise<'user' | 'admin'> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 'user';

  const rows = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return rows[0]?.role === 'admin' ? 'admin' : 'user';
}
