import { NextResponse } from 'next/server';

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
        return NextResponse.redirect(`${origin}/dashboard`);
      }

      console.error('Session exchange error:', exchangeError);
    } catch (e) {
      console.error('Callback handler error:', e);
    }
  }

  return NextResponse.redirect(`${origin}/?auth=error`);
}
