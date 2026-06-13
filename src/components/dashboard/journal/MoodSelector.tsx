'use client';

import { type Mood } from '@/data/stressLevels';

interface MoodSelectorProps {
  value?: Mood;
  onChange: (mood: Mood) => void;
}

const MOODS: { value: Mood; emoji: string; label: string; caption: string }[] =
  [
    {
      value: 'very_calm',
      emoji: '😌',
      label: 'Sangat tenang',
      caption: 'Sangat Tenang',
    },
    { value: 'calm', emoji: '😊', label: 'Tenang', caption: 'Tenang' },
    { value: 'neutral', emoji: '😐', label: 'Netral', caption: 'Netral' },
    { value: 'stressed', emoji: '😟', label: 'Tertekan', caption: 'Tertekan' },
    {
      value: 'very_stressed',
      emoji: '😰',
      label: 'Sangat tertekan',
      caption: 'Sangat Tertekan',
    },
  ];

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div
      className="grid grid-cols-5 gap-2"
      role="radiogroup"
      aria-label="Pilih mood"
    >
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          role="radio"
          aria-label={`${mood.emoji} ${mood.label}`}
          aria-checked={value === mood.value}
          onClick={() => onChange(mood.value)}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl p-2 transition-all duration-150 select-none active:scale-95 ${
            value === mood.value
              ? 'bg-primary/10 ring-2 ring-primary shadow-sm'
              : 'bg-muted/50 hover:bg-muted'
          }`}
          title={mood.label}
        >
          <span className="text-xl leading-none">{mood.emoji}</span>
          <span className="text-[11px] font-medium leading-tight text-muted-foreground text-center">
            {mood.caption}
          </span>
        </button>
      ))}
    </div>
  );
}
