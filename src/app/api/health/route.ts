import { NextResponse } from 'next/server';

import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json(
      {
        status: 'ok',
        db: 'connected',
        timestamp: Date.now(),
        version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        db: 'disconnected',
        timestamp: Date.now(),
      },
      { status: 503 }
    );
  }
}
