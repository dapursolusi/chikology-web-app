import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

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
    const user = userEvent.setup();

    render(<PreScanQuestionnaire onSubmit={mockOnSubmit} />);

    const skipButton = screen.getByRole('button', { name: /lewati/i });
    await user.click(skipButton);

    expect(
      screen.getByText(/menjawab beberapa pertanyaan ini/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /kembali/i })
    ).toBeInTheDocument();
  });

  it('question 1 renders checkboxes for multi-select', () => {
    render(<PreScanQuestionnaire onSubmit={mockOnSubmit} />);

    const q1Options = [
      'Pekerjaan',
      'Keluarga (Pasangan, Anak, Orang Tua)',
      'Diri Sendiri',
      'Lingkungan (Tempat Kerja, Sosial, Berita, Pemerintah, dll',
    ];

    for (const option of q1Options) {
      const checkbox = screen.getByRole('checkbox', { name: option });
      expect(checkbox).toBeInTheDocument();
    }
  });

  it('questions 2 and 3 render radio buttons', () => {
    render(<PreScanQuestionnaire onSubmit={mockOnSubmit} />);

    const q2Radio = screen.getByRole('radio', { name: 'Senang' });
    expect(q2Radio).toBeInTheDocument();

    const q3Radio = screen.getByRole('radio', { name: 'Ingatan masa lalu' });
    expect(q3Radio).toBeInTheDocument();
  });

  it('question 1 submits an array when multiple options selected', async () => {
    const user = userEvent.setup();

    render(<PreScanQuestionnaire onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('checkbox', { name: 'Pekerjaan' }));
    await user.click(
      screen.getByRole('checkbox', {
        name: 'Keluarga (Pasangan, Anak, Orang Tua)',
      })
    );
    await user.click(screen.getByRole('radio', { name: 'Senang' }));
    await user.click(screen.getByRole('radio', { name: 'Ingatan masa lalu' }));

    await user.click(screen.getByRole('button', { name: /mulai kamera/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        q1: ['Pekerjaan', 'Keluarga (Pasangan, Anak, Orang Tua)'],
        q2: 'Senang',
        q3: 'Ingatan masa lalu',
      })
    );
  });

  it('skipping the questionnaire submits {}', async () => {
    const user = userEvent.setup();

    render(<PreScanQuestionnaire onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: /lewati/i }));
    await user.click(screen.getByRole('button', { name: /lewati/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({});
  });
});
