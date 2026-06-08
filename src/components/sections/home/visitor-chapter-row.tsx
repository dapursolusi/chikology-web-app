'use client';

import { useState } from 'react';

import { LoginForm } from '@/components/login-form';
import Modal from '@/components/modal';
import { SignupForm } from '@/components/signup-form';

import type { ChapterWithState } from '@/lib/chapters';

export function VisitorChapterRow({
  chapters,
}: {
  chapters: ChapterWithState[];
}) {
  const [activeAuth, setActiveAuth] = useState<'login' | 'signup' | null>(null);
  const open = activeAuth !== null;

  if (chapters.length === 0) {
    return (
      <p
        data-testid="visitor-chapter-row-empty"
        className="text-sm text-muted-foreground"
      >
        Belum ada bab yang dirilis.
      </p>
    );
  }

  return (
    <div
      data-testid="visitor-chapter-row"
      className="flex flex-wrap gap-2"
    >
      {chapters.map((chapter) => (
        <button
          key={chapter.id}
          type="button"
          data-testid={`visitor-chapter-${chapter.id}`}
          onClick={() => setActiveAuth('signup')}
          className="shrink-0 rounded-lg border-2 border-teal-600 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100"
        >
          Bab {chapter.chapterNumber} · Masuk untuk baca
        </button>
      ))}

      <Modal
        trigger={null}
        open={open}
        onOpenChange={(o) => {
          if (!o) setActiveAuth(null);
        }}
        content={{
          variant: 'direct',
          directContent:
            activeAuth === 'login' ? (
              <LoginForm onSwitchToSignup={() => setActiveAuth('signup')} />
            ) : activeAuth === 'signup' ? (
              <SignupForm onSwitchToLogin={() => setActiveAuth('login')} />
            ) : null,
        }}
      />
    </div>
  );
}
