import { describe, expect, it } from 'vitest';

import { shouldRedirectLandingToDashboard } from '@/lib/supabase/middleware';

describe('shouldRedirectLandingToDashboard', () => {
  it('does not redirect logged-in user on / when EBOOK_LIVE is true', () => {
    expect(
      shouldRedirectLandingToDashboard('/', { id: 'user-1' }, true)
    ).toBe(false);
  });

  it('redirects logged-in user on / to /dashboard when EBOOK_LIVE is false', () => {
    expect(
      shouldRedirectLandingToDashboard('/', { id: 'user-1' }, false)
    ).toBe(true);
  });

  it('does not redirect when user is not logged in (regardless of EBOOK_LIVE)', () => {
    expect(shouldRedirectLandingToDashboard('/', null, true)).toBe(false);
    expect(shouldRedirectLandingToDashboard('/', null, false)).toBe(false);
  });

  it('does not redirect on any other path (e.g. /dashboard)', () => {
    expect(
      shouldRedirectLandingToDashboard('/dashboard', { id: 'user-1' }, false)
    ).toBe(false);
    expect(
      shouldRedirectLandingToDashboard('/dashboard/book', { id: 'user-1' }, false)
    ).toBe(false);
  });
});
