import { type NextRequest, NextResponse } from 'next/server';

import { ensureUserRecord, getUserRole } from '@/actions/auth';
import { type CookieOptions, createServerClient } from '@supabase/ssr';

import { getBaseUrl } from '@/lib/supabase/base-url';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'undefined';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'undefined';
  const baseUrl = getBaseUrl();
  console.log(
    `DIAGNOSTIC: URL=${url} (len=${url.length}), Key=${key.substring(0, 10)}... (len=${key.length}), BaseUrl=${baseUrl}`
  );
  throw new Error(
    `DIAGNOSTIC: URL=${url.substring(0, 35)} (len=${url.length}), Key=${key.substring(0, 30)}... (len=${key.length}), BaseUrl=${baseUrl}`
  );

  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/?auth=error&reason=${error}`);
  }

  if (code) {
    const response = new NextResponse();

    const supabase = createServerClient(
      getBaseUrl(),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }: {
                name: string;
                value: string;
                options?: CookieOptions;
              }) =>
                response.cookies.set(
                  name,
                  value,
                  options as Record<string, string>
                )
            );
          },
        },
      }
    );

    try {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await ensureUserRecord(
            user.id,
            user.email ?? '',
            user.user_metadata?.full_name ?? user.user_metadata?.name,
            user.user_metadata?.avatar_url ?? user.user_metadata?.picture
          );

          const role = await getUserRole(user.id);
          if (role && role !== user.user_metadata?.role) {
            await supabase.auth.updateUser({
              data: { role },
            });
          }
        }

        const redirectUrl = new URL('/dashboard', origin);
        const redirectResponse = NextResponse.redirect(redirectUrl);

        response.cookies.getAll().forEach(({ name, value, ...rest }) => {
          redirectResponse.cookies.set(name, value, rest);
        });

        return redirectResponse;
      }

      console.error('Session exchange error:', exchangeError);
    } catch (e) {
      console.error('Callback handler error:', e);
    }
  }

  return NextResponse.redirect(`${origin}/?auth=error`);
}
