import { BookOpen } from 'lucide-react';

import { BookCountdown } from '@/components/sections/home/BookCountdown';
import { EmbeddedChapterRow } from '@/components/sections/home/embedded-chapter-row';
import { VisitorChapterRow } from '@/components/sections/home/visitor-chapter-row';

import type { ChapterWithState } from '@/lib/chapters';

type Props = {
  ebookLive: boolean;
  userId: string | null;
  chapters: ChapterWithState[];
};

export default function EBook({ ebookLive, userId, chapters }: Props) {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Content side */}
          <div className="order-2 lg:order-1">
            <div className="mx-auto max-w-xl px-2 sm:px-0">
              {/* Section indicator */}
              <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm">
                <BookOpen className="mr-2 size-4 text-primary" />
                <span className="font-medium text-primary">
                  E-Book Eksklusif
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                <span className="text-primary">
                  <i className="font-bold">Bicaralah, dan Sembuhlah</i>
                </span>
              </h2>

              {/* Description */}
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Ketidakberanian bicara seringkali membawa seseorang pada
                hilangnya koneksi dengan diri sendiri, kerapuhan jiwa, dan
                matinya RASA. Refleksi yang saya angkat dari berbagai kisah
                nyata, pelik, problematik, dan menguras energi ini akan membawa
                anda menemukan kembali suara dan keberanian bicara sebagai
                langkah kecil pencerahan jiwa .
              </p>

              {/* CTA zone: countdown before launch, chapter rows after */}
              <div className="mt-6" data-testid="ebook-cta-zone">
                {ebookLive ? (
                  userId ? (
                    <EmbeddedChapterRow chapters={chapters} />
                  ) : (
                    <VisitorChapterRow chapters={chapters} />
                  )
                ) : (
                  <BookCountdown />
                )}
              </div>

              {/* Trust indicators */}
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground"></div>
            </div>
          </div>

          {/* Image side */}
          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative w-full max-w-[340px] md:max-w-72">
              <div className="relative overflow-hidden rounded-3xl border-2 border-border shadow-2xl">
                <img
                  alt="E-Book cover - Bicaralah, dan Sembuhlah"
                  src="/ebook_cover.png"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
