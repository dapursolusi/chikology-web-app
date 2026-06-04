import { act } from 'react';

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BookCountdown } from '@/components/sections/home/BookCountdown';

describe('BookCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the launch date label', () => {
    vi.setSystemTime(new Date('2026-06-01T00:00:00+07:00'));
    render(<BookCountdown />);
    expect(
      screen.getByText(/Rilis 16 Juni 2026.*Ulang Tahun Mas Chiko/i)
    ).toBeInTheDocument();
  });

  it('renders days, hours, and minutes remaining until launch', () => {
    // 1 day, 3 hours, 30 minutes before launch
    vi.setSystemTime(new Date('2026-06-14T20:30:00+07:00'));
    render(<BookCountdown />);
    expect(screen.getByTestId('countdown-days')).toHaveTextContent('1');
    expect(screen.getByTestId('countdown-hours')).toHaveTextContent('3');
    expect(screen.getByTestId('countdown-minutes')).toHaveTextContent('30');
  });

  it('ticks: advancing one minute decrements the displayed minutes', () => {
    vi.setSystemTime(new Date('2026-06-14T20:30:00+07:00'));
    render(<BookCountdown />);
    expect(screen.getByTestId('countdown-minutes')).toHaveTextContent('30');

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByTestId('countdown-minutes')).toHaveTextContent('29');
  });

  it('shows "Sudah rilis" once launch time is reached', () => {
    vi.setSystemTime(new Date('2026-06-16T00:00:00+07:00'));
    render(<BookCountdown />);
    expect(screen.getByText(/Sudah rilis/i)).toBeInTheDocument();
    expect(screen.queryByTestId('countdown-days')).not.toBeInTheDocument();
  });
});
