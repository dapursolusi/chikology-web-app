'use client';

import { useCallback, useState, useTransition } from 'react';

import { saveJournalEntry } from '@/actions/journal';
import { saveQuestionnaireResponse } from '@/actions/questionnaire';
import { MOOD_MAP } from '@/data/stressLevels';
import type { StressLevel } from '@/data/stressLevels';
import { toast } from 'sonner';

import FaceScanner from '@/components/FaceScanner';
import { StressResultCard } from '@/components/dashboard/scanner/StressResultCard';

import { PreScanQuestionnaire } from './PreScanQuestionnaire';

type FlowState = 'form' | 'camera' | 'result';

export function ScannerFlow() {
  const [flowState, setFlowState] = useState<FlowState>('form');
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<
    Record<string, string> | undefined
  >(undefined);
  const [result, setResult] = useState<StressLevel | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
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
    startSaveTransition(async () => {
      const res = await saveJournalEntry({
        mood: MOOD_MAP[result.tier],
        stressTier: result.tier,
        recommendation: result.interventions.map((i) => i.title).join(', '),
      });
      if ('success' in res && res.success) {
        toast.success('Tersimpan ke jurnal!');
      } else if ('error' in res) {
        toast.error(res.error ?? 'Gagal menyimpan');
      }
    });
  }, [result]);

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
        isSaving={isSaving}
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
