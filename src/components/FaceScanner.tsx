'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Webcam from 'react-webcam';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { getStressLevel, mapEmotionsToStress } from '@/lib/stressAnalyzer';

type ModelStatus = 'loading' | 'ready' | 'error';

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
  const [modelStatus, setModelStatus] = useState<ModelStatus>('loading');
  const [cameraActive, setCameraActive] = useState(false);
  const faceapiRef = useRef<Awaited<typeof import('face-api.js')> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [noFace, setNoFace] = useState(false);

  useEffect(() => {
    async function loadModels() {
      try {
        const faceapi = await import('face-api.js');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        console.warn('Models loaded ✓');
        faceapiRef.current = faceapi;
        setModelStatus('ready');
      } catch {
        console.error('Failed to load face-api models');
        setModelStatus('error');
      }
    }
    loadModels();
  }, []);

  const startCamera = useCallback(() => {
    setCameraActive(true);
  }, []);

  const analyzeFace = useCallback(async () => {
    const faceapi = faceapiRef.current;
    const video = webcamRef.current?.video;
    if (!faceapi || !video) return;

    setIsAnalyzing(true);
    setNoFace(false);
    setResult(null);

    try {
      const detection = await faceapi
        .detectSingleFace(video)
        .withFaceExpressions();

      if (!detection) {
        setNoFace(true);
        console.warn('No face detected');
        return;
      }

      const emotions = detection.expressions as unknown as Parameters<
        typeof mapEmotionsToStress
      >[0];
      console.warn('Raw emotions:', emotions);
      const tier = mapEmotionsToStress(emotions);
      console.warn('Stress tier:', tier);
      const level = getStressLevel(tier);
      console.warn('Recommendation:', level.intervention);

      setResult({
        tier,
        emoji: level.emoji,
        label: level.label,
        color: level.color,
        message: level.message,
        intervention: level.intervention,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      setNoFace(true);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setResult(null);
    setNoFace(false);
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
        {modelStatus === 'loading' && (
          <p className="text-sm text-muted-foreground">Memuat model AI...</p>
        )}
        {modelStatus === 'error' && (
          <p className="text-sm text-destructive">
            Gagal memuat model. Muat ulang halaman.
          </p>
        )}

        {!cameraActive ? (
          <Button
            onClick={startCamera}
            disabled={modelStatus !== 'ready'}
            size="lg"
          >
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

        {modelStatus === 'ready' && cameraActive && !result && (
          <div className="flex flex-col items-center gap-2">
            {noFace && (
              <p className="text-sm text-destructive">
                Tidak ada wajah terdeteksi. Pastikan wajah terlihat jelas di
                kamera.
              </p>
            )}
            <Button onClick={analyzeFace} disabled={isAnalyzing} size="lg">
              {isAnalyzing ? 'Menganalisis...' : 'Analisis Wajah'}
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <p className="text-sm text-muted-foreground">
            Menganalisis ekspresi wajah...
          </p>
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
