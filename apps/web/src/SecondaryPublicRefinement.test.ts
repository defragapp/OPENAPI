import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const howItWorks = read('../public/how-it-works.html');
const pricing = read('../public/pricing.html');
const secondaryCss = read('../public/v0-public-static.css');
const policyCss = read('./public-secondary-pages-locked.css');
const renderedVisualVerifier = read('../../../scripts/verify-live-visual-release-v3.mjs');

describe('secondary public refinement release', () => {
  it('keeps the refinement isolated to secondary public surfaces', () => {
    expect(howItWorks).toContain('/v0-public-static.css?v=20260803-refined-v2');
    expect(pricing).toContain('/v0-public-static.css?v=20260803-refined-v2');
    expect(secondaryCss).toContain('Sovereign.OS secondary public surfaces');
    expect(secondaryCss).not.toContain('.v0-hero');
    expect(secondaryCss).not.toContain('.landing-story--personal');
    expect(policyCss).toContain('.public-secondary-page');
    expect(policyCss).not.toContain('.public-approved-v8 .v0-hero');
    expect(policyCss).not.toContain('.public-approved-v8 .landing-story');
  });

  it('brings Privacy and Terms into the same readable secondary-page scale', () => {
    expect(policyCss).toContain('width: min(1080px, calc(100% - 72px))');
    expect(policyCss).toContain('font-size: 0.9rem');
    expect(policyCss).toContain('min-height: 44px');
    expect(policyCss).toContain('@media (max-width: 430px)');
    expect(policyCss).toContain('width: calc(100% - 28px)');
  });

  it('requires real phone-width visual verification at both target sizes', () => {
    expect(renderedVisualVerifier).toContain("name: 'mobile-390x844'");
    expect(renderedVisualVerifier).toContain('viewport: { width: 390, height: 844');
    expect(renderedVisualVerifier).toContain("name: 'mobile-430x932'");
    expect(renderedVisualVerifier).toContain('viewport: { width: 430, height: 932');
    expect(renderedVisualVerifier).toContain('minimumBandCorrelation: 0.08');
    expect(renderedVisualVerifier).not.toContain('minimumBandCorrelation: 0.00');
  });

  it('preserves phone readability and touch-size safeguards', () => {
    expect(secondaryCss).toContain('@media (max-width: 760px)');
    expect(secondaryCss).toContain('@media (max-width: 430px)');
    expect(secondaryCss).toContain('min-height: 44px');
    expect(secondaryCss).toContain('overflow-x: clip');
  });
});
