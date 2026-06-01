'use server';

import { db } from '@/db';
import { users } from '@/db/schema';

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
