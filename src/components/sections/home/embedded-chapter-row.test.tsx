import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ChapterWithState } from '@/lib/chapters';

import { EmbeddedChapterRow } from './embedded-chapter-row';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const baseChapter = {
  id: 'ch-1',
  title: 'Bab 1 — Awal',
  chapterNumber: 1,
  priceIdr: 49000,
  isFree: false,
  releaseDate: '2025-01-01',
  pdfPath: null,
};

const ownedChapter: ChapterWithState = {
  ...baseChapter,
  state: 'owned',
};
const buyableChapter: ChapterWithState = {
  ...baseChapter,
  id: 'ch-2',
  chapterNumber: 2,
  state: 'buyable',
};
const buyableFreeChapter: ChapterWithState = {
  ...baseChapter,
  id: 'ch-2b',
  chapterNumber: 2,
  priceIdr: 0,
  isFree: true,
  state: 'buyable',
};
const lockedChapter: ChapterWithState = {
  ...baseChapter,
  id: 'ch-3',
  chapterNumber: 3,
  state: 'locked',
};
const unreleasedChapter: ChapterWithState = {
  ...baseChapter,
  id: 'ch-4',
  chapterNumber: 4,
  state: 'unreleased',
};

describe('EmbeddedChapterRow', () => {
  it('renders one interactive element per chapter with chapter number and label', () => {
    render(<EmbeddedChapterRow chapters={[ownedChapter, buyableChapter]} />);

    expect(screen.getByText(/bab 1/i)).toBeInTheDocument();
    expect(screen.getByText(/bab 2/i)).toBeInTheDocument();
    expect(screen.getAllByTestId(/^embedded-chapter-ch-/)).toHaveLength(2);
  });

  it('shows "Baca" label for owned chapters', () => {
    render(<EmbeddedChapterRow chapters={[ownedChapter]} />);
    expect(screen.getByText(/bab 1.*baca/i)).toBeInTheDocument();
  });

  it('shows "Beli" label for buyable paid chapters with the price', () => {
    render(<EmbeddedChapterRow chapters={[buyableChapter]} />);
    expect(screen.getByText(/bab 2.*beli.*49\.000/i)).toBeInTheDocument();
  });

  it('shows "Buka Gratis" for buyable free chapters', () => {
    render(<EmbeddedChapterRow chapters={[buyableFreeChapter]} />);
    expect(screen.getByText(/bab 2.*buka gratis/i)).toBeInTheDocument();
  });

  it('shows "Selesaikan bab sebelumnya" for locked chapters with a lock icon', () => {
    render(<EmbeddedChapterRow chapters={[lockedChapter]} />);
    const item = screen.getByTestId('embedded-chapter-ch-3');
    expect(item).toHaveAttribute('data-state', 'locked');
    expect(item).toHaveAttribute(
      'title',
      'Selesaikan bab sebelumnya terlebih dahulu'
    );
  });

  it('shows "Segera hadir" for unreleased chapters (non-interactive)', () => {
    render(<EmbeddedChapterRow chapters={[unreleasedChapter]} />);
    const item = screen.getByTestId('embedded-chapter-ch-4');
    expect(item).toHaveAttribute('data-state', 'unreleased');
    expect(item.textContent).toMatch(/segera hadir/i);
  });

  it('navigates to /dashboard/book/<id> when an owned chapter is clicked', () => {
    render(<EmbeddedChapterRow chapters={[ownedChapter]} />);
    const link = screen.getByRole('link', { name: /bab 1.*baca/i });
    expect(link).toHaveAttribute('href', '/dashboard/book/ch-1');
  });

  it('navigates to /dashboard/book when a buyable chapter is clicked', () => {
    render(<EmbeddedChapterRow chapters={[buyableChapter]} />);
    const link = screen.getByRole('link', { name: /bab 2.*beli/i });
    expect(link).toHaveAttribute('href', '/dashboard/book');
  });

  it('renders an empty state when there are no chapters', () => {
    render(<EmbeddedChapterRow chapters={[]} />);
    expect(screen.getByText(/belum ada bab yang dirilis/i)).toBeInTheDocument();
  });
});
