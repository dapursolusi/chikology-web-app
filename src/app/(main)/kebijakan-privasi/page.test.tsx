import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import KebijakanPrivasiPage from './page';

describe('Kebijakan Privasi page', () => {
  it('renders page heading and key privacy content in Indonesian', () => {
    render(<KebijakanPrivasiPage />);

    expect(
      screen.getByRole('heading', { name: /kebijakan privasi/i })
    ).toBeInTheDocument();

    const dataWajahElements = screen.getAllByText(/data wajah/i);
    expect(dataWajahElements.length).toBeGreaterThan(0);

    expect(screen.getByText(/tidak disimpan/i)).toBeInTheDocument();

    expect(screen.getByText(/UU No\. 27 Tahun 2022/i)).toBeInTheDocument();
  });
});
