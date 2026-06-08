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

type Question = {
  id: string;
  text: string;
  options: string[];
};

const PLACEHOLDER_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Apa yang membuat pikiranmu terasa berat hari ini? (bisa pilih lebih dari satu untuk menentukan tingkat stres)',
    options: [
      'Pekerjaan',
      'Keluarga (Pasangan, Anak, Orang Tua)',
      'Diri Sendiri',
      'Lingkungan (Tempat Kerja, Sosial, Berita, Pemerintah, dll',
      'Lainnya...',
    ],
  },
  {
    id: 'q2',
    text: 'Apa yang kamu rasakan saat ini?',
    options: [
      'Senang',
      'Sedih',
      'Cemas',
      'Campur Aduk',
      'Tidak bisa merasakan apapun ',
      'Lainnya...',
    ],
  },
  {
    id: 'q3',
    text: 'Apa yang paling mengganggumu saat ini?',
    options: [
      'Ingatan masa lalu',
      'Ketakutan masa depan',
      'Tekanan dan ancaman dari seseorang',
      'Penilaian dari sosial',
      'Kesepian karena tidak ada support system',
      'Lainnya...',
    ],
  },
];

interface PreScanQuestionnaireProps {
  onSubmit: (answers: Record<string, string>) => void;
}

export function PreScanQuestionnaire({ onSubmit }: PreScanQuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
  const [skipModalOpen, setSkipModalOpen] = useState(false);

  const handleOptionChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option.includes('Lainnya') ? 'other:' : option,
    }));
  };

  const handleOtherTextChange = (questionId: string, text: string) => {
    setOtherTexts((prev) => ({ ...prev, [questionId]: text }));
    if (text) {
      setAnswers((prev) => ({ ...prev, [questionId]: `other:${text}` }));
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const handleSkipConfirm = () => {
    setSkipModalOpen(false);
    onSubmit({});
  };

  const isValid = PLACEHOLDER_QUESTIONS.every((q) => {
    const answer = answers[q.id];
    if (!answer) return false;
    if (answer.startsWith('other:')) {
      return otherTexts[q.id]?.trim().length > 0;
    }
    return true;
  });

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="space-y-4">
        {PLACEHOLDER_QUESTIONS.map((question) => (
          <div key={question.id} className="space-y-3 rounded-lg border p-4">
            <p className="font-medium text-foreground">{question.text}</p>
            <div className="space-y-2">
              {question.options.map((option) => {
                const isOther = option.includes('Lainnya');
                const currentAnswer = answers[question.id] || '';
                const isSelected = isOther
                  ? currentAnswer.startsWith('other:')
                  : currentAnswer === option;

                return (
                  <div key={option} className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleOptionChange(question.id, option)}
                        className="accent-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                    {isOther && isSelected && (
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
                );
              })}
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
