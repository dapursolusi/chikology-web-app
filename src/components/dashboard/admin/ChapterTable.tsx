import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { idrFormatter } from '@/lib/currency';

export interface ChapterRow {
  id: string;
  title: string;
  chapterNumber: number;
  priceIdr: number;
  releaseDate: string | null;
  isFree: boolean;
  pdfPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ChapterTableProps {
  chapters: ChapterRow[];
  onEdit?: (chapter: ChapterRow) => void;
  onHide?: (chapter: ChapterRow) => void;
}

function formatPrice(chapter: ChapterRow): string {
  if (chapter.isFree) return 'Gratis';
  return idrFormatter.format(chapter.priceIdr);
}

function formatRelease(chapter: ChapterRow): string {
  return chapter.releaseDate ?? 'Belum dijadwalkan';
}

export function ChapterTable({ chapters, onEdit, onHide }: ChapterTableProps) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        Belum ada bab. Buat bab pertama menggunakan formulir di atas.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Judul</TableHead>
          <TableHead>Harga</TableHead>
          <TableHead>Rilis</TableHead>
          <TableHead className="w-48 text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {chapters.map((chapter) => (
          <ChapterRowItem
            key={chapter.id}
            chapter={chapter}
            onEdit={onEdit}
            onHide={onHide}
          />
        ))}
      </TableBody>
    </Table>
  );
}

interface ChapterRowItemProps {
  chapter: ChapterRow;
  onEdit?: (chapter: ChapterRow) => void;
  onHide?: (chapter: ChapterRow) => void;
}

function ChapterRowItem({ chapter, onEdit, onHide }: ChapterRowItemProps) {
  const [hideOpen, setHideOpen] = useState(false);
  const isScheduled = chapter.releaseDate !== null;

  return (
    <TableRow>
      <TableCell className="font-medium">{chapter.chapterNumber}</TableCell>
      <TableCell>{chapter.title}</TableCell>
      <TableCell>{formatPrice(chapter)}</TableCell>
      <TableCell>{formatRelease(chapter)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(chapter)}
            >
              Edit
            </Button>
          )}
          {onHide && isScheduled && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHideOpen(true)}
              >
                Sembunyikan
              </Button>
              <AlertDialog open={hideOpen} onOpenChange={setHideOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sembunyikan bab?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bab akan dikeluarkan dari daftar publik dan tidak lagi
                      memiliki tanggal rilis. Anda dapat menjadwalkannya kembali
                      nanti.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onHide(chapter);
                        setHideOpen(false);
                      }}
                    >
                      Sembunyikan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
