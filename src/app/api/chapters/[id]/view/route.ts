import { NextRequest, NextResponse } from 'next/server';

import { getAdminRole } from '@/actions/book';
import { db } from '@/db';
import { bookChapters, chapterAccessLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

import { canUserReadChapter } from '@/lib/chapters';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chapterId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const isAdmin = (await getAdminRole()) === 'admin';

  if (!isAdmin) {
    const access = await canUserReadChapter(user.id, chapterId);

    if (access.canRead === false) {
      await db.insert(chapterAccessLogs).values({
        userId: user.id,
        chapterId,
        eventType: 'access_denied',
        metadata: { reason: access.reason },
      });

      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  }

  const rows = await db
    .select({ pdfPath: bookChapters.pdfPath })
    .from(bookChapters)
    .where(eq(bookChapters.id, chapterId));
  const pdfPath = rows[0]?.pdfPath;

  if (!pdfPath) {
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
  }

  const serviceClient = createServiceClient();
  const { data: fileData, error } = await serviceClient.storage
    .from('book-chapters')
    .download(pdfPath);

  if (error || !fileData) {
    return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 500 });
  }

  const pdfBytes = new Uint8Array(await fileData.arrayBuffer());
  const fileSize = pdfBytes.length;

  const rangeHeader = request.headers.get('Range');
  let start = 0;
  let end = fileSize - 1;
  let statusCode = 200;

  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      start = parseInt(match[1], 10);
      end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
      statusCode = 206;
    }
  }

  const chunk = pdfBytes.slice(start, end + 1);

  await db.insert(chapterAccessLogs).values({
    userId: user.id,
    chapterId,
    eventType: 'view_started',
    metadata: { range: rangeHeader || 'full' },
  });

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set(
    'Content-Disposition',
    `inline; filename="${pdfPath.split('/').pop()}"`
  );
  headers.set('Content-Length', chunk.length.toString());
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'private, max-age=60');

  if (statusCode === 206) {
    headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
  }

  return new NextResponse(chunk, { status: statusCode, headers });
}
