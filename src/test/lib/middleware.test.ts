import { describe, expect, it } from 'vitest';

import {
  getBypassRedirect,
  shouldRedirectLandingToDashboard,
} from '@/lib/supabase/middleware';

describe('getBypassRedirect', () => {
  it('returns true when bypass-redirect query param is "true"', () => {
    const url = new URL('http://localhost/?bypass-redirect=true');
    expect(getBypassRedirect(url)).toBe(true);
  });

  it('returns false when bypass-redirect query param is absent', () => {
    const url = new URL('http://localhost/');
    expect(getBypassRedirect(url)).toBe(false);
  });

  it('returns false when bypass-redirect query param is not "true"', () => {
    const url = new URL('http://localhost/?bypass-redirect=yes');
    expect(getBypassRedirect(url)).toBe(false);
  });
});

describe('shouldRedirectLandingToDashboard', () => {
  it('does not redirect logged-in user on / when EBOOK_LIVE is true', () => {
    expect(shouldRedirectLandingToDashboard('/', { id: 'user-1' }, true)).toBe(
      false
    );
  });

  it('redirects logged-in user on / to /dashboard when EBOOK_LIVE is false', () => {
    expect(shouldRedirectLandingToDashboard('/', { id: 'user-1' }, false)).toBe(
      true
    );
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
      shouldRedirectLandingToDashboard(
        '/dashboard/book',
        { id: 'user-1' },
        false
      )
    ).toBe(false);
  });

  it('bypasses redirect when bypassRedirect is true even if EBOOK_LIVE is false', () => {
    expect(
      shouldRedirectLandingToDashboard('/', { id: 'user-1' }, false, true)
    ).toBe(false);
  });

  it('still redirects when bypassRedirect is false and EBOOK_LIVE is false', () => {
    expect(
      shouldRedirectLandingToDashboard('/', { id: 'user-1' }, false, false)
    ).toBe(true);
  });

  it('defaults bypassRedirect to false for backward compatibility', () => {
    // Calling with 3 args (no bypassRedirect) should behave like false
    expect(shouldRedirectLandingToDashboard('/', { id: 'user-1' }, false)).toBe(
      true
    );
  });
});
