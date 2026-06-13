import { BookPageClient } from '@/app/dashboard/book/BookPageClient';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChapterWithState } from '@/lib/chapters';

const { mockRefresh, mockPurchaseChapter } = vi.hoisted(() => ({
  mockRefresh: vi.fn(),
  mockPurchaseChapter: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock('@/actions/chapters', () => ({
  purchaseChapter: mockPurchaseChapter,
}));

function makeChapter(
  overrides: Partial<ChapterWithState> = {}
): ChapterWithState {
  return {
    id: 'ch-1',
    title: 'Bab 1 — Awal',
    chapterNumber: 1,
    priceIdr: 49000,
    isFree: false,
    releaseDate: '2025-01-01',
    pdfPath: null,
    state: 'buyable',
    ...overrides,
  };
}

describe('BookPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ChapterList with the passed chapters', () => {
    const chapters: ChapterWithState[] = [
      makeChapter({ id: 'a', chapterNumber: 1, title: 'Bab 1' }),
      makeChapter({ id: 'b', chapterNumber: 2, title: 'Bab 2' }),
    ];

    render(<BookPageClient chapters={chapters} />);

    expect(screen.getByTestId('chapter-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('chapter-card')).toHaveLength(2);
  });

  it('renders the empty-state when the chapters list is empty', () => {
    render(<BookPageClient chapters={[]} />);

    expect(screen.getByTestId('chapter-list-empty')).toBeInTheDocument();
  });

  it('does not render the modal on initial mount', () => {
    render(<BookPageClient chapters={[makeChapter()]} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the modal with the clicked chapter when a paid buyable button is pressed', async () => {
    const user = userEvent.setup();
    const chapter = makeChapter({
      id: 'ch-paid',
      title: 'Bab Berbayar',
      chapterNumber: 3,
      priceIdr: 49000,
    });

    render(<BookPageClient chapters={[chapter]} />);

    await user.click(screen.getByRole('button', { name: /beli/i }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.textContent).toContain('Bab Berbayar');
    expect(dialog.textContent).toContain('Bab 3');
    expect(mockPurchaseChapter).not.toHaveBeenCalled();
  });

  it('opens the modal with the clicked chapter when a free buyable button is pressed', async () => {
    const user = userEvent.setup();
    const chapter = makeChapter({
      id: 'ch-free',
      title: 'Bab Gratis',
      chapterNumber: 1,
      priceIdr: 0,
      isFree: true,
    });

    render(<BookPageClient chapters={[chapter]} />);

    await user.click(screen.getByRole('button', { name: /buka gratis/i }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.textContent).toContain('Bab Gratis');
  });

  it('calls router.refresh and closes the modal on a successful purchase (free chapter)', async () => {
    const user = userEvent.setup();
    mockPurchaseChapter.mockResolvedValueOnce({
      success: true,
      chapter: { id: 'ch-free', title: 'Bab Gratis', chapterNumber: 2 },
    });
    const chapter = makeChapter({
      id: 'ch-free',
      title: 'Bab Gratis',
      priceIdr: 0,
      isFree: true,
    });

    render(<BookPageClient chapters={[chapter]} />);

    await user.click(screen.getByRole('button', { name: /buka gratis/i }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: /ya, klaim gratis/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(mockPurchaseChapter).toHaveBeenCalledWith('ch-free');
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not call router.refresh when the user cancels', async () => {
    const user = userEvent.setup();
    const chapter = makeChapter();

    render(<BookPageClient chapters={[chapter]} />);

    await user.click(screen.getByRole('button', { name: /beli/i }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: /batal/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(mockPurchaseChapter).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
