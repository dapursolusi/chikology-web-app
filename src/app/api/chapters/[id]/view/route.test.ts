import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { canUserReadChapter } from '@/lib/chapters';
import { createClient, createServiceClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server');
vi.mock('@/db');
vi.mock('@/lib/chapters');
vi.mock('drizzle-orm');

function createMockFileData(bytes: Uint8Array) {
  return {
    arrayBuffer: vi.fn().mockResolvedValue(bytes.buffer),
    size: bytes.length,
    type: 'application/pdf',
  };
}

describe('Viewer Endpoint /api/chapters/[id]/view', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.mocked(eq).mockImplementation((col, val) => ({ col, val }));

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    });
    vi.mocked(canUserReadChapter).mockResolvedValue({
      canRead: true,
      reason: 'owned',
    });
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() =>
          Promise.resolve([{ pdfPath: 'chapters/chapter-1.pdf' }])
        ),
      })),
    });
    const mockStorage = {
      from: vi.fn(() => ({
        download: vi.fn().mockResolvedValue({
          data: createMockFileData(new Uint8Array([37, 80, 68, 70])),
          error: null,
        }),
      })),
    };
    vi.mocked(createServiceClient).mockReturnValue({ storage: mockStorage });
    const insertValuesMock = vi.fn().mockResolvedValue([]);
    vi.mocked(db.insert).mockReturnValue({ values: insertValuesMock });
  });

  it('returns 401 when user is not authenticated', async () => {
    const { GET } = await import('./route');
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const request = new Request('http://localhost/api/chapters/ch-1/view');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'ch-1' }),
    });

    expect(response.status).toBe(401);
  });

  it('returns 403 when user cannot read chapter', async () => {
    const { GET } = await import('./route');
    vi.mocked(canUserReadChapter).mockResolvedValue({
      canRead: false,
      reason: 'paid',
    });

    const request = new Request('http://localhost/api/chapters/ch-1/view');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'ch-1' }),
    });

    expect(response.status).toBe(403);
  });

  it('returns 404 when chapter PDF not found', async () => {
    const { GET } = await import('./route');
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ pdfPath: null }])),
      })),
    });

    const request = new Request('http://localhost/api/chapters/ch-1/view');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'ch-1' }),
    });

    expect(response.status).toBe(404);
  });

  it('returns 200 with PDF content and correct headers', async () => {
    const { GET } = await import('./route');

    const request = new Request('http://localhost/api/chapters/ch-1/view');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'ch-1' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe(
      'inline; filename="chapter-1.pdf"'
    );
  });

  it('supports Range header for byte-range requests', async () => {
    const { GET } = await import('./route');

    const mockStorage = {
      from: vi.fn(() => ({
        download: vi.fn().mockResolvedValue({
          data: createMockFileData(new Uint8Array(1000).fill(65)),
          error: null,
        }),
      })),
    };
    vi.mocked(createServiceClient).mockReturnValue({ storage: mockStorage });

    const request = new Request('http://localhost/api/chapters/ch-1/view', {
      headers: { Range: 'bytes=0-499' },
    });
    const response = await GET(request, {
      params: Promise.resolve({ id: 'ch-1' }),
    });

    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 0-499/1000');
    expect(response.headers.get('Accept-Ranges')).toBe('bytes');
  });

  it('logs view_started to audit table', async () => {
    const { GET } = await import('./route');

    const insertValuesMock = vi.fn().mockResolvedValue([]);
    vi.mocked(db.insert).mockReturnValue({ values: insertValuesMock });

    const request = new Request('http://localhost/api/chapters/ch-1/view');
    await GET(request, { params: Promise.resolve({ id: 'ch-1' }) });

    expect(insertValuesMock).toHaveBeenCalled();
  });
});
