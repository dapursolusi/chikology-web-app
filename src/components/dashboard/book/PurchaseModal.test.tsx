import { purchaseChapter } from '@/actions/chapters';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ChapterWithState } from '@/lib/chapters';

import { PurchaseModal } from './PurchaseModal';

vi.mock('@/actions/chapters', () => ({
  purchaseChapter: vi.fn(),
}));

const paidChapter: ChapterWithState = {
  id: 'ch-paid',
  title: 'Bab 1 — Awal',
  chapterNumber: 1,
  priceIdr: 49000,
  isFree: false,
  releaseDate: '2025-01-01',
  pdfPath: 'chapters/1.pdf',
  state: 'buyable',
};

const freeChapter: ChapterWithState = {
  id: 'ch-free',
  title: 'Bab 2 — Gratis',
  chapterNumber: 2,
  priceIdr: 0,
  isFree: true,
  releaseDate: '2025-01-01',
  pdfPath: 'chapters/2.pdf',
  state: 'buyable',
};

describe('PurchaseModal', () => {
  it('does not render the dialog content when closed', () => {
    render(
      <PurchaseModal
        open={false}
        onOpenChange={() => {}}
        chapter={paidChapter}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders chapter title, number, and formatted IDR price for paid chapters', () => {
    render(
      <PurchaseModal
        open={true}
        onOpenChange={() => {}}
        chapter={paidChapter}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Bab 1 — Awal')).toBeInTheDocument();
    expect(screen.getByText(/49\.000/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ya, beli/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^batal$/i })
    ).toBeInTheDocument();
  });

  it('renders "Gratis" and "Ya, Klaim Gratis" for free chapters', () => {
    render(
      <PurchaseModal
        open={true}
        onOpenChange={() => {}}
        chapter={freeChapter}
      />
    );
    // Description text is exactly "Bab 2 · Gratis" (middle dot, not em-dash) — distinct from the title
    expect(screen.getByText('Bab 2 · Gratis')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ya, klaim gratis/i })
    ).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when Batal is clicked and does not call purchaseChapter', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PurchaseModal
        open={true}
        onOpenChange={onOpenChange}
        chapter={paidChapter}
      />
    );

    await user.click(screen.getByRole('button', { name: /^batal$/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(purchaseChapter).not.toHaveBeenCalled();
  });

  it('calls purchaseChapter with the chapter ID when "Ya, Beli" is clicked', async () => {
    vi.mocked(purchaseChapter).mockResolvedValueOnce({
      success: true,
      chapter: { id: 'ch-paid', title: 'Bab 1 — Awal', chapterNumber: 1 },
    });
    const user = userEvent.setup();
    render(
      <PurchaseModal
        open={true}
        onOpenChange={() => {}}
        chapter={paidChapter}
      />
    );

    await user.click(screen.getByRole('button', { name: /ya, beli/i }));

    expect(purchaseChapter).toHaveBeenCalledWith('ch-paid');
  });

  it('calls purchaseChapter for free chapters too (v1 unifies both paths)', async () => {
    vi.mocked(purchaseChapter).mockResolvedValueOnce({
      success: true,
      chapter: { id: 'ch-free', title: 'Bab 2 — Gratis', chapterNumber: 2 },
    });
    const user = userEvent.setup();
    render(
      <PurchaseModal
        open={true}
        onOpenChange={() => {}}
        chapter={freeChapter}
      />
    );

    await user.click(screen.getByRole('button', { name: /ya, klaim gratis/i }));

    expect(purchaseChapter).toHaveBeenCalledWith('ch-free');
  });

  it('closes the modal and calls onSuccess when purchaseChapter succeeds', async () => {
    vi.mocked(purchaseChapter).mockResolvedValueOnce({
      success: true,
      chapter: { id: 'ch-paid', title: 'Bab 1 — Awal', chapterNumber: 1 },
    });
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <PurchaseModal
        open={true}
        onOpenChange={onOpenChange}
        chapter={paidChapter}
        onSuccess={onSuccess}
      />
    );

    await user.click(screen.getByRole('button', { name: /ya, beli/i }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(onSuccess).toHaveBeenCalledWith(paidChapter);
  });

  it('displays the error message when purchaseChapter returns an error and keeps the modal open', async () => {
    vi.mocked(purchaseChapter).mockResolvedValueOnce({
      error: 'Bab sudah dimiliki',
    });
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <PurchaseModal
        open={true}
        onOpenChange={onOpenChange}
        chapter={paidChapter}
        onSuccess={onSuccess}
      />
    );

    await user.click(screen.getByRole('button', { name: /ya, beli/i }));

    expect(await screen.findByText(/sudah dimiliki/i)).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
