import { redirect } from 'next/navigation';

import { BookPageClient } from '@/app/dashboard/book/BookPageClient';

import { getChaptersWithState } from '@/lib/chapters';
import { getEbookLive } from '@/lib/feature-flags';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'E-Book · Chikology',
};

export default async function BookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?auth=login');
  }

  const ebookLive = await getEbookLive();

  if (!ebookLive) {
    return (
      <div
        data-testid="ebook-coming-soon"
        className="flex flex-1 items-center justify-center p-8"
      >
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground">
            E-Book Segera Hadir
          </h1>
          <p className="mt-2 text-muted-foreground">
            E-Book Mas Chiko akan segera tersedia. Nantikan ya!
          </p>
        </div>
      </div>
    );
  }

  const allChapters = await getChaptersWithState(user.id);
  const chapters = allChapters.filter((c) => c.releaseDate !== null);

  return <BookPageClient chapters={chapters} />;
}
