import { type NextRequest, NextResponse } from 'next/server';

import { ensureUserRecord, getUserRole } from '@/actions/auth';

import { createClient } from '@/lib/supabase/server';

function getAppOrigin(origin: string) {
  return process.env.NODE_ENV === 'production'
    ? 'https://www.chikology.id'
    : origin;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const appOrigin = getAppOrigin(origin);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${appOrigin}/?auth=error&reason=${error}`);
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

          const role = await getUserRole(user.id);
          if (role && role !== user.user_metadata?.role) {
            await supabase.auth.updateUser({
              data: { role },
            });
          }
        }

        return NextResponse.redirect(`${appOrigin}/dashboard`);
      }

      console.error('Session exchange error:', exchangeError);
    } catch (e) {
      console.error('Callback handler error:', e);
    }
  }

  return NextResponse.redirect(`${appOrigin}/?auth=error`);
}
