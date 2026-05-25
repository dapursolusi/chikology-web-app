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

const MOOD_MAP = {
  1: 'very_calm',
  2: 'calm',
  3: 'neutral',
  4: 'stressed',
  5: 'very_stressed',
} as const;

type Mood = (typeof MOOD_MAP)[keyof typeof MOOD_MAP];

type StressLevel = {
  tier: StressTier;
  label: string;
  emoji: string;
  color: string;
  message: string;
  intervention: string;
};

const stressLevels: Record<StressTier, StressLevel> = {
  1: {
    tier: 1,
    label: 'Relaxed / Low Stress',
    emoji: '😌',
    color: '#22c55e',
    message:
      'Hai, saat ini kamu sedang dalam keadaan baik, pertahankan. Stres yang ada di kamu saat ini bersifat eustress (stres positif) yang justru meningkatkan motivasi dan fokus. Empat saran di atas coba lakukan secara rutin agar stres yang kamu rasakan bisa diolah jadi kegiatan produktif. Kamu bisa sesuaikan waktunya dengan jam kerja dan aktivitas harian, jika belum mampu olahraga 30 menit, 15 menit juga boleh yang penting kamu happy melakukannya dan tidak menjadikan hal tersebut sebagai kewajiban atau paksaan. Tujuan utama dari aktivitas ini adalah agar stresmu tidak makin meningkat yang berpotensi jadi disfungsi terhadap aktivitas lainnya.',
    intervention:
      'Mindfulness Maintenance — Lakukan body scan ringan dan pernapasan 4-7-8 sebagai rutinitas harian (5-10 menit/hari)',
  },
  2: {
    tier: 2,
    label: 'Mild Stress (Alert / Tension)',
    emoji: '😊',
    color: '#84cc16',
    message:
      'Stresmu mulai naik, yuk mulai kembali ke diri sendiri. Kamu boleh merasa capek, penuh, bahkan seolah dunia sedang menekanmu saat ini. Tapi saya pengen ngajak kamu tetep sadar sama diri sendiri. Ngga butuh waktu lama kok untuk bisa kembali aware. Cukup tarik nafas sesuai arahan saya di atas, regangkan semua otot, dan mulai menulis tipis tentang apa yang kamu rasakan. Saya ga minta banyak waktumu, sediakan saja 15 menit setiap hari sebelum tidur untuk mencatat semua hal yang bikin kamu lelah secara mental hari ini. Lalu ketika bangun esok hari, coba kamu baca lagi dan petakan mana yang mau kamu utamakan untuk diselesaikan lebih dulu, fokus pada problemnya bukan pada emosinya, supaya kamu ga makin tertekan. Nanti jika butuh bantuan untuk mengurai satu persatu yang sudah kamu catat, kamu boleh hubungi saya melalui admin',
    intervention:
      'Breathing Regulation — Coba lakukan Box Breathing: 4 detik tarik, 4 tahan, 4 buang, 4 diam',
  },
  3: {
    tier: 3,
    label: 'Moderate Stress (Overload Beginning)',
    emoji: '😐',
    color: '#eab308',
    message:
      'Haloo.. berhenti sejenak dari aktivitasmu dan baca tulisan ini sebentar karena ini sangat penting buat kamu. Saat ini kamu dalam kondisi yang kurang optimal untuk memaksakan segala sesuatu. Kamu butuh aktivitas yang bukan sekedar aktivitas, tapi tepat sasaran agar stresmu bisa lebih dikondisikan dan mentalmu menjadi lebih siap menghadapi segala tantangan di depan. Kamu mulai butuh dorongan untuk aktif mencari dukungan sosial (berbicara dengan orang terpercaya, bisa dengan sahabat, keluarga atau saya sebagai konselormu). Kamu butuh meluangkan waktu untuk dirimu sedikit lebih lama dari sebelumnya. 10-15 menit perhari untuk Scheduled Worry Time + Writing Therapy bisa sedikit membantumu me-release segala bentuk kecemasan dan pikiran negatif. Sesekali melakukan Progressive Muscle Relaxation itu lebih baik. Jika merasa sulit mengatasi keadaan ini sendirian, jangan ragu hubungi saya',
    intervention:
      'Cognitive Restructuring (CBT) — Identifikasi Automatic Negative Thoughts (ANTs) dan tantang dengan bukti nyata. Contoh: "Saya harus sempurna" → "Saya cukup melakukan yang terbaik hari ini"',
  },
  4: {
    tier: 4,
    label: 'High Stress (Overwhelmed / Emotional Strain)',
    emoji: '😟',
    color: '#ef4444',
    message:
      'Sudah saatnya jujur dengan diri sendiri, jangan lagi bilang ngga papa jika kondisimu sudah seperti ini. Stres berat membutuhkan orang lain secara profesional agar kamu tidak makin kehilangan produktivitas dan kehilangan dirimu sendiri. Regulasi harus mulai dilakukan secara rutin dan terjadwal, tidak boleh tidak. Kamu juga musti rutin melakukan Grounding technique (5-4-3-2-1) agar tubuhmu bisa terkoneksi kembali dengan lingkungan dimana kamu berpijak. Social support bukan lagi hanya dari teman, sahabat, maupun keluarga, tapi kamu harus datang kepada profesional yang benar-benar mengerti ilmunya. Jika belum ada kesempatan untuk itu, kamu bisa lakukan Self-Detox baik secara sosial maupun digital. Berikan waktu 1-2 jam untuk memberikan kesempatan kamu terkoneksi kembali dengan diri sendiri. Take ur time, saat ini jangan terburu-buru merespon segala sesuatu dan sekali lagi saya ingatkan, saya siap membantu jika dibutuhkan',
    intervention:
      'Grounding Technique (5-4-3-2-1) — Sebut 5 hal yang kamu lihat, 4 yang kamu sentuh, 3 yang kamu dengar, 2 yang kamu cium, 1 yang kamu rasa',
  },
  5: {
    tier: 5,
    label: 'Severe Stress (Distress / Critical)',
    emoji: '😰',
    color: '#b91c1c',
    message:
      'Kamu sudah dalam kondisi sangat membutuhkan bantuan dan saya siap membantumu. Saat ini bukan hanya kehilangan kemampuan untuk meregulasi emosi secara mandiri, kamu juga perlahan mulai terdisosiasi dari realita, terkadang bingung dengan apa yang kamu rasakan, sulit membedakan mana imajinasi dan kenyataan, mana yang penting dilakukan mana yang harus diabaikan. Saya tahu kondisi seperti ini berat untuk kamu, tapi saya minta kamu tetap jaga kesadaran, jangan melakukan tindakan gegabah yang membahayakan orang lain maupun diri sendiri. Satu hal yang perlu diingat, kamu tidak sendiri menghadapi hal ini, kamu hanya butuh mulai membuka diri untuk cerita tentang apa yang kamu rasakan dan alami, lalu ijinkan kesembuhan dan cinta dari sekitar mulai menyembuhkan semua luka-luka yang ada.',
    intervention:
      'Immediate Grounding 5-4-3-2-1 — Segera hubungi profesional kesehatan jiwa atau layanan darurat. Kontak admin konselor untuk penanganan lebih lanjut',
  },
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

export function getStressLevel(tier: StressTier): StressLevel {
  return stressLevels[tier];
}

export function mapToMood(tier: StressTier): Mood {
  return MOOD_MAP[tier];
}
