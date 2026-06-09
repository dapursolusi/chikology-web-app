import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.hoisted(() =>
  vi.fn<() => { data: { user: { id: string; email: string } | null } }>(() => ({
    data: { user: { id: 'test-user-id', email: 'test@test.com' } },
  }))
);

const mockWhere = vi.hoisted(() =>
  vi.fn<() => Promise<unknown[]>>(async () => [])
);

const mockInnerJoin2 = vi.hoisted(() => vi.fn(() => ({ where: mockWhere })));
const mockInnerJoin = vi.hoisted(() =>
  vi.fn(() => ({ innerJoin: mockInnerJoin2, where: mockWhere }))
);

const mockSet = vi.hoisted(() => vi.fn(() => ({ where: mockWhere })));
const mockUpdate = vi.hoisted(() => vi.fn(() => ({ set: mockSet })));

const mockGetAdminRole = vi.hoisted(() =>
  vi.fn<() => Promise<'user' | 'admin'>>(async () => 'admin')
);

const mockFrom = vi.hoisted(() =>
  vi.fn(() => ({ innerJoin: mockInnerJoin, where: mockWhere }))
);
const mockSelect = vi.hoisted(() => vi.fn(() => ({ from: mockFrom })));

const mockReturning = vi.hoisted(() =>
  vi.fn<() => Promise<unknown[]>>(async () => [{ id: 'proof-uuid' }])
);
const mockValues = vi.hoisted(() =>
  vi.fn(() => ({ returning: mockReturning }))
);
const mockInsert = vi.hoisted(() => vi.fn(() => ({ values: mockValues })));

const mockUpload = vi.hoisted(() =>
  vi.fn<
    () => Promise<{
      data: { path: string } | null;
      error: { message: string } | null;
    }>
  >(async () => ({
    data: { path: 'user-id/ch-id-123456.png' },
    error: null,
  }))
);
const mockRemove = vi.hoisted(() =>
  vi.fn(async () => ({ data: null, error: null }))
);
const mockStorageFrom = vi.hoisted(() =>
  vi.fn(() => ({ upload: mockUpload, remove: mockRemove }))
);

const mockCreateSignedUrl = vi.hoisted(() =>
  vi.fn<
    () => Promise<{
      data: { signedUrl: string } | null;
      error: { message: string } | null;
    }>
  >(async () => ({
    data: { signedUrl: 'https://example.supabase.co/proof-image.png' },
    error: null,
  }))
);
const mockServiceStorageFrom = vi.hoisted(() =>
  vi.fn(() => ({ createSignedUrl: mockCreateSignedUrl }))
);

vi.mock('@/db', () => ({
  db: { select: mockSelect, insert: mockInsert, update: mockUpdate },
}));

vi.mock('@/actions/book', () => ({
  getAdminRole: mockGetAdminRole,
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
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

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => 'EQ'),
    and: vi.fn(() => 'AND'),
    inArray: vi.fn(() => 'IN_ARRAY'),
  };
});

function makeFormData(overrides?: {
  chapterId?: string;
  file?: File;
}): FormData {
  const fd = new FormData();
  fd.append('chapterId', overrides?.chapterId ?? 'ch-1');
  fd.append(
    'file',
    overrides?.file ?? new File(['dummy'], 'proof.png', { type: 'image/png' })
  );
  return fd;
}

describe('submitPaymentProof', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockReturnValueOnce({ data: { user: null } });

    const { submitPaymentProof } = await import('@/actions/payment');
    const result = await submitPaymentProof(new FormData());

    expect(result).toEqual({ error: 'Not authenticated' });
  });

  it('rejects non-image file types', async () => {
    const fd = makeFormData({
      file: new File(['not an image'], 'test.txt', { type: 'text/plain' }),
    });

    const { submitPaymentProof } = await import('@/actions/payment');
    const result = await submitPaymentProof(fd);

    expect(result).toEqual({
      error: expect.stringMatching(/gambar|image|format/i),
    });
  });

  it('rejects files larger than 5MB', async () => {
    const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', {
      type: 'image/png',
    });
    const fd = makeFormData({ file: bigFile });

    const { submitPaymentProof } = await import('@/actions/payment');
    const result = await submitPaymentProof(fd);

    expect(result).toEqual({ error: expect.stringMatching(/5MB|besar|size/i) });
  });

  it('rejects duplicate proof for same chapter when previous proof is pending', async () => {
    mockWhere.mockResolvedValueOnce([
      { id: 'existing-proof', status: 'pending' },
    ]);

    const fd = makeFormData();
    const { submitPaymentProof } = await import('@/actions/payment');
    const result = await submitPaymentProof(fd);

    expect(result).toEqual({
      error: expect.stringMatching(/sudah|pending|verifikasi/i),
    });
  });

  it('rejects duplicate proof when previous proof is approved', async () => {
    mockWhere.mockResolvedValueOnce([
      { id: 'existing-proof', status: 'approved' },
    ]);

    const fd = makeFormData();
    const { submitPaymentProof } = await import('@/actions/payment');
    const result = await submitPaymentProof(fd);

    expect(result).toEqual({
      error: expect.stringMatching(/sudah|approved|diverifikasi/i),
    });
  });

  it('uploads file to storage, inserts proof record, and returns success', async () => {
    const fd = makeFormData();
    const { submitPaymentProof } = await import('@/actions/payment');
    const result = await submitPaymentProof(fd);

    expect(result).toEqual({ success: true });

    // Should upload to payment-proofs bucket with correct path pattern
    expect(mockStorageFrom).toHaveBeenCalledWith('payment-proofs');
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/test-user-id\/ch-1-\d+\.png/),
      expect.any(File),
      { contentType: 'image/png' }
    );

    // Should insert into payment_proofs
    expect(mockInsert).toHaveBeenCalledOnce();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'test-user-id',
        chapterId: 'ch-1',
        proofPath: expect.any(String),
        status: 'pending',
      })
    );
    expect(mockReturning).toHaveBeenCalledOnce();
  });

  it('allows re-upload when previous proof was rejected — deletes old file and inserts new proof', async () => {
    // Previous proof was rejected
    mockWhere.mockResolvedValueOnce([
      {
        id: 'old-rejected-proof',
        status: 'rejected',
        proofPath: 'test-user-id/ch-1-old.png',
      },
    ]);

    const fd = makeFormData();
    const { submitPaymentProof } = await import('@/actions/payment');
    const result = await submitPaymentProof(fd);

    expect(result).toEqual({ success: true });

    // Should remove old file
    expect(mockRemove).toHaveBeenCalledWith(['test-user-id/ch-1-old.png']);

    // Should upload new file
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/test-user-id\/ch-1-\d+\.png/),
      expect.any(File),
      { contentType: 'image/png' }
    );

    // Should insert new proof record
    expect(mockInsert).toHaveBeenCalledOnce();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'test-user-id',
        chapterId: 'ch-1',
        status: 'pending',
      })
    );
  });
});

describe('getProofVerifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no proofs exist', async () => {
    const { getProofVerifications } = await import('@/actions/payment');
    const result = await getProofVerifications();

    expect(result).toEqual([]);
  });

  it('returns error when user is not authenticated', async () => {
    mockGetAdminRole.mockResolvedValueOnce('user');

    const { getProofVerifications } = await import('@/actions/payment');
    const result = await getProofVerifications();

    expect(result).toEqual({ error: expect.stringMatching(/admin/i) });
  });

  it('returns error when authenticated user is not admin', async () => {
    mockGetAdminRole.mockResolvedValueOnce('user');

    const { getProofVerifications } = await import('@/actions/payment');
    const result = await getProofVerifications();

    expect(result).toEqual({ error: expect.stringMatching(/admin/i) });
  });

  it('returns proof rows with user email and chapter details', async () => {
    mockWhere.mockResolvedValueOnce([
      {
        id: 'proof-uuid',
        userId: 'user-uuid',
        chapterId: 'chapter-uuid',
        proofPath: 'user-uuid/ch-uuid-123456.png',
        status: 'pending',
        rejectionReason: null,
        createdAt: new Date('2026-06-09'),
        userEmail: 'user@test.com',
        chapterTitle: 'Bab 1 — Awal',
        chapterNumber: 1,
      },
    ]);

    const { getProofVerifications } = await import('@/actions/payment');
    const result = await getProofVerifications();
    const rows = result as Array<Record<string, unknown>>;

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      userEmail: 'user@test.com',
      chapterTitle: 'Bab 1 — Awal',
      chapterNumber: 1,
      status: 'pending',
      proofImageUrl: expect.stringContaining('supabase.co'),
    });
    expect(mockServiceStorageFrom).toHaveBeenCalledWith('payment-proofs');
    expect(mockCreateSignedUrl).toHaveBeenCalled();
  });
});

describe('verifyPaymentProof', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when user is not authenticated', async () => {
    mockGetAdminRole.mockResolvedValueOnce('user');

    const { verifyPaymentProof } = await import('@/actions/payment');
    const result = await verifyPaymentProof('proof-uuid', 'approve');

    expect(result).toEqual({ error: expect.stringMatching(/admin/i) });
  });

  it('returns error when authenticated user is not admin', async () => {
    mockGetAdminRole.mockResolvedValueOnce('user');

    const { verifyPaymentProof } = await import('@/actions/payment');
    const result = await verifyPaymentProof('proof-uuid', 'approve');

    expect(result).toEqual({ error: expect.stringMatching(/admin/i) });
  });

  it('approves a proof — inserts chapter_purchases and updates proof status', async () => {
    mockWhere
      .mockResolvedValueOnce([
        { userId: 'user-uuid', chapterId: 'chapter-uuid' },
      ])
      .mockResolvedValueOnce([]);

    const { verifyPaymentProof } = await import('@/actions/payment');
    const result = await verifyPaymentProof('proof-uuid', 'approve');

    expect(result).toEqual({ success: true });
    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-uuid',
        chapterId: 'chapter-uuid',
      })
    );
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'approved',
        reviewedBy: 'test-user-id',
      })
    );
    expect(mockWhere).toHaveBeenCalledTimes(2);
  });

  it('rejects a proof — sets rejection_reason, reviewed_by, and status to rejected', async () => {
    const { verifyPaymentProof } = await import('@/actions/payment');
    const result = await verifyPaymentProof(
      'proof-uuid',
      'reject',
      'Bukti tidak jelas'
    );

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'rejected',
        rejectionReason: 'Bukti tidak jelas',
        reviewedBy: 'test-user-id',
      })
    );
    expect(mockWhere).toHaveBeenCalledOnce();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('revalidates /dashboard/book and /dashboard/admin/book on success', async () => {
    const { revalidatePath } = await import('next/cache');
    mockWhere.mockResolvedValueOnce([
      { userId: 'user-uuid', chapterId: 'chapter-uuid' },
    ]);

    const { verifyPaymentProof } = await import('@/actions/payment');
    await verifyPaymentProof('proof-uuid', 'approve');

    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/book');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/admin/book');
  });
});
