import { describe, expect, it, vi } from 'vitest';

// `from` and `where` are intentionally part of the chainable mock even though
// some tests exercise only `orderBy` or `limit`. Without them the chain breaks.

const {
  select,
  insert,
  orderBy,
  limit,
  from: _from,
  where: _where,
  returning: _returning,
} = vi.hoisted(() => {
  const orderBy = vi.fn<() => Promise<unknown[]>>(async () => []);
  const limit = vi.fn<() => Promise<unknown[]>>(async () => []);
  const where = vi.fn(() => ({ limit, orderBy }));
  const returning = vi.fn<() => Promise<unknown[]>>(async () => []);
  const values = vi.fn(() => ({ returning }));
  const from = vi.fn(() => ({ where, orderBy, limit }));
  const select = vi.fn(() => ({ from }));
  const insert = vi.fn(() => ({ values }));
  return { select, insert, from, orderBy, where, limit, returning, values };
});

const { mockUpload, mockStorageFrom } = vi.hoisted(() => {
  const mockUpload = vi.fn<
    () => Promise<{
      data: { path: string } | null;
      error: { message: string } | null;
    }>
  >(async () => ({ data: { path: '1-1234567890.pdf' }, error: null }));
  const mockStorageFrom = vi.fn(() => ({ upload: mockUpload }));
  return { mockUpload, mockStorageFrom };
});

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: { select, insert },
}));

vi.mock('drizzle-orm', () => ({
  asc: vi.fn(() => 'ASC'),
  eq: vi.fn(() => 'EQ'),
}));

type MockUser = { id: string; email: string } | null;
const mockGetUser = vi.fn<() => { data: { user: MockUser } }>(() => ({
  data: { user: { id: 'test-user-id', email: 'test@test.com' } },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    storage: { from: mockStorageFrom },
  })),
}));

function makeFormData(values: Record<string, string | File>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) {
    fd.append(k, v);
  }
  return fd;
}

describe('getBookChapters', () => {
  it('returns empty array when no chapters exist', async () => {
    orderBy.mockResolvedValueOnce([]);

    const { getBookChapters } = await import('@/actions/book');
    const result = await getBookChapters();
    expect(result).toEqual([]);
  });

  it('returns chapter rows with id, title, chapterNumber, priceIdr, isFree, releaseDate, pdfPath, createdAt, updatedAt', async () => {
    const rowA = {
      id: 'chapter-a-uuid',
      title: 'Bab 1 — Awal',
      chapterNumber: 1,
      priceIdr: 0,
      releaseDate: '2026-06-16',
      isFree: true,
      pdfPath: 'chapters/1.pdf',
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };
    const rowB = {
      id: 'chapter-b-uuid',
      title: 'Bab 2 — Lanjut',
      chapterNumber: 2,
      priceIdr: 49000,
      releaseDate: null,
      isFree: false,
      pdfPath: null,
      createdAt: new Date('2026-06-02T00:00:00Z'),
      updatedAt: new Date('2026-06-02T00:00:00Z'),
    };
    orderBy.mockResolvedValueOnce([rowA, rowB]);

    const { getBookChapters } = await import('@/actions/book');
    const result = await getBookChapters();

    expect(result).toEqual([rowA, rowB]);
  });
});

describe('getAdminRole', () => {
  it('returns "user" when no user is authenticated', async () => {
    mockGetUser.mockReturnValueOnce({ data: { user: null as MockUser } });

    const { getAdminRole } = await import('@/actions/book');
    const result = await getAdminRole();
    expect(result).toBe('user');
  });

  it('returns "user" for authenticated user whose row has role="user"', async () => {
    mockGetUser.mockReturnValueOnce({
      data: { user: { id: 'regular-user-id', email: 'r@t.com' } },
    });
    limit.mockResolvedValueOnce([{ role: 'user' }]);

    const { getAdminRole } = await import('@/actions/book');
    const result = await getAdminRole();
    expect(result).toBe('user');
  });

  it('returns "user" for authenticated user whose row is missing', async () => {
    mockGetUser.mockReturnValueOnce({
      data: { user: { id: 'orphan-user-id', email: 'o@t.com' } },
    });
    limit.mockResolvedValueOnce([]);

    const { getAdminRole } = await import('@/actions/book');
    const result = await getAdminRole();
    expect(result).toBe('user');
  });

  it('returns "admin" for authenticated user whose row has role="admin"', async () => {
    mockGetUser.mockReturnValueOnce({
      data: { user: { id: 'admin-user-id', email: 'a@t.com' } },
    });
    limit.mockResolvedValueOnce([{ role: 'admin' }]);

    const { getAdminRole } = await import('@/actions/book');
    const result = await getAdminRole();
    expect(result).toBe('admin');
  });
});

describe('createChapter', () => {
  function adminAuth() {
    mockGetUser.mockReturnValueOnce({
      data: { user: { id: 'admin-user-id', email: 'a@t.com' } },
    });
    limit.mockResolvedValueOnce([{ role: 'admin' }]);
  }

  it('returns Forbidden when current user is not authenticated', async () => {
    mockGetUser.mockReturnValueOnce({ data: { user: null as MockUser } });

    const { createChapter } = await import('@/actions/book');
    const fd = makeFormData({
      title: 'Bab 1',
      chapter_number: '1',
      price_idr: '0',
      release_date: '',
      is_free: 'true',
    });
    const result = await createChapter(fd);
    expect(result).toEqual({ error: 'Hanya admin yang dapat membuat bab' });
  });

  it('returns Forbidden when authenticated user is not admin', async () => {
    mockGetUser.mockReturnValueOnce({
      data: { user: { id: 'regular-user', email: 'r@t.com' } },
    });
    limit.mockResolvedValueOnce([{ role: 'user' }]);

    const { createChapter } = await import('@/actions/book');
    const fd = makeFormData({
      title: 'Bab 1',
      chapter_number: '1',
      price_idr: '0',
      release_date: '',
      is_free: 'true',
    });
    const result = await createChapter(fd);
    expect(result).toEqual({ error: 'Hanya admin yang dapat membuat bab' });
  });

  it('returns validation error for empty title', async () => {
    adminAuth();

    const { createChapter } = await import('@/actions/book');
    const fd = makeFormData({
      title: '',
      chapter_number: '1',
      price_idr: '0',
      release_date: '',
      is_free: 'true',
    });
    const result = await createChapter(fd);
    expect(result).toMatchObject({ error: expect.any(String) });
  });

  it('returns validation error when is_free is true but price_idr > 0', async () => {
    adminAuth();

    const { createChapter } = await import('@/actions/book');
    const fd = makeFormData({
      title: 'Bab 1',
      chapter_number: '1',
      price_idr: '1000',
      release_date: '',
      is_free: 'true',
    });
    const result = await createChapter(fd);
    expect(result).toMatchObject({ error: expect.stringMatching(/harga/i) });
  });

  it('inserts a row with is_free=true forcing price_idr=0 and skipping PDF upload', async () => {
    adminAuth();
    _returning.mockResolvedValueOnce([{ id: 'new-chapter-id' }]);

    const { createChapter } = await import('@/actions/book');
    const fd = makeFormData({
      title: 'Bab 1 — Awal',
      chapter_number: '1',
      price_idr: '0',
      release_date: '2026-06-16',
      is_free: 'true',
    });
    const result = await createChapter(fd);

    expect(result).toEqual({ success: true, chapterId: 'new-chapter-id' });
    expect(mockUpload).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('uploads PDF with <chapter_number>-<timestamp>.pdf path before inserting', async () => {
    adminAuth();
    insert.mockClear();
    _returning.mockResolvedValueOnce([{ id: 'new-chapter-id' }]);
    const fakePdf = new File(['pdf-bytes'], 'source.pdf', {
      type: 'application/pdf',
    });

    const { createChapter } = await import('@/actions/book');
    const fd = makeFormData({
      title: 'Bab 2',
      chapter_number: '2',
      price_idr: '49000',
      release_date: '',
      is_free: 'false',
      pdf: fakePdf,
    });
    const result = await createChapter(fd);

    expect(result).toEqual({ success: true, chapterId: 'new-chapter-id' });
    expect(mockStorageFrom).toHaveBeenCalledWith('book-chapters');
    expect(mockUpload).toHaveBeenCalledTimes(1);
    const [uploadPath, uploadFile] = mockUpload.mock.calls[0] ?? [];
    expect(typeof uploadPath).toBe('string');
    expect(uploadPath as string).toMatch(/^2-\d+\.pdf$/);
    expect(uploadFile).toBe(fakePdf);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('returns friendly error on chapter_number unique violation', async () => {
    adminAuth();
    const uniqueError = Object.assign(new Error('duplicate key value'), {
      code: '23505',
    });
    insert.mockImplementationOnce(() => {
      throw uniqueError;
    });

    const { createChapter } = await import('@/actions/book');
    const fd = makeFormData({
      title: 'Bab 1',
      chapter_number: '1',
      price_idr: '0',
      release_date: '',
      is_free: 'true',
    });
    const result = await createChapter(fd);
    expect(result).toMatchObject({
      error: expect.stringMatching(/nomor bab/i),
    });
  });

  it('returns error when storage upload fails', async () => {
    adminAuth();
    insert.mockClear();
    mockUpload.mockResolvedValueOnce({
      data: null,
      error: { message: 'bucket offline' },
    });

    const { createChapter } = await import('@/actions/book');
    const fd = makeFormData({
      title: 'Bab 3',
      chapter_number: '3',
      price_idr: '0',
      release_date: '',
      is_free: 'true',
      pdf: new File(['x'], 'a.pdf', { type: 'application/pdf' }),
    });
    const result = await createChapter(fd);
    expect(result).toMatchObject({
      error: expect.stringMatching(/unggah|upload/i),
    });
    expect(insert).not.toHaveBeenCalled();
  });
});
