export type Emotions = {
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  surprised: number;
  neutral: number;
  disgusted: number;
};

export type StressTier = 1 | 2 | 3 | 4 | 5;

export const MOOD_MAP = {
  1: 'very_calm',
  2: 'calm',
  3: 'neutral',
  4: 'stressed',
  5: 'very_stressed',
} as const;

export type Mood = (typeof MOOD_MAP)[keyof typeof MOOD_MAP];

export type StressLevel = {
  tier: StressTier;
  label: string;
  emoji: string;
  color: string;
  desc: string;
  signs: string[];
  risks: string[];
  interventions: {
    title: string;
    subTitle?: string;
    description: string;
  }[];
  messages: string;
};

export const stressLevels: Record<StressTier, StressLevel> = {
  1: {
    tier: 1,
    label: 'Relaxed / Low Stress',
    emoji: '😌',
    color: '#22c55e',
    desc: 'Individu berada dalam kondisi fisik dan emotional yang stabil.',
    signs: [
      'Ekspresi wajah tampak rileks/netral/positif',
      'kontak mata stabil',
      'otot wajah tidak tegang',
      'gerakan spontan',
    ],
    risks: ['Hampir tidak ada, kondisi optimal.'],
    interventions: [
      {
        title: 'Mindfulness Maintenance',
        subTitle: '5-10 menit/hari',
        description:
          'Lakukan body scan ringan dan pernapasan 4-7-8 sebagai rutinitas harian.',
      },
      {
        title: 'Gratitude Journaling',
        subTitle: '30 menit/hari',
        description:
          'Apa yang membuatmu merasa bersyukur hari ini? Tidak harus hal besar. Ada seseorang yang tiba-tiba memberikan kue pada saat jam istirahat, kolega memberi senyuman, teman yang mau mendengar cerita recehmu, hatimu tetap merasa damai walau kerjaan menumpuk, itu semua contoh hal yang bisa disyukuri. Coba lebih peka dengan sekitar dan pakai RASA-mu',
      },
      {
        title: 'Micro-Break',
        subTitle: 'Pomodoro',
        description:
          'Di setiap 25 menit aktivitas fokusmu, beri jeda 5 menit istirahat. Ulangi selama 4x. Dan di sesi terakhir, beri waktu istirahat lebih 10-15 menit.',
      },
      {
        title: 'Physical Activity Reinforcement',
        subTitle: '30 menit/hari',
        description:
          'Lakukan aktivitas fisik ringan 30 menit/hari. Jalan kaki pagi, joging, olahraga Karena aktivitas fisik terbukti meningkatkan BDNF (Brain-Derived Neurotrophic Factor) dan serotonin sebagai buffer alami terhadap stres',
      },
    ],
    messages:
      'Hai, saat ini kamu sedang dalam keadaan baik, pertahankan. Stres yang ada di kamu saat ini bersifat eustress (stres positif) yang justru meningkatkan motivasi dan fokus. Empat saran di atas coba lakukan secara rutin agar stres yang kamu rasakan bisa diolah jadi kegiatan produktif. Kamu bisa sesuaikan waktunya dengan jam kerja dan aktivitas harian, jika belum mampu olahraga 30 menit, 15 menit juga boleh yang penting kamu happy melakukannya dan tidak menjadikan hal tersebut sebagai kewajiban atau paksaan. Tujuan utama dari aktivitas ini adalah agar stresmu tidak makin meningkat yang berpotensi jadi disfungsi terhadap aktivitas lainnya.',
  },
  2: {
    tier: 2,
    label: 'Mild Stress (Alert / Tension)',
    emoji: '😊',
    color: '#84cc16',
    desc: 'Mulai muncul tanda-tanda aktivasi sistem saraf simpatis yang ringan. Individu masih mampu berfungsi optimal namun mulai merasakan tekanan. Ekspresi wajah menunjukkan sedikit ketegangan, microexpression kekhawatiran sesekali muncul. Respon stres awal, masih bisa terkendali',
    signs: [
      'Sedikit ketegangan di wajah (kening, alis, mata)',
      'Mulai muncul gelisah ringan, senyum berkurang',
      'Perhatian sedikit terdistraksi',
      'Gerakan lebih terbatas',
      'Microexporession cemas sesekali',
      'Fokus mulai terganggu',
    ],
    risks: ['Jika terus berlanjut, bisa naik ke level moderat.'],
    interventions: [
      {
        title: 'Breathing Regulation',
        subTitle: '(5-5-5 Breathing)',
        description:
          'Coba lakukan saran pernafasan dari Porges. Simpel aja 5 tarik, 5 tahan, 5 buang. Atau kamu juga bisa lakukan Box Breathing (4 tarik, 4 tahan, 4 buang, 4 diam). Kamu bisa lakukan secara bergantian atau pilih mana yang kamu rasa lebih nyaman',
      },
      {
        title: 'Progressive Muscle Relaxation',
        description:
          'Bukan hanya pernafasan, karena stresmu sudah lumayan tinggi. Coba regangkan dan relakskan kelompok otot secara sistematis dari kaki ke kepala. Ini terbukti efektif menurunkan ketegangan somatik dan kecemasan ringan dalam 15–20 menit.',
      },
      {
        title: 'Time Management & Priority Mapping',
        description:
          'Berikan nama dan stressor pada emosimu, contoh : saya cemas karena deadline. Lalu identifikasi stressor spesifik menggunakan Eisenhower Matrix (tentukan mana yang urgen vs penting).',
      },
    ],
    messages:
      'Stresmu mulai naik, yuk mulai kembali ke diri sendiri. Kamu boleh merasa capek, penuh, bahkan seolah dunia sedang menekanmu saat ini. Tapi saya pengen ngajak kamu tetep sadar sama diri sendiri. Ngga butuh waktu lama kok untuk bisa kembali aware. Cukup tarik nafas sesuai arahan saya di atas, regangkan semua otot, dan mulai menulis tipis tentang apa yang kamu rasakan. Saya ga minta banyak waktumu, sediakan saja 15 menit setiap hari sebelum tidur untuk mencatat semua hal yang bikin kamu lelah secara mental hari ini. Lalu ketika bangun esok hari, coba kamu baca lagi dan petakan mana yang mau kamu utamakan untuk diselesaikan lebih dulu, fokus pada problemnya bukan pada emosinya, supaya kamu ga makin tertekan. Nanti jika butuh bantuan untuk mengurai satu persatu yang sudah kamu catat, kamu boleh hubungi saya melalui admin',
  },
  3: {
    tier: 3,
    label: 'Moderate Stress (Overload Beginning)',
    emoji: '😐',
    color: '#eab308',
    desc: 'Aktivasi hipotalamus-hipofisis-adrenal (HPA-axis) yang signifikan menyebabkan peningkatan kortisol. Ekspresi wajah menunjukkan ketegangan jelas, microexpression marah atau takut lebih sering, gerakan wajah asimetris mulai terdeteksi. Karena aktivitasi HPA-axis signifikan, kamu perlu intervensi lanjutan.',
    signs: [
      'Ekspresi tegang (rahang kaku, alis mengerut), microexpression takut/marah',
      'Mulai terlihat lelah, frustasi, kerutan dahi menonjol, bibir tertekan',
      'Penurunan performa kerja',
    ],
    risks: ['Overthinking & Emotional reactivity meningkat.'],
    interventions: [
      {
        title: 'Cognitive Restructuring',
        subTitle: 'CBT',
        description:
          'Mengubah pikiran irasional jadi lebih rasional. Kamu bisa mulai coba identifikasi Automatic Negative Thoughts (ANTs) menggunakan ABC model (Activating event → Belief → Consequence). Tantang pola pikir negatif yang selalu membayangkan kemungkinan terburuk (catastrophizing) dan menyamaratakan semua kondisi (overgeneralization) dengan bukti nyata yang ada (evidence-based disputation). Contoh: Saya harus sempurna → Saya cukup melakukan yang terbaik hari ini sampai pulang kerja',
      },
      {
        title: 'Social Support Activation',
        description:
          'Dorong pengguna untuk aktif mencari dukungan sosial (berbicara dengan orang terpercaya). Oxytocin yang dilepas saat koneksi sosial terbukti menghambat respons stres kortisol secara langsung.',
      },
      {
        title: 'Expressive Writing Therapy',
        description:
          'Tulis pengalaman stres secara naratif 15–20 menit selama 4 hari berturut-turut. Penelitian longitudinal menunjukkan penurunan kunjungan dokter 43% dan peningkatan fungsi imun yang signifikan',
      },
    ],
    messages:
      'Haloo.. berhenti sejenak dari aktivitasmu dan baca tulisan ini sebentar karena ini sangat penting buat kamu. Saat ini kamu dalam kondisi yang kurang optimal untuk memaksakan segala sesuatu. Kamu butuh aktivitas yang bukan sederhana aktivitas, tapi tepat sasaran agar stresmu bisa lebih dikondisikan dan mentalmu menjadi lebih siap menghadapi segala tantangan di depan. Kamu mulai butuh dorongan untuk aktif mencari dukungan sosial (berbicara dengan orang terpercaya, bisa dengan sahabat, keluarga atau saya sebagai konselormu). Kamu butuh meluangkan waktu untuk dirimu sedikit lebih lama dari sebelumnya. 10-15 menit perhari untuk Scheduled Worry Time + Writing Therapy bisa sedikit membantumu me-release segala bentuk kecemasan dan pikiran negatif. Sesekali melakukan Progressive Muscle Relaxation itu lebih baik. Jika merasa sulit mengatasi keadaan ini sendirian, jangan ragu hubungi saya.',
  },
  4: {
    tier: 4,
    label: 'High Stress (Overwhelmed / Emotional Strain)',
    emoji: '😟',
    color: '#ef4444',
    desc: 'Sistem regulasi emosi mengalami overload. Kemampuan decision-making dan problemsolving menurun drastis akibat aktivasi amigdala yang berlebihan. Ekspresi wajah menunjukkan distress yang jelas, rigid, dan sulit dikontrol. Microexpression negatif dominan. Disfungsi emosional, butuh penanganan terstruktur.',
    signs: [
      'Wajah sangat tegang, ekspresi rigid/kaku, asimetri wajah jelas, microexpression negatif (jelas marah/takut), kontak mata menghindar',
      'Sulit fokus, mudah tersinggung',
      'Tanda kelelahan mental yang jelas (burnout)',
    ],
    risks: ['Burnout awal', 'Konflik interpersonal'],
    interventions: [
      {
        title: 'Acceptance & Commitment Therapy (ACT)',
        description:
          'Fokus pada defusion kognitif: lihat pikiran sebagai pikiran, BUKAN fakta absolut yang tidak bisa berubah.',
      },
    ],
    messages:
      'Sudah saatnya jujur dengan diri sendiri, jangan lagi bilang ngga papa jika kondisimu sudah seperti ini. Stres berat membutuhkan orang lain secara profesional agar kamu tidak makin kehilangan produktivitas dan kehilangan dirimu sendiri. Regulasi harus mulai dilakukan secara rutin dan terjadwal, tidak boleh tidak. Kamu juga musti rutin melakukan Grounding technique (5-4-3-2-1) agar tubuhmu bisa terkoneksi kembali dengan lingkungan dimana kamu berpijak. Social support bukan lagi hanya dari teman, sahabat, maupun keluarga, tapi kamu harus datang kepada profesional yang benar-benar mengerti ilmunya. Jika belum ada kesempatan untuk itu, kamu bisa lakukan Self-Detox baik secara sosial maupun digital. Berikan waktu 1-2 jam untuk memberikan kesempatan kamu terkoneksi kembali dengan diri sendiri. Take ur time, saat ini jangan terburu-buru merespon segala sesuatu dan sekali lagi saya ingatkan, saya siap membantu jika dibutuhkan',
  },
  5: {
    tier: 5,
    label: 'Severe Stress (Distress / Critical)',
    emoji: '😰',
    color: '#b91c1c',
    desc: 'Kondisi darurat psikologis. Korteks prefrontal hampir non-fungsional, sistem limbik mendominasi sepenuhnya (emotional hijacking). Ekspresi wajah menunjukkan tandatanda kepanikan atau dissociasi — bisa tampak sangat ekspresif (panic) atau justru flat/kosong (dissociation). Rujukan segera diperlukan',
    signs: [
      'Ekspresi wajah menunjukkan distress tinggi (takut, sedih, panik/disosiatif, marah)',
      'Gerakan mikro sangat cepat atau sangat lambat (freeze)',
      'Asimetri ekstrim, tatapan kosong atau liar, kontrol wajah hilang',
      'Disregulasi emosi (menangis, marah, shut down tiba-tiba)',
      'Fungsi kerja terganggu signifikan',
    ],
    risks: ['Burnout berat', 'Anxiety disorder/depresi (jika kronis)'],
    interventions: [
      {
        title: 'Immediate Grounding: 5-4-3-2-1 Technique',
        description:
          'Identifikasi 5 hal yang bisa dilihat, 4 yang bisa disentuh, 3 yang bisa didengar, 2 yang bisa dicium, 1 yang bisa dirasakan. Mengalihkan fokus ke sensori eksternal memutus siklus hyperarousal amigdala secara cepat.',
      },
      {
        title: 'Emergency Referral Protocol',
        description:
          'Sistem wajib memberikan alert untuk segera menghubungi profesional kesehatan jiwa atau layanan darurat. Kontak admin konselor untuk penanganan lebih lanjut.',
      },
      {
        title: 'Psychological First Aid (PFA)',
        description:
          '5 prinsip PFA berbasis bukti: promote safety (rasa aman), calming (ketenangan), selfefficacy, connectedness (koneksi sosial), dan hope.',
      },
    ],
    messages:
      'Kamu sudah dalam kondisi sangat membutuhkan bantuan dan saya siap membantumu. Saat ini bukan hanya kehilangan kemampuan untuk meregulasi emosi secara mandiri, kamu juga perlahan mulai terdisosiasi dari realita, terkadang bingung dengan apa yang kamu rasakan, sulit membedakan mana imajinasi dan kenyataan, mana yang penting dilakukan mana yang harus diabaikan. Saya tahu kondisi seperti ini berat untuk kamu, tapi saya minta kamu tetap jaga kesadaran, jangan melakukan tindakan gegabah yang membahayakan orang lain maupun diri sendiri. Satu hal yang perlu diingat, kamu tidak sendiri menghadapi hal ini, kamu hanya butuh mulai membuka diri untuk cerita tentang apa yang kamu rasakan dan alami, lalu ijinkan kesembuhan dan cinta dari sekitar mulai menyembuhkan semua luka-luka yang ada.',
  },
};
