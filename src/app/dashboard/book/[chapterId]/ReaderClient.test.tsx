import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NextChapterAction } from '@/lib/chapters';

import { ReaderClient } from './ReaderClient';

const mockGetChapterSignedUrl = vi.hoisted(() => vi.fn());

vi.mock('@/actions/chapters', () => ({
  getChapterSignedUrl: mockGetChapterSignedUrl,
}));

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
  beforeEach(() => {
    mockGetChapterSignedUrl.mockReset();
    mockGetChapterSignedUrl.mockResolvedValue({
      url: 'https://example.supabase.co/signed/x',
      expiresIn: 300,
    });
  });

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

  it('renders a skeleton (no iframe) while the signed URL is loading', () => {
    mockGetChapterSignedUrl.mockImplementation(() => new Promise(() => {}));
    const { container } = render(
      <ReaderClient chapter={chapter} nextAction={nextAction} />
    );
    expect(container.querySelector('iframe')).not.toBeInTheDocument();
    expect(screen.getByTestId('reader-skeleton')).toBeInTheDocument();
  });

  it('renders an iframe with the signed URL after the fetch resolves', async () => {
    render(<ReaderClient chapter={chapter} nextAction={nextAction} />);
    const iframe = await screen.findByTitle(/pdf|bab 1/i);
    expect(iframe).toHaveAttribute(
      'src',
      'https://example.supabase.co/signed/x'
    );
  });

  it('shows an error message when the signed URL fetch fails', async () => {
    mockGetChapterSignedUrl.mockReset();
    mockGetChapterSignedUrl.mockResolvedValue({
      error: 'Gagal membuat URL PDF',
    });
    render(<ReaderClient chapter={chapter} nextAction={nextAction} />);
    await waitFor(() => {
      expect(screen.getByTestId('reader-error')).toBeInTheDocument();
    });
    expect(screen.getByText(/gagal membuat url pdf/i)).toBeInTheDocument();
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
