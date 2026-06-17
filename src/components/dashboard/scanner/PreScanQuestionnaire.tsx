'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { type QuestionnaireAnswers, questions } from './questionData';

interface PreScanQuestionnaireProps {
  onSubmit: (answers: QuestionnaireAnswers) => void;
}

export function PreScanQuestionnaire({ onSubmit }: PreScanQuestionnaireProps) {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
  const [skipModalOpen, setSkipModalOpen] = useState(false);

  const handleCheckboxChange = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const next = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [questionId]: next };
    });
  };

  const handleRadioChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option.includes('Lainnya') ? 'other:' : option,
    }));
  };

  const handleOtherTextChange = (questionId: string, text: string) => {
    setOtherTexts((prev) => ({ ...prev, [questionId]: text }));
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    if (question.type === 'multi') {
      setAnswers((prev) => {
        const current = (prev[questionId] as string[]) || [];
        const withoutOther = current.filter((v) => !v.startsWith('Lainnya'));
        if (text.trim()) {
          return {
            ...prev,
            [questionId]: [...withoutOther, `Lainnya: ${text}`],
          };
        }
        return { ...prev, [questionId]: withoutOther };
      });
    } else if (text) {
      setAnswers((prev) => ({ ...prev, [questionId]: `other:${text}` }));
    }
  };

  const handleOtherCheck = (questionId: string, checked: boolean) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    if (question.type === 'multi') {
      setAnswers((prev) => {
        const current = (prev[questionId] as string[]) || [];
        const withoutOther = current.filter((v) => !v.startsWith('Lainnya'));
        if (checked) {
          const text = otherTexts[questionId] || '';
          return {
            ...prev,
            [questionId]: text.trim()
              ? [...withoutOther, `Lainnya: ${text}`]
              : [...withoutOther, 'other:'],
          };
        }
        return { ...prev, [questionId]: withoutOther };
      });
    } else {
      if (checked) {
        setAnswers((prev) => ({ ...prev, [questionId]: 'other:' }));
      } else {
        setAnswers((prev) => {
          const next = { ...prev };
          delete next[questionId];
          return next;
        });
      }
    }
  };

  const isOtherSelected = (questionId: string) => {
    const answer = answers[questionId];
    if (!answer) return false;
    if (Array.isArray(answer)) {
      return answer.some((v) => v.startsWith('Lainnya') || v === 'other:');
    }
    return answer.startsWith('other:');
  };

  const isOtherTextValid = (questionId: string) => {
    return otherTexts[questionId]?.trim().length > 0;
  };

  const handleSubmit = () => {
    const cleaned: QuestionnaireAnswers = {};
    for (const [key, value] of Object.entries(answers)) {
      if (Array.isArray(value)) {
        const filtered = value.filter((v) => v !== 'other:');
        if (filtered.length > 0) cleaned[key] = filtered;
      } else if (value && !value.startsWith('other:')) {
        cleaned[key] = value;
      }
    }
    onSubmit(cleaned);
  };

  const handleSkipConfirm = () => {
    setSkipModalOpen(false);
    onSubmit({});
  };

  const isValid = questions.every((q) => {
    const answer = answers[q.id];
    if (!answer) return false;

    if (q.type === 'multi') {
      const arr = answer as string[];
      if (arr.length === 0) return false;
      if (arr.some((v) => v === 'other:')) {
        return isOtherTextValid(q.id);
      }
      return true;
    }

    if (typeof answer === 'string' && answer.startsWith('other:')) {
      return isOtherTextValid(q.id);
    }
    return true;
  });

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="space-y-3 rounded-lg border p-4">
            <p className="font-medium text-foreground">{question.text}</p>
            <div className="space-y-2">
              {question.options.map((option) => {
                const isMulti = question.type === 'multi';
                const answer = answers[question.id];
                const isSelected = isMulti
                  ? ((answer as string[]) || []).includes(option)
                  : answer === option;

                return (
                  <div key={option} className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type={isMulti ? 'checkbox' : 'radio'}
                        name={question.id}
                        value={option}
                        checked={isSelected}
                        onChange={() =>
                          isMulti
                            ? handleCheckboxChange(question.id, option)
                            : handleRadioChange(question.id, option)
                        }
                        className="accent-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  </div>
                );
              })}

              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type={question.type === 'multi' ? 'checkbox' : 'radio'}
                    name={question.id}
                    checked={isOtherSelected(question.id)}
                    onChange={(e) =>
                      handleOtherCheck(question.id, e.target.checked)
                    }
                    className="accent-primary"
                  />
                  <span className="text-sm">Lainnya...</span>
                </label>
                {isOtherSelected(question.id) && (
                  <textarea
                    placeholder="Lainnya..."
                    value={otherTexts[question.id] || ''}
                    onChange={(e) =>
                      handleOtherTextChange(question.id, e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={2}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          size="lg"
          className="flex-1"
        >
          Mulai Kamera
        </Button>
        <Button
          onClick={() => setSkipModalOpen(true)}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          Lewati
        </Button>
      </div>

      <Dialog open={skipModalOpen} onOpenChange={setSkipModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lewati pertanyaan?</DialogTitle>
            <DialogDescription>
              Menjawab beberapa pertanyaan ini dapat membantu kami menganalisis
              kamu dengan lebih akurat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSkipModalOpen(false)}>
              Kembali
            </Button>
            <Button onClick={handleSkipConfirm}>Lewati</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
