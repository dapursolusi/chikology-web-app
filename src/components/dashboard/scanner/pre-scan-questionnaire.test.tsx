import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PreScanQuestionnaire } from './PreScanQuestionnaire';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/modal', () => ({
  default: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

const mockOnSubmit = vi.fn();

describe('PreScanQuestionnaire', () => {
  it('renders questionnaire with placeholder questions', () => {
    render(<PreScanQuestionnaire onSubmit={mockOnSubmit} />);

    expect(
      screen.getByText(/Apa yang membuat pikiranmu terasa berat hari ini/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Apa yang kamu rasakan saat ini/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Apa yang paling mengganggumu saat ini/i)
    ).toBeInTheDocument();
  });

  it('renders skip button', () => {
    render(<PreScanQuestionnaire onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('button', { name: /lewati/i })).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<PreScanQuestionnaire onSubmit={mockOnSubmit} />);

    expect(
      screen.getByRole('button', { name: /mulai kamera/i })
    ).toBeInTheDocument();
  });

  it('skip confirmation modal shows correct text', async () => {
    const user = await import('@testing-library/user-event');
    const userEvent = user.default;

    render(<PreScanQuestionnaire onSubmit={mockOnSubmit} />);

    const skipButton = screen.getByRole('button', { name: /lewati/i });
    await userEvent.click(skipButton);

    expect(
      screen.getByText(/menjawab beberapa pertanyaan ini/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /kembali/i })
    ).toBeInTheDocument();
  });
});
