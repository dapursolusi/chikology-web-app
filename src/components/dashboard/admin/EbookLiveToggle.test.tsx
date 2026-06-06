import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EbookLiveToggle } from '@/components/dashboard/admin/EbookLiveToggle';

const { mockSetEbookLiveState, mockToastSuccess, mockToastError } = vi.hoisted(
  () => ({
    mockSetEbookLiveState: vi.fn<
      () => Promise<{ success: true } | { error: string }>
    >(async () => ({ success: true })),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
  })
);

vi.mock('@/actions/settings', () => ({
  setEbookLiveState: mockSetEbookLiveState,
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

describe('EbookLiveToggle', () => {
  it('renders "Aktif" label and pressed state when initialLive is true', () => {
    render(<EbookLiveToggle initialLive={true} />);
    const toggle = screen.getByTestId('ebook-live-toggle');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveTextContent(/aktif/i);
  });

  it('renders "Non-aktif" label and unpressed state when initialLive is false', () => {
    render(<EbookLiveToggle initialLive={false} />);
    const toggle = screen.getByTestId('ebook-live-toggle');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveTextContent(/non-aktif/i);
  });

  it('clicking the toggle calls setEbookLiveState with the new value (true)', async () => {
    const user = userEvent.setup();
    render(<EbookLiveToggle initialLive={false} />);
    const toggle = screen.getByTestId('ebook-live-toggle');

    await user.click(toggle);

    expect(mockSetEbookLiveState).toHaveBeenCalledWith(true);
  });

  it('clicking the toggle when currently live calls setEbookLiveState with false', async () => {
    const user = userEvent.setup();
    render(<EbookLiveToggle initialLive={true} />);
    const toggle = screen.getByTestId('ebook-live-toggle');

    await user.click(toggle);

    expect(mockSetEbookLiveState).toHaveBeenCalledWith(false);
  });

  it('reverts to previous state and shows error toast when action returns error', async () => {
    mockSetEbookLiveState.mockResolvedValueOnce({
      error: 'Hanya admin yang dapat mengubah status e-book',
    });
    const user = userEvent.setup();
    render(<EbookLiveToggle initialLive={false} />);
    const toggle = screen.getByTestId('ebook-live-toggle');

    await user.click(toggle);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows success toast when action succeeds', async () => {
    mockSetEbookLiveState.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    render(<EbookLiveToggle initialLive={false} />);
    const toggle = screen.getByTestId('ebook-live-toggle');

    await user.click(toggle);

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalled();
    });
  });
});
