'use server';

import { db } from '@/db';
import { journalEntries } from '@/db/schema';
import { and, desc, eq, gte, isNull, sql } from 'drizzle-orm';

import { createClient } from '@/lib/supabase/server';

const MOOD_NUMERIC: Record<string, number> = {
  very_calm: 1,
  calm: 2,
  neutral: 3,
  stressed: 4,
  very_stressed: 5,
};

export interface DashboardStats {
  journalCount: number;
  avgMood: number | null;
  weekChange: string | null;
}

export interface RecentActivityItem {
  title: string;
  description: string;
  time: string;
  icon: 'Calendar' | 'Sparkles';
  color: 'text-primary' | 'text-secondary-foreground';
}

export interface DayMood {
  day: string;
  emoji: string;
  mood: number | null;
  hasEntry: boolean;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { journalCount: 0, avgMood: null, weekChange: null };
  }

  const weekStart = getWeekStart();
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const [thisWeek, prevWeek] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)::int`,
        avgTier: sql<number>`coalesce(avg(${journalEntries.stressTier})::numeric, 0)`,
      })
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, user.id),
          gte(journalEntries.createdAt, weekStart)
        )
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, user.id),
          gte(journalEntries.createdAt, prevWeekStart)
        )
      ),
  ]);

  const change = thisWeek[0].count - prevWeek[0].count;

  return {
    journalCount: thisWeek[0].count,
    avgMood: Number(thisWeek[0].avgTier) || null,
    weekChange:
      change > 0
        ? `+${change} dari minggu lalu`
        : change < 0
          ? `${change} dari minggu lalu`
          : 'Sama seperti minggu lalu',
  };
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const entries = await db
    .select({
      content: journalEntries.content,
      recommendation: journalEntries.recommendation,
      mood: journalEntries.mood,
      createdAt: journalEntries.createdAt,
    })
    .from(journalEntries)
    .where(
      and(eq(journalEntries.userId, user.id), isNull(journalEntries.deletedAt))
    )
    .orderBy(desc(journalEntries.createdAt))
    .limit(5);

  return entries.map((entry) => ({
    title: entry.content ? 'Jurnal baru ditambahkan' : 'Deteksi mood selesai',
    description: entry.content ?? entry.recommendation ?? 'Analisis Harian',
    time: formatTimeAgo(entry.createdAt),
    icon: entry.content ? 'Calendar' : 'Sparkles',
    color: entry.content ? 'text-primary' : 'text-secondary-foreground',
  }));
}

export async function getWeekMoods(): Promise<DayMood[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const moodEmojis: Record<string, string> = {
    very_calm: '😌',
    calm: '😊',
    neutral: '😐',
    stressed: '😟',
    very_stressed: '😰',
  };

  const result: DayMood[] = dayNames.map((day) => ({
    day,
    emoji: moodEmojis.neutral,
    mood: null,
    hasEntry: false,
  }));

  if (!user) return result;

  const entries = await db
    .select({
      mood: journalEntries.mood,
      createdAt: journalEntries.createdAt,
    })
    .from(journalEntries)
    .where(
      and(eq(journalEntries.userId, user.id), isNull(journalEntries.deletedAt))
    )
    .orderBy(desc(journalEntries.createdAt));

  const entriesByDay = new Map<number, typeof entries>();
  for (const entry of entries) {
    const d = new Date(entry.createdAt);
    if (d >= weekStart && d < weekEnd) {
      const dayIndex = (d.getDay() + 6) % 7;
      if (!entriesByDay.has(dayIndex)) {
        entriesByDay.set(dayIndex, []);
      }
      entriesByDay.get(dayIndex)!.push(entry);
    }
  }

  for (const [dayIndex, dayEntries] of entriesByDay) {
    if (dayEntries.length > 0) {
      const moods = dayEntries
        .map((e) => (e.mood ? MOOD_NUMERIC[e.mood] : null))
        .filter((m): m is number => m !== null);
      const avgMood =
        moods.length > 0
          ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length)
          : null;
      result[dayIndex] = {
        day: dayNames[dayIndex],
        emoji: avgMood
          ? (Object.entries(MOOD_NUMERIC).find(([, v]) => v === avgMood)?.[0] ??
            'neutral')
          : 'neutral',
        mood: avgMood,
        hasEntry: true,
      };
    }
  }

  return result;
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}
