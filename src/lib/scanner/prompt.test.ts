import { describe, expect, it } from 'vitest';

import { buildPrompt, formatAnswers } from './prompt';

describe('formatAnswers', () => {
  it('returns empty string when no answers provided', () => {
    expect(formatAnswers({})).toBe('');
  });

  it('formats single-string answers with question labels', () => {
    const result = formatAnswers({
      q2: 'Senang',
      q3: 'Kesepian karena tidak ada support system',
    });
    expect(result).toContain('Apa yang kamu rasakan saat ini?: Senang');
    expect(result).toContain(
      'Apa yang paling mengganggumu saat ini?: Kesepian karena tidak ada support system'
    );
  });

  it('formats array answers as comma-separated values', () => {
    const result = formatAnswers({
      q1: ['Pekerjaan', 'Keluarga (Pasangan, Anak, Orang Tua)'],
    });
    expect(result).toContain('Pekerjaan, Keluarga (Pasangan, Anak, Orang Tua)');
  });

  it('handles mixed array and string answers together', () => {
    const result = formatAnswers({
      q1: ['Pekerjaan', 'Diri Sendiri'],
      q2: 'Cemas',
      q3: 'Ketakutan masa depan',
    });
    expect(result).toContain('Pekerjaan, Diri Sendiri');
    expect(result).toContain('Cemas');
    expect(result).toContain('Ketakutan masa depan');
  });
});

describe('buildPrompt', () => {
  it('includes base clinical prompt and weighting rules when no answers', () => {
    const prompt = buildPrompt();
    expect(prompt).toContain('tier');
    expect(prompt).toContain('micro-tension');
    expect(prompt).toContain('60%');
    expect(prompt).toContain('40%');
    expect(prompt).not.toContain('[Konteks Kuesioner]');
  });

  it('includes formatted questionnaire context when answers provided', () => {
    const prompt = buildPrompt({
      q1: ['Pekerjaan'],
      q2: 'Cemas',
      q3: 'Ketakutan masa depan',
    });
    expect(prompt).toContain('[Konteks Kuesioner]');
    expect(prompt).toContain('Pekerjaan');
    expect(prompt).toContain('Cemas');
    expect(prompt).toContain('Ketakutan masa depan');
  });

  it('contains tier markers from stressLevels signs arrays', () => {
    const prompt = buildPrompt();
    expect(prompt).toContain('Tier 1 (Relaxed / Low Stress)');
    expect(prompt).toContain('rileks/netral/positif');
    expect(prompt).toContain('Tier 3 (Moderate Stress');
    expect(prompt).toContain('rahang kaku, alis mengerut');
    expect(prompt).toContain('Tier 5 (Severe Stress');
    expect(prompt).toContain('distress tinggi');
  });

  it('contains reality instruction about neutral faces and micro-tension', () => {
    const prompt = buildPrompt();
    expect(prompt).toContain('REALITY INSTRUCTION');
    expect(prompt).toContain('micro-tension');
    expect(prompt).toContain('wajah netral');
    expect(prompt).toContain('kekakuan rahang');
  });
});
