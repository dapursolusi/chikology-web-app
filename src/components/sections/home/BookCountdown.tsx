'use client';

import { useEffect, useState } from 'react';

const LAUNCH_AT = new Date('2026-06-16T00:00:00+07:00').getTime();

function diff(nowMs: number) {
  const ms = Math.max(0, LAUNCH_AT - nowMs);
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60_000) % 60;
  const hours = Math.floor(ms / 3_600_000) % 24;
  const days = Math.floor(ms / 86_400_000);
  return { days, hours, minutes, seconds };
}

type Props = {
  size?: 'full' | 'compact';
  initialNow?: number;
  intervalMs?: number;
};

export function BookCountdown({
  size = 'full',
  initialNow,
  intervalMs = 1000,
}: Props) {
  const [now, setNow] = useState(() => initialNow ?? Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const { days, hours, minutes, seconds } = diff(now);
  const released = now >= LAUNCH_AT;

  if (size === 'compact') {
    return (
      <span
        data-testid="countdown-compact"
        className="text-xs text-muted-foreground px-3 pb-2"
      >
        {released
          ? 'Sudah rilis'
          : `${days} hari ${hours} jam ${minutes} menit`}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-medium text-foreground">
        Rilis 16 Juni 2026
      </p>
      {released ? (
        <p className="text-lg font-semibold text-primary">Sudah rilis</p>
      ) : (
        <div className="flex justify-center gap-4">
          <Unit testId="countdown-days" value={days} label="hari" />
          <Unit testId="countdown-hours" value={hours} label="jam" />
          <Unit testId="countdown-minutes" value={minutes} label="menit" />
          <Unit testId="countdown-seconds" value={seconds} label="detik" />
        </div>
      )}
    </div>
  );
}

function Unit({
  testId,
  value,
  label,
}: {
  testId: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex min-w-16 flex-col items-center rounded-xl border-2 border-border bg-card px-3 py-2">
      <span
        data-testid={testId}
        className="text-2xl font-bold tabular-nums text-primary"
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
