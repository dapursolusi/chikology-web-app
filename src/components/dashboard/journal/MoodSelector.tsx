'use client';

import { Mood } from '@/actions/journal';

interface MoodSelectorProps {
  value?: Mood;
  onChange: (mood: Mood) => void;
}

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'very_calm', emoji: '😌', label: 'Sangat tenang' },
  { value: 'calm', emoji: '😊', label: 'Tenang' },
  { value: 'neutral', emoji: '😐', label: 'Netral' },
  { value: 'stressed', emoji: '😟', label: 'Tertekan' },
  { value: 'very_stressed', emoji: '😰', label: 'Sangat tertekan' },
];

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Pilih mood">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          role="radio"
          onClick={() => onChange(mood.value)}
          className="flex size-12 items-center justify-center rounded-lg text-2xl transition-all hover:scale-110 aria-checked:ring-2 aria-checked:ring-primary aria-checked:ring-offset-2"
          aria-checked={value === mood.value}
          title={mood.label}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  );
}
