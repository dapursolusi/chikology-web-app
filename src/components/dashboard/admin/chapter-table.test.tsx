import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
});
