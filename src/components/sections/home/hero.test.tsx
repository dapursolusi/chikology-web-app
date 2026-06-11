import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Hero } from '@/components/sections/home/hero';

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

vi.mock('@/components/login-form', () => ({
  LoginForm: () => <div data-testid="login-form" />,
}));

vi.mock('@/components/signup-form', () => ({
  SignupForm: () => <div data-testid="signup-form" />,
}));

vi.mock('@/components/modal', () => ({
  default: () => null,
}));

vi.mock('lucide-react', () => ({
  ArrowRight: () => <span>→</span>,
  BookOpen: () => <span>📖</span>,
  MessageCircle: () => <span>💬</span>,
  Sparkles: () => <span>✨</span>,
}));

describe('Hero', () => {
  it('renders primary CTA as "Daftar" not "Mulai Gratis"', () => {
    render(<Hero isAuthenticated={false} />);

    const ctaButtons = screen.getAllByRole('button');
    const primaryCTA = ctaButtons.find((btn) =>
      btn.textContent?.includes('Daftar')
    );

    expect(primaryCTA).toBeInTheDocument();
    expect(screen.queryByText('Mulai Gratis')).not.toBeInTheDocument();
  });
});
