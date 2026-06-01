import {
  Emotions,
  MOOD_MAP,
  Mood,
  StressLevel,
  StressTier,
  stressLevels,
} from '@/data/stressLevels';

export function mapEmotionsToStress(emotions: Emotions): StressTier {
  const { happy, sad, angry, fearful, neutral } = emotions;

  const positiveSignal = happy + neutral;
  const negativeSignal = sad + angry + fearful;

  if (positiveSignal > 0.8) return 1;
  if (positiveSignal > 0.6 && negativeSignal < 0.2) return 2;
  if (negativeSignal < 0.4) return 3;
  if (negativeSignal < 0.7) return 4;
  return 5;
}

export function getStressLevel(tier: StressTier): StressLevel {
  return stressLevels[tier];
}

export function mapToMood(tier: StressTier): Mood {
  return MOOD_MAP[tier];
}
