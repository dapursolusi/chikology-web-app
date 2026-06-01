import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MoodSelector } from './MoodSelector';

const EMOJI = ['😌', '😊', '😐', '😟', '😰'];
const LABELS = [
  'Sangat tenang',
  'Tenang',
  'Netral',
  'Tertekan',
  'Sangat tertekan',
];

describe('MoodSelector', () => {
  it('renders 5 emoji buttons', () => {
    render(<MoodSelector onChange={vi.fn()} />);

    EMOJI.forEach((emoji) => {
      expect(screen.getByText(emoji)).toBeInTheDocument();
    });
  });

  it('calls onChange with correct mood when emoji is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MoodSelector onChange={onChange} />);

    await user.click(screen.getByText('😊'));
    expect(onChange).toHaveBeenCalledWith('calm');

    await user.click(screen.getByText('😰'));
    expect(onChange).toHaveBeenCalledWith('very_stressed');
  });

  it('renders with aria-checked false for unselected mood', () => {
    render(<MoodSelector onChange={vi.fn()} />);

    EMOJI.forEach((emoji) => {
      const button = screen.getByText(emoji);
      expect(button).toHaveAttribute('aria-checked', 'false');
    });
  });

  it('pre-fills selected mood via value prop', () => {
    render(<MoodSelector value="neutral" onChange={vi.fn()} />);

    const neutralButton = screen.getByText('😐');
    expect(neutralButton).toHaveAttribute('aria-checked', 'true');
  });

  it('shows correct label as title on each button', () => {
    render(<MoodSelector onChange={vi.fn()} />);

    LABELS.forEach((label) => {
      expect(screen.getByTitle(label)).toBeInTheDocument();
    });
  });
});
