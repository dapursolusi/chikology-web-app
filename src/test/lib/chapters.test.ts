import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  canUserReadChapter,
  computeChapterState,
  getNextChapterAction,
} from '@/lib/chapters';

// Mock DB for getChaptersWithState tests
const mockOrderBy = vi.hoisted(() =>
  vi.fn<() => Promise<unknown[]>>(async () => [])
);
const mockWhere = vi.hoisted(() =>
  vi.fn<() => Promise<unknown[]>>(async () => [])
);
const mockFrom = vi.hoisted(() =>
  vi.fn(() => ({ orderBy: mockOrderBy, where: mockWhere }))
);
const mockSelect = vi.hoisted(() => vi.fn(() => ({ from: mockFrom })));

vi.mock('@/db', () => ({
  db: { select: mockSelect },
}));

vi.mock('drizzle-orm', () => ({
  asc: vi.fn(() => 'ASC'),
  eq: vi.fn(() => 'EQ'),
  relations: vi.fn(() => ({})),
}));

// ─── computeChapterState — pure function tests ───────────────────────

describe('computeChapterState', () => {
  it('returns "unreleased" for a chapter with null release_date', () => {
    const state = computeChapterState(
      { chapterNumber: 1, releaseDate: null },
      new Set(),
      []
    );
    expect(state).toBe('unreleased');
  });

  it('returns "buyable" for a released chapter 1 that is not owned', () => {
    const state = computeChapterState(
      { chapterNumber: 1, releaseDate: '2025-01-01' },
      new Set(),
      []
    );
    expect(state).toBe('buyable');
  });

  it('returns "owned" for a released chapter that is owned', () => {
    const state = computeChapterState(
      { chapterNumber: 1, releaseDate: '2025-01-01' },
      new Set([1]),
      []
    );
    expect(state).toBe('owned');
  });

  it('returns "locked" for released chapter 2 when chapter 1 is released but not owned', () => {
    const state = computeChapterState(
      { chapterNumber: 2, releaseDate: '2025-01-01' },
      new Set(),
      [
        { chapterNumber: 1, releaseDate: '2025-01-01' },
        { chapterNumber: 2, releaseDate: '2025-01-01' },
      ]
    );
    expect(state).toBe('locked');
  });

  it('returns "buyable" for released chapter 2 when chapter 1 is owned', () => {
    const state = computeChapterState(
      { chapterNumber: 2, releaseDate: '2025-01-01' },
      new Set([1]),
      [
        { chapterNumber: 1, releaseDate: '2025-01-01' },
        { chapterNumber: 2, releaseDate: '2025-01-01' },
      ]
    );
    expect(state).toBe('buyable');
  });

  it('returns "unreleased" for a chapter with a future release_date', () => {
    const farFuture = '2099-12-31';
    const state = computeChapterState(
      { chapterNumber: 1, releaseDate: farFuture },
      new Set(),
      []
    );
    expect(state).toBe('unreleased');
  });
});

// ─── getPublicChapters — public visitor list ─────────────────────────

describe('getPublicChapters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only released chapters with state="buyable" for visitors', async () => {
    const released = {
      id: 'ch1',
      title: 'Bab 1 — Awal',
      chapterNumber: 1,
      priceIdr: 0,
      isFree: true,
      releaseDate: '2025-01-01',
      pdfPath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const unreleased = {
      id: 'ch2',
      title: 'Bab 2 — Lanjutan',
      chapterNumber: 2,
      priceIdr: 49000,
      isFree: false,
      releaseDate: '2099-01-01',
      pdfPath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOrderBy.mockResolvedValueOnce([released, unreleased]);

    const { getPublicChapters } = await import('@/lib/chapters');
    const result = await getPublicChapters();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'ch1',
      title: 'Bab 1 — Awal',
      chapterNumber: 1,
      state: 'buyable',
    });
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockOrderBy).toHaveBeenCalledTimes(1);
    expect(mockWhere).not.toHaveBeenCalled();
  });

  it('returns empty array when no chapters are released', async () => {
    mockOrderBy.mockResolvedValueOnce([]);

    const { getPublicChapters } = await import('@/lib/chapters');
    const result = await getPublicChapters();

    expect(result).toEqual([]);
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });
});

// ─── getChaptersWithState — async integration tests ──────────────────

describe('getChaptersWithState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no chapters exist', async () => {
    mockOrderBy.mockResolvedValueOnce([]);

    const { getChaptersWithState } = await import('@/lib/chapters');
    const result = await getChaptersWithState('user-id');

    expect(result).toEqual([]);
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledTimes(1);
  });

  it('returns chapters with computed states including ownership', async () => {
    const chapter1 = {
      id: 'ch1',
      title: 'Bab 1',
      chapterNumber: 1,
      priceIdr: 0,
      isFree: true,
      releaseDate: '2025-01-01',
      pdfPath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const chapter2 = {
      id: 'ch2',
      title: 'Bab 2',
      chapterNumber: 2,
      priceIdr: 49000,
      isFree: false,
      releaseDate: '2025-06-01',
      pdfPath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOrderBy.mockResolvedValueOnce([chapter1, chapter2]);
    // User owns chapter 1
    mockWhere.mockResolvedValueOnce([{ chapterId: 'ch1' }]);
    // No payment proofs
    mockWhere.mockResolvedValueOnce([]);

    const { getChaptersWithState } = await import('@/lib/chapters');
    const result = await getChaptersWithState('user-id');

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'ch1',
      chapterNumber: 1,
      state: 'owned',
      proofStatus: 'none',
    });
    expect(result[1]).toMatchObject({
      id: 'ch2',
      chapterNumber: 2,
      state: 'buyable',
      proofStatus: 'none',
    });
  });

  it('returns buyable chapters with proofStatus "pending" when a payment proof exists', async () => {
    const chapter1 = {
      id: 'ch1',
      title: 'Bab 1',
      chapterNumber: 1,
      priceIdr: 49000,
      isFree: false,
      releaseDate: '2025-01-01',
      pdfPath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOrderBy.mockResolvedValueOnce([chapter1]);
    // User owns nothing
    mockWhere.mockResolvedValueOnce([]);
    // Payment proof exists with status pending
    mockWhere.mockResolvedValueOnce([{ chapterId: 'ch1', status: 'pending' }]);

    const { getChaptersWithState } = await import('@/lib/chapters');
    const result = await getChaptersWithState('user-id');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'ch1',
      state: 'buyable',
      proofStatus: 'pending',
    });
  });

  it('returns proofStatus "approved" when payment proof was approved', async () => {
    const chapter1 = {
      id: 'ch1',
      title: 'Bab 1',
      chapterNumber: 1,
      priceIdr: 49000,
      isFree: false,
      releaseDate: '2025-01-01',
      pdfPath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOrderBy.mockResolvedValueOnce([chapter1]);
    mockWhere.mockResolvedValueOnce([]);
    mockWhere.mockResolvedValueOnce([{ chapterId: 'ch1', status: 'approved' }]);

    const { getChaptersWithState } = await import('@/lib/chapters');
    const result = await getChaptersWithState('user-id');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'ch1',
      state: 'buyable',
      proofStatus: 'approved',
    });
  });

  it('returns rejectionReason when proof status is rejected', async () => {
    const chapter1 = {
      id: 'ch1',
      title: 'Bab 1',
      chapterNumber: 1,
      priceIdr: 49000,
      isFree: false,
      releaseDate: '2025-01-01',
      pdfPath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOrderBy.mockResolvedValueOnce([chapter1]);
    mockWhere.mockResolvedValueOnce([]);
    mockWhere.mockResolvedValueOnce([
      {
        chapterId: 'ch1',
        status: 'rejected',
        rejectionReason: 'Bukti tidak jelas',
      },
    ]);

    const { getChaptersWithState } = await import('@/lib/chapters');
    const result = await getChaptersWithState('user-id');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'ch1',
      state: 'buyable',
      proofStatus: 'rejected',
      rejectionReason: 'Bukti tidak jelas',
    });
  });
});

// ─── canUserReadChapter — async integration tests ────────────────────

describe('canUserReadChapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns "owned" when user has a purchase for the chapter', async () => {
    // Call 1: chapter lookup → released, free
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch1',
        title: 'Bab 1',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    // Call 2: all chapters
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch1',
        title: 'Bab 1',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    // Call 3: user purchases → owns ch1
    mockWhere.mockResolvedValueOnce([{ chapterId: 'ch1' }]);

    const result = await canUserReadChapter('user-id', 'ch1');

    expect(result).toEqual({ canRead: true, reason: 'owned' });
  });

  it('returns "free-claimable" when chapter is free, released, and not owned', async () => {
    // Call 1: chapter lookup → released, free
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-free',
        title: 'Bab Gratis',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    // Call 2: all chapters
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch-free',
        title: 'Bab Gratis',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    // Call 3: user purchases → none
    mockWhere.mockResolvedValueOnce([]);

    const result = await canUserReadChapter('user-id', 'ch-free');

    expect(result).toEqual({ canRead: true, reason: 'free-claimable' });
  });

  it('returns "paid" when chapter is paid, released, and not owned', async () => {
    // Call 1: chapter lookup → released, paid
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-paid',
        title: 'Bab Berbayar',
        chapterNumber: 1,
        priceIdr: 49000,
        isFree: false,
        releaseDate: '2025-01-01',
        pdfPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    // Call 2: all chapters
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch-paid',
        title: 'Bab Berbayar',
        chapterNumber: 1,
        priceIdr: 49000,
        isFree: false,
        releaseDate: '2025-01-01',
        pdfPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    // Call 3: user purchases → none
    mockWhere.mockResolvedValueOnce([]);

    const result = await canUserReadChapter('user-id', 'ch-paid');

    expect(result).toEqual({ canRead: false, reason: 'paid' });
  });

  it('returns "unreleased" when chapter release_date is in the future', async () => {
    // Call 1: chapter lookup → future release date
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-future',
        title: 'Bab Masa Depan',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2099-12-31',
        pdfPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await canUserReadChapter('user-id', 'ch-future');

    expect(result).toEqual({ canRead: false, reason: 'unreleased' });
  });

  it('returns "locked" when previous chapter is released but not owned', async () => {
    // Call 1: chapter lookup → chapter 2, released, paid
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-2',
        title: 'Bab 2',
        chapterNumber: 2,
        priceIdr: 49000,
        isFree: false,
        releaseDate: '2025-06-01',
        pdfPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    // Call 2: all chapters → chapter 1 (released, not owned) + chapter 2
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch-1',
        title: 'Bab 1',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ch-2',
        title: 'Bab 2',
        chapterNumber: 2,
        priceIdr: 49000,
        isFree: false,
        releaseDate: '2025-06-01',
        pdfPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    // Call 3: user purchases → empty
    mockWhere.mockResolvedValueOnce([]);

    const result = await canUserReadChapter('user-id', 'ch-2');

    expect(result).toEqual({ canRead: false, reason: 'locked' });
  });

  it('returns "not-found" when chapter does not exist', async () => {
    // Call 1: chapter lookup → empty
    mockWhere.mockResolvedValueOnce([]);

    const result = await canUserReadChapter('user-id', 'nonexistent');

    expect(result).toEqual({ canRead: false, reason: 'not-found' });
  });
});

// ─── getNextChapterAction — pure function tests ──────────────────────

describe('getNextChapterAction', () => {
  function chapter(
    overrides: Partial<import('@/lib/chapters').ChapterWithState>
  ) {
    return {
      id: 'ch-1',
      title: 'Bab 1 — Awal',
      chapterNumber: 1,
      priceIdr: 0,
      isFree: true,
      releaseDate: '2025-01-01',
      pdfPath: null,
      state: 'buyable' as const,
      ...overrides,
    };
  }

  it('returns "end-of-book" when there is no next chapter', () => {
    const action = getNextChapterAction(3, [chapter({ chapterNumber: 3 })]);
    expect(action).toEqual({ kind: 'end-of-book' });
  });

  it('returns "navigate" when next chapter is owned', () => {
    const action = getNextChapterAction(1, [
      chapter({ chapterNumber: 1 }),
      chapter({ id: 'ch-2', chapterNumber: 2, state: 'owned' }),
    ]);
    expect(action).toEqual({
      kind: 'navigate',
      nextChapter: { id: 'ch-2', title: 'Bab 1 — Awal', chapterNumber: 2 },
    });
  });

  it('returns "auto-claim" when next chapter is free, released, and not owned', () => {
    const action = getNextChapterAction(1, [
      chapter({ chapterNumber: 1 }),
      chapter({ id: 'ch-2', chapterNumber: 2, state: 'buyable', isFree: true }),
    ]);
    expect(action).toEqual({
      kind: 'auto-claim',
      nextChapter: { id: 'ch-2', title: 'Bab 1 — Awal', chapterNumber: 2 },
    });
  });

  it('returns "redirect-to-list" with reason "paid" when next chapter is paid and buyable', () => {
    const action = getNextChapterAction(1, [
      chapter({ chapterNumber: 1 }),
      chapter({
        id: 'ch-2',
        chapterNumber: 2,
        state: 'buyable',
        isFree: false,
        priceIdr: 49000,
      }),
    ]);
    expect(action).toEqual({ kind: 'redirect-to-list', reason: 'paid' });
  });

  it('returns "locked" with previous chapter number when next chapter is locked', () => {
    const action = getNextChapterAction(1, [
      chapter({ chapterNumber: 1 }),
      chapter({ id: 'ch-2', chapterNumber: 2, state: 'locked' }),
    ]);
    expect(action).toEqual({ kind: 'locked', previousChapterNumber: 1 });
  });

  it('returns "unreleased" when next chapter is unreleased', () => {
    const action = getNextChapterAction(1, [
      chapter({ chapterNumber: 1 }),
      chapter({
        id: 'ch-2',
        chapterNumber: 2,
        state: 'unreleased',
        releaseDate: null,
      }),
    ]);
    expect(action).toEqual({ kind: 'unreleased' });
  });
});
