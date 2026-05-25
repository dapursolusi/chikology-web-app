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

type ModelStatus = 'loading' | 'ready' | 'error';

export default function FaceScanner() {
  const webcamRef = useRef<Webcam>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>('loading');
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    async function loadModels() {
      try {
        const faceapi = await import('face-api.js');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        console.warn('Models loaded ✓');
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

        {modelStatus === 'ready' && cameraActive && (
          <p className="text-xs text-muted-foreground">
            Kamera aktif. Wajah terlihat di layar ✓
          </p>
        )}
      </CardContent>
    </Card>
  );
}
