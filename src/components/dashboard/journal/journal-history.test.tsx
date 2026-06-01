import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { JournalHistory } from './JournalHistory';

const mockEntry = {
  id: 'entry-1',
  mood: 'calm' as const,
  content: '<p>Test journal content</p>',
  stressTier: null,
  recommendation: null,
  createdAt: new Date('2026-06-01T10:00:00'),
};

const mockScanEntry = {
  id: 'entry-2',
  mood: 'stressed' as const,
  content: null,
  stressTier: 4 as const,
  recommendation: 'Practice mindfulness',
  createdAt: new Date('2026-06-01T11:00:00'),
};

vi.mock('@/actions/journal', () => ({
  deleteJournalEntry: vi.fn(() => ({ success: true })),
}));

describe('JournalHistory', () => {
  it('renders entries', () => {
    render(<JournalHistory entries={[mockEntry]} />);

    expect(screen.getByText('Test journal content')).toBeInTheDocument();
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('renders scan-only entry with tier label', () => {
    render(<JournalHistory entries={[mockScanEntry]} />);

    expect(screen.getByText(/dari scan wajah/i)).toBeInTheDocument();
  });

  it('expands entry on click', async () => {
    const user = userEvent.setup();
    render(<JournalHistory entries={[mockEntry]} />);

    await user.click(screen.getByText('Test journal content'));
    expect(screen.getByText('Catatan:')).toBeInTheDocument();
  });

  it('shows delete button after expand', async () => {
    const user = userEvent.setup();
    render(<JournalHistory entries={[mockEntry]} />);

    await user.click(screen.getByText('Test journal content'));
    expect(screen.getByRole('button', { name: /hapus/i })).toBeInTheDocument();
  });
});
