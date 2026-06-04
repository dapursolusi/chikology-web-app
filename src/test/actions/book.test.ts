import { describe, expect, it, vi } from 'vitest';

// `from` and `where` are intentionally part of the chainable mock even though
// some tests exercise only `orderBy` or `limit`. Without them the chain breaks.

const {
  select,
  orderBy,
  limit,
  from: _from,
  where: _where,
} = vi.hoisted(() => {
  const orderBy = vi.fn<() => Promise<unknown[]>>(async () => []);
  const limit = vi.fn<() => Promise<unknown[]>>(async () => []);
  const where = vi.fn(() => ({ limit, orderBy }));
  const from = vi.fn(() => ({ where, orderBy, limit }));
  const select = vi.fn(() => ({ from }));
  return { select, from, orderBy, where, limit };
});

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: { select },
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
  })),
}));

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
