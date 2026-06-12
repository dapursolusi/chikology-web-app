import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EBook from '@/components/sections/home/e-book';

import type { ChapterWithState } from '@/lib/chapters';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/sections/home/BookCountdown', () => ({
  BookCountdown: () => <div data-testid="book-countdown" />,
}));

vi.mock('@/components/sections/home/embedded-chapter-row', () => ({
  EmbeddedChapterRow: ({ chapters }: { chapters: ChapterWithState[] }) => (
    <div
      data-testid="embedded-chapter-row"
      data-count={chapters.length}
      data-state="logged-in"
    />
  ),
}));

vi.mock('@/components/sections/home/visitor-chapter-row', () => ({
  VisitorChapterRow: ({ chapters }: { chapters: ChapterWithState[] }) => (
    <div
      data-testid="visitor-chapter-row"
      data-count={chapters.length}
      data-state="visitor"
    />
  ),
}));

vi.mock('lucide-react', () => ({
  ArrowRight: () => <span>→</span>,
  BookOpen: () => <span>📖</span>,
}));

const releasedChapter: ChapterWithState = {
  id: 'ch-1',
  title: 'Bab 1 — Awal',
  chapterNumber: 1,
  priceIdr: 0,
  isFree: true,
  releaseDate: '2025-01-01',
  pdfPath: null,
  state: 'buyable',
};

describe('EBook section', () => {
  it('renders BookCountdown in the CTA zone when ebookLive is false', () => {
    render(<EBook ebookLive={false} userId={null} chapters={[]} />);
    expect(screen.getByTestId('book-countdown')).toBeInTheDocument();
    expect(screen.queryByTestId('visitor-chapter-row')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('embedded-chapter-row')
    ).not.toBeInTheDocument();
  });

  it('renders VisitorChapterRow when ebookLive is true and no user is signed in', () => {
    render(<EBook ebookLive userId={null} chapters={[releasedChapter]} />);
    expect(screen.queryByTestId('book-countdown')).not.toBeInTheDocument();
    const visitor = screen.getByTestId('visitor-chapter-row');
    expect(visitor).toBeInTheDocument();
    expect(visitor.dataset.state).toBe('visitor');
    expect(visitor.dataset.count).toBe('1');
  });

  it('renders EmbeddedChapterRow when ebookLive is true and a user is signed in', () => {
    const ownedChapter: ChapterWithState = {
      ...releasedChapter,
      state: 'owned',
    };
    render(<EBook ebookLive userId="user-1" chapters={[ownedChapter]} />);
    expect(screen.queryByTestId('book-countdown')).not.toBeInTheDocument();
    const embedded = screen.getByTestId('embedded-chapter-row');
    expect(embedded).toBeInTheDocument();
    expect(embedded.dataset.state).toBe('logged-in');
    expect(embedded.dataset.count).toBe('1');
  });

  it('keeps the book promo card content (title, description, badge) in all modes', () => {
    const { rerender } = render(
      <EBook ebookLive={false} userId={null} chapters={[]} />
    );
    expect(screen.getByText(/Bicaralah, dan Sembuhlah/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Ketidakberanian bicara seringkali/i)
    ).toBeInTheDocument();

    rerender(<EBook ebookLive userId={null} chapters={[releasedChapter]} />);
    expect(screen.getByText(/Bicaralah, dan Sembuhlah/i)).toBeInTheDocument();

    rerender(<EBook ebookLive userId="user-1" chapters={[releasedChapter]} />);
    expect(screen.getByText(/Bicaralah, dan Sembuhlah/i)).toBeInTheDocument();
  });
});
