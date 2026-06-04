import { notFound } from 'next/navigation';

import { getAdminRole, getBookChapters } from '@/actions/book';

import { ChapterForm } from '@/components/dashboard/admin/ChapterForm';

export const metadata = {
  title: 'Kelola E-Book · Chikology',
};

export default async function AdminBookPage() {
  const role = await getAdminRole();
  if (role !== 'admin') {
    notFound();
  }

  const chapters = await getBookChapters();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Kelola E-Book
        </h1>
        <p className="text-muted-foreground">
          Tambah, ubah, dan jadwalkan bab untuk e-book Mas Chiko.
        </p>
      </div>
      <ChapterForm chapters={chapters} />
    </div>
  );
}
