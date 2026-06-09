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
            <div className="mx-auto max-w-xl">
              {/* Section indicator */}
              <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm">
                <BookOpen className="mr-2 size-4 text-primary" />
                <span className="font-medium text-primary">
                  E-Book Eksklusif
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Buku{' '}
                <span className="text-primary">
                  <i className="font-bold">
                    Seni Berdamain Dengan Diri Sendiri
                  </i>
                </span>
              </h2>

              {/* Description */}
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Panduan praktis untuk memahami dan menerima diri sendiri.
                Pelajari teknik berdamai dengan pikiran negatif dan membangun
                hubungan yang healthier dengan diri kamu.
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
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Sudah diakses 10K+ pembaca</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image side */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="relative overflow-hidden rounded-3xl border-2 border-border shadow-2xl">
                <img
                  alt="E-Book cover - Seni Berdamain Dengan Diri Sendiri"
                  src="https://images.unsplash.com/photo-1716892001590-79a5b6207662?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="h-auto w-full object-cover"
                />
              </div>

              {/* Decorative label */}
              <div className="absolute -bottom-4 -right-4 rounded-2xl bg-card border-2 border-border px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    Chapter 1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
