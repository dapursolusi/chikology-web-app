import { db } from '@/db';
import { appSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export function getServerTimestamp(): number {
  return Date.now();
}

export async function getEbookLive(): Promise<boolean> {
  try {
    const rows = await db
      .select({ value: appSettings.value })
      .from(appSettings)
      .where(eq(appSettings.key, 'ebook_live'))
      .limit(1);
    return rows[0]?.value === 'true';
  } catch {
    return false;
  }
}
