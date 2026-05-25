import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Analyze this person\'s facial expression. Rate stress level 1-5. Return ONLY valid JSON: {"tier": <1-5>}. Tier 1 = relaxed/happy, 2 = mild tension, 3 = moderate stress, 4 = high stress, 5 = severe distress. No other text, no markdown, no backticks.',
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 50,
            temperature: 0.2,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errText);
      return NextResponse.json(
        { error: `Gemini error: ${geminiResponse.status}` },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();
    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: 'Gemini returned empty response' },
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
      console.error('Gemini raw output:', content);
      return NextResponse.json(
        { error: 'Invalid JSON from Gemini' },
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
