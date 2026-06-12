import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|ebook_cover.png|sitemap.xml|robots.txt|api/analyze-face|api/health).*)',
  ],
};
