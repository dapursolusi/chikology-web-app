import { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/server');
vi.mock('@/actions/auth');
vi.mock('@/db');
vi.mock('@/db/schema');
vi.mock('drizzle-orm');
vi.mock('openai', () => ({
  OpenAI: vi.fn(),
}));

const mockUserId = 'user-1';
const mockEmail = 'user@test.com';
const MOCK_SCAN_USAGE = {
  userId: Symbol('userId'),
  scanDate: Symbol('scanDate'),
  count: Symbol('count'),
};

function makeRequest(body: Record<string, unknown> = { image: 'fakebase64' }) {
  return new NextRequest('http://localhost/api/analyze-face', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/analyze-face', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.stubEnv('OPENROUTER_API_KEY', 'sk-openrouter-test');
    vi.stubEnv('CHIKOLOGY_SUMOPOD_API_KEY', 'sk-sumopod-test');
    vi.stubEnv('OPENAI_BASE_URL', 'https://ai.sumopod.com/v1');

    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId, email: mockEmail } },
        }),
      },
    } as never);

    const { ensureUserRecord } = await import('@/actions/auth');
    vi.mocked(ensureUserRecord).mockResolvedValue(undefined);

    const { scanUsage } = await import('@/db/schema');
    Object.assign(
      scanUsage as unknown as Record<string, unknown>,
      MOCK_SCAN_USAGE
    );

    const { eq, and, sql } = await import('drizzle-orm');
    vi.mocked(eq).mockImplementation((col, val) => ({ col, val }) as never);
    vi.mocked(and).mockReturnValue({} as never);
    vi.mocked(sql).mockImplementation(
      (strings: TemplateStringsArray) => strings.join('') as never
    );

    const { db } = await import('@/db');
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ count: 0 }])),
        })),
      })),
    } as never);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn().mockResolvedValue([]),
      })),
    } as never);
  });

  it('returns tier when OpenRouter succeeds', async () => {
    const { OpenAI } = await import('openai');

    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: '{"tier": 3}' } }],
    });
    vi.mocked(OpenAI).mockImplementation(function () {
      return { chat: { completions: { create: mockCreate } } };
    } as never);

    const { POST } = await import('./route');
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ tier: 3 });
  });

  it('falls back to SumoPod when OpenRouter fails, returns tier', async () => {
    const { OpenAI } = await import('openai');

    const mockCreate = vi.fn();
    mockCreate
      .mockImplementationOnce(() => {
        throw new Error('OpenRouter down');
      })
      .mockImplementationOnce(() => {
        throw new Error('OpenRouter retry');
      })
      .mockResolvedValueOnce({
        choices: [{ message: { content: '{"tier": 4}' } }],
      });

    vi.mocked(OpenAI).mockImplementation(function () {
      return { chat: { completions: { create: mockCreate } } };
    } as never);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { POST } = await import('./route');
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ tier: 4 });
    expect(warnSpy).toHaveBeenCalledWith(
      'OpenRouter failed, falling back to SumoPod'
    );
    warnSpy.mockRestore();
  });

  it('returns 502 when both OpenRouter and SumoPod fail', async () => {
    const { OpenAI } = await import('openai');

    const mockCreate = vi
      .fn()
      .mockRejectedValue(new Error('All providers down'));
    vi.mocked(OpenAI).mockImplementation(function () {
      return { chat: { completions: { create: mockCreate } } };
    } as never);

    const { POST } = await import('./route');
    const response = await POST(makeRequest());

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe('terjadi kesalahan dari server AI');
  });

  it('extracts cues and confidence when AI returns them', async () => {
    const { OpenAI } = await import('openai');

    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content:
              '{"tier": 3, "cues": "rahang kaku, alis mengerut ringan", "confidence": "high"}',
          },
        },
      ],
    });
    vi.mocked(OpenAI).mockImplementation(function () {
      return { chat: { completions: { create: mockCreate } } };
    } as never);

    const { POST } = await import('./route');
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ tier: 3 });
  });

  it('auto-saves scan result after successful analysis', async () => {
    const { OpenAI } = await import('openai');
    const { scanResults } = await import('@/db/schema');

    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: '{"tier": 3, "cues": "rahang kaku", "confidence": "high"}',
          },
        },
      ],
    });
    vi.mocked(OpenAI).mockImplementation(function () {
      return { chat: { completions: { create: mockCreate } } };
    } as never);

    const { db } = await import('@/db');
    const insertSpy = vi.mocked(db.insert);
    insertSpy.mockImplementation(() => {
      const chain = {
        values: vi.fn(() => ({
          onConflictDoUpdate: vi.fn().mockResolvedValue([]),
        })),
      };
      return chain as never;
    });

    const { POST } = await import('./route');
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(insertSpy).toHaveBeenCalledTimes(2);

    const secondCallArgs = insertSpy.mock.calls[1];
    expect(secondCallArgs[0]).toBe(scanResults);
  });
});
