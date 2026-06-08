import { stressLevels } from '@/data/stressLevels';
import type Webcam from 'react-webcam';

import { cropImage } from './crop';

export class CameraError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CameraError';
  }
}

export class AnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalysisError';
  }
}

export async function waitForVideoReady(
  video: HTMLVideoElement | null | undefined,
  timeoutMs = 5000
): Promise<HTMLVideoElement> {
  if (video && video.readyState >= 2) return video;

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 500));
    if (video && video.readyState >= 2) return video;
  }

  throw new CameraError('Gagal mengakses kamera');
}

export async function analyzeFace(
  webcamRef: React.RefObject<Webcam | null>,
  questionnaireAnswers?: Record<string, string>
): Promise<(typeof stressLevels)[1]> {
  const video = webcamRef.current?.video ?? null;
  await waitForVideoReady(video ?? undefined);

  const screenshot = webcamRef.current?.getScreenshot();
  if (!screenshot) throw new CameraError('Gagal mengambil gambar');

  const cropped = await cropImage(screenshot);

  const response = await fetch('/api/analyze-face', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: cropped,
      ...(questionnaireAnswers ? { questionnaire: questionnaireAnswers } : {}),
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new AnalysisError(err.error || 'Gagal mendapatkan respons');
  }

  const data = await response.json();

  if (!data.tier || data.tier < 1 || data.tier > 5) {
    throw new AnalysisError('Gagal mendapatkan respons');
  }

  const tier = Math.max(1, Math.min(5, Math.round(data.tier))) as
    | 1
    | 2
    | 3
    | 4
    | 5;
  const level = stressLevels[tier];
  const randomizedMessages = level.messages
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  return {
    tier,
    emoji: level.emoji,
    label: level.label,
    color: level.color,
    desc: level.desc,
    messages: randomizedMessages,
    interventions: level.interventions,
    signs: level.signs,
    risks: level.risks,
  };
}
