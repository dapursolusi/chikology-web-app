import { NextResponse } from 'next/server';

import { ensureUserRecord } from '@/actions/auth';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/?auth=error&reason=${error}`);
  }

  if (code) {
    try {
      const supabase = await createClient();
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
        }

        return NextResponse.redirect(`${origin}/dashboard`);
      }

      console.error('Session exchange error:', exchangeError);
    } catch (e) {
      console.error('Callback handler error:', e);
    }
  }

  return NextResponse.redirect(`${origin}/?auth=error`);
}
