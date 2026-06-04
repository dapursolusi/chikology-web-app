import AdminBookPage from '@/app/dashboard/admin/book/page';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

type ChapterRowShape = {
  id: string;
  title: string;
  chapterNumber: number;
  priceIdr: number;
  releaseDate: string | null;
  isFree: boolean;
  pdfPath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const { getAdminRole, getBookChapters } = vi.hoisted(() => ({
  getAdminRole: vi.fn<() => Promise<'user' | 'admin'>>(async () => 'user'),
  getBookChapters: vi.fn<() => Promise<ChapterRowShape[]>>(async () => []),
}));

vi.mock('@/actions/book', () => ({
  getAdminRole,
  getBookChapters,
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('AdminBookPage — role gate', () => {
  it('calls notFound() when current user is not an admin', async () => {
    getAdminRole.mockResolvedValueOnce('user');

    await expect(AdminBookPage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(getBookChapters).not.toHaveBeenCalled();
  });

  it('renders the chapter list for an admin user', async () => {
    getAdminRole.mockResolvedValueOnce('admin');
    getBookChapters.mockResolvedValueOnce([
      {
        id: 'a-uuid',
        title: 'Bab 1 — Awal',
        chapterNumber: 1,
        priceIdr: 0,
        releaseDate: '2026-06-16',
        isFree: true,
        pdfPath: 'chapters/1.pdf',
        createdAt: new Date('2026-06-01T00:00:00Z'),
        updatedAt: new Date('2026-06-01T00:00:00Z'),
      },
    ]);

    const element = await AdminBookPage();
    render(element);
    expect(screen.getByText('Kelola E-Book')).toBeInTheDocument();
    expect(screen.getByText('Bab 1 — Awal')).toBeInTheDocument();
  });
});
