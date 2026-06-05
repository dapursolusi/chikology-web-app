import { beforeEach, describe, expect, it, vi } from 'vitest';

import { computeChapterState } from '@/lib/chapters';

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

    const { getChaptersWithState } = await import('@/lib/chapters');
    const result = await getChaptersWithState('user-id');

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'ch1',
      chapterNumber: 1,
      state: 'owned',
    });
    expect(result[1]).toMatchObject({
      id: 'ch2',
      chapterNumber: 2,
      state: 'buyable',
    });
  });
});
