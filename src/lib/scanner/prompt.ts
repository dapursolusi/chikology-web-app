import { stressLevels } from '@/data/stressLevels';
import type { StressTier } from '@/data/stressLevels';

import { questions } from '@/components/dashboard/scanner/questionData';
import type { QuestionnaireAnswers } from '@/components/dashboard/scanner/questionData';

const tierEntries = Object.values(stressLevels) as Array<
  (typeof stressLevels)[StressTier]
>;

const TIER_MARKERS =
  'TIER MARKERS:\n' +
  tierEntries
    .map(
      (level) =>
        `- Tier ${level.tier} (${level.label}): ${level.signs.join(', ')}`
    )
    .join('\n');

const REALITY_INSTRUCTION = `
REALITY INSTRUCTION:
Pengguna akan menunjukkan wajah netral/lurus di depan kamera. Jangan mencari ekspresi emosional yang jelas. Sebaliknya, cari MICRO-TENSION: kekakuan rahang, kompresi alis, pengerutan bibir, ketegangan mata, kekakuan leher. Wajah netral TIDAK berarti tier 3 — wajah netral tanpa ketegangan = tier 1.
`.trim();

const CONTEXT_WEIGHTING = `
CONTEXT WEIGHTING RULES:
- Questionnaire answers = PRIMARY signal (60%)
- Facial micro-tension = CONFIRMING signal (40%)
- Contradiction handling: jika wajah menunjukkan ketegangan tapi pengguna melaporkan suasana hati positif → percaya wajahnya, naikkan maksimal 1 tier. Jangan pernah menurunkan tier hanya berdasarkan kuesioner saja.
`.trim();

export function formatAnswers(answers: QuestionnaireAnswers): string {
  if (Object.keys(answers).length === 0) return '';

  const questionMap = new Map(questions.map((q) => [q.id, q.text]));

  const lines = Object.entries(answers).map(([key, value]) => {
    const label = questionMap.get(key) ?? key;
    const val = Array.isArray(value) ? value.join(', ') : value;
    return `${label}: ${val}`;
  });

  return lines.join('\n');
}

export function buildPrompt(answers?: QuestionnaireAnswers): string {
  const parts = [TIER_MARKERS, REALITY_INSTRUCTION, CONTEXT_WEIGHTING];

  if (answers && Object.keys(answers).length > 0) {
    const formatted = formatAnswers(answers);
    parts.push(`\n[Konteks Kuesioner]\n${formatted}`);
  }

  parts.push(
    '\nReturn JSON only: {"tier": <1-5>, "cues": "<short Indonesian description of observed tension>", "confidence": "high"|"medium"|"low"}'
  );

  return parts.join('\n\n');
}
