// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { chapterSchema } from './chapter';

describe('chapterSchema', () => {
  it('rejects empty title', () => {
    const result = chapterSchema.safeParse({
      title: '',
      chapter_number: 1,
      price_idr: 0,
      release_date: '',
      is_free: true,
      pdf: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title');
    }
  });

  it('rejects non-positive chapter_number', () => {
    const result = chapterSchema.safeParse({
      title: 'Bab 0',
      chapter_number: 0,
      price_idr: 0,
      release_date: '',
      is_free: true,
      pdf: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('chapter_number');
    }
  });

  it('rejects negative price_idr', () => {
    const result = chapterSchema.safeParse({
      title: 'Bab 1',
      chapter_number: 1,
      price_idr: -1,
      release_date: '',
      is_free: true,
      pdf: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('price_idr');
    }
  });

  it('accepts valid create values', () => {
    const fakePdf = new File(['pdf'], '1-123456.pdf', {
      type: 'application/pdf',
    });
    const result = chapterSchema.safeParse({
      title: 'Bab 1',
      chapter_number: 1,
      price_idr: 0,
      release_date: '2026-06-16',
      is_free: true,
      pdf: fakePdf,
    });
    expect(result.success).toBe(true);
  });

  it('accepts blank release_date as empty string (action handles normalization)', () => {
    const fakePdf = new File(['pdf'], '1-123456.pdf', {
      type: 'application/pdf',
    });
    const result = chapterSchema.safeParse({
      title: 'Bab 1',
      chapter_number: 1,
      price_idr: 0,
      release_date: '',
      is_free: true,
      pdf: fakePdf,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.release_date).toBe('');
    }
  });

  it('truncates title at 255 chars', () => {
    const longTitle = 'x'.repeat(256);
    const result = chapterSchema.safeParse({
      title: longTitle,
      chapter_number: 1,
      price_idr: 0,
      release_date: '',
      is_free: true,
      pdf: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title');
    }
  });

  it('rejects price_idr > 0 when is_free is true', () => {
    const result = chapterSchema.safeParse({
      title: 'Bab 1',
      chapter_number: 1,
      price_idr: 1000,
      release_date: '',
      is_free: true,
      pdf: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('price_idr');
    }
  });

  it('accepts price_idr > 0 when is_free is false', () => {
    const result = chapterSchema.safeParse({
      title: 'Bab 1',
      chapter_number: 1,
      price_idr: 49000,
      release_date: '',
      is_free: false,
      pdf: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-PDF file', () => {
    const fakeImg = new File(['img'], 'cover.png', { type: 'image/png' });
    const result = chapterSchema.safeParse({
      title: 'Bab 1',
      chapter_number: 1,
      price_idr: 0,
      release_date: '',
      is_free: true,
      pdf: fakeImg,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('pdf');
    }
  });

  it('rejects PDF larger than 50MB', () => {
    const bigPdf = new File([new Uint8Array(51 * 1024 * 1024)], 'big.pdf', {
      type: 'application/pdf',
    });
    const result = chapterSchema.safeParse({
      title: 'Bab 1',
      chapter_number: 1,
      price_idr: 0,
      release_date: '',
      is_free: true,
      pdf: bigPdf,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('pdf');
    }
  });

  it('accepts missing pdf field (undefined)', () => {
    const result = chapterSchema.safeParse({
      title: 'Bab 1',
      chapter_number: 1,
      price_idr: 0,
      release_date: '',
      is_free: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pdf).toBeNull();
    }
  });
});

describe('chapterSchema — node env compatibility', () => {
  it('does not throw ReferenceError when FileList is undefined', () => {
    expect(typeof FileList).toBe('undefined');

    const result = chapterSchema.safeParse({
      title: 'Bab 1',
      chapter_number: 1,
      price_idr: 0,
      release_date: '',
      is_free: true,
      pdf: null,
    });

    expect(result.success).toBe(true);
  });
});
