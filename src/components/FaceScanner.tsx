'use client';

import { useCallback, useRef, useState, useTransition } from 'react';

import { saveJournalEntry } from '@/actions/journal';
import { LoaderCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import { toast } from 'sonner';

import { StressResultCard } from '@/components/dashboard/scanner/StressResultCard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { getStressLevel } from '@/lib/stressAnalyzer';

type AnalysisResult = {
  tier: 1 | 2 | 3 | 4 | 5;
  emoji: string;
  label: string;
  color: string;
  message: string;
  intervention: string;
  ciri: string;
  risiko: string;
};

export default function FaceScanner() {
  const webcamRef = useRef<Webcam>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(() => {
    setCameraActive(true);
  }, []);

  const analyzeFace = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      let video = webcamRef.current?.video ?? null;
      if (!video || video.readyState < 2) {
        for (let i = 0; i < 10; i++) {
          await new Promise((r) => setTimeout(r, 500));
          video = webcamRef.current?.video ?? null;
          if (video && video.readyState >= 2) break;
        }
      }

      if (!video) {
        setError('Gagal mengakses kamera');
        return;
      }

      const screenshot = webcamRef.current?.getScreenshot();
      if (!screenshot) {
        setError('Gagal mengambil gambar');
        return;
      }

      const img = new Image();
      img.src = screenshot;
      await new Promise((r) => {
        img.onload = r;
      });

      const cropRatio = 0.7;
      const cropW = img.width * cropRatio;
      const cropH = img.height * cropRatio;
      const cropX = (img.width - cropW) / 2;
      const cropY = (img.height - cropH) / 2;

      const c = document.createElement('canvas');
      c.width = cropW;
      c.height = cropH;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      const cropped = c.toDataURL('image/jpeg', 0.95);

      const base64 = cropped.replace(/^data:image\/\w+;base64,/, '');

      const response = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) {
        const err = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        setError(err.error || 'Gagal mendapatkan respons');
        return;
      }

      const data = await response.json();

      if (!data.tier || data.tier < 1 || data.tier > 5) {
        setError('Gagal mendapatkan respons');
        return;
      }

      const tier = data.tier as 1 | 2 | 3 | 4 | 5;
      const level = getStressLevel(tier);
      console.warn('Analysis tier:', tier);

      setResult({
        tier,
        emoji: level.emoji,
        label: level.label,
        color: level.color,
        message: level.messages[0],
        intervention: level.intervention,
        ciri: level.ciri,
        risiko: level.risiko,
      });
    } catch {
      setError('Gagal mendapatkan respons');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const [isSaving, startSaveTransition] = useTransition();

  const handleSave = useCallback(() => {
    if (!result) return;
    startSaveTransition(async () => {
      const res = await saveJournalEntry({
        stressTier: result.tier,
        recommendation: result.intervention,
      });
      if (res.success) {
        toast.success('Tersimpan ke jurnal!');
      } else {
        toast.error(res.error ?? 'Gagal menyimpan');
      }
    });
  }, [result]);

  return (
    <Card className="mx-0 w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Face Scanner</CardTitle>
        <CardDescription>
          Deteksi ekspresi wajah untuk analisis mood
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {!cameraActive ? (
          <Button onClick={startCamera} size="lg" className="min-w-[200px]">
            Mulai Kamera
          </Button>
        ) : (
          <div className="relative w-full max-w-[640px] overflow-hidden rounded-xl border">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user',
              }}
              className="block w-full"
              mirrored
            />
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
          </div>
        )}

        {cameraActive && !result && (
          <div className="flex w-full flex-col items-center gap-3">
            {error && (
              <div className="w-full rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              onClick={analyzeFace}
              disabled={isAnalyzing}
              size="lg"
              className="min-w-[200px]"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="size-5 animate-spin" />
                  Menganalisis...
                </span>
              ) : (
                'Analisis Wajah'
              )}
            </Button>
          </div>
        )}

        {result && (
          <StressResultCard
            result={result}
            onSave={handleSave}
            onReset={resetAnalysis}
            isSaving={isSaving}
          />
        )}
      </CardContent>
    </Card>
  );
}
