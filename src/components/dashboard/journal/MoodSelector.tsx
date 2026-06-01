'use client';

import { Mood } from '@/actions/journal';

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
    <div className="flex gap-3" role="radiogroup" aria-label="Pilih mood">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          role="radio"
          aria-label={`${mood.emoji} ${mood.label}`}
          onClick={() => onChange(mood.value)}
          className="flex flex-col items-center gap-0.5 rounded-lg px-1 pt-1 transition-all hover:scale-105 aria-checked:scale-105 aria-checked:ring-2 aria-checked:ring-primary aria-checked:ring-offset-2"
          aria-checked={value === mood.value}
          title={mood.label}
        >
          <span className="text-2xl leading-none">{mood.emoji}</span>
          <span className="text-[10px] font-medium leading-none text-muted-foreground">
            {mood.caption}
          </span>
        </button>
      ))}
    </div>
  );
}
