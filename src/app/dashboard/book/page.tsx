import { redirect } from 'next/navigation';

import { BookPageClient } from '@/app/dashboard/book/BookPageClient';

import { getChaptersWithState } from '@/lib/chapters';
import { getEbookLive } from '@/lib/feature-flags';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'E-Book',
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
    redirect('/');
  }

  const allChapters = await getChaptersWithState(user.id);
  const chapters = allChapters.filter((c) => c.releaseDate !== null);

  return <BookPageClient chapters={chapters} />;
}
