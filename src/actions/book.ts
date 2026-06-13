'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { bookChapters, users } from '@/db/schema';
import { type ChapterParsedValues, chapterSchema } from '@/schemas/chapter';
import { asc, eq } from 'drizzle-orm';

import { createClient, getAuthUser } from '@/lib/supabase/server';

const BOOK_BUCKET = 'book-chapters';

export async function getBookChapters() {
  return db
    .select()
    .from(bookChapters)
    .orderBy(asc(bookChapters.chapterNumber));
}

export async function getAdminRole(): Promise<'user' | 'admin'> {
  const user = await getAuthUser();
  if (!user) return 'user';

  const rows = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return rows[0]?.role === 'admin' ? 'admin' : 'user';
}

function formDataToRaw(fd: FormData) {
  const pdfEntry = fd.get('pdf');
  return {
    title: fd.get('title') ?? '',
    chapter_number: fd.get('chapter_number') ?? '',
    price_idr: fd.get('price_idr') ?? '',
    release_date: fd.get('release_date') ?? '',
    is_free: fd.get('is_free') === 'true' || fd.get('is_free') === 'on',
    pdf: pdfEntry instanceof File ? pdfEntry : null,
  };
}

export async function createChapter(
  formData: FormData
): Promise<{ success: true; chapterId: string } | { error: string }> {
  const role = await getAdminRole();
  if (role !== 'admin') {
    return { error: 'Hanya admin yang dapat membuat bab' };
  }

  const parsed = chapterSchema.safeParse(formDataToRaw(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }
  const values: ChapterParsedValues = parsed.data;

  const supabase = await createClient();

  let pdfPath: string | null = null;
  if (values.pdf) {
    const objectPath = `${values.chapter_number}-${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(BOOK_BUCKET)
      .upload(objectPath, values.pdf, {
        contentType: 'application/pdf',
        cacheControl: 'max-age=60',
      });
    if (uploadError) {
      console.error(
        '[DEBUG-b1c3] createChapter upload error:',
        JSON.stringify(uploadError)
      );
      return { error: 'Gagal mengunggah file PDF' };
    }
    pdfPath = objectPath;
  }

  try {
    const releaseDate =
      values.release_date && values.release_date.trim() !== ''
        ? values.release_date
        : null;
    const [row] = await db
      .insert(bookChapters)
      .values({
        title: values.title,
        chapterNumber: values.chapter_number,
        priceIdr: values.is_free ? 0 : values.price_idr,
        releaseDate,
        isFree: values.is_free,
        pdfPath,
      })
      .returning({ id: bookChapters.id });

    revalidatePath('/dashboard/admin/book');
    return { success: true, chapterId: row.id };
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
    if (code === '23505') {
      return { error: 'Nomor bab sudah digunakan' };
    }
    return { error: 'Gagal membuat bab' };
  }
}

export async function updateChapter(
  id: string,
  formData: FormData
): Promise<{ success: true; chapterId: string } | { error: string }> {
  const role = await getAdminRole();
  if (role !== 'admin') {
    return { error: 'Hanya admin yang dapat mengubah bab' };
  }

  const parsed = chapterSchema.safeParse(formDataToRaw(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid' };
  }
  const values: ChapterParsedValues = parsed.data;

  const supabase = await createClient();

  let pdfPath: string | undefined;
  if (values.pdf) {
    const objectPath = `${values.chapter_number}-${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(BOOK_BUCKET)
      .upload(objectPath, values.pdf, {
        contentType: 'application/pdf',
        cacheControl: 'max-age=60',
      });
    if (uploadError) {
      console.error(
        '[DEBUG-b1c3] updateChapter upload error:',
        JSON.stringify(uploadError)
      );
      return { error: 'Gagal mengunggah file PDF' };
    }
    pdfPath = objectPath;
  }

  const releaseDate =
    values.release_date && values.release_date.trim() !== ''
      ? values.release_date
      : null;

  const setValues: Partial<typeof bookChapters.$inferInsert> = {
    title: values.title,
    chapterNumber: values.chapter_number,
    priceIdr: values.is_free ? 0 : values.price_idr,
    releaseDate,
    isFree: values.is_free,
  };
  if (pdfPath !== undefined) {
    setValues.pdfPath = pdfPath;
  }

  try {
    const [row] = await db
      .update(bookChapters)
      .set(setValues)
      .where(eq(bookChapters.id, id))
      .returning({ id: bookChapters.id });

    revalidatePath('/dashboard/admin/book');
    return { success: true, chapterId: row.id };
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
    if (code === '23505') {
      return { error: 'Nomor bab sudah digunakan' };
    }
    return { error: 'Gagal mengubah bab' };
  }
}

export async function hideChapter(
  id: string
): Promise<{ success: true } | { error: string }> {
  const role = await getAdminRole();
  if (role !== 'admin') {
    return { error: 'Hanya admin yang dapat menyembunyikan bab' };
  }
  await db
    .update(bookChapters)
    .set({ releaseDate: null })
    .where(eq(bookChapters.id, id));
  revalidatePath('/dashboard/admin/book');
  return { success: true };
}
