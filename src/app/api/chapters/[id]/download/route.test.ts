import { NextRequest } from 'next/server';

import { getAdminRole } from '@/actions/book';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { PDFDocument } from 'pdf-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { canUserReadChapter } from '@/lib/chapters';
import { createClient, createServiceClient } from '@/lib/supabase/server';

vi.mock('@/actions/book', () => ({
  getAdminRole: vi.fn(),
}));
vi.mock('@/lib/supabase/server');
vi.mock('@/db');
vi.mock('@/lib/chapters');
vi.mock('drizzle-orm');

async function createMinimalPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage();
  return doc.save();
}

function createMockFileData(bytes: Uint8Array) {
  return {
    arrayBuffer: vi.fn().mockResolvedValue(bytes.buffer),
    size: bytes.length,
    type: 'application/pdf',
  };
}

describe('Download Endpoint /api/chapters/[id]/download', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.mocked(getAdminRole).mockResolvedValue('user');
    vi.mocked(eq).mockImplementation((col, val) => ({ col, val }) as never);
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'tira@gmail.com' } },
        }),
      },
    } as never);
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() =>
          Promise.resolve([{ pdfPath: 'chapters/chapter-1.pdf' }])
        ),
      })),
    } as never);
  });

  it('returns 401 when user is not authenticated', async () => {
    const { GET } = await import('./route');
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const request = new NextRequest(
      'http://localhost/api/chapters/ch-1/download'
    );
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
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue([]),
    } as never);

    const request = new NextRequest(
      'http://localhost/api/chapters/ch-1/download'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'ch-1' }),
    });

    expect(response.status).toBe(403);
  });

  it('returns 200 when admin downloads a chapter they cannot normally access', async () => {
    const { GET } = await import('./route');
    const pdfBytes = await createMinimalPdf();
    vi.mocked(getAdminRole).mockResolvedValue('admin');
    vi.mocked(canUserReadChapter).mockResolvedValue({
      canRead: false,
      reason: 'paid',
    });
    const mockStorage = {
      from: vi.fn(() => ({
        download: vi.fn().mockResolvedValue({
          data: createMockFileData(pdfBytes),
          error: null,
        }),
      })),
    };
    vi.mocked(createServiceClient).mockReturnValue({
      storage: mockStorage,
    } as never);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue([]),
    } as never);

    const request = new NextRequest(
      'http://localhost/api/chapters/ch-1/download'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'ch-1' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('sets Cache-Control to a short max-age to prevent stale PDF caching', async () => {
    const { GET } = await import('./route');
    const pdfBytes = await createMinimalPdf();
    vi.mocked(canUserReadChapter).mockResolvedValue({
      canRead: true,
      reason: 'owned',
    });
    const mockStorage = {
      from: vi.fn(() => ({
        download: vi.fn().mockResolvedValue({
          data: createMockFileData(pdfBytes),
          error: null,
        }),
      })),
    };
    vi.mocked(createServiceClient).mockReturnValue({
      storage: mockStorage,
    } as never);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue([]),
    } as never);

    const request = new NextRequest(
      'http://localhost/api/chapters/ch-1/download'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'ch-1' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, max-age=60');
  });

  it('returns 403 when non-admin downloads a chapter they cannot read', async () => {
    const { GET } = await import('./route');
    vi.mocked(canUserReadChapter).mockResolvedValue({
      canRead: false,
      reason: 'paid',
    });
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue([]),
    } as never);

    const request = new NextRequest(
      'http://localhost/api/chapters/ch-1/download'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'ch-1' }),
    });

    expect(response.status).toBe(403);
  });

  it('returns 404 when chapter PDF not found', async () => {
    const { GET } = await import('./route');
    vi.mocked(canUserReadChapter).mockResolvedValue({
      canRead: true,
      reason: 'owned',
    });
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ pdfPath: null }])),
      })),
    } as never);

    const request = new NextRequest(
      'http://localhost/api/chapters/ch-1/download'
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: 'ch-1' }),
    });

    expect(response.status).toBe(404);
  });

  describe('with a valid PDF', () => {
    let originalPdfBytes: Uint8Array;

    beforeEach(async () => {
      originalPdfBytes = await createMinimalPdf();

      vi.mocked(canUserReadChapter).mockResolvedValue({
        canRead: true,
        reason: 'owned',
      });
      const mockStorage = {
        from: vi.fn(() => ({
          download: vi.fn().mockResolvedValue({
            data: createMockFileData(originalPdfBytes),
            error: null,
          }),
        })),
      };
      vi.mocked(createServiceClient).mockReturnValue({
        storage: mockStorage,
      } as never);
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue([]),
      } as never);
    });

    it('returns 200 with watermarked PDF', async () => {
      const { GET } = await import('./route');

      const request = new NextRequest(
        'http://localhost/api/chapters/ch-1/download'
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: 'ch-1' }),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
      expect(response.headers.get('Content-Disposition')).toContain(
        'attachment'
      );
      expect(response.headers.get('Content-Disposition')).toContain(
        'chapter-1.pdf'
      );
    });

    it('output is a valid PDF with same page count', async () => {
      const { GET } = await import('./route');

      const request = new NextRequest(
        'http://localhost/api/chapters/ch-1/download'
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: 'ch-1' }),
      });

      const responseBytes = new Uint8Array(await response.arrayBuffer());
      const outputPdf = await PDFDocument.load(responseBytes);
      const pages = outputPdf.getPages();

      expect(pages.length).toBe(1);
    });

    it('output PDF is larger than input (watermark added)', async () => {
      const { GET } = await import('./route');

      const request = new NextRequest(
        'http://localhost/api/chapters/ch-1/download'
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: 'ch-1' }),
      });

      const responseBytes = new Uint8Array(await response.arrayBuffer());

      expect(responseBytes.length).toBeGreaterThan(originalPdfBytes.length);
    });

    it('logs download_requested to audit table', async () => {
      const { GET } = await import('./route');

      const insertValuesMock = vi.fn().mockResolvedValue([]);
      vi.mocked(db.insert).mockReturnValue({
        values: insertValuesMock,
      } as never);

      const request = new NextRequest(
        'http://localhost/api/chapters/ch-1/download'
      );
      await GET(request, { params: Promise.resolve({ id: 'ch-1' }) });

      expect(insertValuesMock).toHaveBeenCalled();
    });
  });
});
