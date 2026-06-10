import { NextRequest, NextResponse } from 'next/server';

import { ensureUserRecord } from '@/actions/auth';
import { db } from '@/db';
import { scanUsage } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { OpenAI } from 'openai';

import { createClient } from '@/lib/supabase/server';

const STRESS_PROMPT = `Analyze facial expression for stress in detail. Rate 1-5.

RULES:
- 1: Relaxed. Soft face, gentle eyes, zero muscle tension. Smile or calm-neutral.
- 2: Mild. Very subtle tension in 1 area (brow or mouth). Still appears mostly relaxed.
- 3: Moderate. Visible tension in 2+ areas. Flat affect with tight jaw or furrowed brow. WARNING: Do NOT default here.
- 4: High. Hard expression, obvious clenching, compressed lips, tight eyes.
- 5: Severe. Extreme tension, grimacing, distress.

CRITICAL:
- A neutral face with NO tension = 1 (not 3). Calm neutral is relaxed.
- A neutral face with TENSE features (tight jaw, furrowed brow) = 3+.
- If totally ambiguous with zero tension cues = 2 (not 3).
- Only use 3 when you clearly see tension in multiple zones.

Return {"tier": <1-5>}. JSON only.`;

const DAILY_LIMIT = 5;
const BURST_LIMIT = 3;
const BURST_WINDOW_MS = 2 * 60 * 1000;
const COOLDOWN_MS = 60 * 60 * 1000;
const MAX_IMAGE_BYTES = 5_000_000;

type BurstState = {
  burstCount: number;
  windowStart: number;
  cooldownUntil: number;
};
const burstMap = new Map<string, BurstState>();

function getBurstState(userId: string): BurstState {
  let state = burstMap.get(userId);
  if (!state || Date.now() > state.cooldownUntil) {
    state = { burstCount: 0, windowStart: Date.now(), cooldownUntil: 0 };
    burstMap.set(userId, state);
  }
  return state;
}

function checkBurst(userId: string): { allowed: boolean; reason?: string } {
  const state = getBurstState(userId);

  if (Date.now() < state.cooldownUntil) {
    return { allowed: false, reason: 'cooldown' };
  }

  if (Date.now() - state.windowStart > BURST_WINDOW_MS) {
    state.burstCount = 0;
    state.windowStart = Date.now();
  }

  if (state.burstCount >= BURST_LIMIT) {
    state.cooldownUntil = Date.now() + COOLDOWN_MS;
    return { allowed: false, reason: 'burst' };
  }

  return { allowed: true };
}

function recordBurst(userId: string) {
  const state = getBurstState(userId);
  state.burstCount++;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await ensureUserRecord(user.id, user.email ?? '');

    const body = await request.json();
    const { image, questionnaire } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (image.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: 'Ukuran gambar terlalu besar. Maksimal 5MB' },
        { status: 413 }
      );
    }

    const burst = checkBurst(user.id);
    if (!burst.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti' },
        { status: 429 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const usage = await db
      .select({ count: scanUsage.count })
      .from(scanUsage)
      .where(and(eq(scanUsage.userId, user.id), eq(scanUsage.scanDate, today)))
      .limit(1);

    const scanCount = usage[0]?.count ?? 0;
    if (scanCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: 'Kuota scan Anda sudah habis untuk hari ini' },
        { status: 429 }
      );
    }

    const apiKey =
      process.env.CHIKOLOGY_SUMOPOD_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'CHIKOLOGY_SUMOPOD_API_KEY or GROQ_API_KEY not configured' },
        { status: 500 }
      );
    }

    const promptWithContext = questionnaire
      ? `${STRESS_PROMPT}\n\n[Questionnaire Answers]\n${JSON.stringify(questionnaire, null, 2)}`
      : STRESS_PROMPT;

    const sumopod = new OpenAI({
      apiKey: process.env.CHIKOLOGY_SUMOPOD_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
      timeout: 20000,
      maxRetries: 0,
    });

    let content: string | null = null;

    try {
      const response = await sumopod.chat.completions.create({
        model: 'MiniMax-M3',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptWithContext },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 300,
      });
      content = response.choices?.[0]?.message?.content;
    } catch (e) {
      console.error('SumoPod call failed:', e);
    }

    if (!content) {
      return NextResponse.json(
        { error: 'SumoPod returned empty response' },
        { status: 502 }
      );
    }

    const tierMatch = content.match(/\{[\s\S]*?"tier"\s*:\s*(\d+)[\s\S]*?\}/);
    if (!tierMatch) {
      return NextResponse.json(
        { error: 'Invalid JSON from model', raw: content },
        { status: 502 }
      );
    }

    const tier = Math.max(1, Math.min(5, Math.round(Number(tierMatch[1]))));

    await db
      .insert(scanUsage)
      .values({ userId: user.id, scanDate: today, count: 1 })
      .onConflictDoUpdate({
        target: [scanUsage.userId, scanUsage.scanDate],
        set: { count: sql`scan_usage.count + 1` },
      });

    recordBurst(user.id);

    return NextResponse.json({ tier });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
