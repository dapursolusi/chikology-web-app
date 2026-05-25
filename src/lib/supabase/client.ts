'use client';

import { createBrowserClient } from '@supabase/ssr';

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return raw.replace('/rest/v1/', '');
}

export function createClient() {
  return createBrowserClient(
    getBaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
