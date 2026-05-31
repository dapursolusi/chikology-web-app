'use client';

import { useState } from 'react';

import FaceScanner from '@/components/FaceScanner';

import { PreScanQuestionnaire } from './PreScanQuestionnaire';

type FlowState = 'form' | 'camera';

export function ScannerFlow() {
  const [flowState, setFlowState] = useState<FlowState>('form');
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<
    Record<string, string> | undefined
  >(undefined);

  const handleQuestionnaireSubmit = (answers: Record<string, string>) => {
    setQuestionnaireAnswers(answers);
    setFlowState('camera');
  };

  if (flowState === 'camera') {
    return <FaceScanner questionnaireAnswers={questionnaireAnswers} />;
  }

  return <PreScanQuestionnaire onSubmit={handleQuestionnaireSubmit} />;
}
