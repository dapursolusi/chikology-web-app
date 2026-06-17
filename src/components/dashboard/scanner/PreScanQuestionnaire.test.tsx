import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PreScanQuestionnaire } from './PreScanQuestionnaire';

describe('PreScanQuestionnaire', () => {
  it('disables submit button when no answers are provided', () => {
    const onSubmit = vi.fn();
    render(<PreScanQuestionnaire onSubmit={onSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /mulai kamera/i });
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button when at least one question is answered', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PreScanQuestionnaire onSubmit={onSubmit} />);

    const sedihRadio = screen.getByRole('radio', { name: /sedih/i });
    await user.click(sedihRadio);

    const submitBtn = screen.getByRole('button', { name: /mulai kamera/i });
    expect(submitBtn).toBeEnabled();
  });

  it('submits only answered questions when partially filled', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PreScanQuestionnaire onSubmit={onSubmit} />);

    const sedihRadio = screen.getByRole('radio', { name: /sedih/i });
    await user.click(sedihRadio);

    const submitBtn = screen.getByRole('button', { name: /mulai kamera/i });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith({ q2: 'Sedih' });
  });

  it('submits all answered questions when fully filled', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PreScanQuestionnaire onSubmit={onSubmit} />);

    await user.click(screen.getByRole('checkbox', { name: /pekerjaan/i }));
    await user.click(screen.getByRole('checkbox', { name: /keluarga/i }));
    await user.click(screen.getByRole('radio', { name: /cemas/i }));
    await user.click(
      screen.getByRole('radio', { name: /ketakutan masa depan/i })
    );

    const submitBtn = screen.getByRole('button', { name: /mulai kamera/i });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith({
      q1: ['Pekerjaan', 'Keluarga (Pasangan, Anak, Orang Tua)'],
      q2: 'Cemas',
      q3: 'Ketakutan masa depan',
    });
  });

  it('submits empty object when skip is confirmed', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PreScanQuestionnaire onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /lewati/i }));

    const modalSkipBtn = screen.getByRole('button', { name: /^lewati$/i });
    await user.click(modalSkipBtn);

    expect(onSubmit).toHaveBeenCalledWith({});
  });
});
