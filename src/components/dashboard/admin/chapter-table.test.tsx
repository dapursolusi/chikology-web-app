import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { type ChapterRow, ChapterTable } from './ChapterTable';

const baseChapters: ChapterRow[] = [
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
  {
    id: 'b-uuid',
    title: 'Bab 2 — Lanjut',
    chapterNumber: 2,
    priceIdr: 49000,
    releaseDate: null,
    isFree: false,
    pdfPath: null,
    createdAt: new Date('2026-06-02T00:00:00Z'),
    updatedAt: new Date('2026-06-02T00:00:00Z'),
  },
];

describe('ChapterTable', () => {
  it('renders empty state when there are no chapters', () => {
    render(<ChapterTable chapters={[]} />);
    expect(screen.getByText(/belum ada bab/i)).toBeInTheDocument();
  });

  it('renders one row per chapter with title and chapter number', () => {
    render(<ChapterTable chapters={baseChapters} />);
    expect(screen.getByText('Bab 1 — Awal')).toBeInTheDocument();
    expect(screen.getByText('Bab 2 — Lanjut')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows "Gratis" for chapters where isFree is true and a formatted IDR price otherwise', () => {
    render(<ChapterTable chapters={baseChapters} />);
    expect(screen.getByText('Gratis')).toBeInTheDocument();
    expect(screen.getByText(/49\.000/)).toBeInTheDocument();
  });

  it('shows the release date when scheduled, "Belum dijadwalkan" when null', () => {
    render(<ChapterTable chapters={baseChapters} />);
    expect(screen.getByText('2026-06-16')).toBeInTheDocument();
    expect(screen.getByText('Belum dijadwalkan')).toBeInTheDocument();
  });

  it('renders an Edit button on every row that calls onEdit with the chapter', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<ChapterTable chapters={baseChapters} onEdit={onEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons).toHaveLength(2);
    await user.click(editButtons[0]!);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(baseChapters[0]);
  });

  it('renders Hide button only on rows whose releaseDate is not null', () => {
    render(<ChapterTable chapters={baseChapters} onHide={() => {}} />);

    const hideButtons = screen.getAllByRole('button', { name: /sembunyikan/i });
    expect(hideButtons).toHaveLength(1);
  });

  it('clicking Hide opens an AlertDialog and confirming calls onHide with the chapter', async () => {
    const onHide = vi.fn();
    const user = userEvent.setup();
    render(<ChapterTable chapters={baseChapters} onHide={onHide} />);

    await user.click(screen.getByRole('button', { name: /sembunyikan/i }));

    expect(
      screen.getByRole('alertdialog', { name: /sembunyikan bab/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /sembunyikan/i }));

    expect(onHide).toHaveBeenCalledTimes(1);
    expect(onHide).toHaveBeenCalledWith(baseChapters[0]);
  });

  it('canceling the Hide confirmation does not call onHide', async () => {
    const onHide = vi.fn();
    const user = userEvent.setup();
    render(<ChapterTable chapters={baseChapters} onHide={onHide} />);

    await user.click(screen.getByRole('button', { name: /sembunyikan/i }));
    await user.click(screen.getByRole('button', { name: /batal/i }));

    expect(onHide).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('alertdialog', { name: /sembunyikan bab/i })
    ).not.toBeInTheDocument();
  });
});
