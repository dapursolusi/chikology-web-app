import {
  deleteJournalEntry,
  getJournalEntries,
  saveJournalEntry,
} from '@/actions/journal';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

type MockUser = { id: string; email: string } | null;
const mockUser: MockUser = { id: 'test-user-id', email: 'test@test.com' };
const mockGetUser = vi.fn<() => { data: { user: MockUser } }>(() => ({
  data: { user: mockUser },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [{ id: 'new-entry-id' }]),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => []),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve({})),
      })),
    })),
  },
}));

vi.mock('drizzle-orm', () => ({
  isNull: vi.fn(() => 'IS NULL'),
  eq: vi.fn(() => 'EQ'),
  and: vi.fn(() => 'AND'),
  desc: vi.fn(() => 'DESC'),
}));

describe('saveJournalEntry', () => {
  it('returns error when not authenticated', async () => {
    mockGetUser.mockReturnValueOnce({ data: { user: null as MockUser } });
    const result = await saveJournalEntry({ mood: 'calm' });
    expect(result).toEqual({ error: 'Not authenticated' });
  });

  it('returns error when mood is missing', async () => {
    const result = await saveJournalEntry({
      // @ts-expect-error mood is required
      mood: undefined,
    });
    expect(result).toEqual({ error: 'Mood is required' });
  });

  it('returns error when both content and stressTier are missing', async () => {
    const result = await saveJournalEntry({ mood: 'neutral' });
    expect(result).toEqual({
      error: 'At least one of content or stressTier must be provided',
    });
  });

  it('accepts mood with stressTier', async () => {
    const result = await saveJournalEntry({ mood: 'calm', stressTier: 2 });
    expect(result).toEqual({ success: true, entryId: 'new-entry-id' });
  });

  it('accepts mood with content only', async () => {
    const result = await saveJournalEntry({
      mood: 'stressed',
      content: 'Feeling overwhelmed today',
    });
    expect(result).toEqual({ success: true, entryId: 'new-entry-id' });
  });
});

describe('getJournalEntries', () => {
  it('returns empty array when not authenticated', async () => {
    mockGetUser.mockReturnValueOnce({ data: { user: null as MockUser } });
    const result = await getJournalEntries();
    expect(result).toEqual([]);
  });
});

describe('deleteJournalEntry', () => {
  it('returns error when not authenticated', async () => {
    mockGetUser.mockReturnValueOnce({ data: { user: null as MockUser } });
    const result = await deleteJournalEntry('some-id');
    expect(result).toEqual({ error: 'Not authenticated' });
  });
});
