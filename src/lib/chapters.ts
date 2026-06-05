import { db } from '@/db';
import { bookChapters, chapterPurchases } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type ChapterState = 'unreleased' | 'locked' | 'buyable' | 'owned';

export type ChapterWithState = {
  id: string;
  title: string;
  chapterNumber: number;
  priceIdr: number;
  isFree: boolean;
  releaseDate: string | null;
  pdfPath: string | null;
  state: ChapterState;
};

export function isReleased(
  chapter: { releaseDate: string | null },
  now: Date
): boolean {
  return (
    chapter.releaseDate !== null &&
    new Date(chapter.releaseDate + 'T00:00:00') <= now
  );
}

export async function getChaptersWithState(
  userId: string
): Promise<ChapterWithState[]> {
  const chapters = await db
    .select()
    .from(bookChapters)
    .orderBy(bookChapters.chapterNumber);

  if (chapters.length === 0) return [];

  const purchases = await db
    .select({ chapterId: chapterPurchases.chapterId })
    .from(chapterPurchases)
    .where(eq(chapterPurchases.userId, userId));

  const ownedChapterIds = new Set(purchases.map((p) => p.chapterId));
  const ownedChapterNumbers = new Set(
    chapters
      .filter((c) => ownedChapterIds.has(c.id))
      .map((c) => c.chapterNumber)
  );

  const releaseInfo = chapters.map((c) => ({
    chapterNumber: c.chapterNumber,
    releaseDate: c.releaseDate,
  }));

  return chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    chapterNumber: chapter.chapterNumber,
    priceIdr: chapter.priceIdr,
    isFree: chapter.isFree,
    releaseDate: chapter.releaseDate,
    pdfPath: chapter.pdfPath,
    state: computeChapterState(
      {
        chapterNumber: chapter.chapterNumber,
        releaseDate: chapter.releaseDate,
      },
      ownedChapterNumbers,
      releaseInfo
    ),
  }));
}

export function computeChapterState(
  chapter: {
    chapterNumber: number;
    releaseDate: string | null;
  },
  ownedChapterNumbers: Set<number>,
  allChapters: { chapterNumber: number; releaseDate: string | null }[]
): ChapterState {
  if (ownedChapterNumbers.has(chapter.chapterNumber)) return 'owned';

  const now = new Date();

  if (!isReleased(chapter, now)) return 'unreleased';

  // Sequential gating: chapter N requires owning chapter N-1 if it exists
  if (chapter.chapterNumber > 1) {
    const prevChapterNumber = chapter.chapterNumber - 1;
    const prevChapter = allChapters.find(
      (c) => c.chapterNumber === prevChapterNumber
    );
    if (prevChapter && isReleased(prevChapter, now)) {
      if (!ownedChapterNumbers.has(prevChapterNumber)) return 'locked';
    }
  }

  return 'buyable';
}
