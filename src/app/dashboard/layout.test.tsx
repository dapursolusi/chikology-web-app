import type { ReactNode } from 'react';

import DashboardLayout from '@/app/dashboard/layout';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const mockGetUser = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

const mockGetUserRole = vi.hoisted(() => vi.fn());
vi.mock('@/actions/auth', () => ({
  getUserRole: mockGetUserRole,
}));

const MockAppSidebar = vi.hoisted(() => vi.fn(() => null));
vi.mock('@/components/app-sidebar', () => ({
  AppSidebar: MockAppSidebar,
}));

vi.mock('@/lib/feature-flags', () => ({
  getEbookLive: vi.fn(() => Promise.resolve(false)),
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

vi.mock('./DashboardHeader', () => ({
  DashboardHeader: () => (
    <header>
      <span>Datamu aman, privasi terjamin</span>
    </header>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'test-user', email: 'test@test.com' } },
  });
});

describe('Dashboard layout', () => {
  it('renders the privacy tagline in the header', async () => {
    const { container } = render(
      await DashboardLayout({ children: <div>content</div> })
    );

    expect(container.textContent).toContain('Datamu aman, privasi terjamin');
  });

  it('passes isAdmin={true} to AppSidebar when DB role is admin', async () => {
    mockGetUserRole.mockResolvedValue('admin');

    render(await DashboardLayout({ children: <div>content</div> }));

    expect(MockAppSidebar).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ isAdmin: true }),
      undefined
    );
  });

  it('passes isAdmin={false} to AppSidebar when DB role is user', async () => {
    mockGetUserRole.mockResolvedValue('user');

    render(await DashboardLayout({ children: <div>content</div> }));

    expect(MockAppSidebar).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ isAdmin: false }),
      undefined
    );
  });

  it('passes isAdmin={false} when DB has no role (null)', async () => {
    mockGetUserRole.mockResolvedValue(null);

    render(await DashboardLayout({ children: <div>content</div> }));

    expect(MockAppSidebar).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ isAdmin: false }),
      undefined
    );
  });
});
