import { act } from 'react';

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
    },
  }),
}));

vi.mock('@/components/logo', () => ({
  default: () => <div data-testid="logo" />,
}));

vi.mock('@/components/nav-user', () => ({
  NavUser: () => <div data-testid="nav-user" />,
}));

function renderSidebar(ebookLive: boolean, initialNow?: number) {
  return render(
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar ebookLive={ebookLive} initialNow={initialNow} />
      </SidebarProvider>
    </TooltipProvider>
  );
}

describe('AppSidebar — E-Book gate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders E-Book row as aria-disabled when ebookLive is false', () => {
    vi.setSystemTime(new Date('2026-06-14T20:30:15+07:00'));
    renderSidebar(false);
    const ebookRow = screen.getByRole('button', { name: /E-Book/i });
    expect(ebookRow).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows compact countdown below disabled E-Book row when ebookLive is false', () => {
    vi.setSystemTime(new Date('2026-06-14T20:30:15+07:00'));
    renderSidebar(false);
    expect(screen.getByTestId('countdown-compact')).toHaveTextContent(
      '1 hari 3 jam 29 menit'
    );
  });

  it('does not expose "Segera hadir 16 Juni" tooltip (removed)', () => {
    vi.setSystemTime(new Date('2026-06-14T20:30:15+07:00'));
    renderSidebar(false);
    const ebookRow = screen.getByRole('button', { name: /E-Book/i });
    expect(ebookRow).not.toHaveAttribute('title', 'Segera hadir 16 Juni');
  });

  it('renders E-Book row as enabled when ebookLive is true', () => {
    renderSidebar(true);
    const ebookRow = screen.getByRole('button', { name: /E-Book/i });
    expect(ebookRow).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('shows no countdown when ebookLive is true', () => {
    renderSidebar(true);
    expect(screen.queryByTestId('countdown-compact')).not.toBeInTheDocument();
  });
});

describe('AppSidebar — Admin section', () => {
  it('renders "Admin" button when isAdmin is true', () => {
    render(
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar isAdmin={true} />
        </SidebarProvider>
      </TooltipProvider>
    );
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('does not render "Admin" button when isAdmin is false', () => {
    render(
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar isAdmin={false} />
        </SidebarProvider>
      </TooltipProvider>
    );
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('does not render "Admin" button by default (isAdmin not passed)', () => {
    renderSidebar(true);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
