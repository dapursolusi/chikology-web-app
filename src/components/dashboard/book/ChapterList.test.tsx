import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ChapterWithState } from '@/lib/chapters';

import { ChapterList } from './ChapterList';

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
  pdfPath: 'chapters/1.pdf',
};

const unreleasedChapter: ChapterWithState = {
  ...baseChapter,
  state: 'unreleased',
};

const lockedChapter: ChapterWithState = {
  ...baseChapter,
  id: 'ch-2',
  chapterNumber: 2,
  state: 'locked',
};

const buyablePaidChapter: ChapterWithState = {
  ...baseChapter,
  state: 'buyable',
};

const buyableFreeChapter: ChapterWithState = {
  ...baseChapter,
  id: 'ch-3',
  priceIdr: 0,
  isFree: true,
  state: 'buyable',
};

const ownedChapter: ChapterWithState = {
  ...baseChapter,
  id: 'ch-4',
  state: 'owned',
};

describe('ChapterList', () => {
  it('renders empty state when there are no chapters', () => {
    render(<ChapterList chapters={[]} onPurchase={() => {}} />);
    expect(screen.getByText(/belum ada bab/i)).toBeInTheDocument();
  });

  it('renders one card per chapter with title and number', () => {
    render(
      <ChapterList
        chapters={[ownedChapter, lockedChapter]}
        onPurchase={() => {}}
      />
    );
    // Both chapters share `title: 'Bab 1 — Awal'` from baseChapter, so two cards
    expect(screen.getAllByText('Bab 1 — Awal')).toHaveLength(2);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows "Segera hadir" for unreleased chapters with no action', () => {
    render(
      <ChapterList chapters={[unreleasedChapter]} onPurchase={() => {}} />
    );
    expect(screen.getByText(/segera hadir/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /beli|buka|baca/i })
    ).not.toBeInTheDocument();
  });

  it('shows "Selesaikan bab sebelumnya" for locked chapters with no action', () => {
    render(<ChapterList chapters={[lockedChapter]} onPurchase={() => {}} />);
    expect(screen.getByText(/selesaikan bab sebelumnya/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /beli|buka|baca/i })
    ).not.toBeInTheDocument();
  });

  it('shows "Beli Rp 49.000" for buyable paid chapters', () => {
    render(
      <ChapterList chapters={[buyablePaidChapter]} onPurchase={() => {}} />
    );
    expect(
      screen.getByRole('button', { name: /beli.*49\.000/i })
    ).toBeInTheDocument();
  });

  it('shows "Buka Gratis" for buyable free chapters', () => {
    render(
      <ChapterList chapters={[buyableFreeChapter]} onPurchase={() => {}} />
    );
    expect(
      screen.getByRole('button', { name: /buka gratis/i })
    ).toBeInTheDocument();
  });

  it('shows a "Baca" link to the reader page for owned chapters', () => {
    render(<ChapterList chapters={[ownedChapter]} onPurchase={() => {}} />);
    const bacaLink = screen.getByRole('link', { name: /baca/i });
    expect(bacaLink).toBeInTheDocument();
    expect(bacaLink).toHaveAttribute('href', '/dashboard/book/ch-4');
  });

  it('calls onPurchase with the chapter when "Beli" or "Buka Gratis" is clicked', async () => {
    const onPurchase = vi.fn();
    const user = userEvent.setup();
    render(
      <ChapterList
        chapters={[buyablePaidChapter, buyableFreeChapter]}
        onPurchase={onPurchase}
      />
    );

    await user.click(screen.getByRole('button', { name: /beli/i }));
    expect(onPurchase).toHaveBeenCalledWith(buyablePaidChapter);

    await user.click(screen.getByRole('button', { name: /buka gratis/i }));
    expect(onPurchase).toHaveBeenCalledWith(buyableFreeChapter);

    expect(onPurchase).toHaveBeenCalledTimes(2);
  });
});
