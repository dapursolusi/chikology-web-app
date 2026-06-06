import EBook from '@/components/sections/home/e-book';
import Features from '@/components/sections/home/features';
import { Hero } from '@/components/sections/home/hero';

import type { ChapterWithState } from '@/lib/chapters';
import { getChaptersWithState, getPublicChapters } from '@/lib/chapters';
import { getEbookLive } from '@/lib/feature-flags';
import { createClient } from '@/lib/supabase/server';

export default async function MainPage() {
  const [supabase, ebookLive] = await Promise.all([
    createClient(),
    getEbookLive(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let chapters: ChapterWithState[] = [];
  if (ebookLive) {
    chapters = user
      ? await getChaptersWithState(user.id)
      : await getPublicChapters();
  }

  return (
    <div className="flex flex-col gap-8 min-h-screen">
      <Hero ebookLive={ebookLive} />
      <EBook
        ebookLive={ebookLive}
        userId={user?.id ?? null}
        chapters={chapters}
      />
      <Features />
    </div>
  );
}
