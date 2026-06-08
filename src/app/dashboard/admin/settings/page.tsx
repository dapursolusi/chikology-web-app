import { notFound } from 'next/navigation';

import { getAdminRole } from '@/actions/book';

import { EbookLiveToggle } from '@/components/dashboard/admin/EbookLiveToggle';

import { getEbookLive } from '@/lib/feature-flags';

export const metadata = {
  title: 'Pengaturan Admin · Chikology',
};

export default async function AdminSettingsPage() {
  const role = await getAdminRole();
  if (role !== 'admin') {
    notFound();
  }

  const ebookLive = await getEbookLive();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Pengaturan Admin
        </h1>
        <p className="text-muted-foreground">
          Kelola pengaturan fitur aplikasi.
        </p>
      </div>
      <EbookLiveToggle initialLive={ebookLive} />
    </div>
  );
}
