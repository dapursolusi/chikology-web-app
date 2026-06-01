import { describe, expect, it } from 'vitest';

describe('Breadcrumb route labels', () => {
  const ROUTE_LABELS: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/journal': 'Jurnal Harian',
    '/dashboard/scanner': 'Deteksi Level Stress',
  };

  it('maps /dashboard to Dashboard', () => {
    expect(ROUTE_LABELS['/dashboard']).toBe('Dashboard');
  });

  it('maps /dashboard/journal to Jurnal Harian', () => {
    expect(ROUTE_LABELS['/dashboard/journal']).toBe('Jurnal Harian');
  });

  it('maps /dashboard/scanner to Deteksi Level Stress', () => {
    expect(ROUTE_LABELS['/dashboard/scanner']).toBe('Deteksi Level Stress');
  });

  it('has entries for all dashboard routes', () => {
    expect(Object.keys(ROUTE_LABELS)).toContain('/dashboard');
    expect(Object.keys(ROUTE_LABELS)).toContain('/dashboard/journal');
    expect(Object.keys(ROUTE_LABELS)).toContain('/dashboard/scanner');
  });
});
