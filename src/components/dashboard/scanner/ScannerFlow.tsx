'use client';

import { useCallback, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { saveQuestionnaireResponse } from '@/actions/questionnaire';
import type { StressLevel } from '@/data/stressLevels';

import FaceScanner from '@/components/dashboard/scanner/FaceScanner';
import { StressResultCard } from '@/components/dashboard/scanner/StressResultCard';

import { PreScanQuestionnaire } from './PreScanQuestionnaire';

type FlowState = 'form' | 'camera' | 'result';

export function ScannerFlow() {
  const router = useRouter();
  const [flowState, setFlowState] = useState<FlowState>('form');
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<
    Record<string, string> | undefined
  >(undefined);
  const [result, setResult] = useState<StressLevel | null>(null);
  const [, startFormTransition] = useTransition();

  const handleQuestionnaireSubmit = useCallback(
    (answers: Record<string, string>) => {
      startFormTransition(async () => {
        await saveQuestionnaireResponse({ answers });
        setQuestionnaireAnswers(answers);
        setFlowState('camera');
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

  const handleReset = useCallback(() => {
    setResult(null);
    setFlowState('camera');
  }, []);

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
