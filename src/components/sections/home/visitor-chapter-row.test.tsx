import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ChapterWithState } from '@/lib/chapters';

import { VisitorChapterRow } from './visitor-chapter-row';

vi.mock('@/components/login-form', () => ({
  LoginForm: ({ onSwitchToSignup }: { onSwitchToSignup?: () => void }) => (
    <div data-testid="login-form">
      <button type="button" onClick={onSwitchToSignup}>
        Switch to signup
      </button>
    </div>
  ),
}));

vi.mock('@/components/signup-form', () => ({
  SignupForm: ({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) => (
    <div data-testid="signup-form">
      <button type="button" onClick={onSwitchToLogin}>
        Switch to login
      </button>
    </div>
  ),
}));

vi.mock('@/components/modal', () => ({
  default: ({
    open,
    content,
  }: {
    open: boolean;
    content: { variant: string; directContent?: React.ReactNode };
  }) =>
    open ? <div data-testid="auth-modal">{content.directContent}</div> : null,
}));

const chapters: ChapterWithState[] = [
  {
    id: 'ch-1',
    title: 'Bab 1 — Awal',
    chapterNumber: 1,
    priceIdr: 0,
    isFree: true,
    releaseDate: '2025-01-01',
    pdfPath: null,
    state: 'buyable',
  },
  {
    id: 'ch-2',
    title: 'Bab 2 — Lanjutan',
    chapterNumber: 2,
    priceIdr: 49000,
    isFree: false,
    releaseDate: '2025-01-01',
    pdfPath: null,
    state: 'buyable',
  },
];

describe('VisitorChapterRow', () => {
  it('renders one "Masuk untuk baca" button per released chapter', () => {
    render(<VisitorChapterRow chapters={chapters} />);
    const buttons = screen.getAllByRole('button', {
      name: /masuk untuk baca/i,
    });
    expect(buttons).toHaveLength(2);
  });

  it('opens the signup modal when a chapter button is clicked', async () => {
    const user = userEvent.setup();
    render(<VisitorChapterRow chapters={chapters} />);

    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    await user.click(
      screen.getAllByRole('button', { name: /masuk untuk baca/i })[0]
    );
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
  });

  it('can switch from signup to login inside the modal', async () => {
    const user = userEvent.setup();
    render(<VisitorChapterRow chapters={chapters} />);

    await user.click(
      screen.getAllByRole('button', { name: /masuk untuk baca/i })[0]
    );
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /switch to login/i }));
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.queryByTestId('signup-form')).not.toBeInTheDocument();
  });

  it('renders an empty state when no chapters are available', () => {
    render(<VisitorChapterRow chapters={[]} />);
    expect(screen.getByText(/belum ada bab yang dirilis/i)).toBeInTheDocument();
  });
});
