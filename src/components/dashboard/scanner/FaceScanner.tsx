'use client';

import { useCallback, useRef, useState } from 'react';

import type { StressLevel } from '@/data/stressLevels';
import { LoaderCircle } from 'lucide-react';
import Webcam from 'react-webcam';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  AnalysisError,
  CameraError,
  analyzeFace,
} from '@/lib/scanner/pipeline';

import type { QuestionnaireAnswers } from './questionData';

interface FaceScannerProps {
  questionnaireAnswers?: QuestionnaireAnswers;
  onResult: (result: StressLevel) => void;
}

export default function FaceScanner({
  questionnaireAnswers,
  onResult,
}: FaceScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(() => {
    setCameraActive(true);
  }, []);

  const analyzeFaceAction = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeFace(webcamRef, questionnaireAnswers);
      console.warn('Analysis tier:', result.tier);
      onResult(result);
    } catch (err) {
      if (err instanceof CameraError) {
        setError(err.message);
      } else if (err instanceof AnalysisError) {
        setError(err.message);
      } else {
        setError('Gagal mendapatkan respons');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [questionnaireAnswers, onResult]);

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

        {cameraActive && (
          <div className="flex w-full flex-col items-center gap-3">
            {error && (
              <div className="w-full rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              onClick={analyzeFaceAction}
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
      </CardContent>
    </Card>
  );
}
