'use client';

import { useState } from 'react';

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

const SAMPLE_PAGES = [
  `Chapter 1: The Beginning

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`,

  `Chapter 2: Discovery

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.`,

  `Chapter 3: Journey

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.

Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.`,

  `Chapter 4: Wisdom

On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue.

Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure.`,

  `Chapter 5: Conclusion

In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted.

The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.`,
];

export default function Page() {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const goToPrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < SAMPLE_PAGES.length - 1) setCurrentPage(currentPage + 1);
  };

  const zoomIn = () => setZoom(Math.min(zoom + 10, 200));
  const zoomOut = () => setZoom(Math.max(zoom - 10, 50));
  const rotate = () => setRotation((rotation + 90) % 360);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            E-Book Viewer
          </span>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            disabled={zoom <= 50}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-sm text-muted-foreground">
            {zoom}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            disabled={zoom >= 200}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={rotate}
            aria-label="Rotate page"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page Container */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto flex h-full max-w-4xl items-start justify-center">
          {/* Page */}
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-card border border-border shadow-lg transition-all duration-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
              minHeight: '600px',
            }}
          >
            {/* Page Header */}
            <div className="border-b bg-muted/50 px-8 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Halaman {currentPage + 1} dari {SAMPLE_PAGES.length}
                </span>
                <span className="font-medium text-foreground">
                  Bab {currentPage + 1}
                </span>
              </div>
            </div>

            {/* Page Content */}
            <div className="px-8 py-10 md:px-12 md:py-12">
              <div className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-line">
                {SAMPLE_PAGES[currentPage]}
              </div>
            </div>

            {/* Page Footer */}
            <div className="absolute right-0 bottom-0 px-8 py-2 text-xs text-muted-foreground">
              • {currentPage + 1} •
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center justify-center gap-4 border-t bg-background px-4 py-3">
        <Button
          variant="outline"
          onClick={goToPrevPage}
          disabled={currentPage === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <div className="flex items-center gap-2">
          {SAMPLE_PAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`h-2 w-6 rounded-full transition-all duration-200 ${
                index === currentPage
                  ? 'bg-primary scale-110'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to page ${index + 1}`}
              aria-current={index === currentPage ? 'page' : undefined}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={goToNextPage}
          disabled={currentPage === SAMPLE_PAGES.length - 1}
          className="gap-2"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
