'use client';

import { useEffect, useState } from 'react';

import { BookOpenIcon, BotIcon, NotebookPen, Settings } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { BookCountdown } from '@/components/sections/home/BookCountdown';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

import { createClient } from '@/lib/supabase/client';

import Logo from './logo';

const DASHBOARD_PREFIX = '/dashboard';
const dashboardLink = (path: string = '') =>
  path ? `${DASHBOARD_PREFIX}/${path}` : DASHBOARD_PREFIX;

function buildNavMain(
  ebookLive: boolean,
  isAdmin: boolean,
  countdown?: React.ReactNode
) {
  const mainNav = [
    {
      title: 'Jurnal Pribadi',
      url: '#',
      icon: <NotebookPen />,
      items: [
        {
          title: 'Isi Jurnal',
          url: dashboardLink('journal'),
        },
      ],
    },
    {
      title: 'Stress Detection',
      url: '#',
      icon: <BotIcon />,
      items: [
        {
          title: 'Deteksi Wajah',
          url: dashboardLink('scanner'),
        },
      ],
    },
    {
      title: 'E-Book',
      url: '#',
      icon: <BookOpenIcon />,
      disabled: !ebookLive,
      countdown: !ebookLive ? countdown : undefined,
      items: [
        {
          title: 'Baca E-Book',
          url: dashboardLink('book'),
        },
      ],
    },
  ];

  if (isAdmin) {
    mainNav.push({
      title: 'Admin',
      url: '#',
      icon: <Settings />,
      items: [
        {
          title: 'Kelola Bab',
          url: dashboardLink('admin/book'),
        },
        {
          title: 'Fitur E-Book',
          url: '#',
        },
        {
          title: 'Pengaturan',
          url: dashboardLink('admin/settings'),
        },
      ],
    });
  }

  return mainNav;
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  ebookLive?: boolean;
  isAdmin?: boolean;
  initialNow?: number;
};

export function AppSidebar({
  ebookLive = false,
  isAdmin = false,
  initialNow,
  ...props
}: AppSidebarProps) {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name:
            data.user.user_metadata?.full_name ??
            data.user.email?.split('@')[0] ??
            'User',
          email: data.user.email ?? '',
          avatar: data.user.user_metadata?.avatar_url ?? '',
        });
      }
    });
  }, []);

  const ebookCountdown = !ebookLive ? (
    <BookCountdown size="compact" initialNow={initialNow} intervalMs={60_000} />
  ) : undefined;

  const navMain = buildNavMain(ebookLive, isAdmin, ebookCountdown);

  return (
    <Sidebar collapsible="icon" {...props} className="mobile:w-64">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
