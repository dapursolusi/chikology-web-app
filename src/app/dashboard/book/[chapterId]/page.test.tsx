import ReaderPage from '@/app/dashboard/book/[chapterId]/page';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChapterWithState, NextChapterAction } from '@/lib/chapters';

const {
  mockGetUser,
  mockGetChaptersWithState,
  ReaderClient,
  mockRedirect,
  mockGetNextChapterAction,
} = vi.hoisted(() => {
  const ReaderClient = vi.fn(
    ({
      chapter,
      nextAction,
    }: {
      chapter: { id: string; title: string; chapterNumber: number };
      nextAction: NextChapterAction;
    }) => (
      <div
        data-testid="reader-client"
        data-chapter-id={chapter.id}
        data-next-kind={nextAction.kind}
      />
    )
  );
  return {
    mockGetUser: vi.fn<() => { data: { user: { id: string } | null } }>(() => ({
      data: { user: { id: 'user-1' } },
    })),
    mockGetChaptersWithState: vi.fn<() => Promise<ChapterWithState[]>>(
      async () => []
    ),
    mockRedirect: vi.fn((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    }),
    mockGetNextChapterAction: vi.fn(),
    ReaderClient,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock('@/lib/chapters', () => ({
  getChaptersWithState: mockGetChaptersWithState,
  getNextChapterAction: mockGetNextChapterAction,
}));

vi.mock('@/app/dashboard/book/[chapterId]/ReaderClient', () => ({
  ReaderClient,
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

function makeChapter(
  overrides: Partial<ChapterWithState> = {}
): ChapterWithState {
  return {
    id: 'ch-1',
    title: 'Bab 1 — Awal',
    chapterNumber: 1,
    priceIdr: 0,
    isFree: true,
    releaseDate: '2025-01-01',
    pdfPath: 'chapters/1.pdf',
    state: 'owned',
    ...overrides,
  };
}

describe('ReaderPage', () => {
  beforeEach(() => {
    // Reset all queued values but keep implementations
    mockGetChaptersWithState.mockReset();
    mockGetChaptersWithState.mockImplementation(async () => []);
    mockGetNextChapterAction.mockReset();
    mockGetNextChapterAction.mockImplementation(() => ({
      kind: 'end-of-book' as const,
    }));
  });

  it('redirects to /?auth=login when user is not authenticated', async () => {
    mockGetUser.mockReturnValueOnce({ data: { user: null } });

    await expect(
      ReaderPage({ params: Promise.resolve({ chapterId: 'ch-1' }) })
    ).rejects.toThrow('NEXT_REDIRECT:/?auth=login');
  });

  it('redirects to /dashboard/book?denied=not-found when chapter does not exist', async () => {
    mockGetChaptersWithState.mockResolvedValueOnce([]);

    await expect(
      ReaderPage({ params: Promise.resolve({ chapterId: 'missing' }) })
    ).rejects.toThrow('NEXT_REDIRECT:/dashboard/book?denied=not-found');
  });

  it('redirects to /dashboard/book?denied=unreleased when chapter is not yet released', async () => {
    mockGetChaptersWithState.mockResolvedValueOnce([
      makeChapter({ id: 'ch-future', state: 'unreleased' }),
    ]);

    await expect(
      ReaderPage({ params: Promise.resolve({ chapterId: 'ch-future' }) })
    ).rejects.toThrow('NEXT_REDIRECT:/dashboard/book?denied=unreleased');
  });

  it('redirects to /dashboard/book?denied=locked when previous chapter is not owned', async () => {
    mockGetChaptersWithState.mockResolvedValueOnce([
      makeChapter({ id: 'ch-2', state: 'locked' }),
    ]);

    await expect(
      ReaderPage({ params: Promise.resolve({ chapterId: 'ch-2' }) })
    ).rejects.toThrow('NEXT_REDIRECT:/dashboard/book?denied=locked');
  });

  it('redirects to /dashboard/book?denied=paid when chapter is paid and not owned', async () => {
    mockGetChaptersWithState.mockResolvedValueOnce([
      makeChapter({ id: 'ch-paid', state: 'buyable', isFree: false }),
    ]);

    await expect(
      ReaderPage({ params: Promise.resolve({ chapterId: 'ch-paid' }) })
    ).rejects.toThrow('NEXT_REDIRECT:/dashboard/book?denied=paid');
  });

  it('renders ReaderClient with chapter and computed next action when access is allowed', async () => {
    const chapter = makeChapter({ id: 'ch-1' });
    mockGetChaptersWithState.mockImplementation(async () => [chapter]);
    mockGetNextChapterAction.mockReturnValueOnce({
      kind: 'navigate',
      nextChapter: {
        id: 'ch-2',
        title: 'Bab 2 — Lanjut',
        chapterNumber: 2,
      },
    });

    const element = await ReaderPage({
      params: Promise.resolve({ chapterId: 'ch-1' }),
    });
    render(element);

    const client = screen.getByTestId('reader-client');
    expect(client).toBeInTheDocument();
    expect(client.dataset.chapterId).toBe('ch-1');
    expect(client.dataset.nextKind).toBe('navigate');
    expect(mockGetNextChapterAction).toHaveBeenCalledWith(1, [chapter]);
  });
});
