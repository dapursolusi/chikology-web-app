import { type NextRequest, NextResponse } from 'next/server';

import { createServerClient } from '@supabase/ssr';

import { getEbookLive } from '@/lib/feature-flags';

import { getBaseUrl } from './base-url';

/**
 * Check if the `bypass-redirect` query parameter is set to `"true"`,
 * allowing smoke-testing the landing page while authenticated without
 * being redirected to /dashboard.
 *
 * This function reads the URL query param. `updateSession` also checks
 * a matching cookie for flexibility.
 */
export function getBypassRedirect(url: URL): boolean {
  return url.searchParams.get('bypass-redirect') === 'true';
}

export function shouldRedirectLandingToDashboard(
  path: string,
  user: { id: string } | null,
  ebookLive: boolean,
  bypassRedirect: boolean = false
): boolean {
  if (bypassRedirect) return false;
  return path === '/' && user !== null && !ebookLive;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    getBaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protect dashboard routes — redirect to landing if not authenticated
  if (path.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'login');
    return NextResponse.redirect(url);
  }

  // Determine if the redirect should be bypassed (for smoke testing).
  const bypassRedirect =
    getBypassRedirect(request.nextUrl) ||
    request.cookies.get('bypass-redirect')?.value === 'true';

  // Redirect authenticated users from landing to dashboard,
  // but only when the e-book hasn't launched yet. At full launch
  // (EBOOK_LIVE=true) the landing page is the marketing surface that
  // shows the embedded chapter list.
  if (
    shouldRedirectLandingToDashboard(
      path,
      user,
      await getEbookLive(),
      bypassRedirect
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
