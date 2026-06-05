import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ChapterForm } from '@/components/dashboard/admin/ChapterForm';

const { mockCreateChapter, mockUpdateChapter, mockHideChapter } = vi.hoisted(
  () => ({
    mockCreateChapter: vi.fn<
      () => Promise<{ success: true; chapterId: string } | { error: string }>
    >(async () => ({ success: true, chapterId: 'new-chapter-id' })),
    mockUpdateChapter: vi.fn<
      () => Promise<{ success: true; chapterId: string } | { error: string }>
    >(async () => ({ success: true, chapterId: 'updated-chapter-id' })),
    mockHideChapter: vi.fn<
      () => Promise<{ success: true } | { error: string }>
    >(async () => ({ success: true })),
  })
);

vi.mock('@/actions/book', () => ({
  createChapter: mockCreateChapter,
  updateChapter: mockUpdateChapter,
  hideChapter: mockHideChapter,
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

  it('switches to edit mode when Edit button is clicked and pre-populates fields from the chapter', async () => {
    const user = userEvent.setup();
    render(<ChapterForm chapters={[baseChapter]} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByText(/edit bab/i)).toBeInTheDocument();
    expect((screen.getByLabelText(/judul/i) as HTMLInputElement).value).toBe(
      baseChapter.title
    );
    expect(
      (screen.getByLabelText(/nomor bab/i) as HTMLInputElement).value
    ).toBe(String(baseChapter.chapterNumber));
    expect((screen.getByLabelText(/harga/i) as HTMLInputElement).value).toBe(
      String(baseChapter.priceIdr)
    );
    expect(
      (screen.getByLabelText(/tanggal rilis/i) as HTMLInputElement).value
    ).toBe(baseChapter.releaseDate ?? '');
  });

  it('submits the edit form to updateChapter with the chapter id and a FormData built from the current values', async () => {
    const user = userEvent.setup();
    mockCreateChapter.mockClear();
    mockUpdateChapter.mockClear();
    mockUpdateChapter.mockResolvedValueOnce({
      success: true,
      chapterId: baseChapter.id,
    });
    render(<ChapterForm chapters={[baseChapter]} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.clear(screen.getByLabelText(/judul/i));
    await user.type(screen.getByLabelText(/judul/i), 'Bab 1 — Updated Title');

    await user.click(screen.getByRole('button', { name: /simpan perubahan/i }));

    await waitFor(() => {
      expect(mockUpdateChapter).toHaveBeenCalledTimes(1);
    });
    const [chapterId, fd] = mockUpdateChapter.mock.calls[0] as unknown as [
      string,
      FormData,
    ];
    expect(chapterId).toBe(baseChapter.id);
    expect(fd).toBeInstanceOf(FormData);
    expect(fd.get('title')).toBe('Bab 1 — Updated Title');
    expect(mockCreateChapter).not.toHaveBeenCalled();
  });

  it('clicking the Hide confirmation calls hideChapter with the chapter id and exits edit mode if applicable', async () => {
    const user = userEvent.setup();
    render(<ChapterForm chapters={[baseChapter]} />);

    await user.click(screen.getByRole('button', { name: /sembunyikan/i }));
    await user.click(screen.getByRole('button', { name: /sembunyikan/i }));

    await waitFor(() => {
      expect(mockHideChapter).toHaveBeenCalledTimes(1);
    });
    expect(mockHideChapter).toHaveBeenCalledWith(baseChapter.id);
  });
});
