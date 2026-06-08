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
  messages: string[];
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
    messages: [
      'Hai, saat ini kamu sedang dalam keadaan baik, pertahankan. Stres yang ada di kamu saat ini bersifat eustress (stres positif) yang justru meningkatkan motivasi dan fokus. Empat saran di atas coba lakukan secara rutin agar stres yang kamu rasakan bisa diolah jadi kegiatan produktif. Kamu bisa sesuaikan waktunya dengan jam kerja dan aktivitas harian, jika belum mampu olahraga 30 menit, 15 menit juga boleh yang penting kamu happy melakukannya dan tidak menjadikan hal tersebut sebagai kewajiban atau paksaan. Tujuan utama dari aktivitas ini adalah agar stresmu tidak makin meningkat yang berpotensi jadi disfungsi terhadap aktivitas lainnya.',
      'Kabar baik. Kamu sedang dalam keadaan yang justru bisa kamu manfaatkan untuk hal produktif. Stres yang kamu rasakan saat ini tergolong eustress, bahan bakar alami yang bikin kamu lebih termotivasi dan tajam dalam berpikir. Pertahankan kondisi ini. Agar bahan bakarmu bertahan lebih lama, coba jadikan keempat saran ini bagian dari keseharianmu. Tentunya lakukan sesuaikan dengan ritme hidupmu sendiri. Mulailah dengan olahraga ringan. Tidak perlu terlalu lama kalau belum terbiasa. Kamu bisa mulai dari 15 menit yang benar-benar kamu nikmati dengan sadar. Karena aktivitas yang kamu lakukan dengan senang hati jauh lebih efektif daripada yang terasa seperti beban tambahan.Tujuan dari semua ini bukan untuk membebanimu dengan rutinitas baru, tapi untuk memastikan energi positif yang sudah kamu punya hari ini tidak perlahan berubah menjadi tekanan yang menghambat.',
      'Kondisimu saat ini lebih baik dari yang mungkin kamu sadari. Stres yang kamu bawa sekarang bukan musuh. Ini eustress, jenis stres yang justru menajamkan fokus dan mendorong kamu bergerak. Yang perlu kamu lakukan sekarang bukan menghilangkannya, tapi menjaganya tetap di level ini. Empat saran ini bisa jadi aktivitas andalan harianmu. Tidak perlu sempurna. Cobalah mulai bergerak. Kalau 30 menit olahraga terasa berat, 15 menit pun sudah cukup. Yang penting kamu melakukannya karena mau, bukan karena merasa harus. Gerakan kecil yang konsisten jauh lebih berdaya dari sesi besar yang cuma bertahan seminggu.Tujuannya sederhana: pastikan stres ini tidak naik dan mulai mengganggu hal-hal lain dalam hidupmu. Kamu sudah di jalur yang tepat, jaga ritmenya.',
    ],
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
    messages: [
      'Stresmu mulai naik, yuk mulai kembali ke diri sendiri. Kamu boleh merasa capek, penuh, bahkan seolah dunia sedang menekanmu saat ini. Tapi saya pengen ngajak kamu tetep sadar sama diri sendiri. Ngga butuh waktu lama kok untuk bisa kembali aware. Cukup tarik nafas sesuai arahan saya di atas, regangkan semua otot, dan mulai menulis tipis tentang apa yang kamu rasakan. Saya ga minta banyak waktumu, sediakan saja 15 menit setiap hari sebelum tidur untuk mencatat semua hal yang bikin kamu lelah secara mental hari ini. Lalu ketika bangun esok hari, coba kamu baca lagi dan petakan mana yang mau kamu utamakan untuk diselesaikan lebih dulu, fokus pada problemnya bukan pada emosinya, supaya kamu ga makin tertekan. Nanti jika butuh bantuan untuk mengurai satu persatu yang sudah kamu catat, kamu boleh hubungi saya melalui admin',
      'Stresmu sedang naik dan tubuhmu sudah merasakannya lebih dulu dari yang kamu sadari. Ini bukan waktunya memaksakan diri. Ini waktunya kamu kembali ke diri sendiri, pelan-pelan. Kamu boleh capek. Kamu boleh merasa penuh. Tapi jangan sampai kamu kehilangan koneksi dengan apa yang sebenarnya sedang kamu rasakan. Ada beberapa hal kecil yang bisa kamu coba mulai saat ini juga: ikuti latihan napas yang saya berikan di bawah, regangkan otot-otot yang tegang, lalu tulis apa saja yang bikin kamu berat hari ini. Langsung di web ini saja. Tidak perlu sempurna, cukup jujur pada dirimu sendiri. Jadikan 15 menit sebelum tidur sebagai ruang untuk mencatat itu semua. Lalu esok paginya, kamu bisa baca ulang. Bukan untuk menghakimi diri, tapi untuk memetakan: mana yang paling perlu diselesaikan? Hadapi satu per satu, tidak perlu takut, karena itu yang akan membuat langkahmu tetap bisa maju. Kalau kamu butuh bantuan untuk mengurai semuanya, jangan ragu hubungi saya lewat admin. Kami di sini untukmu.',
      'Sebentar.. kamu boleh berhenti dulu sekarang. \n Wajar jika saat ini rasanya berat. Wajar jika kepalamu terasa penuh, nafas terasa lebih cepat, tenaga terkuras, dan segalanya terasa menumpuk. Saya tidak minta kamu untuk langsung baikbaik saja. Yang saya minta cuma satu: tetap hadir untuk dirimu sendiri. Mulai dari yang paling kecil. Ikuti panduan napas di bawah, regangkan badanmu sebentar, buka tab jurnal di web ini, lalu tuliskan apa saja yang bikin kamu lelah hari ini. Tidak perlu rapi, tidak perlu panjang. Hanya kejujuran yang saya minta dari kamu. Sisihkan 15 menit sebelum tidur untuk hal ini. Dan besok pagi, sebelum memulai hari, baca kembali catatanmu. Bukan untuk larut, tapi untuk melihat lebih jernih: “mana yang perlu saya hadapi lebih dulu?”. Fokus pada masalahnya, bukan perasaannya. Itu yang akan membuatmu bergerak dengan keberdayaan diri. Kalau suatu saat kamu butuh seseorang untuk membantu mengurai satu persatu apa yang kamu rasa dan pikirkan, admin siap mengatur jadwal untuk kamu ngobrol dengan saya. Kamu tidak harus melewati ini sendiri.',
    ],
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
    messages: [
      'Haloo.. berhenti sejenak dari aktivitasmu dan baca tulisan ini sebentar karena ini sangat penting buat kamu. Saat ini kamu dalam kondisi yang kurang optimal untuk memaksakan segala sesuatu. Kamu butuh aktivitas yang bukan sederhana aktivitas, tapi tepat sasaran agar stresmu bisa lebih dikondisikan dan mentalmu menjadi lebih siap menghadapi segala tantangan di depan. Kamu mulai butuh dorongan untuk aktif mencari dukungan sosial (berbicara dengan orang terpercaya, bisa dengan sahabat, keluarga atau saya sebagai konselormu). Kamu butuh meluangkan waktu untuk dirimu sedikit lebih lama dari sebelumnya. 10-15 menit perhari untuk Scheduled Worry Time + Writing Therapy bisa sedikit membantumu me-release segala bentuk kecemasan dan pikiran negatif. Sesekali melakukan Progressive Muscle Relaxation itu lebih baik. Jika merasa sulit mengatasi keadaan ini sendirian, jangan ragu hubungi saya.',
      'Berhenti sejenak... Ada yang lebih penting dari apapun yang sedang kamu kerjakan saat ini, dan itu adalah kondisimu sendiri. Saat ini tubuh dan pikiranmu sedang tidak dalam posisi yang optimal untuk terus dipaksa. Bukan berarti kamu lemah tapi mengenali batas diri adalah bentuk kecerdasan yang banyak orang abaikan sampai terlambat. Kamu butuh sesuatu yang lebih dari sekadar istirahat biasa. Kamu butuh tindakan yang tepat sasaran yang bisa benar-benar menyiapkan mentalmu menghadapi tantangan ke depan. Langkah pertama yang paling kamu butuhkan sekarang adalah dukungan sosial yang nyata: bicara dengan orang yang kamu percaya. Sahabat, anggota keluarga, atau saya sebagai konselormu. Jangan tunda ini, karena memendam sendiri hanya akan memperberat yang sudah berat. Kamu bisa luangkan 10–15 menit setiap hari khusus untuk dirimu: Scheduled Worry Time untuk memberi ruang pada kecemasanmu secara terjadwal dan Writing Therapy untuk melepas pikiran negatif yang terus berputar. Tambahkan Progressive Muscle Relaxation sesekali, dan ingat menghubungi saya itu bukan tanda menyerah, itu tanda kamu serius menjaga dirimu sendiri.',
      'Hei, sebentar saja. Baca ini dulu. \n Saya tahu kamu sedang banyak menanggung sesuatu. Dan saya mau kamu tahu: kamu tidak harus pura-pura kuat atau terus mendorong diri di tengah kondisi seperti ini. Memaksakan segala sesuatu saat kamu tidak dalam kondisi optimal justru akan menguras lebih banyak dari yang kamu punya. Yang kamu butuhkan saat ini bukan lebih banyak aktivitas, tapi aktivitas yang tepat. Kamu bisa mulai dengan satu langkah: cari seseorang yang kamu percaya hari ini, yang mau hadir menyediakan telinganya untuk mendengar ceritamu. Sahabat, keluarga, atau saya sebagai konselormu. Berbicara dengan orang yang tepat adalah salah satu cara paling nyata untuk meringankan beban yang sudah lama kamu simpan sendiri. Kamu juga bisa sisihkan 10–15 menit setiap hari hanya untuk dirimu. Gunakan waktu itu untuk Scheduled Worry Time dan Writing Therapy. Biarkan semua kecemasan dan pikiran negatif itu keluar, bukan berputar terus di kepalamu. Sesekali, kamu bisa coba juga Progressive Muscle Relaxation untuk membantu tubuhmu ikut melepaskan ketegangan yang sudah menumpuk. Kalau sewaktu-waktu terasa terlalu berat, jangan ragu untuk menghubungi saya.',
    ],
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
    messages: [
      'Sudah saatnya jujur dengan diri sendiri, jangan lagi bilang ngga papa jika kondisimu sudah seperti ini. Stres berat membutuhkan orang lain secara profesional agar kamu tidak makin kehilangan produktivitas dan kehilangan dirimu sendiri. Regulasi harus mulai dilakukan secara rutin dan terjadwal, tidak boleh tidak. Kamu juga musti rutin melakukan Grounding technique (5-4-3-2-1) agar tubuhmu bisa terkoneksi kembali dengan lingkungan dimana kamu berpijak. Social support bukan lagi hanya dari teman, sahabat, maupun keluarga, tapi kamu harus datang kepada profesional yang benar-benar mengerti ilmunya. Jika belum ada kesempatan untuk itu, kamu bisa lakukan Self-Detox baik secara sosial maupun digital. Berikan waktu 1-2 jam untuk memberikan kesempatan kamu terkoneksi kembali dengan diri sendiri. Take ur time, saat ini jangan terburu-buru merespon segala sesuatu dan sekali lagi saya ingatkan, saya siap membantu jika dibutuhkan',
      'Kamu sudah terlalu lama menahan ini sendiri. Sekarang, saya hanya ingin kamu lebih jujur. Bukan ke saya, tapi ke dirimu sendiri. Kondisimu saat ini bukan sesuatu yang bisa diselesaikan dengan "nanti juga membaik sendiri." Stres di level ini butuh penanganan yang nyata. Membiarkannya berlarut tanpa intervensi yang tepat bisa perlahan merampas produktivitasmu dan yang lebih dalam dari itu, koneksimu dengan dirimu sendiri akan hilang cepat atau lambat. Saatnya menjadikan regulasi diri sebagai bagian dari harimu. Rutin, terjadwal, tidak bisa ditawar. Cobalah Grounding Technique 5-4-3-2-1 setiap kali pikiran terasa melayang atau dunia terasa terlalu bising. Teknik ini bekerja dengan cara mengembalikan kesadaranmu ke tubuh dan lingkungan di sekitarmu. Sederhana tapi sangat nyata dampaknya. Satu hal lagi yang perlu kamu dengar: di titik ini, dukungan yang kamu butuhkan sudah melampaui apa yang bisa diberikan oleh orang-orang terdekatmu. Bukan karena mereka tidak peduli tapi karena ada jenis pemahaman dan pendampingan yang hanya bisa datang dari seorang profesional. Temukan itu. Kalau belum bisa sekarang, mulailah dengan Self-Detox. Jauhkan dirimu dari kebisingan sosial dan digital. Berikan dirimu ruang 1–2 jam untuk bernapas tanpa tuntutan apapun. Tidak ada yang perlu direspon dengan terburu-buru hari ini. Yang paling penting sekarang adalah kamu. Dan saya ada, kapanpun kamu butuh.',
      'Saya perlu kamu baca ini sampai selesai. \n Sudah cukup bilang "ngga papa" saat kondisimu sudah sampai di titik ini. Bukan karena kamu salah tapi karena kamu layak mendapat lebih dari sekadar motivasi sabar untuk bertahan. Stres seberat ini tidak dirancang untuk kamu hadapi sendiri. Memaksa menahan diri hanya akan mengikis produktivitas dan perlahan-lahan merusak kepercayaan dirimu. Regulasi diri harus mulai menjadi sesuatu yang rutin dan terjadwal, bukan sesekali, bukan kalau sempat. Salah satu yang paling penting untuk kamu mulai sekarang adalah Grounding Technique 5-4-3-2-1. Teknik sederhana yang membantu tubuh dan pikiranmu kembali terhubung dengan tempat kamu berpijak, saat semuanya terasa terlalu penuh. Di level ini, dukungan dari orang terdekat saja tidak cukup. Kamu butuh seseorang yang benarbenar mengerti ilmunya, seorang profesional yang bisa membantumu mengurai ini dengan cara yang tepat. Jika saat ini belum memungkinkan, mulailah dengan Self-Detox: menjauh sesaat dari hiruk-pikuk sosial dan digital. Berikan dirimu 1–2 jam untuk kembali terhubung dengan dirimu sendiri. Tidak perlu terburu-buru merespon siapapun atau apapun hari ini. Ambil waktumu. Dan ketika kamu siap, saya di sini, benar-benar siap membantu.',
    ],
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
    messages: [
      'Kamu sudah dalam kondisi sangat membutuhkan bantuan dan saya siap membantumu. Saat ini bukan hanya kehilangan kemampuan untuk meregulasi emosi secara mandiri, kamu juga perlahan mulai terdisosiasi dari realita, terkadang bingung dengan apa yang kamu rasakan, sulit membedakan mana imajinasi dan kenyataan, mana yang penting dilakukan mana yang harus diabaikan. Saya tahu kondisi seperti ini berat untuk kamu, tapi saya minta kamu tetap jaga kesadaran, jangan melakukan tindakan gegabah yang membahayakan orang lain maupun diri sendiri. Satu hal yang perlu diingat, kamu tidak sendiri menghadapi hal ini, kamu hanya butuh mulai membuka diri untuk cerita tentang apa yang kamu rasakan dan alami, lalu ijinkan kesembuhan dan cinta dari sekitar mulai menyembuhkan semua luka-luka yang ada.',
      'Sebelum apapun saya ingin kamu tahu bahwa kamu sudah melakukan hal yang benar dengan sampai di sini. Kondisimu saat ini nyata dan serius dan saya tidak akan meremehkannya. Kemampuanmu untuk meregulasi perasaan dan membaca situasi sedang dalam titik yang sangat berat. Mungkin ada saat-saat di mana semuanya terasa tidak nyata atau kamu tidak tahu lagi mana yang penting dan mana yang tidak. Itu bukan tanda kamu gila. Itu tanda bahwa kamu sudah menanggung terlalu banyak, terlalu lama, tanpa cukup dukungan. So, untuk saat ini, saya minta satu hal saja darimu: Jaga Diri. Jangan biarkan kondisi ini mendorongmu mengambil tindakan yang bisa menyakiti dirimu sendiri atau orang lain. Jika pikiran ke arah itu datang, berhenti, tarik napas, dan hubungi saya sekarang. Kamu tidak harus tahu caranya sembuh. Kamu tidak harus punya semua jawabannya. Yang perlu kamu lakukan sekarang hanyalah membuka mulut dan mulai bercerita kepada saya, kepada seseorang yang kamu percaya, kepada siapapun yang ada. Karena di sekitarmu, ada orang-orang yang membawa kesembuhan dan cinta untukmu. Mereka hanya butuh ijinmu untuk masuk. Ambil waktumu. Saya menunggu dan saya siap menemanimu melewati masa-masa sulit ini, satu langkah demi satu langkah.',
      'Saya di sini dan saya tidak pergi ke mana-mana. \n Kamu sedang dalam kondisi yang membutuhkan bantuan dan saya tekankan itu bukan kelemahan. Itu informasi paling jujur dari tubuh yang perlu kamu dengar. Saat ini, kemampuanmu untuk meregulasi emosi dan membaca realita sedang tidak bisa bekerja seperti biasanya. Mungkin ada momen-momen di mana segalanya terasa kabur mana yang nyata, mana yang tidak. Mana yang harus dihadapi, mana yang harus dilepaskan. Saya tahu itu berat dan kamu tidak harus berpura-pura sebaliknya. Yang paling penting saya minta darimu saat ini: tetap jaga kesadaranmu. Jangan ambil keputusan yang terburu-buru. Jangan lakukan apapun yang bisa menyakiti dirimu sendiri atau orang di sekitarmu. Satu langkah kecil dulu. Lakukan satu tarikan napas panjang. Kamu tidak sendirian bahkan di saat yang terasa paling sepi sekalipun. Yang perlu kamu lakukan hanya satu: Mulailah Bercerita. Kepada saya, kepada seseorang yang kamu percaya, kepada siapapun yang bisa menerimamu apa adanya. Tidak perlu sempurna, tidak perlu terstruktur. Cukup mulai. Kesembuhan itu nyata. Dan cinta dari orang-orang di sekitarmu juga nyata sedang menunggu ruang untuk masuk. Biarkan mereka masuk. Biarkan saya membantu.',
    ],
  },
};
