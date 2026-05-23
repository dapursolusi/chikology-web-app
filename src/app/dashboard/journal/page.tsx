'use client';

import { useState } from 'react';

import {
  Calendar as CalendarIcon,
  ChevronDown,
  Edit,
  Plus,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

// Mock journal data
const mockJournals = [
  {
    id: 1,
    date: '2026-04-28',
    mood: 'Bahagia',
    title: 'Mediasi pagi yang menyenangkan',
    content:
      'Memulai hari dengan 15 menit mediasi. Rasanya fokus dan tenang hari ini. Selesai semua tugas pagi sebelum pukul 9.',
    createdAt: '2026-04-28 09:15',
  },
  {
    id: 2,
    date: '2026-04-27',
    mood: 'Produktif',
    title: 'Capai milestone proyek',
    content:
      'Menyelesaikan implementasi fitur utama. Tim melakukan pekerjaan yang bagus. Deploy ke staging berhasil.',
    createdAt: '2026-04-27 17:30',
  },
  {
    id: 3,
    date: '2026-04-26',
    mood: 'Santai',
    title: 'Hari libur Minggu',
    content:
      'Luangkan waktu untuk membaca dan berjalan-jalan di luar. Tidak ada pekerjaan, hanya menikmati hari yang tenang.',
    createdAt: '2026-04-26 20:45',
  },
  {
    id: 4,
    date: '2026-04-25',
    mood: 'Fokus',
    title: 'Sesi kerja mendalam',
    content:
      '3 jam kerja tanpa gangguan. Mencapai kemajuan signifikan dalam optimasi algoritma.',
    createdAt: '2026-04-25 14:20',
  },
  {
    id: 5,
    date: '2026-04-24',
    mood: 'Lelah',
    title: 'Hari panjang bekerja',
    content: 'Pertukaran berturut-turut. Perlu istirahat dini malam ini.',
    createdAt: '2026-04-24 19:55',
  },
];

const moodOptions = [
  'Bahagia',
  'Tenang',
  'Produktif',
  'Energetik',
  'Fokus',
  'Motivasi',
  'Bersyukur',
  'Lelah',
  'Stres',
  'Cemas',
];

export default function JournalPage() {
  const [journals, setJournals] = useState(mockJournals);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [dateRange, setDateRange] = useState('all');
  const [formData, setFormData] = useState({
    mood: '',
    title: '',
    content: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newJournal = {
      id: journals.length + 1,
      date:
        selectedDate?.toISOString().split('T')[0] ||
        new Date().toISOString().split('T')[0],
      mood: formData.mood,
      title: formData.title,
      content: formData.content,
      createdAt: new Date().toLocaleString(),
    };

    setJournals([newJournal, ...journals]);
    setFormData({ mood: '', title: '', content: '' });
  };

  const deleteJournal = (id: number) => {
    setJournals(journals.filter((j) => j.id !== id));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jurnal</h1>
          <p className="text-muted-foreground">
            Catat pikiran dan pengalaman harian Anda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal Form Card */}
        <Card className="p-5 lg:sticky lg:top-6 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Entri Jurnal Baru</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <div className="border rounded-md p-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="mx-auto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">Suasana Hati</Label>
              <Select
                value={formData.mood}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, mood: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih suasana hati" />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map((mood) => (
                    <SelectItem key={mood} value={mood}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                name="title"
                placeholder="Apa yang ada di pikiran Anda?"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Isi</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Tuliskan pikiran Anda disini..."
                rows={5}
                value={formData.content}
                onChange={handleInputChange}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Simpan Entri
            </Button>
          </form>
        </Card>

        {/* Journal List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <h3 className="font-medium">
                  Filter berdasarkan rentang tanggal
                </h3>
              </div>
              <Select defaultValue="all" onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Pilih rentang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="week">Minggu Ini</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Desktop Table View */}
          <Card className="hidden md:block overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Tanggal</TableHead>
                  <TableHead className="w-[100px]">Suasana Hati</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead className="text-right w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journals.map((journal) => (
                  <TableRow key={journal.id} className="group">
                    <TableCell className="font-medium">
                      {journal.date}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs">
                        {journal.mood}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{journal.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {journal.content}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteJournal(journal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {journals.map((journal) => (
              <Card key={journal.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {journal.date}
                    </p>
                    <h4 className="font-medium">{journal.title}</h4>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs">
                    {journal.mood}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {journal.content}
                </p>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" className="h-8">
                    <Edit className="h-4 w-4 mr-1" />
                    Ubah
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-destructive"
                    onClick={() => deleteJournal(journal.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
