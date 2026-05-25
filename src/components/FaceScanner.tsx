'use client';

import { useCallback, useRef, useState, useTransition } from 'react';

import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import Webcam from 'react-webcam';

import { saveJournalEntry } from '@/actions/journal';
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
};

const tierGradients: Record<number, string> = {
  1: 'from-[#22c55e]/10 to-[#22c55e]/5',
  2: 'from-[#84cc16]/10 to-[#84cc16]/5',
  3: 'from-[#eab308]/10 to-[#eab308]/5',
  4: 'from-[#ef4444]/10 to-[#ef4444]/5',
  5: 'from-[#b91c1c]/15 to-[#b91c1c]/5',
};

const tierBorders: Record<number, string> = {
  1: 'border-l-[#22c55e]',
  2: 'border-l-[#84cc16]',
  3: 'border-l-[#eab308]',
  4: 'border-l-[#ef4444]',
  5: 'border-l-[#b91c1c]',
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
        message: level.message,
        intervention: level.intervention,
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
    <Card className="mx-auto w-full max-w-2xl">
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
          <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="overflow-hidden rounded-xl border">
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: result.color }}
              />
              <div
                className={`space-y-4 bg-gradient-to-br p-5 ${tierGradients[result.tier]} border-l-4 ${tierBorders[result.tier]}`}
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/80 text-3xl shadow-sm ring-1 ring-black/5">
                    {result.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xl font-bold">Tingkat {result.tier}</p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: result.color }}
                    >
                      {result.label}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pesan dari Chikology
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {result.message}
                  </p>
                </div>

                <div className="rounded-lg bg-white/60 p-4 ring-1 ring-black/5">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Intervensi
                  </p>
                  <p className="text-sm">{result.intervention}</p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <LoaderCircle className="size-4 animate-spin" />
                        Menyimpan...
                      </span>
                    ) : (
                      'Simpan ke Jurnal'
                    )}
                  </Button>
                  <Button
                    onClick={resetAnalysis}
                    variant="outline"
                    className="flex-1"
                  >
                    Analisis Ulang
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
