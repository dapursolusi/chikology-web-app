import { purchaseChapter } from '@/actions/chapters';
import { submitPaymentProof } from '@/actions/payment';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChapterWithState } from '@/lib/chapters';

import { PurchaseModal } from './PurchaseModal';

const mockGetRejectedProofUrl = vi.hoisted(() => vi.fn());

vi.mock('@/actions/chapters', () => ({
  purchaseChapter: vi.fn(),
}));

vi.mock('@/actions/payment', () => ({
  submitPaymentProof: vi.fn(),
}));

vi.mock('@/actions/proof', () => ({
  getRejectedProofUrl: mockGetRejectedProofUrl,
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

const rejectedChapter: ChapterWithState = {
  id: 'ch-rejected',
  title: 'Bab 1 — Awal',
  chapterNumber: 1,
  priceIdr: 49000,
  isFree: false,
  releaseDate: '2025-01-01',
  pdfPath: 'chapters/1.pdf',
  state: 'buyable',
  proofStatus: 'rejected',
  rejectionReason: 'Screenshoot tidak valid, harap upload ulang',
};

describe('PurchaseModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('renders chapter title, number, and formatted IDR price with Lanjutkan button for paid chapters', () => {
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
      screen.getByRole('button', { name: /lanjutkan/i })
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

  it('shows file upload step after clicking Lanjutkan for paid chapters', async () => {
    const user = userEvent.setup();
    render(
      <PurchaseModal
        open={true}
        onOpenChange={() => {}}
        chapter={paidChapter}
      />
    );

    await user.click(screen.getByRole('button', { name: /lanjutkan/i }));

    expect(screen.getByTestId('payment-proof-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kirim/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /lanjutkan/i })
    ).not.toBeInTheDocument();
  });

  it('calls purchaseChapter for free chapters (skipping file upload)', async () => {
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

  it('closes the modal and calls onSuccess when purchaseChapter succeeds (free chapter)', async () => {
    vi.mocked(purchaseChapter).mockResolvedValueOnce({
      success: true,
      chapter: { id: 'ch-free', title: 'Bab 2 — Gratis', chapterNumber: 2 },
    });
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <PurchaseModal
        open={true}
        onOpenChange={onOpenChange}
        chapter={freeChapter}
        onSuccess={onSuccess}
      />
    );

    await user.click(screen.getByRole('button', { name: /ya, klaim gratis/i }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(onSuccess).toHaveBeenCalledWith(freeChapter);
  });

  it('displays the error message when purchaseChapter returns an error and keeps the modal open (free chapter)', async () => {
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
        chapter={freeChapter}
        onSuccess={onSuccess}
      />
    );

    await user.click(screen.getByRole('button', { name: /ya, klaim gratis/i }));

    expect(await screen.findByText(/sudah dimiliki/i)).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows file input for paid chapters and calls submitPaymentProof on confirm', async () => {
    vi.mocked(submitPaymentProof).mockResolvedValueOnce({ success: true });
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

    await user.click(screen.getByRole('button', { name: /lanjutkan/i }));

    const fileInput = screen.getByTestId('payment-proof-input');
    expect(fileInput).toBeInTheDocument();

    const file = new File(['fake-proof'], 'proof.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: /kirim/i }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(onSuccess).toHaveBeenCalledWith(paidChapter);
    expect(submitPaymentProof).toHaveBeenCalledTimes(1);
  });

  it('shows rejection reason and old proof image for rejected chapters', async () => {
    mockGetRejectedProofUrl.mockResolvedValue({
      url: 'https://example.supabase.co/rejected-proof.png',
    });
    render(
      <PurchaseModal
        open={true}
        onOpenChange={() => {}}
        chapter={rejectedChapter}
      />
    );

    expect(screen.getByText(/screenshoot tidak valid/i)).toBeInTheDocument();
    expect(
      await screen.findByTestId('rejected-proof-image')
    ).toBeInTheDocument();
    expect(screen.getByTestId('payment-proof-input')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /kirim ulang/i })
    ).toBeInTheDocument();
  });

  it('calls submitPaymentProof on re-upload for rejected chapters', async () => {
    mockGetRejectedProofUrl.mockResolvedValue({
      url: 'https://example.supabase.co/rejected-proof.png',
    });
    vi.mocked(submitPaymentProof).mockResolvedValueOnce({ success: true });
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(
      <PurchaseModal
        open={true}
        onOpenChange={onOpenChange}
        chapter={rejectedChapter}
        onSuccess={onSuccess}
      />
    );

    await screen.findByTestId('rejected-proof-image');

    const fileInput = screen.getByTestId('payment-proof-input');
    const file = new File(['new-proof'], 'new.png', { type: 'image/png' });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: /kirim ulang/i }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(onSuccess).toHaveBeenCalledWith(rejectedChapter);
    expect(submitPaymentProof).toHaveBeenCalledTimes(1);
  });
});
