import Link from 'next/link';

import {
  getDashboardStats,
  getRecentActivity,
  getWeekMoods,
} from '@/actions/dashboard';
import { ArrowRight, BookOpen, Calendar, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  Smile: Sparkles,
  Sparkles,
  BookOpen,
};

export default async function Page() {
  const [stats, recentActivity, weekMoods] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getWeekMoods(),
  ]);

  const journalCount = stats.journalCount ?? 0;
  const avgMood = stats.avgMood;

  const moodLabel =
    avgMood !== null
      ? avgMood <= 1.5
        ? 'Sangat tenang'
        : avgMood <= 2.5
          ? 'Tenang'
          : avgMood <= 3.5
            ? 'Netral'
            : avgMood <= 4.5
              ? 'Tertekan'
              : 'Sangat tertekan'
      : 'Belum ada data';

  const cards = [
    {
      title: 'Jurnal minggu ini',
      value: String(journalCount),
      change: stats.weekChange ?? '—',
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Mood rata-rata',
      value: avgMood !== null ? avgMood.toFixed(1) : '—',
      change: avgMood !== null ? moodLabel : 'Mulai lacak moodmu',
      icon: Sparkles,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Rata-rata stres',
      value: avgMood !== null ? String(Math.round(avgMood)) : '—',
      change: avgMood !== null ? 'Tingkat stres mingguan' : 'Belum ada data',
      icon: Calendar,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
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
        {cards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
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
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada aktivitas. Mulai dengan menulis jurnal atau deteksi
                mood.
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const IconComponent = ICONS[activity.icon];
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="rounded-full bg-muted p-2">
                        {IconComponent && (
                          <IconComponent
                            className={`size-4 ${activity.color}`}
                          />
                        )}
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
                  );
                })}
              </div>
            )}
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
            {weekMoods.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">{day.day}</span>
                <span
                  className="text-2xl opacity-60"
                  role="img"
                  aria-label={`Mood: ${day.emoji}`}
                >
                  {day.emoji}
                </span>
                {day.hasEntry && (
                  <div className="h-1 w-1 rounded-full bg-primary" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
