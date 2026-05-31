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
  message:
    'Haloo.. berhenti sejenak dari aktivitasmu dan baca tulisan ini sebentar karena ini sangat penting buat kamu.',
  intervention:
    'Cognitive Restructuring (CBT) — Identifikasi Automatic Negative Thoughts (ANTs)',
  ciri: 'Ekspresi tegang (rahang kaku, alis mengerut), microexpression takut/marah',
  risiko: 'Overthinking & Emotional reactivity meningkat',
};

describe('StressResultCard', () => {
  it('renders consultation CTA with WhatsApp link', () => {
    render(<StressResultCard result={mockResult} />);

    const cta = screen.getByRole('link', {
      name: /Butuh rekomendasi lebih dalam\? Jadwalkan konsultasi dengan Mas Chiko/i,
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

  it('renders expandable detail with ciri and risiko', () => {
    render(<StressResultCard result={mockResult} />);

    expect(screen.getByText(/Ciri:/)).toBeInTheDocument();
    expect(screen.getByText(/Risiko:/)).toBeInTheDocument();
    expect(screen.getByText(mockResult.ciri)).toBeInTheDocument();
    expect(screen.getByText(mockResult.risiko)).toBeInTheDocument();
  });

  it('renders tier badge with emoji, tier number, and label', () => {
    render(<StressResultCard result={mockResult} />);

    expect(screen.getByText('Tingkat 3')).toBeInTheDocument();
    expect(screen.getByText(mockResult.label)).toBeInTheDocument();
  });
});
