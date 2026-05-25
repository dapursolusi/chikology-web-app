'use client';

import { useCallback, useRef, useState } from 'react';

import Webcam from 'react-webcam';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Face Scanner</CardTitle>
        <CardDescription>
          Deteksi ekspresi wajah untuk analisis mood
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {!cameraActive ? (
          <Button onClick={startCamera} size="lg">
            Mulai Kamera
          </Button>
        ) : (
          <div className="relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user',
              }}
              className="rounded-lg border"
              mirrored
            />
          </div>
        )}

        {cameraActive && !result && (
          <div className="flex flex-col items-center gap-2">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={analyzeFace} disabled={isAnalyzing} size="lg">
              {isAnalyzing ? 'Menganalisis...' : 'Analisis Wajah'}
            </Button>
          </div>
        )}

        {result && (
          <div className="w-full overflow-hidden rounded-lg border">
            <div
              className="h-2 w-full"
              style={{ backgroundColor: result.color }}
            />
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{result.emoji}</span>
                <div>
                  <p className="text-lg font-semibold">Tingkat {result.tier}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.label}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Pesan dari Chikology:</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {result.message}
                </p>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p className="mb-1 text-xs font-medium">Intervensi:</p>
                <p className="text-sm">{result.intervention}</p>
              </div>
              <Button onClick={resetAnalysis} variant="outline" size="sm">
                Analisis Ulang
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
