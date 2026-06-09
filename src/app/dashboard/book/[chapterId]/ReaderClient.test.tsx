import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { NextChapterAction } from '@/lib/chapters';

import { ReaderClient } from './ReaderClient';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/dashboard/book/NextChapterButton', () => ({
  NextChapterButton: ({ action }: { action: NextChapterAction }) => (
    <div data-testid="next-chapter-button" data-kind={action.kind} />
  ),
}));

const chapter = {
  id: 'ch-1',
  title: 'Bab 1 — Awal',
  chapterNumber: 1,
};

const nextAction: NextChapterAction = { kind: 'end-of-book' };

describe('ReaderClient', () => {
  it('renders a back link pointing to /dashboard/book', () => {
    render(<ReaderClient chapter={chapter} nextAction={nextAction} />);
    const back = screen.getByRole('link', { name: /kembali|back/i });
    expect(back).toHaveAttribute('href', '/dashboard/book');
  });

  it('renders the chapter title in the header', () => {
    render(<ReaderClient chapter={chapter} nextAction={nextAction} />);
    expect(
      screen.getByRole('heading', { name: /bab 1 — awal/i })
    ).toBeInTheDocument();
  });

  it('renders an iframe pointing to the PDF.js viewer with viewer endpoint', () => {
    render(<ReaderClient chapter={chapter} nextAction={nextAction} />);
    const iframe = screen.getByTitle(/pdf|bab 1/i);
    expect(iframe).toHaveAttribute(
      'src',
      '/pdfjs/web/viewer.html?file=%2Fapi%2Fchapters%2Fch-1%2Fview'
    );
  });

  it('renders a download button linking to the download endpoint', () => {
    render(<ReaderClient chapter={chapter} nextAction={nextAction} />);
    const downloadLink = screen.getByRole('link', { name: /download/i });
    expect(downloadLink).toHaveAttribute('href', '/api/chapters/ch-1/download');
  });

  it('renders a consultation CTA linking to wa.me/6287853186759', () => {
    render(<ReaderClient chapter={chapter} nextAction={nextAction} />);
    const cta = screen.getByRole('link', {
      name: /konsultasi|mas chiko|whatsapp/i,
    });
    expect(cta).toHaveAttribute('href', 'https://wa.me/6287853186759');
  });

  it('renders the NextChapterButton with the passed action', () => {
    const action: NextChapterAction = {
      kind: 'navigate',
      nextChapter: { id: 'ch-2', title: 'Bab 2', chapterNumber: 2 },
    };
    render(<ReaderClient chapter={chapter} nextAction={action} />);
    const button = screen.getByTestId('next-chapter-button');
    expect(button).toHaveAttribute('data-kind', 'navigate');
  });
});
