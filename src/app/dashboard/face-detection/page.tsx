'use client';

import { useRef, useState } from 'react';

import { Camera, Lightbulb, Smile, Zap } from 'lucide-react';
import Webcam from 'react-webcam';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalysisResult {
  primaryEmotion: string;
  energyLevel: number;
  insight: string;
}

export default function FaceDetectionPage() {
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const captureAndAnalyze = async () => {
    if (!webcamRef.current) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error('Failed to capture image');

      const base64Data = imageSrc.split(',')[1];

      const apiResponse = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Data,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || `API error: ${apiResponse.status}`);
      }

      const parsedResult: AnalysisResult = await apiResponse.json();
      setResult(parsedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2">
      {/* Webcam section */}
      <div className="flex flex-col gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center gap-2">
              <Camera className="size-5 text-primary" />
              <CardTitle className="text-lg">Kamera</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="relative overflow-hidden rounded-xl border-2 border-border">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="h-auto w-full max-w-[300px]"
                width={300}
                height={400}
              />
            </div>
            <Button
              onClick={captureAndAnalyze}
              disabled={loading}
              size="lg"
              className="w-full max-w-[300px] gap-2"
            >
              {loading ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Camera className="size-4" />
                  Scan Wajah
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 text-center text-destructive text-sm">
              {error}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Result section */}
      <Card className="h-fit">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center gap-2">
            <Smile className="size-5 text-primary" />
            <CardTitle className="text-lg">Hasil Analisis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {result ? (
            <div className="space-y-6">
              {/* Primary emotion */}
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Smile className="size-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Emosi Utama
                  </h4>
                  <p className="text-2xl font-bold text-foreground">
                    {result.primaryEmotion}
                  </p>
                </div>
              </div>

              {/* Energy level */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Zap className="size-4" />
                    Level Energi
                  </h4>
                  <span className="text-lg font-semibold text-foreground">
                    {result.energyLevel}/10
                  </span>
                </div>
                <div className="w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${(result.energyLevel / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Insight */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Lightbulb className="size-5 text-secondary-foreground" />
                  <h4 className="font-medium text-foreground">Insight</h4>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  {result.insight}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Camera className="size-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Klik &quot;Scan Wajah&quot; untuk menganalisis mood kamu
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
