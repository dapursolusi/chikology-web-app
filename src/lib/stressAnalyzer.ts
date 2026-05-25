type Emotions = {
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  surprised: number;
  neutral: number;
  disgusted: number;
};

type StressTier = 1 | 2 | 3 | 4 | 5;

const recommendations: Record<StressTier, string[]> = {
  1: [
    'Pertahankan kondisi positifmu! Coba meditasi singkat 5 menit untuk menjaga ketenangan.',
    'Kondisi mentalmu sangat baik. Saatnya melakukan hal produktif yang kamu sukai!',
    'Kamu dalam kondisi prima. Ajak teman ngobrol atau jalan-jalan sebentar.',
  ],
  2: [
    'Suasana hatimu cukup baik. Jurnal rasa syukur bisa membantu mempertahankan energi positif.',
    'Coba lakukan peregangan ringan atau jalan kaki 10 menit untuk menjaga mood.',
    'Dengarkan musik favoritmu untuk mempertahankan suasana hati yang baik.',
  ],
  3: [
    'Kamu merasa netral. Coba tulis 3 hal yang kamu syukuri hari ini.',
    'Luangkan waktu 5 menit untuk tarik napas dalam-dalam dan rileks.',
    'Minum air putih dan istirahat sejenak dari layar. Tubuhmu butuh jeda.',
  ],
  4: [
    'Kamu terlihat cukup stres. Coba teknik pernapasan 4-7-8: tarik napas 4 detik, tahan 7 detik, hembuskan 8 detik.',
    'Jalan-jalan sebentar di luar ruangan bisa membantu menjernihkan pikiran.',
    'Tulis apa yang mengganggumu di jurnal. Mengeluarkan isi pikiran bisa mengurangi beban.',
  ],
  5: [
    'Kamu sangat stres. Prioritas utama: tarik napas. Coba teknik grounding 5-4-3-2-1: sebut 5 hal yang kamu lihat, 4 yang kamu sentuh, 3 yang kamu dengar, 2 yang kamu cium, 1 yang kamu rasa.',
    'Jangan ragu untuk istirahat total. Matikan notifikasi dan luangkan waktu untuk diri sendiri.',
    'Jika stres terasa berat, hubungi teman dekat atau profesional kesehatan mental.',
  ],
};

export function mapEmotionsToStress(emotions: Emotions): StressTier {
  const { happy, sad, angry, fearful, neutral } = emotions;

  const positiveSignal = happy + neutral;
  const negativeSignal = sad + angry + fearful;

  if (positiveSignal > 0.8) return 1;
  if (positiveSignal > 0.6 && negativeSignal < 0.2) return 2;
  if (negativeSignal < 0.4) return 3;
  if (negativeSignal < 0.7) return 4;
  return 5;
}

export function mapToMood(
  tier: StressTier
): 'very_calm' | 'calm' | 'neutral' | 'stressed' | 'very_stressed' {
  const moodMap: Record<
    StressTier,
    'very_calm' | 'calm' | 'neutral' | 'stressed' | 'very_stressed'
  > = {
    1: 'very_calm',
    2: 'calm',
    3: 'neutral',
    4: 'stressed',
    5: 'very_stressed',
  };
  return moodMap[tier];
}

export function getRandomRecommendation(tier: StressTier): string {
  const options = recommendations[tier];
  return options[Math.floor(Math.random() * options.length)];
}
