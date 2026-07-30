import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');

describe('public metadata and fallback documents', () => {
  it('uses the current self, relationship, and system positioning in document metadata', () => {
    expect(index).toContain('Know yourself. Understand the system. Choose what fits.');
    expect(index).toContain('Private AI for understanding yourself, your relationships, and the systems around you.');
    expect(index).toContain('Private personal, relationship, and system intelligence');
    expect(index).not.toContain('Personal AI for real life');
    expect(index).not.toContain('the decisions in front of you');
  });

  it('keeps the static 404 on the current cohesion assets and product category', () => {
    for (const asset of [
      '/launch.css?v=20260730-cohesion',
      '/launch-polish.css?v=20260730-cohesion',
      '/static-release.css?v=20260730-cohesion',
      '/static-experience.css?v=20260730-cohesion'
    ]) {
      expect(notFound).toContain(asset);
    }
    expect(notFound).toContain('Private AI for personal, relationship, and system intelligence');
    expect(notFound).not.toContain('20260728-baseline-first');
    expect(notFound).not.toContain('20260729-visual-sync');
  });
});
