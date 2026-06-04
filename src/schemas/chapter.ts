import { z } from 'zod';

const FIFTY_MB = 50 * 1024 * 1024;

function readFile(value: unknown): File | null {
  if (value instanceof FileList) {
    return value[0] instanceof File ? value[0] : null;
  }
  if (value instanceof File) {
    return value;
  }
  return null;
}

export const chapterSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Judul wajib diisi')
      .max(255, 'Judul maksimal 255 karakter'),
    chapter_number: z.coerce
      .number()
      .int('Bab harus bilangan bulat')
      .positive('Bab harus lebih dari 0'),
    price_idr: z.coerce
      .number()
      .int('Harga harus bilangan bulat')
      .min(0, 'Harga tidak boleh negatif'),
    release_date: z.string().optional(),
    is_free: z.boolean().default(false),
    pdf: z
      .custom<File | FileList | null | undefined>(
        (val) => val == null || val instanceof File || val instanceof FileList,
        { message: 'File PDF wajib diunggah' }
      )
      .transform(readFile)
      .refine((file) => !file || file.type === 'application/pdf', {
        message: 'File harus berformat PDF',
      })
      .refine((file) => !file || file.size <= FIFTY_MB, {
        message: 'Ukuran file maksimal 50MB',
      })
      .optional()
      .transform((val) => val ?? null),
  })
  .refine((data) => data.is_free !== true || data.price_idr === 0, {
    message: 'Harga harus 0 untuk bab gratis',
    path: ['price_idr'],
  });

export type ChapterFormValues = z.input<typeof chapterSchema>;
export type ChapterParsedValues = z.output<typeof chapterSchema>;
