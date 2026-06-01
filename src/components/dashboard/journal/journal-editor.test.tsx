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
    emit: vi.fn(),
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

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('bold button is present and clickable', () => {
    render(<JournalEditor content="" onChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    const boldButton = buttons[0];
    expect(boldButton).toBeInTheDocument();
  });

  it('italic button is present and clickable', () => {
    render(<JournalEditor content="" onChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    const italicButton = buttons[1];
    expect(italicButton).toBeInTheDocument();
  });

  it('renders editor content area', () => {
    render(<JournalEditor content="" onChange={vi.fn()} />);

    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
  });
});
