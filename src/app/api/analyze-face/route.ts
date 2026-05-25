import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
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
                  text: 'Analyze this person\'s facial expression. Return ONLY valid JSON: {"tier": <1-5>}. Tier 1 = relaxed/happy, 2 = mild tension, 3 = moderate stress, 4 = high stress, 5 = severe distress. Base it purely on visible facial expression. No other text, only JSON.',
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
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errText);
      return NextResponse.json(
        { error: 'AI analysis failed' },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();
    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return NextResponse.json({ error: 'Empty AI response' }, { status: 502 });
    }

    let result: { tier: number };
    try {
      result = JSON.parse(content.trim());
    } catch {
      return NextResponse.json(
        { error: 'Invalid AI response format' },
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
