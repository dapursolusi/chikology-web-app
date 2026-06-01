'use client';

import { createBrowserClient } from '@supabase/ssr';

import { getBaseUrl } from './base-url';

export function createClient() {
  return createBrowserClient(
    getBaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
