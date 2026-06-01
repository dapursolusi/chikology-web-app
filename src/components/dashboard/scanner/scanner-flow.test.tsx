import type { ReactNode } from 'react';
import { act } from 'react';

import { render, screen } from '@testing-library/react';
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
    onSubmit: (answers: Record<string, string>) => void;
  }) => (
    <div data-testid="questionnaire">
      <button onClick={() => onSubmit({ q1: 'Baik' })}>
        Submit Questionnaire
      </button>
    </div>
  ),
}));

vi.mock('@/components/FaceScanner', () => ({
  default: ({
    questionnaireAnswers,
  }: {
    questionnaireAnswers?: Record<string, string>;
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

  it('switches to camera after questionnaire submit', async () => {
    render(<ScannerFlow />);

    const submitBtn = screen.getByRole('button', {
      name: /submit questionnaire/i,
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(screen.getByTestId('facescanner')).toBeInTheDocument();
  });
});
