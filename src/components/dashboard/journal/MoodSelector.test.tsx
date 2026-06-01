import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MoodSelector } from './MoodSelector';

const CAPTIONS = [
  'Sangat Tenang',
  'Tenang',
  'Netral',
  'Tertekan',
  'Sangat Tertekan',
];

const EMOJIS = ['😌', '😊', '😐', '😟', '😰'];

describe('MoodSelector', () => {
  it('renders 5 emoji buttons with captions', () => {
    render(<MoodSelector onChange={vi.fn()} />);

    CAPTIONS.forEach((caption) => {
      expect(screen.getByText(caption)).toBeInTheDocument();
    });
  });

  it('calls onChange with correct mood when button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MoodSelector onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: '😊 Tenang' }));
    expect(onChange).toHaveBeenCalledWith('calm');

    await user.click(screen.getByRole('radio', { name: '😰 Sangat tertekan' }));
    expect(onChange).toHaveBeenCalledWith('very_stressed');
  });

  it('renders with aria-checked false for unselected mood', () => {
    render(<MoodSelector onChange={vi.fn()} />);

    const buttons = screen.getAllByRole('radio');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-checked', 'false');
    });
  });

  it('pre-fills selected mood via value prop', () => {
    render(<MoodSelector value="neutral" onChange={vi.fn()} />);

    const neutralButton = screen.getByRole('radio', { name: '😐 Netral' });
    expect(neutralButton).toHaveAttribute('aria-checked', 'true');
  });

  it('each button contains the correct emoji', () => {
    render(<MoodSelector onChange={vi.fn()} />);

    EMOJIS.forEach((emoji) => {
      expect(screen.getByText(emoji)).toBeInTheDocument();
    });
  });
});
