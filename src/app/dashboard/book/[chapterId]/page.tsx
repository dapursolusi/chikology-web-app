import { redirect } from 'next/navigation';

import { getAdminRole } from '@/actions/book';

import { getChaptersWithState, getNextChapterAction } from '@/lib/chapters';
import { createClient } from '@/lib/supabase/server';

import { ReaderClient } from './ReaderClient';

export const metadata = {
  title: 'Baca Bab',
};

export default async function ReaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ chapterId: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { chapterId } = await params;
  const { preview } = searchParams ? await searchParams : {};
  const isPreview = preview === '1' && (await getAdminRole()) === 'admin';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?auth=login');
  }

  const chapters = await getChaptersWithState(user.id);
  const current = chapters.find((c) => c.id === chapterId);

  if (!current) {
    redirect('/dashboard/book?denied=not-found');
  }

  if (!isPreview) {
    if (current.state === 'unreleased') {
      redirect('/dashboard/book?denied=unreleased');
    }

    if (current.state === 'locked') {
      redirect('/dashboard/book?denied=locked');
    }

    if (current.state === 'buyable' && !current.isFree) {
      redirect('/dashboard/book?denied=paid');
    }
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
      isPreview={isPreview}
    />
  );
}
