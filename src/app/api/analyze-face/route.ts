import { NextRequest, NextResponse } from 'next/server';

import { OpenAI } from 'openai';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, questionnaire } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
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
      if (!content) {
        console.error(
          'MiniMax-M3 empty content, full response:',
          JSON.stringify(response)
        );
      }
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

    return NextResponse.json({ tier });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
