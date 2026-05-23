import { BookOpen, ScanFace, Speech } from 'lucide-react';

export default function Features() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Kenali Dirimu Lebih Dalam
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Platform lengkap untuk mendukung perjalanan kesehatan mental kamu
            dengan teknologi AI dan dukungan konseling profesional.
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Feature 1: Counseling */}
          <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-250 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
            <div className="inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/20">
              <Speech className="size-6" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-card-foreground">
              Konseling
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Berbicara dengan profesional untuk mendapatkan dukungan dan
              panduan yang kamu butuhkan.
            </p>
          </div>

          {/* Feature 2: Mood Detection */}
          <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-250 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
            <div className="inline-flex rounded-xl bg-secondary/30 p-3 text-secondary-foreground transition-colors group-hover:bg-secondary/40">
              <ScanFace className="size-6" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-card-foreground">
              Deteksi Mood Setiap Hari
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Lacak perubahan emosi dengan teknologi AI dan dapatkan rekomendasi
              personal setiap hari.
            </p>
          </div>

          {/* Feature 3: E-Book */}
          <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-250 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
            <div className="inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/20">
              <BookOpen className="size-6" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-card-foreground">
              Baca E-Book
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Akses koleksi e-book eksklusif tentang kesehatan mental dan
              pengembangan diri.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
