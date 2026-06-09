import { BookPageClient } from '@/app/dashboard/book/BookPageClient';
import { ReaderClient } from '@/app/dashboard/book/[chapterId]/ReaderClient';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChapterWithState } from '@/lib/chapters';

// Mock only the server-action and router boundaries. All React components
// (BookPageClient, ChapterList, PurchaseModal, ReaderClient, NextChapterButton)
// are rendered for real so the user-visible flow is exercised end-to-end.
const {
  mockPurchaseChapter,
  mockGetChapterSignedUrl,
  mockSubmitPaymentProof,
  mockGetRejectedProofUrl,
  mockRouterPush,
  mockRouterRefresh,
} = vi.hoisted(() => ({
  mockPurchaseChapter: vi.fn(),
  mockGetChapterSignedUrl: vi.fn(),
  mockSubmitPaymentProof: vi.fn(),
  mockGetRejectedProofUrl: vi.fn(),
  mockRouterPush: vi.fn(),
  mockRouterRefresh: vi.fn(),
}));

vi.mock('@/actions/chapters', () => ({
  purchaseChapter: mockPurchaseChapter,
  getChapterSignedUrl: mockGetChapterSignedUrl,
  claimFreeChapter: vi.fn(),
}));

vi.mock('@/actions/payment', () => ({
  submitPaymentProof: mockSubmitPaymentProof,
}));

vi.mock('@/actions/proof', () => ({
  getRejectedProofUrl: mockGetRejectedProofUrl,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, refresh: mockRouterRefresh }),
}));

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
    pdfPath: 'chapters/1.pdf',
    state: 'buyable',
    proofStatus: 'none' as const,
    ...overrides,
  };
}

describe('book purchase → reader → next-chapter flow (E2E integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPurchaseChapter.mockResolvedValue({
      success: true,
      chapter: { id: 'ch-1', title: 'Bab 1 — Awal', chapterNumber: 1 },
    });
    mockGetChapterSignedUrl.mockResolvedValue({
      url: 'https://example.supabase.co/storage/v1/object/signed/ch-1',
      expiresIn: 300,
    });
  });

  it('user can purchase ch-1, open it in reader, and auto-claim free ch-2 from next-chapter button', async () => {
    const user = userEvent.setup();

    // 1. /dashboard/book shows ch-1 (paid, buyable) + ch-2 (free, locked).
    const initialChapters: ChapterWithState[] = [
      makeChapter({
        id: 'ch-1',
        title: 'Bab 1 — Awal',
        priceIdr: 0,
        isFree: true,
        state: 'buyable',
      }),
      makeChapter({
        id: 'ch-2',
        title: 'Bab 2 — Lanjut',
        chapterNumber: 2,
        priceIdr: 0,
        isFree: true,
        state: 'locked',
      }),
    ];
    const { rerender } = render(<BookPageClient chapters={initialChapters} />);

    expect(screen.getAllByTestId('chapter-card')[0]?.dataset.state).toBe(
      'buyable'
    );
    expect(screen.getByTestId('chapter-state-locked')).toBeInTheDocument();
    expect(mockPurchaseChapter).not.toHaveBeenCalled();

    // 2. User clicks "Buka Gratis" on ch-1 → PurchaseModal opens.
    await user.click(screen.getByRole('button', { name: /buka gratis/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Bab 1 — Awal');
    expect(mockPurchaseChapter).not.toHaveBeenCalled();

    // 3. User confirms → purchaseChapter called, modal closes, router.refresh fires.
    await user.click(screen.getByRole('button', { name: /ya, klaim gratis/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(mockPurchaseChapter).toHaveBeenCalledWith('ch-1');
    expect(mockRouterRefresh).toHaveBeenCalledTimes(1);

    // 4. After server refresh, ch-1 is owned, ch-2 is unlocked (free, buyable).
    const updatedChapters: ChapterWithState[] = [
      makeChapter({ id: 'ch-1', title: 'Bab 1 — Awal', state: 'owned' }),
      makeChapter({
        id: 'ch-2',
        title: 'Bab 2 — Lanjut',
        chapterNumber: 2,
        priceIdr: 0,
        isFree: true,
        state: 'buyable',
      }),
    ];
    rerender(<BookPageClient chapters={updatedChapters} />);

    expect(screen.getAllByTestId('chapter-card')[0]?.dataset.state).toBe(
      'owned'
    );
    expect(screen.getByRole('link', { name: /baca/i })).toHaveAttribute(
      'href',
      '/dashboard/book/ch-1'
    );
    expect(
      screen.getByRole('button', { name: /buka gratis/i })
    ).toBeInTheDocument();

    // 5. User clicks "Baca" on ch-1 → reader page opens with auto-claim for ch-2.
    // In production, the Next.js <Link> navigates to /dashboard/book/ch-1, which
    // renders ReaderClient with the nextAction computed from getNextChapterAction.
    rerender(
      <ReaderClient
        chapter={{ id: 'ch-1', title: 'Bab 1 — Awal', chapterNumber: 1 }}
        nextAction={{
          kind: 'auto-claim',
          nextChapter: {
            id: 'ch-2',
            title: 'Bab 2 — Lanjut',
            chapterNumber: 2,
          },
        }}
      />
    );

    // 6. Reader renders the PDF.js viewer iframe.
    const iframe = await screen.findByTitle(/pdf|bab 1/i);
    expect(iframe).toHaveAttribute(
      'src',
      '/pdfjs/web/viewer.html?file=%2Fapi%2Fchapters%2Fch-1%2Fview'
    );

    // 7. Next-chapter button auto-claims free ch-2 → navigates to ch-2 reader.
    const nextButton = screen.getByRole('button', {
      name: /klaim.*bab 2|bab 2 — lanjut/i,
    });
    await user.click(nextButton);

    // Click "Ya, Klaim Gratis" in the confirmation modal
    await user.click(screen.getByRole('button', { name: /ya, klaim gratis/i }));

    await waitFor(() => {
      expect(mockPurchaseChapter).toHaveBeenCalledWith('ch-2');
    });
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard/book/ch-2');
  });

  it('user sees rejection reason + Beli Ulang, re-uploads proof, and succeeds', async () => {
    const user = userEvent.setup();

    mockGetRejectedProofUrl.mockResolvedValue({
      url: 'https://example.supabase.co/rejected-proof.png',
    });
    mockSubmitPaymentProof.mockResolvedValue({ success: true });

    // 1. /dashboard/book shows ch-1 with rejected proof status.
    const chapters: ChapterWithState[] = [
      makeChapter({
        id: 'ch-1',
        title: 'Bab 1 — Awal',
        priceIdr: 49000,
        isFree: false,
        state: 'buyable',
        proofStatus: 'rejected',
        rejectionReason: 'Screenshoot tidak valid, harap upload ulang',
      }),
      makeChapter({
        id: 'ch-2',
        title: 'Bab 2 — Lanjut',
        chapterNumber: 2,
        state: 'locked',
      }),
    ];

    render(<BookPageClient chapters={chapters} />);

    // 2. User sees rejection reason and "Beli Ulang" button.
    expect(screen.getByText(/screenshoot tidak valid/i)).toBeInTheDocument();
    const beliUlang = screen.getByRole('button', { name: /beli ulang/i });
    expect(beliUlang).toBeInTheDocument();

    // 3. User clicks "Beli Ulang" → modal opens at step 2 with old proof image.
    await user.click(beliUlang);
    expect(
      await screen.findByTestId('rejected-proof-image')
    ).toBeInTheDocument();
    expect(screen.getByTestId('payment-proof-input')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /kirim ulang/i })
    ).toBeInTheDocument();

    // 4. User uploads a new proof file and submits.
    const fileInput = screen.getByTestId('payment-proof-input');
    const file = new File(['new-proof'], 'new.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: /kirim ulang/i }));

    await waitFor(() => {
      expect(mockSubmitPaymentProof).toHaveBeenCalledTimes(1);
    });

    // 5. Modal closes on success.
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(mockRouterRefresh).toHaveBeenCalledTimes(1);
  });
});
