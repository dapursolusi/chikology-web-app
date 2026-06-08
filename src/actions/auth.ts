'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function ensureUserRecord(
  userId: string,
  email: string,
  name?: string,
  avatarUrl?: string
): Promise<void> {
  await db
    .insert(users)
    .values({
      id: userId,
      email,
      name: name ?? null,
      avatarUrl: avatarUrl ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email,
        name: name ?? null,
        avatarUrl: avatarUrl ?? null,
        updatedAt: new Date(),
      },
    });
}

export async function getUserRole(userId: string): Promise<string | null> {
  const result = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0]?.role ?? null;
}
