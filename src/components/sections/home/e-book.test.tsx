import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EBook from '@/components/sections/home/e-book';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/sections/home/BookCountdown', () => ({
  BookCountdown: () => <div data-testid="book-countdown" />,
}));

vi.mock('lucide-react', () => ({
  ArrowRight: () => <span>→</span>,
  BookOpen: () => <span>📖</span>,
}));

describe('EBook section', () => {
  it('renders BookCountdown in place of the two CTAs', () => {
    render(<EBook />);
    expect(screen.getByTestId('book-countdown')).toBeInTheDocument();
    expect(screen.queryByText(/Baca Preview/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Akses Full E-Book/i)).not.toBeInTheDocument();
  });

  it('keeps the book promo card content (title, description, badge)', () => {
    render(<EBook />);
    expect(
      screen.getByText(/Seni Berdamain Dengan Diri Sendiri/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Panduan praktis untuk memahami/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Chapter 1/i)).toBeInTheDocument();
  });
});
