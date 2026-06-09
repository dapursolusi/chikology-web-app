import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.hoisted(() =>
  vi.fn<() => { data: { user: { id: string; email: string } | null } }>(() => ({
    data: { user: { id: 'test-user-id', email: 'test@test.com' } },
  }))
);

const mockWhere = vi.hoisted(() =>
  vi.fn<() => Promise<unknown[]>>(async () => [])
);
const mockFrom = vi.hoisted(() => vi.fn(() => ({ where: mockWhere })));
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
const mockStorageFrom = vi.hoisted(() => vi.fn(() => ({ upload: mockUpload })));

vi.mock('@/db', () => ({
  db: { select: mockSelect, insert: mockInsert },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    storage: { from: mockStorageFrom },
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
});
