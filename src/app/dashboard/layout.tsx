import { redirect } from 'next/navigation';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { getEbookLive } from '@/lib/feature-flags';
import { createClient } from '@/lib/supabase/server';

import { DashboardHeader } from './DashboardHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?auth=login');
  }

  const ebookLive = await getEbookLive();

  return (
    <SidebarProvider>
      <AppSidebar ebookLive={ebookLive} />
      <SidebarInset className="h-screen flex-col">
        <DashboardHeader />
        <div className="w-full flex-1 bg-muted/30 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
