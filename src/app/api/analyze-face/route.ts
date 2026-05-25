import { NextRequest, NextResponse } from 'next/server';

import Groq from 'groq-sdk';

const groq = new Groq();

const STRESS_PROMPT = `Analyze facial expression for stress. Rate 1-5.

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
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      );
    }

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: STRESS_PROMPT },
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
      max_tokens: 50,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Groq returned empty response' },
        { status: 502 }
      );
    }

    const cleaned = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    let result: { tier: number };
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error('Groq raw output:', content);
      return NextResponse.json(
        { error: 'Invalid JSON from Groq' },
        { status: 502 }
      );
    }

    const tier = Math.max(1, Math.min(5, Math.round(result.tier)));

    return NextResponse.json({ tier });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
