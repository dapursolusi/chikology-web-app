'use client';

import { useEffect, useState } from 'react';

import { BookOpenIcon, BotIcon, NotebookPen } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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

const navMain = [
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
    items: [
      {
        title: 'Baca E-Book',
        url: '#',
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
