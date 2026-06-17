export type QuestionType = 'multi' | 'single';

export interface Question {
  id: string;
  text: string;
  options: string[];
  type: QuestionType;
}

export const questions: Question[] = [
  {
    id: 'q1',
    text: 'Apa yang membuat pikiranmu terasa berat hari ini? (bisa pilih lebih dari satu untuk menentukan tingkat stres)',
    options: [
      'Pekerjaan',
      'Keluarga (Pasangan, Anak, Orang Tua)',
      'Diri Sendiri',
      'Lingkungan (Tempat Kerja, Sosial, Berita, Pemerintah, dll',
    ],
    type: 'multi',
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
    ],
    type: 'single',
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
    ],
    type: 'single',
  },
];

export type QuestionnaireAnswers = Record<string, string | string[]>;
