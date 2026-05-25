import Link from 'next/link';

import { ArrowRight, BookOpen, Calendar, Smile, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Page() {
  // Mock data for dashboard
  const stats = [
    {
      title: 'Jurnal minggu ini',
      value: '5',
      change: '+2 dari minggu lalu',
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Mood rata-rata',
      value: '4.2',
      change: 'Mulai meningkat',
      icon: Smile,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
  ];

  const recentActivity = [
    {
      title: 'Jurnal baru ditambahkan',
      description: 'Refleksi pagi tentang hari yang produktif',
      time: '2 jam lalu',
      icon: Calendar,
      color: 'text-primary',
    },
    {
      title: 'Deteksi mood selesai',
      description: 'Analisis Harian - Akurasi 94%',
      time: '5 jam lalu',
      icon: Sparkles,
      color: 'text-secondary-foreground',
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Berikut ringkasan perjalanan mental kamu.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
            {/* Decorative line */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-primary/50 to-secondary/50" />
          </Card>
        ))}
      </div>

      {/* Quick actions + activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick actions card */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Akses fitur favorit kamu dengan satu klik
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Link href="/dashboard/journal">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 border-2 hover:border-primary/20 hover:bg-primary/5"
                >
                  <Calendar className="size-6 text-primary" />
                  <span className="text-sm font-medium">Tulis Jurnal</span>
                </Button>
              </Link>
              <Link href="/dashboard/scanner">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 border-2 hover:border-primary/20 hover:bg-primary/5"
                >
                  <Sparkles className="size-6 text-secondary-foreground" />
                  <span className="text-sm font-medium">Deteksi Mood</span>
                </Button>
              </Link>
              <Link href="/dashboard/journal">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 border-2 hover:border-primary/20 hover:bg-primary/5"
                >
                  <BookOpen className="size-6 text-secondary-foreground" />
                  <span className="text-sm font-medium">Jurnal</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Riwayat aktivitas kamu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="rounded-full p-2 bg-muted">
                    <activity.icon className={`size-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood tracking preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Minggu Ini</CardTitle>
              <CardDescription>Ringkasan mood harian kamu</CardDescription>
            </div>
            <Link href="/dashboard/journal">
              <Button variant="ghost" size="sm" className="gap-1">
                Lihat semua
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around py-4">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, i) => {
              const moods = ['😊', '😌', '😐', '🙂', '😔', '😊', '😄'];
              const isActive = i === 5 || i === 6;
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <span
                    className="text-2xl"
                    role="img"
                    aria-label={`Mood: ${moods[i]}`}
                  >
                    {moods[i]}
                  </span>
                  {isActive && (
                    <div className="h-1 w-1 rounded-full bg-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
