import { describe, expect, it, vi } from 'vitest';

const {
  select,
  insert,
  update,
  set: _set,
  orderBy: _orderBy,
  limit,
  from: _from,
  where: _where,
  returning: _returning,
} = vi.hoisted(() => {
  const orderBy = vi.fn<() => Promise<unknown[]>>(async () => []);
  const limit = vi.fn<() => Promise<unknown[]>>(async () => []);
  const returning = vi.fn<() => Promise<unknown[]>>(async () => []);
  const where = vi.fn(() => ({ limit, orderBy, returning }));
  const set = vi.fn(() => ({ where }));
  const values = vi.fn(() => ({ returning }));
  const from = vi.fn(() => ({ where, orderBy, limit }));
  const select = vi.fn(() => ({ from }));
  const insert = vi.fn(() => ({ values }));
  const update = vi.fn(() => ({ set }));
  return {
    select,
    insert,
    update,
    set,
    from,
    where,
    orderBy,
    limit,
    returning,
    values,
  };
});

// References preserved to satisfy TS noUnusedLocals while keeping the
// chainable mock shape (these are still wired into the drizzle chain
// closures above).
void _orderBy;
void _from;
void _where;
void _returning;

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: { select, insert, update },
}));

vi.mock('drizzle-orm', () => ({
  asc: vi.fn(() => 'ASC'),
  eq: vi.fn((_col: unknown, val: unknown) => ({ op: 'eq', val })),
  relations: vi.fn(() => ({})),
}));

type MockUser = { id: string; email: string } | null;
const mockGetUser = vi.fn<() => { data: { user: MockUser } }>(() => ({
  data: { user: { id: 'admin-user-id', email: 'a@t.com' } },
}));

vi.mock('@/lib/supabase/server', () => {
  const createClient = vi.fn(() => ({
    auth: { getUser: mockGetUser },
  }));
  return {
    createClient,
    getAuthUser: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  };
});

function adminAuth() {
  mockGetUser.mockReturnValueOnce({
    data: { user: { id: 'admin-user-id', email: 'a@t.com' } },
  });
  limit.mockResolvedValueOnce([{ role: 'admin' }]);
}

describe('setEbookLiveState', () => {
  it('admin can set ebook_live to true (updates app_settings row)', async () => {
    adminAuth();

    const { setEbookLiveState } = await import('@/actions/settings');
    const result = await setEbookLiveState(true);

    expect(result).toEqual({ success: true });
    expect(update).toHaveBeenCalledTimes(1);
    expect(_set).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'true' })
    );
  });

  it('admin can set ebook_live to false (writes "false" string to row)', async () => {
    adminAuth();

    const { setEbookLiveState } = await import('@/actions/settings');
    const result = await setEbookLiveState(false);

    expect(result).toEqual({ success: true });
    expect(_set).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'false' })
    );
  });

  it('rejects non-admin authenticated user with error and does not write', async () => {
    update.mockClear();
    mockGetUser.mockReturnValueOnce({
      data: { user: { id: 'regular-user-id', email: 'r@t.com' } },
    });
    limit.mockResolvedValueOnce([{ role: 'user' }]);

    const { setEbookLiveState } = await import('@/actions/settings');
    const result = await setEbookLiveState(true);

    expect(result).toMatchObject({ error: expect.any(String) });
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated caller with error and does not write', async () => {
    update.mockClear();
    mockGetUser.mockReturnValueOnce({
      data: { user: null as MockUser },
    });

    const { setEbookLiveState } = await import('@/actions/settings');
    const result = await setEbookLiveState(true);

    expect(result).toMatchObject({ error: expect.any(String) });
    expect(update).not.toHaveBeenCalled();
  });
});
