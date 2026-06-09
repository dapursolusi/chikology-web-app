import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';

import { getBaseUrl } from './base-url';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getBaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );
}

export function createServiceClient() {
  return createServerClient(
    getBaseUrl(),
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // no-op — service role doesn't need cookies
        },
      },
    }
  );
}
