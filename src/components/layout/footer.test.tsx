import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Footer from '@/components/layout/footer';

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

vi.mock('@/components/logo', () => ({
  default: () => <div data-testid="logo">Chikology</div>,
}));

describe('Footer', () => {
  it('renders the privacy tagline "Datamu aman, privasi terjamin"', () => {
    render(<Footer />);

    expect(
      screen.getByText(/Datamu aman, privasi terjamin/)
    ).toBeInTheDocument();
  });

  it('links "Kebijakan Privasi" to /kebijakan-privasi', () => {
    render(<Footer />);

    const link = screen.getByRole('link', { name: 'Kebijakan Privasi' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/kebijakan-privasi');
  });
});
