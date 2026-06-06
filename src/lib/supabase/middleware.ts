import { type NextRequest, NextResponse } from 'next/server';

import { createServerClient } from '@supabase/ssr';

import { getEbookLive } from '@/lib/feature-flags';

import { getBaseUrl } from './base-url';

export function shouldRedirectLandingToDashboard(
  path: string,
  user: { id: string } | null,
  ebookLive: boolean
): boolean {
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

  // Redirect authenticated users from landing to dashboard,
  // but only when the e-book hasn't launched yet. At full launch
  // (EBOOK_LIVE=true) the landing page is the marketing surface that
  // shows the embedded chapter list.
  if (shouldRedirectLandingToDashboard(path, user, await getEbookLive())) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
