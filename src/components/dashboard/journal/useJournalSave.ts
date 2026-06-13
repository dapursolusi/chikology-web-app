'use client';

import {
  type Dispatch,
  type SetStateAction,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { type Mood as MoodType, saveJournalEntry } from '@/actions/journal';
import {
  MOOD_MAP,
  type Mood,
  type StressTier,
  stressLevels,
} from '@/data/stressLevels';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  mood: Mood | null;
  content: string | null;
  stressTier: number | null;
  recommendation: string | null;
  createdAt: Date;
}

interface UseJournalSaveOptions {
  entries: JournalEntry[];
  tier?: StressTier | null;
}

type ActionState =
  | { success: true; entryId: string }
  | { error: string }
  | null;

interface UseJournalSaveReturn {
  mood: MoodType | undefined;
  setMood: (mood: MoodType) => void;
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  entries: JournalEntry[];
  formAction: (formData: FormData) => void;
  isPending: boolean;
  error: string | null;
  moodRef: React.RefObject<HTMLInputElement | null>;
  hasTier: boolean;
}

export function useJournalSave({
  entries,
  tier,
}: UseJournalSaveOptions): UseJournalSaveReturn {
  const router = useRouter();
  const hasTier = tier !== null;

  const defaultMood: MoodType | undefined =
    hasTier && tier ? (MOOD_MAP[tier] as MoodType) : undefined;

  const [mood, setMoodState] = useState<MoodType | undefined>(defaultMood);
  const [content, setContent] = useState('');
  const [localEntries, setLocalEntries] = useState(entries);
  const moodRef = useRef<HTMLInputElement>(null);
  const lastSavedIdRef = useRef<string | null>(null);

  // Toast scan-forwarding message + seed hidden input with default mood
  useEffect(() => {
    if (hasTier) {
      toast.success('Hasil scan telah diteruskan ke jurnal.');
    }
    if (defaultMood && moodRef.current) {
      moodRef.current.value = defaultMood;
    }
  }, [hasTier, defaultMood]);

  // Sync local entries with fresh server data after router.refresh()
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalEntries(entries);
  }, [entries]);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    (_state, formData) => {
      const moodValue = formData.get('mood') as MoodType | null;
      if (!moodValue) return { error: 'Mood wajib dipilih' };
      return saveJournalEntry({
        mood: moodValue,
        content: content || undefined,
        stressTier: tier ?? undefined,
        recommendation: tier ? stressLevels[tier].messages[0] : undefined,
      });
    },
    null
  );

  // Handle successful save: toast, optimistic update, then refresh server data
  useEffect(() => {
    if (
      state &&
      'success' in state &&
      state.entryId !== lastSavedIdRef.current
    ) {
      const newId = state.entryId;
      lastSavedIdRef.current = newId;

      toast.success('Jurnal berhasil disimpan!');
      setContent('');

      // Optimistically prepend the saved entry
      const savedEntry = entries.find((e) => e.id === newId);
      if (savedEntry) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalEntries((prev) => [savedEntry, ...prev]);
      } else {
        setLocalEntries((prev) => {
          const newEntry: JournalEntry = {
            id: newId,
            mood: mood ?? null,
            content: content || null,
            stressTier: tier ?? null,
            recommendation: tier ? stressLevels[tier].messages[0] : null,
            createdAt: new Date(),
          };
          return [newEntry, ...prev];
        });
      }

      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function setMood(newMood: MoodType) {
    setMoodState(newMood);
    if (moodRef.current) {
      moodRef.current.value = newMood;
    }
  }

  return {
    mood,
    setMood,
    content,
    setContent,
    entries: localEntries,
    formAction,
    isPending,
    error: state && 'error' in state ? state.error : null,
    moodRef,
    hasTier,
  };
}
