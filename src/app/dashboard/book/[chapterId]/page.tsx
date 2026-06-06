import { redirect } from 'next/navigation';

import {
  canUserReadChapter,
  getChaptersWithState,
  getNextChapterAction,
} from '@/lib/chapters';
import { createClient } from '@/lib/supabase/server';

import { ReaderClient } from './ReaderClient';

export const metadata = {
  title: 'Baca Bab · Chikology',
};

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?auth=login');
  }

  const access = await canUserReadChapter(user.id, chapterId);
  if (access.canRead === false) {
    redirect(`/dashboard/book?denied=${access.reason}`);
  }

  const chapters = await getChaptersWithState(user.id);
  const current = chapters.find((c) => c.id === chapterId);
  if (!current) {
    redirect('/dashboard/book?denied=not-found');
  }

  const nextAction = getNextChapterAction(current.chapterNumber, chapters);

  return (
    <ReaderClient
      chapter={{
        id: current.id,
        title: current.title,
        chapterNumber: current.chapterNumber,
      }}
      nextAction={nextAction}
    />
  );
}
