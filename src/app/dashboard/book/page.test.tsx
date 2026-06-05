import BookPage from '@/app/dashboard/book/page';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChapterWithState } from '@/lib/chapters';

const {
  mockGetUser,
  mockGetEbookLive,
  mockGetChaptersWithState,
  BookPageClient,
} = vi.hoisted(() => {
  const BookPageClient = vi.fn(
    ({ chapters }: { chapters: ChapterWithState[] }) => (
      <div data-testid="book-page-client" data-count={chapters.length} />
    )
  );
  return {
    mockGetUser: vi.fn<
      () => Promise<{ data: { user: { id: string } | null } }>
    >(async () => ({ data: { user: { id: 'user-1' } } })),
    mockGetEbookLive: vi.fn<() => Promise<boolean>>(async () => true),
    mockGetChaptersWithState: vi.fn<() => Promise<ChapterWithState[]>>(
      async () => []
    ),
    BookPageClient,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock('@/lib/feature-flags', () => ({
  getEbookLive: mockGetEbookLive,
}));

vi.mock('@/lib/chapters', () => ({
  getChaptersWithState: mockGetChaptersWithState,
}));

vi.mock('./BookPageClient', () => ({
  BookPageClient,
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
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

describe('BookPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the "coming soon" placeholder when EBOOK_LIVE is false', async () => {
    mockGetEbookLive.mockResolvedValueOnce(false);

    const element = await BookPage();
    render(element);

    expect(screen.getByText(/segera hadir/i)).toBeInTheDocument();
    expect(BookPageClient).not.toHaveBeenCalled();
    expect(mockGetChaptersWithState).not.toHaveBeenCalled();
  });

  it('renders the BookPageClient with chapters when EBOOK_LIVE is true', async () => {
    mockGetEbookLive.mockResolvedValueOnce(true);
    mockGetChaptersWithState.mockResolvedValueOnce([
      makeChapter({ id: 'a', chapterNumber: 1 }),
      makeChapter({ id: 'b', chapterNumber: 2 }),
    ]);

    const element = await BookPage();
    render(element);

    const client = screen.getByTestId('book-page-client');
    expect(client).toBeInTheDocument();
    expect(client.dataset.count).toBe('2');
    expect(mockGetChaptersWithState).toHaveBeenCalledWith('user-1');
  });

  it('filters out chapters with a null releaseDate (hidden by admin)', async () => {
    mockGetEbookLive.mockResolvedValueOnce(true);
    mockGetChaptersWithState.mockResolvedValueOnce([
      makeChapter({
        id: 'visible',
        chapterNumber: 1,
        releaseDate: '2025-01-01',
      }),
      makeChapter({
        id: 'hidden',
        chapterNumber: 2,
        releaseDate: null,
        state: 'unreleased',
      }),
      makeChapter({
        id: 'visible-2',
        chapterNumber: 3,
        releaseDate: '2025-06-01',
      }),
    ]);

    const element = await BookPage();
    render(element);

    const client = screen.getByTestId('book-page-client');
    expect(client.dataset.count).toBe('2');
    const passedChapters = BookPageClient.mock.calls[0][0]
      .chapters as ChapterWithState[];
    expect(passedChapters.map((c) => c.id)).toEqual(['visible', 'visible-2']);
  });

  it('passes an empty list to BookPageClient when no chapters are published', async () => {
    mockGetEbookLive.mockResolvedValueOnce(true);
    mockGetChaptersWithState.mockResolvedValueOnce([
      makeChapter({ id: 'hidden', releaseDate: null, state: 'unreleased' }),
    ]);

    const element = await BookPage();
    render(element);

    const client = screen.getByTestId('book-page-client');
    expect(client.dataset.count).toBe('0');
  });
});
