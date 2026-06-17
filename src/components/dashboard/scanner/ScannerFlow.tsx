'use client';

import { useCallback, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { saveQuestionnaireResponse } from '@/actions/questionnaire';
import type { StressLevel } from '@/data/stressLevels';

import FaceScanner from '@/components/dashboard/scanner/FaceScanner';
import { StressResultCard } from '@/components/dashboard/scanner/StressResultCard';
import { Button } from '@/components/ui/button';

import { PreScanQuestionnaire } from './PreScanQuestionnaire';
import type { QuestionnaireAnswers } from './questionData';

type FlowState = 'form' | 'consent' | 'camera' | 'result';

export function ScannerFlow() {
  const router = useRouter();
  const [flowState, setFlowState] = useState<FlowState>('form');
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<
    QuestionnaireAnswers | undefined
  >(undefined);
  const [result, setResult] = useState<StressLevel | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [, startFormTransition] = useTransition();

  const handleQuestionnaireSubmit = useCallback(
    (answers: QuestionnaireAnswers) => {
      startFormTransition(async () => {
        await saveQuestionnaireResponse({ answers });
        setQuestionnaireAnswers(answers);
        setFlowState('consent');
      });
    },
    []
  );

  const handleAnalysisResult = useCallback((analysisResult: StressLevel) => {
    setResult(analysisResult);
    setFlowState('result');
  }, []);

  const handleSave = useCallback(() => {
    if (!result) return;
    router.push(`/dashboard/journal?tier=${result.tier}`);
  }, [result, router]);

  const handleConsentConfirm = useCallback(() => {
    setFlowState('camera');
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setFlowState('camera');
  }, []);

  if (flowState === 'consent') {
    return (
      <div className="space-y-6 rounded-xl border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Persetujuan Privasi
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sebelum melanjutkan, kami perlu persetujuan Anda terkait pemrosesan
            data wajah.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-2 border-primary/30 bg-white accent-primary"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            aria-label="Saya setuju data wajah saya diproses untuk analisis stres dan tidak disimpan."
          />
          <span className="text-sm text-muted-foreground">
            Saya setuju data wajah saya diproses untuk analisis stres dan tidak
            disimpan.
          </span>
        </label>

        <Button
          onClick={handleConsentConfirm}
          disabled={!consentChecked}
          className="w-full"
        >
          Lanjutkan
        </Button>
      </div>
    );
  }

  if (flowState === 'result' && result) {
    return (
      <StressResultCard
        result={result}
        onSave={handleSave}
        onReset={handleReset}
      />
    );
  }

  if (flowState === 'camera') {
    return (
      <FaceScanner
        questionnaireAnswers={questionnaireAnswers}
        onResult={handleAnalysisResult}
      />
    );
  }

  return <PreScanQuestionnaire onSubmit={handleQuestionnaireSubmit} />;
}
