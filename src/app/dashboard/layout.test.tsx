import type { ReactNode } from 'react';

import DashboardLayout from '@/app/dashboard/layout';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
  redirect: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'test-user', email: 'test@test.com' } },
      })),
    },
  })),
}));

vi.mock('@/components/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="sidebar" />,
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarInset: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarProvider: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarTrigger: () => <button data-testid="sidebar-trigger">☰</button>,
}));

vi.mock('@/components/ui/breadcrumb', () => ({
  Breadcrumb: ({ children }: { children: ReactNode }) => <nav>{children}</nav>,
  BreadcrumbItem: ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  ),
  BreadcrumbLink: ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  ),
  BreadcrumbList: ({ children }: { children: ReactNode }) => (
    <ol>{children}</ol>
  ),
  BreadcrumbPage: ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  ),
  BreadcrumbSeparator: () => <span>/</span>,
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

describe('Dashboard layout', () => {
  it('renders the privacy tagline in the header', async () => {
    const { container } = render(
      await DashboardLayout({ children: <div>content</div> })
    );

    expect(container.textContent).toContain('Datamu aman, privasi terjamin');
  });
});
