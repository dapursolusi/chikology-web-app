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

  it('renders the NextChapterButton with the passed action', () => {
    const action: NextChapterAction = {
      kind: 'navigate',
      nextChapter: { id: 'ch-2', title: 'Bab 2', chapterNumber: 2 },
    };
    render(<ReaderClient chapter={chapter} nextAction={action} />);
    const button = screen.getByTestId('next-chapter-button');
    expect(button).toHaveAttribute('data-kind', 'navigate');
  });

  describe('preview mode', () => {
    it('does not render the NextChapterButton', () => {
      render(
        <ReaderClient
          chapter={chapter}
          nextAction={nextAction}
          isPreview={true}
        />
      );
      expect(
        screen.queryByTestId('next-chapter-button')
      ).not.toBeInTheDocument();
    });

    it('renders a Kembali ke Panel Admin link to /dashboard/admin/book', () => {
      render(
        <ReaderClient
          chapter={chapter}
          nextAction={nextAction}
          isPreview={true}
        />
      );
      const adminLink = screen.getByRole('link', {
        name: /panel admin|admin/i,
      });
      expect(adminLink).toHaveAttribute('href', '/dashboard/admin/book');
    });

    it('renders the PDF viewer with the same URL as normal mode', () => {
      render(
        <ReaderClient
          chapter={chapter}
          nextAction={nextAction}
          isPreview={true}
        />
      );
      const iframe = screen.getByTitle(/pdf|bab 1/i);
      expect(iframe).toHaveAttribute(
        'src',
        '/pdfjs/web/viewer.html?file=%2Fapi%2Fchapters%2Fch-1%2Fview'
      );
    });

    it('renders the download link with the same URL as normal mode', () => {
      render(
        <ReaderClient
          chapter={chapter}
          nextAction={nextAction}
          isPreview={true}
        />
      );
      const downloadLink = screen.getByRole('link', { name: /download/i });
      expect(downloadLink).toHaveAttribute(
        'href',
        '/api/chapters/ch-1/download'
      );
    });
  });
});
