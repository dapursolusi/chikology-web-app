import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { JournalEditor } from './JournalEditor';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    isActive: vi.fn((type: string) => type === 'bold'),
    chain: vi.fn(() => ({
      focus: vi.fn(() => ({
        toggleBold: vi.fn(),
        toggleItalic: vi.fn(),
        toggleBulletList: vi.fn(),
        toggleOrderedList: vi.fn(),
      })),
    })),
    getHTML: vi.fn(() => '<p>Test content</p>'),
  })),
  EditorContent: ({ editor }: { editor: unknown }) => (
    <div data-testid="tiptap-editor">
      Mock editor with:{' '}
      {String((editor as { getHTML: () => string }).getHTML())}
    </div>
  ),
}));

describe('JournalEditor', () => {
  it('renders toolbar with 4 formatting buttons', () => {
    render(<JournalEditor content="" onChange={vi.fn()} />);

    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText('•')).toBeInTheDocument();
    expect(screen.getByText('1.')).toBeInTheDocument();
  });

  it('bold button is active when editor is in bold state', () => {
    render(<JournalEditor content="" onChange={vi.fn()} />);

    const boldButton = screen.getByText('B').closest('button');
    expect(boldButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('italic button is not active by default', () => {
    render(<JournalEditor content="" onChange={vi.fn()} />);

    const italicButton = screen.getByText('I').closest('button');
    expect(italicButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders editor content area', () => {
    render(<JournalEditor content="" onChange={vi.fn()} />);

    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
  });
});
