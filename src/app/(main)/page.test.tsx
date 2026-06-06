import MainPage from '@/app/(main)/page';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChapterWithState } from '@/lib/chapters';

const {
  mockGetUser,
  mockGetEbookLive,
  mockGetChaptersWithState,
  mockGetPublicChapters,
  EBook,
  Hero,
} = vi.hoisted(() => {
  const EBook = vi.fn(
    ({
      ebookLive,
      userId,
      chapters,
    }: {
      ebookLive: boolean;
      userId: string | null;
      chapters: ChapterWithState[];
    }) => (
      <div
        data-testid="ebook-section"
        data-ebook-live={String(ebookLive)}
        data-user-id={userId ?? 'none'}
        data-chapter-count={chapters.length}
      />
    )
  );
  const Hero = vi.fn(({ ebookLive }: { ebookLive: boolean }) => (
    <div data-testid="hero-section" data-ebook-live={String(ebookLive)} />
  ));
  return {
    mockGetUser: vi.fn<
      () => Promise<{ data: { user: { id: string } | null } }>
    >(async () => ({ data: { user: null } })),
    mockGetEbookLive: vi.fn<() => Promise<boolean>>(async () => false),
    mockGetChaptersWithState: vi.fn<() => Promise<ChapterWithState[]>>(
      async () => []
    ),
    mockGetPublicChapters: vi.fn<() => Promise<ChapterWithState[]>>(
      async () => []
    ),
    EBook,
    Hero,
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
  getPublicChapters: mockGetPublicChapters,
}));

vi.mock('@/components/sections/home/e-book', () => ({
  default: EBook,
}));

vi.mock('@/components/sections/home/features', () => ({
  default: () => <div data-testid="features-section" />,
}));

vi.mock('@/components/sections/home/hero', () => ({
  Hero,
}));

function makeChapter(
  overrides: Partial<ChapterWithState> = {}
): ChapterWithState {
  return {
    id: 'ch-1',
    title: 'Bab 1',
    chapterNumber: 1,
    priceIdr: 0,
    isFree: true,
    releaseDate: '2025-01-01',
    pdfPath: null,
    state: 'buyable',
    ...overrides,
  };
}

describe('MainPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders countdown when EBOOK_LIVE=false and no user is signed in', async () => {
    mockGetEbookLive.mockResolvedValueOnce(false);
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const element = await MainPage();
    render(element);

    const hero = screen.getByTestId('hero-section');
    expect(hero.dataset.ebookLive).toBe('false');
    const ebook = screen.getByTestId('ebook-section');
    expect(ebook.dataset.ebookLive).toBe('false');
    expect(ebook.dataset.userId).toBe('none');
    expect(ebook.dataset.chapterCount).toBe('0');
    expect(mockGetChaptersWithState).not.toHaveBeenCalled();
    expect(mockGetPublicChapters).not.toHaveBeenCalled();
  });

  it('renders countdown when EBOOK_LIVE=false even with a user signed in', async () => {
    mockGetEbookLive.mockResolvedValueOnce(false);
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });

    const element = await MainPage();
    render(element);

    const hero = screen.getByTestId('hero-section');
    expect(hero.dataset.ebookLive).toBe('false');
    const ebook = screen.getByTestId('ebook-section');
    expect(ebook.dataset.ebookLive).toBe('false');
    expect(mockGetChaptersWithState).not.toHaveBeenCalled();
  });

  it('renders visitor chapters (public, no auth) when EBOOK_LIVE=true', async () => {
    mockGetEbookLive.mockResolvedValueOnce(true);
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    mockGetPublicChapters.mockResolvedValueOnce([
      makeChapter({ id: 'pub-1' }),
      makeChapter({ id: 'pub-2', chapterNumber: 2 }),
    ]);

    const element = await MainPage();
    render(element);

    const hero = screen.getByTestId('hero-section');
    expect(hero.dataset.ebookLive).toBe('true');
    const ebook = screen.getByTestId('ebook-section');
    expect(ebook.dataset.ebookLive).toBe('true');
    expect(ebook.dataset.userId).toBe('none');
    expect(ebook.dataset.chapterCount).toBe('2');
    expect(mockGetPublicChapters).toHaveBeenCalledTimes(1);
    expect(mockGetChaptersWithState).not.toHaveBeenCalled();
  });

  it('renders owned/buyable chapters (with auth) when EBOOK_LIVE=true', async () => {
    mockGetEbookLive.mockResolvedValueOnce(true);
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });
    mockGetChaptersWithState.mockResolvedValueOnce([
      makeChapter({ id: 'owned', state: 'owned' }),
      makeChapter({ id: 'buyable', chapterNumber: 2, state: 'buyable' }),
    ]);

    const element = await MainPage();
    render(element);

    const hero = screen.getByTestId('hero-section');
    expect(hero.dataset.ebookLive).toBe('true');
    const ebook = screen.getByTestId('ebook-section');
    expect(ebook.dataset.ebookLive).toBe('true');
    expect(ebook.dataset.userId).toBe('user-1');
    expect(ebook.dataset.chapterCount).toBe('2');
    expect(mockGetChaptersWithState).toHaveBeenCalledWith('user-1');
    expect(mockGetPublicChapters).not.toHaveBeenCalled();
  });
});
