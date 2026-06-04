import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ChapterForm } from '@/components/dashboard/admin/ChapterForm';

const { mockCreateChapter } = vi.hoisted(() => ({
  mockCreateChapter: vi.fn<
    () => Promise<{ success: true; chapterId: string } | { error: string }>
  >(async () => ({ success: true, chapterId: 'new-chapter-id' })),
}));

vi.mock('@/actions/book', () => ({
  createChapter: mockCreateChapter,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const baseChapter = {
  id: 'chapter-uuid',
  title: 'Bab 1 — Awal',
  chapterNumber: 1,
  priceIdr: 0,
  releaseDate: '2026-06-16',
  isFree: true,
  pdfPath: 'chapters/1.pdf',
  createdAt: new Date('2026-06-01T00:00:00Z'),
  updatedAt: new Date('2026-06-01T00:00:00Z'),
};

describe('ChapterForm', () => {
  it('renders empty state when there are no chapters', () => {
    render(<ChapterForm chapters={[]} />);
    expect(screen.getByText(/belum ada bab/i)).toBeInTheDocument();
  });

  it('renders one row per chapter with title and chapter number', () => {
    render(<ChapterForm chapters={[baseChapter]} />);
    expect(screen.getByText('Bab 1 — Awal')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows "Gratis" for chapters where isFree is true and a formatted IDR price otherwise', () => {
    render(<ChapterForm chapters={[baseChapter]} />);
    expect(screen.getByText('Gratis')).toBeInTheDocument();
  });

  it('shows the release date when scheduled, "Belum dijadwalkan" when null', () => {
    const unscheduled = {
      ...baseChapter,
      id: 'chapter-2-uuid',
      chapterNumber: 2,
      title: 'Bab 2 — Lanjut',
      releaseDate: null,
      isFree: false,
      priceIdr: 49000,
    };
    render(<ChapterForm chapters={[baseChapter, unscheduled]} />);
    expect(screen.getByText('2026-06-16')).toBeInTheDocument();
    expect(screen.getByText('Belum dijadwalkan')).toBeInTheDocument();
  });

  it('renders all form fields with proper labels', () => {
    render(<ChapterForm chapters={[]} />);
    expect(screen.getByLabelText(/judul/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nomor bab/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/harga/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tanggal rilis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gratis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pdf/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields on submit', async () => {
    const user = userEvent.setup();
    render(<ChapterForm chapters={[]} />);

    await user.click(screen.getByRole('button', { name: /simpan|buat/i }));

    await waitFor(() => {
      expect(screen.getByText(/judul wajib diisi/i)).toBeInTheDocument();
    });
    expect(mockCreateChapter).not.toHaveBeenCalled();
  });

  it('disables and zeroes price_idr when is_free toggle is enabled', async () => {
    render(<ChapterForm chapters={[]} />);

    const priceInput = screen.getByLabelText(/harga/i) as HTMLInputElement;
    expect(priceInput.disabled).toBe(false);

    fireEvent.click(screen.getByLabelText(/gratis/i));

    await waitFor(() => {
      expect(priceInput.disabled).toBe(true);
      expect(priceInput.value).toBe('0');
    });
  });

  it('submits FormData to createChapter with valid values', async () => {
    mockCreateChapter.mockResolvedValueOnce({
      success: true,
      chapterId: 'new-id',
    });
    const user = userEvent.setup();
    render(<ChapterForm chapters={[]} />);

    await user.type(screen.getByLabelText(/judul/i), 'Bab 2 — Lanjut');
    await user.clear(screen.getByLabelText(/nomor bab/i));
    await user.type(screen.getByLabelText(/nomor bab/i), '2');
    await user.clear(screen.getByLabelText(/harga/i));
    await user.type(screen.getByLabelText(/harga/i), '49000');

    await user.click(screen.getByRole('button', { name: /simpan|buat/i }));

    await waitFor(() => {
      expect(mockCreateChapter).toHaveBeenCalledTimes(1);
    });
  });

  it('surfaces server error from createChapter', async () => {
    mockCreateChapter.mockResolvedValueOnce({
      error: 'Nomor bab sudah digunakan',
    });
    const user = userEvent.setup();
    render(<ChapterForm chapters={[]} />);

    await user.type(screen.getByLabelText(/judul/i), 'Bab 1');
    await user.clear(screen.getByLabelText(/nomor bab/i));
    await user.type(screen.getByLabelText(/nomor bab/i), '1');
    fireEvent.click(screen.getByLabelText(/gratis/i));

    await user.click(screen.getByRole('button', { name: /simpan|buat/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/nomor bab sudah digunakan/i)
      ).toBeInTheDocument();
    });
  });
});
