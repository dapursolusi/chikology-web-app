import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { bookChapters, chapterAccessLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import { canUserReadChapter } from '@/lib/chapters';
import { createClient, createServiceClient } from '@/lib/supabase/server';

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return '****';
  const last4 = localPart.slice(-4);
  return `****${last4}@${domain}`;
}

function formatWIB(date: Date): string {
  const wibDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const year = wibDate.getUTCFullYear();
  const month = String(wibDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getUTCDate()).padStart(2, '0');
  const hours = String(wibDate.getUTCHours()).padStart(2, '0');
  const minutes = String(wibDate.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes} WIB`;
}

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
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  const maskedEmail = maskEmail(user.email);
  const timestamp = formatWIB(new Date());

  for (const page of pages) {
    const { width, height } = page.getSize();
    const fontSize = 10;
    const x = 50;
    const y = 50;

    page.drawText('[Didownload dari CHIKOLOGY]', {
      x,
      y,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.5,
    });

    page.drawText(maskedEmail, {
      x,
      y: y - fontSize - 2,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.5,
    });

    page.drawText(timestamp, {
      x,
      y: y - 2 * (fontSize + 2),
      size: fontSize,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.5,
    });
  }

  const watermarkedPdfBytes = await pdfDoc.save();

  await db.insert(chapterAccessLogs).values({
    userId: user.id,
    chapterId,
    eventType: 'download_requested',
    metadata: { email: maskedEmail },
  });

  const filename = pdfPath.split('/').pop() || 'chapter.pdf';
  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  headers.set('Content-Length', watermarkedPdfBytes.length.toString());
  headers.set('Cache-Control', 'private, max-age=3600');

  return new NextResponse(watermarkedPdfBytes, { status: 200, headers });
}
