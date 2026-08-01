import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');

describe('founder v0 demonstration evidence contract', () => {
  it('uses only supported illustrative Basis source types', () => {
    for (const marker of [
      'GATE 22.4',
      'GATE 57.2',
      'GATE 22 ×3',
      'GATE 57 ×1',
      'Illustrative personality gate and line',
      'Illustrative natal Sun placement',
      'Illustrative Gene Key activation'
    ]) {
      expect(landing).toContain(marker);
    }

    for (const unsupported of [
      'AUTH ·',
      'AUTH·',
      'Emotional Authority',
      'Splenic Authority',
      'SPLENIC ×1'
    ]) {
      expect(landing).not.toContain(unsupported);
    }
  });

  it('keeps relationship and system claims permission-safe and confirmable', () => {
    expect(landing).toContain('using only permitted information');
    expect(landing).toContain('No compatibility score');
    expect(landing).toContain('No private-thought claims');
    expect(landing).toContain('That is a possible coordination pattern—not a verdict about any person.');
    expect(landing).toContain('The actual experience still belongs to each person to confirm.');
    expect(landing).toContain('Each person controls what may be included');
  });

  it('keeps the founder v0 outlined hero line visible at normal viewport scale', () => {
    expect(landing).toContain("WebkitTextStroke: '1.25px rgba(232, 221, 208, 0.58)'");
    expect(landing).toContain("color: 'rgba(15, 15, 15, 0.96)'");
    expect(landing).toContain('Holding onto the pain is.');
  });
});
