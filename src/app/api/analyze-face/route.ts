import { NextRequest, NextResponse } from 'next/server';

import { ensureUserRecord } from '@/actions/auth';
import { db } from '@/db';
import { scanResults, scanUsage } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { OpenAI } from 'openai';

import type { QuestionnaireAnswers } from '@/components/dashboard/scanner/questionData';

import { checkBurst, getBurstState, recordBurst } from '@/lib/rate-limiter';
import { buildPrompt } from '@/lib/scanner/prompt';
import { createClient } from '@/lib/supabase/server';

const DAILY_LIMIT = 5;
const MAX_IMAGE_BYTES = 5_000_000;

async function callAIModel(
  client: OpenAI,
  model: string,
  prompt: string,
  image: string,
  providerName: string
): Promise<string | null> {
  let content: string | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
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
      console.error(`${providerName} call failed:`, e);
    }

    if (content?.trim()) break;

    if (attempt === 1) {
      console.warn(`${providerName} returned empty, retrying...`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return content?.trim() || null;
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

    const today = new Date().toISOString().split('T')[0];
    const burstState = getBurstState(user.id, today);
    const burst = checkBurst(burstState);
    if (!burst.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti' },
        { status: 429 }
      );
    }
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

    const promptWithContext = buildPrompt(
      questionnaire as QuestionnaireAnswers | undefined
    );

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY not configured' },
        { status: 500 }
      );
    }

    const openrouter = new OpenAI({
      apiKey: openrouterKey,
      baseURL: 'https://openrouter.ai/api/v1',
      timeout: 20000,
      maxRetries: 0,
    });

    let content = await callAIModel(
      openrouter,
      'minimax/minimax-m3',
      promptWithContext,
      image,
      'OpenRouter'
    );

    if (!content) {
      console.warn('OpenRouter failed, falling back to SumoPod');

      const sumopod = new OpenAI({
        apiKey: process.env.CHIKOLOGY_SUMOPOD_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
        timeout: 20000,
        maxRetries: 0,
      });

      content = await callAIModel(
        sumopod,
        'MiniMax-M3',
        promptWithContext,
        image,
        'SumoPod'
      );

      if (!content) {
        console.error('Both OpenRouter and SumoPod failed');
        return NextResponse.json(
          { error: 'terjadi kesalahan dari server AI' },
          { status: 502 }
        );
      }
    }

    let tier: number;
    let cues = '';
    let confidence = 'medium';

    try {
      const parsed = JSON.parse(content);
      tier = parsed.tier ?? Math.round(parsed);
      cues = parsed.cues ?? '';
      confidence = parsed.confidence ?? 'medium';
    } catch {
      const match = content.match(/\{[\s\S]*?"tier"\s*:\s*(\d+)/);
      tier = match ? Number(match[1]) : NaN;
    }

    if (!Number.isFinite(tier)) {
      console.error('Parse failed. Content:', content);
      return NextResponse.json(
        { error: 'terjadi kesalahan dari server AI' },
        { status: 502 }
      );
    }

    tier = Math.max(1, Math.min(5, Math.round(tier)));

    await db
      .insert(scanUsage)
      .values({ userId: user.id, scanDate: today, count: 1 })
      .onConflictDoUpdate({
        target: [scanUsage.userId, scanUsage.scanDate],
        set: { count: sql`scan_usage.count + 1` },
      });

    recordBurst(burstState);

    await db.insert(scanResults).values({
      userId: user.id,
      tier,
      cues,
      confidence,
      questionnaireAnswers: questionnaire ?? null,
    });

    return NextResponse.json({ tier });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
