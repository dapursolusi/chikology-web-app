import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
}

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

function formatPrice(chapter: ChapterRow): string {
  if (chapter.isFree) return 'Gratis';
  return idrFormatter.format(chapter.priceIdr);
}

function formatRelease(chapter: ChapterRow): string {
  return chapter.releaseDate ?? 'Belum dijadwalkan';
}

export function ChapterTable({ chapters }: ChapterTableProps) {
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {chapters.map((chapter) => (
          <TableRow key={chapter.id}>
            <TableCell className="font-medium">
              {chapter.chapterNumber}
            </TableCell>
            <TableCell>{chapter.title}</TableCell>
            <TableCell>{formatPrice(chapter)}</TableCell>
            <TableCell>{formatRelease(chapter)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
