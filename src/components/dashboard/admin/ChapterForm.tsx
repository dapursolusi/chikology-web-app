'use client';

import { useEffect, useState } from 'react';

import { createChapter } from '@/actions/book';
import { type ChapterFormValues, chapterSchema } from '@/schemas/chapter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { type ChapterRow, ChapterTable } from './ChapterTable';

interface ChapterFormProps {
  chapters: ChapterRow[];
}

export function ChapterForm({ chapters }: ChapterFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: '',
      chapter_number: 1,
      price_idr: 0,
      release_date: '',
      is_free: false,
      pdf: undefined,
    },
  });

  const isFree = watch('is_free');
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isFree) {
      setValue('price_idr', 0, { shouldValidate: true });
    }
  }, [isFree, setValue]);

  const onSubmit = async (values: ChapterFormValues) => {
    setServerError(null);
    const fd = new FormData();
    fd.append('title', values.title);
    fd.append('chapter_number', String(values.chapter_number));
    fd.append('price_idr', String(values.price_idr));
    if (values.release_date) fd.append('release_date', values.release_date);
    fd.append('is_free', values.is_free ? 'true' : 'false');
    const pdfValue = values.pdf;
    if (pdfValue instanceof File) {
      fd.append('pdf', pdfValue);
    } else if (pdfValue instanceof FileList && pdfValue[0] instanceof File) {
      fd.append('pdf', pdfValue[0]);
    }

    const result = await createChapter(fd);
    if ('error' in result) {
      setServerError(result.error);
      return;
    }
    reset();
    toast.success('Bab berhasil dibuat');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buat Bab Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                {...register('title')}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chapter_number">Nomor Bab</Label>
              <Input
                id="chapter_number"
                type="number"
                {...register('chapter_number')}
                aria-invalid={!!errors.chapter_number}
              />
              {errors.chapter_number && (
                <p className="text-sm text-destructive">
                  {errors.chapter_number.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price_idr">Harga (IDR)</Label>
              <Input
                id="price_idr"
                type="number"
                disabled={isFree}
                {...register('price_idr')}
                aria-invalid={!!errors.price_idr}
              />
              {errors.price_idr && (
                <p className="text-sm text-destructive">
                  {errors.price_idr.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="release_date">Tanggal Rilis (opsional)</Label>
              <Input
                id="release_date"
                type="date"
                {...register('release_date')}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_free"
                type="checkbox"
                {...register('is_free')}
                className="size-4 accent-primary"
              />
              <Label htmlFor="is_free">Jadikan gratis</Label>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pdf">File PDF (opsional, maks 50MB)</Label>
              <Input
                id="pdf"
                type="file"
                accept="application/pdf"
                {...register('pdf')}
              />
            </div>
            {serverError && (
              <div role="alert" className="text-sm text-destructive">
                {serverError}
              </div>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Bab'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <ChapterTable chapters={chapters} />
    </div>
  );
}
