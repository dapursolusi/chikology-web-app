import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return raw.replace('/rest/v1/', '');
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getBaseUrl(), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // ignore — called from Server Component that can't set cookies
          }
        });
      },
    },
  });
}
