'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { bookChapters, chapterPurchases } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';

import {
  canUserReadChapter,
  computeChapterState,
  isReleased,
} from '@/lib/chapters';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function purchaseChapter(chapterId: string): Promise<
  | {
      success: true;
      chapter: { id: string; title: string; chapterNumber: number };
    }
  | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Fetch target chapter
  const targetChapters = await db
    .select()
    .from(bookChapters)
    .where(eq(bookChapters.id, chapterId));
  const chapter = targetChapters[0];

  if (!chapter) {
    return { error: 'Bab tidak ditemukan' };
  }

  if (!isReleased(chapter, new Date())) {
    return { error: 'Bab belum dirilis' };
  }

  // Fetch all chapters for sequential gating
  const allChapters = await db
    .select({
      id: bookChapters.id,
      chapterNumber: bookChapters.chapterNumber,
      releaseDate: bookChapters.releaseDate,
      priceIdr: bookChapters.priceIdr,
      isFree: bookChapters.isFree,
    })
    .from(bookChapters)
    .orderBy(asc(bookChapters.chapterNumber));

  // Fetch user's purchases
  const purchases = await db
    .select({ chapterId: chapterPurchases.chapterId })
    .from(chapterPurchases)
    .where(eq(chapterPurchases.userId, user.id));

  const ownedChapterIds = new Set(purchases.map((p) => p.chapterId));
  const ownedChapterNumbers = new Set(
    allChapters
      .filter((c) => ownedChapterIds.has(c.id))
      .map((c) => c.chapterNumber)
  );

  if (ownedChapterIds.has(chapterId)) {
    return { error: 'Bab sudah dimiliki' };
  }

  // Sequential gating
  const state = computeChapterState(chapter, ownedChapterNumbers, allChapters);

  if (state === 'locked') {
    return { error: 'Selesaikan bab sebelumnya terlebih dahulu' };
  }

  if (state !== 'buyable') {
    return { error: 'Bab belum dapat dibeli' };
  }

  await db
    .insert(chapterPurchases)
    .values({ userId: user.id, chapterId })
    .returning({ id: chapterPurchases.id });

  revalidatePath('/dashboard/book');

  return {
    success: true,
    chapter: {
      id: chapter.id,
      title: chapter.title,
      chapterNumber: chapter.chapterNumber,
    },
  };
}

export async function claimFreeChapter(_chapterId: string): Promise<
  | {
      success: true;
      chapter: { id: string; title: string; chapterNumber: number };
    }
  | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  return { error: 'Not implemented' };
}

export async function getChapterSignedUrl(
  chapterId: string
): Promise<{ url: string; expiresIn: 3600 } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const access = await canUserReadChapter(user.id, chapterId);

  if (access.canRead === false) {
    switch (access.reason) {
      case 'not-found':
        return { error: 'Bab tidak ditemukan' };
      case 'unreleased':
        return { error: 'Bab belum dirilis' };
      case 'locked':
        return { error: 'Selesaikan bab sebelumnya terlebih dahulu' };
      case 'paid':
        return { error: 'Beli bab ini terlebih dahulu' };
    }
  }

  const rows = await db
    .select({ pdfPath: bookChapters.pdfPath })
    .from(bookChapters)
    .where(eq(bookChapters.id, chapterId));
  const pdfPath = rows[0]?.pdfPath;

  if (!pdfPath) {
    return { error: 'PDF belum tersedia untuk bab ini' };
  }

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient.storage
    .from('book-chapters')
    .createSignedUrl(pdfPath, 3600);

  if (error || !data) {
    return { error: 'Gagal membuat URL PDF' };
  }

  return { url: data.signedUrl, expiresIn: 3600 };
}
