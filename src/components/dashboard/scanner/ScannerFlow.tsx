'use client';

import { useState, useTransition } from 'react';

import { saveQuestionnaireResponse } from '@/actions/questionnaire';

import FaceScanner from '@/components/FaceScanner';

import { PreScanQuestionnaire } from './PreScanQuestionnaire';

type FlowState = 'form' | 'camera';

export function ScannerFlow() {
  const [flowState, setFlowState] = useState<FlowState>('form');
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<
    Record<string, string> | undefined
  >(undefined);
  const [, startTransition] = useTransition();

  const handleQuestionnaireSubmit = (answers: Record<string, string>) => {
    startTransition(async () => {
      await saveQuestionnaireResponse({ answers });
      setQuestionnaireAnswers(answers);
      setFlowState('camera');
    });
  };

  if (flowState === 'camera') {
    return <FaceScanner questionnaireAnswers={questionnaireAnswers} />;
  }

  return <PreScanQuestionnaire onSubmit={handleQuestionnaireSubmit} />;
}
