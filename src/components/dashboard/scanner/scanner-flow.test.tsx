import type { ReactNode } from 'react';
import { act } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ScannerFlow } from './ScannerFlow';

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

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/components/modal', () => ({
  default: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/dashboard/scanner/PreScanQuestionnaire', () => ({
  PreScanQuestionnaire: ({
    onSubmit,
  }: {
    onSubmit: (answers: Record<string, string | string[]>) => void;
  }) => (
    <div data-testid="questionnaire">
      <button onClick={() => onSubmit({ q1: ['Pekerjaan'], q2: 'Baik' })}>
        Submit Questionnaire
      </button>
    </div>
  ),
}));

vi.mock('@/components/dashboard/scanner/FaceScanner', () => ({
  default: ({
    questionnaireAnswers,
  }: {
    questionnaireAnswers?: Record<string, string | string[]>;
  }) => (
    <div data-testid="facescanner">
      scanner {questionnaireAnswers ? 'with answers' : 'without answers'}
    </div>
  ),
}));

vi.mock('@/actions/questionnaire', () => ({
  saveQuestionnaireResponse: vi.fn().mockResolvedValue({ success: true }),
}));

describe('ScannerFlow', () => {
  it('renders questionnaire first', () => {
    render(<ScannerFlow />);

    expect(screen.getByTestId('questionnaire')).toBeInTheDocument();
  });

  it('shows consent gate after questionnaire submit, not camera', async () => {
    render(<ScannerFlow />);

    const submitBtn = screen.getByRole('button', {
      name: /submit questionnaire/i,
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(screen.queryByTestId('facescanner')).not.toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: /data wajah/i,
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    const continueBtn = screen.getByRole('button', {
      name: /lanjut/i,
    });
    expect(continueBtn).toBeInTheDocument();
    expect(continueBtn).toBeDisabled();
  });

  it('shows camera after consent checked and confirmed', async () => {
    const user = userEvent.setup();

    render(<ScannerFlow />);

    await user.click(
      screen.getByRole('button', { name: /submit questionnaire/i })
    );

    const checkbox = screen.getByRole('checkbox', { name: /data wajah/i });
    await user.click(checkbox);

    const continueBtn = screen.getByRole('button', { name: /lanjut/i });
    await user.click(continueBtn);

    expect(screen.getByTestId('facescanner')).toBeInTheDocument();
  });
});
