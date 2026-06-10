export default function KebijakanPrivasiPage() {
  return (
    <div className="container-custom py-12 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Kebijakan Privasi
      </h1>

      <p className="mt-4 text-sm text-muted-foreground">
        Terakhir diperbarui: 12 Juni 2026
      </p>

      <div className="mt-8 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Data yang Kami Kumpulkan
          </h2>
          <p>
            Chikology mengumpulkan data berikut untuk memberikan layanan
            analisis stres berbasis AI:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Alamat email (untuk login dan identifikasi akun).</li>
            <li>
              Jawaban kuesioner pra-pemindaian (kebiasaan tidur, tingkat energi,
              dan kondisi mental subjektif).
            </li>
            <li>
              Data wajah — diproses secara sementara oleh Groq AI untuk
              mendeteksi pola ekspresi mikro.{' '}
              <strong>Data wajah tidak disimpan</strong> di server kami setelah
              analisis selesai.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Tujuan Pengumpulan Data
          </h2>
          <p>Seluruh data yang dikumpulkan digunakan semata-mata untuk:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Menganalisis tingkat stres berdasarkan ekspresi wajah dan
              kuesioner.
            </li>
            <li>Memberikan rekomendasi intervensi yang dipersonalisasi.</li>
            <li>
              Menyimpan riwayat jurnal dan hasil pemindaian di akun pengguna.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Penyimpanan Data
          </h2>
          <p>
            Data pengguna (email, respons kuesioner, hasil analisis) disimpan di
            Supabase, penyedia infrastruktur cloud yang mematuhi standar
            keamanan industri. Kami menerapkan Row-Level Security (RLS) sehingga
            setiap pengguna hanya dapat mengakses datanya sendiri.
          </p>
          <p className="mt-2">
            Gambar wajah <strong>tidak pernah disimpan</strong> — gambar dikirim
            langsung ke API Groq untuk dianalisis dan segera dihapus setelah
            proses selesai.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Hak Pengguna
          </h2>
          <p>
            Sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP){' '}
            <strong>UU No. 27 Tahun 2022</strong>, Anda memiliki hak untuk:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Mengakses data pribadi Anda yang tersimpan di sistem kami.</li>
            <li>Meminta penghapusan data pribadi Anda kapan saja.</li>
            <li>Menarik kembali persetujuan pemrosesan data.</li>
            <li>Mengajukan keberatan atas pemrosesan data pribadi.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Kontak</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau
            ingin mengajukan permintaan terkait data pribadi Anda, silakan
            hubungi kami melalui:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              WhatsApp:{' '}
              <a
                href="https://wa.me/6287853186759"
                className="text-primary hover:underline"
              >
                0878-5318-6759
              </a>
            </li>
            <li>
              Email:{' '}
              <a
                href="mailto:halo@chikology.id"
                className="text-primary hover:underline"
              >
                halo@chikology.id
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
