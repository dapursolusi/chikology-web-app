import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StressResultCard } from './StressResultCard';

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

vi.mock('lucide-react', () => ({
  LoaderCircle: () => <span>loading</span>,
}));

const mockResult = {
  tier: 3 as const,
  emoji: '😐',
  label: 'Moderate Stress (Overload Beginning)',
  color: '#eab308',
  desc: 'Aktivasi HPA-axis yang signifikan.',
  signs: [
    'Ekspresi tegang (rahang kaku, alis mengerut)',
    'Microexpression takut/marah',
  ],
  risks: ['Overthinking & Emotional reactivity meningkat.'],
  interventions: [
    {
      title: 'Cognitive Restructuring',
      subTitle: 'CBT',
      description: 'Mengubah pikiran irasional jadi lebih rasional.',
    },
  ],
  messages: [
    'Haloo.. berhenti sejenak dari aktivitasmu dan baca tulisan ini sebentar karena ini sangat penting buat kamu.',
  ],
};

describe('StressResultCard', () => {
  it('renders consultation CTA with WhatsApp link', () => {
    render(<StressResultCard result={mockResult} />);

    const cta = screen.getByRole('link', {
      name: /Konsultasi dengan Mas Chiko/i,
    });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', 'https://wa.me/6287853186759');
  });

  it('renders privacy tagline', () => {
    render(<StressResultCard result={mockResult} />);

    expect(
      screen.getByText('Datamu aman, privasi terjamin')
    ).toBeInTheDocument();
  });

  it('renders expandable detail with signs and risks', () => {
    render(<StressResultCard result={mockResult} />);

    expect(screen.getByText(/Ciri:/)).toBeInTheDocument();
    expect(screen.getByText(/Risiko:/)).toBeInTheDocument();
    expect(
      screen.getByText('Ekspresi tegang (rahang kaku, alis mengerut)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Overthinking & Emotional reactivity meningkat.')
    ).toBeInTheDocument();
  });

  it('renders tier badge with emoji, tier number, and label', () => {
    render(<StressResultCard result={mockResult} />);

    expect(screen.getByText('Tingkat 3')).toBeInTheDocument();
    expect(screen.getByText(mockResult.label)).toBeInTheDocument();
  });
});
