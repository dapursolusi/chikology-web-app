import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('AnnouncementBanner', () => {
  beforeEach(() => {
    document.cookie = 'announcement_dismissed=; path=/; max-age=0';
  });

  afterEach(() => {
    document.cookie = 'announcement_dismissed=; path=/; max-age=0';
  });

  it('renders the banner with correct text and WhatsApp link', async () => {
    vi.resetModules();
    const { default: AnnouncementBanner } =
      await import('@/components/layout/announcement-banner');

    render(<AnnouncementBanner />);

    expect(
      screen.getByText(
        /Ingin curhat, konsultasi, atau dapat rekomendasi lebih dalam/
      )
    ).toBeInTheDocument();

    const link = screen.getByRole('link', {
      name: /Jadwalkan konsultasi dengan Mas Chiko/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://wa.me/6287853186759');
  });

  it('dismisses the banner when X button is clicked', async () => {
    vi.resetModules();
    const { default: AnnouncementBanner } =
      await import('@/components/layout/announcement-banner');

    render(<AnnouncementBanner />);

    const closeButton = screen.getByRole('button', {
      name: /Tutup pengumuman/i,
    });
    fireEvent.click(closeButton);

    expect(
      screen.queryByText(/Ingin curhat, konsultasi/)
    ).not.toBeInTheDocument();
  });

  it('sets a cookie on dismiss', async () => {
    vi.resetModules();
    const { default: AnnouncementBanner } =
      await import('@/components/layout/announcement-banner');

    render(<AnnouncementBanner />);

    const closeButton = screen.getByRole('button', {
      name: /Tutup pengumuman/i,
    });
    fireEvent.click(closeButton);

    expect(document.cookie).toContain('announcement_dismissed=1');
  });

  it('does not render when dismiss cookie is present', async () => {
    document.cookie = 'announcement_dismissed=1';

    vi.resetModules();
    const { default: AnnouncementBanner } =
      await import('@/components/layout/announcement-banner');

    render(<AnnouncementBanner />);

    expect(
      screen.queryByText(/Ingin curhat, konsultasi/)
    ).not.toBeInTheDocument();
  });
});
