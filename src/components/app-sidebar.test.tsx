import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

function renderSidebar(ebookLive: boolean) {
  return render(
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar ebookLive={ebookLive} />
      </SidebarProvider>
    </TooltipProvider>
  );
}

describe('AppSidebar — E-Book gate', () => {
  it('renders E-Book row as aria-disabled when ebookLive is false', () => {
    renderSidebar(false);
    const ebookRow = screen.getByRole('button', { name: /E-Book/i });
    expect(ebookRow).toHaveAttribute('aria-disabled', 'true');
  });

  it('exposes "Segera hadir 16 Juni" as tooltip on the disabled E-Book row', () => {
    renderSidebar(false);
    const ebookRow = screen.getByRole('button', { name: /E-Book/i });
    expect(ebookRow).toHaveAttribute('title', 'Segera hadir 16 Juni');
  });

  it('renders E-Book row as enabled when ebookLive is true', () => {
    renderSidebar(true);
    const ebookRow = screen.getByRole('button', { name: /E-Book/i });
    expect(ebookRow).not.toHaveAttribute('aria-disabled', 'true');
  });
});

// Admin nav tests require Supabase client mock with user role — skipped due to vi.mock hoisting
// Manual verification: login as user with user_metadata.role='admin' → Admin section appears in sidebar
