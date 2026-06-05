import { revalidatePath } from 'next/cache';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.hoisted(() =>
  vi.fn<() => { data: { user: { id: string; email: string } | null } }>(() => ({
    data: { user: { id: 'test-user-id', email: 'test@test.com' } },
  }))
);

const mockReturning = vi.hoisted(() =>
  vi.fn<() => Promise<unknown[]>>(async () => [])
);
const mockValues = vi.hoisted(() =>
  vi.fn(() => ({ returning: mockReturning }))
);
const mockInsert = vi.hoisted(() => vi.fn(() => ({ values: mockValues })));

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

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: { select: mockSelect, insert: mockInsert },
}));

vi.mock('drizzle-orm', () => ({
  asc: vi.fn(() => 'ASC'),
  eq: vi.fn(() => 'EQ'),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

describe('purchaseChapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockReturnValueOnce({ data: { user: null } });

    const { purchaseChapter } = await import('@/actions/chapters');
    const result = await purchaseChapter('chapter-id');

    expect(result).toEqual({ error: 'Not authenticated' });
  });

  it('returns error when chapter does not exist', async () => {
    mockWhere.mockResolvedValueOnce([]);

    const { purchaseChapter } = await import('@/actions/chapters');
    const result = await purchaseChapter('nonexistent-id');

    expect(result).toEqual({ error: 'Bab tidak ditemukan' });
  });

  it('returns error when chapter is not yet released', async () => {
    // First DB call: chapter lookup → unreleased chapter
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-future',
        title: 'Bab Masa Depan',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2099-12-31',
        pdfPath: null,
      },
    ]);

    const { purchaseChapter } = await import('@/actions/chapters');
    const result = await purchaseChapter('ch-future');

    expect(result).toEqual({ error: 'Bab belum dirilis' });
  });

  it('returns error when chapter is already owned', async () => {
    // First DB call: chapter lookup → released chapter
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-owned',
        title: 'Bab Sudah Dimiliki',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: null,
      },
    ]);
    // Second DB call: all chapters (orderBy)
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch-owned',
        chapterNumber: 1,
        releaseDate: '2025-01-01',
        priceIdr: 0,
        isFree: true,
      },
    ]);
    // Third DB call: purchases lookup → already owned
    mockWhere.mockResolvedValueOnce([{ chapterId: 'ch-owned' }]);

    const { purchaseChapter } = await import('@/actions/chapters');
    const result = await purchaseChapter('ch-owned');

    expect(result).toEqual({ error: 'Bab sudah dimiliki' });
  });

  it('returns error when previous chapter is not owned (sequential gating)', async () => {
    // First DB call: chapter lookup → chapter 2, released
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-2',
        title: 'Bab 2',
        chapterNumber: 2,
        priceIdr: 49000,
        isFree: false,
        releaseDate: '2025-06-01',
        pdfPath: null,
      },
    ]);
    // Second DB call: all chapters (orderBy) → chapter 1 + chapter 2
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch-1',
        chapterNumber: 1,
        releaseDate: '2025-01-01',
        priceIdr: 0,
        isFree: true,
      },
      {
        id: 'ch-2',
        chapterNumber: 2,
        releaseDate: '2025-06-01',
        priceIdr: 49000,
        isFree: false,
      },
    ]);
    // Third DB call: purchases lookup → empty (nothing owned)
    mockWhere.mockResolvedValueOnce([]);

    const { purchaseChapter } = await import('@/actions/chapters');
    const result = await purchaseChapter('ch-2');

    expect(result).toEqual({
      error: 'Selesaikan bab sebelumnya terlebih dahulu',
    });
  });

  it('inserts a purchase row and returns success with chapter info', async () => {
    // First DB call: chapter lookup → chapter 1, released, free
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-buy',
        title: 'Bab 1 — Awal',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: null,
      },
    ]);
    // Second DB call: all chapters (orderBy) → just chapter 1
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch-buy',
        chapterNumber: 1,
        releaseDate: '2025-01-01',
        priceIdr: 0,
        isFree: true,
      },
    ]);
    // Third DB call: purchases lookup → empty (not owned yet)
    mockWhere.mockResolvedValueOnce([]);
    // Insert returning → returns the inserted row
    mockReturning.mockResolvedValueOnce([{ id: 'purchase-uuid' }]);

    const { purchaseChapter } = await import('@/actions/chapters');
    const result = await purchaseChapter('ch-buy');

    expect(result).toEqual({
      success: true,
      chapter: { id: 'ch-buy', title: 'Bab 1 — Awal', chapterNumber: 1 },
    });
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/book');
  });
});

describe('claimFreeChapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockReturnValueOnce({ data: { user: null } });

    const { claimFreeChapter } = await import('@/actions/chapters');
    const result = await claimFreeChapter('chapter-id');

    expect(result).toEqual({ error: 'Not authenticated' });
  });
});
