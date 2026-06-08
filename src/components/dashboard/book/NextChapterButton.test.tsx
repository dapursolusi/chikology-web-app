import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { NextChapterAction } from '@/lib/chapters';

import { NextChapterButton } from './NextChapterButton';

vi.mock('@/actions/chapters', () => ({
  purchaseChapter: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
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

describe('NextChapterButton', () => {
  it('renders a Link to the next chapter when action is "navigate"', () => {
    const action: NextChapterAction = {
      kind: 'navigate',
      nextChapter: { id: 'ch-2', title: 'Bab 2 — Lanjut', chapterNumber: 2 },
    };
    render(<NextChapterButton action={action} />);
    const link = screen.getByRole('link', { name: /bab 2/i });
    expect(link).toHaveAttribute('href', '/dashboard/book/ch-2');
  });

  it('renders a Link to the chapter list when action is "redirect-to-list" with reason "paid"', () => {
    const action: NextChapterAction = {
      kind: 'redirect-to-list',
      reason: 'paid',
    };
    render(<NextChapterButton action={action} />);
    const link = screen.getByRole('link', {
      name: /lihat|buka|bab|dashboard\/book/i,
    });
    expect(link).toHaveAttribute('href', '/dashboard/book');
  });

  it('renders "Selesaikan Bab N terlebih dahulu" message when action is "locked"', () => {
    const action: NextChapterAction = {
      kind: 'locked',
      previousChapterNumber: 2,
    };
    render(<NextChapterButton action={action} />);
    expect(screen.getByText(/selesaikan bab 2/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /bab/i })
    ).not.toBeInTheDocument();
  });

  it('renders "Segera hadir" message when action is "unreleased"', () => {
    const action: NextChapterAction = { kind: 'unreleased' };
    render(<NextChapterButton action={action} />);
    expect(screen.getByText(/segera hadir/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /bab/i })
    ).not.toBeInTheDocument();
  });

  it('renders nothing (no button/link) when action is "end-of-book"', () => {
    const action: NextChapterAction = { kind: 'end-of-book' };
    const { container } = render(<NextChapterButton action={action} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls purchaseChapter then navigates when "auto-claim" button is clicked', async () => {
    const { purchaseChapter } = await import('@/actions/chapters');
    vi.mocked(purchaseChapter).mockResolvedValueOnce({
      success: true,
      chapter: { id: 'ch-2', title: 'Bab 2 — Gratis', chapterNumber: 2 },
    });

    const action: NextChapterAction = {
      kind: 'auto-claim',
      nextChapter: { id: 'ch-2', title: 'Bab 2 — Gratis', chapterNumber: 2 },
    };
    const user = userEvent.setup();
    render(<NextChapterButton action={action} />);

    // Click the initial claim button to open modal
    await user.click(
      screen.getByRole('button', { name: /klaim & buka bab 2/i })
    );

    // Click "Ya, Klaim Gratis" in the confirmation modal
    await user.click(screen.getByRole('button', { name: /ya, klaim gratis/i }));

    expect(purchaseChapter).toHaveBeenCalledWith('ch-2');
  });
});
