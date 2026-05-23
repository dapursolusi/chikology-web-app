'use client';

import * as React from 'react';

import {
  BookOpenIcon,
  BotIcon,
  NotebookPen,
  Settings2Icon,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

import Logo from './logo';

// Dashboard URL helper - avoids repeating /dashboard/ prefix
const DASHBOARD_PREFIX = '/dashboard';
const dashboardLink = (path: string = '') =>
  path ? `${DASHBOARD_PREFIX}/${path}` : DASHBOARD_PREFIX;

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
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
      title: 'Mood Checker',
      url: '#',
      icon: <BotIcon />,
      items: [
        {
          title: 'Deteksi Wajah',
          url: dashboardLink('face-detection'),
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
          url: 'e-book',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: <Settings2Icon />,
      items: [
        {
          title: 'General',
          url: dashboardLink('settings/general'),
        },
        {
          title: 'Team',
          url: dashboardLink('settings/team'),
        },
        {
          title: 'Billing',
          url: dashboardLink('settings/billing'),
        },
        {
          title: 'Limits',
          url: dashboardLink('settings/limits'),
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="mobile:w-64">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
