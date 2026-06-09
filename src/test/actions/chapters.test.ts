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

const mockCreateSignedUrl = vi.hoisted(() =>
  vi.fn<
    () => Promise<{
      data: { signedUrl: string } | null;
      error: { message: string } | null;
    }>
  >(async () => ({
    data: {
      signedUrl: 'https://example.supabase.co/storage/v1/object/signed/x',
    },
    error: null,
  }))
);
const mockStorageFrom = vi.hoisted(() =>
  vi.fn(() => ({ createSignedUrl: mockCreateSignedUrl }))
);

const mockServiceCreateSignedUrl = vi.hoisted(() =>
  vi.fn<
    () => Promise<{
      data: { signedUrl: string } | null;
      error: { message: string } | null;
    }>
  >(async () => ({
    data: {
      signedUrl: 'https://example.supabase.co/storage/v1/object/signed/service',
    },
    error: null,
  }))
);
const mockServiceStorageFrom = vi.hoisted(() =>
  vi.fn(() => ({ createSignedUrl: mockServiceCreateSignedUrl }))
);

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: { select: mockSelect, insert: mockInsert },
}));

vi.mock('drizzle-orm', () => ({
  asc: vi.fn(() => 'ASC'),
  eq: vi.fn(() => 'EQ'),
  relations: vi.fn(() => ({})),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    storage: { from: mockStorageFrom },
  })),
  createServiceClient: vi.fn(() => ({
    storage: { from: mockServiceStorageFrom },
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

describe('getChapterSignedUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when user is not authenticated and does not call storage', async () => {
    mockGetUser.mockReturnValueOnce({ data: { user: null } });

    const { getChapterSignedUrl } = await import('@/actions/chapters');
    const result = await getChapterSignedUrl('chapter-id');

    expect(result).toEqual({ error: 'Not authenticated' });
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
    expect(mockStorageFrom).not.toHaveBeenCalled();
  });

  it('returns error when chapter does not exist', async () => {
    // canUserReadChapter: call 1 = chapter lookup via where → empty
    mockWhere.mockResolvedValueOnce([]);

    const { getChapterSignedUrl } = await import('@/actions/chapters');
    const result = await getChapterSignedUrl('nonexistent-id');

    expect(result).toEqual({ error: 'Bab tidak ditemukan' });
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it('returns error when createSignedUrl fails on storage side', async () => {
    // canUserReadChapter call 1: chapter lookup → owned
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-1',
        title: 'Bab 1 — Awal',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: 'chapters/1.pdf',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);
    // call 2: all chapters
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch-1',
        title: 'Bab 1 — Awal',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: 'chapters/1.pdf',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);
    // call 3: purchases → owned
    mockWhere.mockResolvedValueOnce([{ chapterId: 'ch-1' }]);
    // call 4: pdfPath lookup
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-1',
        title: 'Bab 1 — Awal',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: 'chapters/1.pdf',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);
    // storage fails (service client)
    mockServiceCreateSignedUrl.mockResolvedValueOnce({
      data: null,
      error: { message: 'bucket offline' },
    });

    const { getChapterSignedUrl } = await import('@/actions/chapters');
    const result = await getChapterSignedUrl('ch-1');

    expect(result).toMatchObject({
      error: expect.stringMatching(/gagal|url|pdf/i),
    });
    expect(mockServiceStorageFrom).toHaveBeenCalledWith('book-chapters');
    expect(mockServiceCreateSignedUrl).toHaveBeenCalledWith(
      'chapters/1.pdf',
      14400
    );
    expect(mockStorageFrom).not.toHaveBeenCalled();
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it('returns error when chapter has no PDF path', async () => {
    // canUserReadChapter call 1: chapter lookup → free, released, but no pdf
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-no-pdf',
        title: 'Bab Tanpa PDF',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);
    // call 2: all chapters
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch-no-pdf',
        title: 'Bab Tanpa PDF',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);
    // call 3: purchases → none (free claim path is canRead=true)
    mockWhere.mockResolvedValueOnce([]);
    // call 4: pdfPath lookup → null
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-no-pdf',
        title: 'Bab Tanpa PDF',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);

    const { getChapterSignedUrl } = await import('@/actions/chapters');
    const result = await getChapterSignedUrl('ch-no-pdf');

    expect(result).toMatchObject({
      error: expect.stringMatching(/pdf|tidak tersedia/i),
    });
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it('returns "Beli bab ini terlebih dahulu" when chapter is paid and not owned', async () => {
    // canUserReadChapter call 1: chapter lookup → paid released chapter
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-paid',
        title: 'Bab Berbayar',
        chapterNumber: 1,
        priceIdr: 49000,
        isFree: false,
        releaseDate: '2025-01-01',
        pdfPath: 'chapters/paid.pdf',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);
    // call 2: all chapters
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch-paid',
        title: 'Bab Berbayar',
        chapterNumber: 1,
        priceIdr: 49000,
        isFree: false,
        releaseDate: '2025-01-01',
        pdfPath: 'chapters/paid.pdf',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);
    // call 3: purchases → none
    mockWhere.mockResolvedValueOnce([]);

    const { getChapterSignedUrl } = await import('@/actions/chapters');
    const result = await getChapterSignedUrl('ch-paid');

    expect(result).toEqual({ error: 'Beli bab ini terlebih dahulu' });
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it('returns "Bab belum dirilis" when chapter is released in the future', async () => {
    // canUserReadChapter call 1: chapter lookup → unreleased chapter (future releaseDate)
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-future',
        title: 'Bab Masa Depan',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2099-12-31',
        pdfPath: 'chapters/future.pdf',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);
    // canUserReadChapter short-circuits on unreleased → no further DB or storage calls.

    const { getChapterSignedUrl } = await import('@/actions/chapters');
    const result = await getChapterSignedUrl('ch-future');

    expect(result).toEqual({ error: 'Bab belum dirilis' });
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it('returns "Selesaikan bab sebelumnya terlebih dahulu" when chapter is locked by sequential gating', async () => {
    // canUserReadChapter call 1: chapter lookup → ch-2 (released, paid)
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-2',
        title: 'Bab 2',
        chapterNumber: 2,
        priceIdr: 49000,
        isFree: false,
        releaseDate: '2025-01-01',
        pdfPath: 'chapters/2.pdf',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);
    // canUserReadChapter call 2: all chapters (ch-1 released, ch-2 released)
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch-1',
        chapterNumber: 1,
        releaseDate: '2024-01-01',
        priceIdr: 0,
        isFree: true,
      },
      {
        id: 'ch-2',
        chapterNumber: 2,
        releaseDate: '2025-01-01',
        priceIdr: 49000,
        isFree: false,
      },
    ]);
    // canUserReadChapter call 3: purchases → empty (user owns nothing, so ch-2 is locked behind ch-1)
    mockWhere.mockResolvedValueOnce([]);
    // getChapterSignedUrl short-circuits on locked → no storage call.

    const { getChapterSignedUrl } = await import('@/actions/chapters');
    const result = await getChapterSignedUrl('ch-2');

    expect(result).toEqual({
      error: 'Selesaikan bab sebelumnya terlebih dahulu',
    });
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it('returns a signed URL with 14400s expiry when user owns the chapter using service client', async () => {
    // canUserReadChapter call 1: chapter lookup via where → released chapter with pdf
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-1',
        title: 'Bab 1 — Awal',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: 'chapters/1.pdf',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);
    // canUserReadChapter call 2: all chapters via orderBy
    mockOrderBy.mockResolvedValueOnce([
      {
        id: 'ch-1',
        title: 'Bab 1 — Awal',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: 'chapters/1.pdf',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);
    // canUserReadChapter call 3: purchases via where → owns ch-1
    mockWhere.mockResolvedValueOnce([{ chapterId: 'ch-1' }]);
    // getChapterSignedUrl's own chapter lookup for pdfPath
    mockWhere.mockResolvedValueOnce([
      {
        id: 'ch-1',
        title: 'Bab 1 — Awal',
        chapterNumber: 1,
        priceIdr: 0,
        isFree: true,
        releaseDate: '2025-01-01',
        pdfPath: 'chapters/1.pdf',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]);

    const { getChapterSignedUrl } = await import('@/actions/chapters');
    const result = await getChapterSignedUrl('ch-1');

    expect(result).toEqual({
      url: 'https://example.supabase.co/storage/v1/object/signed/service',
      expiresIn: 14400,
    });
    expect(mockServiceStorageFrom).toHaveBeenCalledWith('book-chapters');
    expect(mockServiceCreateSignedUrl).toHaveBeenCalledWith(
      'chapters/1.pdf',
      14400
    );
    expect(mockStorageFrom).not.toHaveBeenCalled();
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });
});
