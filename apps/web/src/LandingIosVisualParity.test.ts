import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const approvedCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const heroCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');

describe('landing iOS visual parity release', () => {
  it('keeps one canonical landing narrative across desktop and mobile', () => {
    for (const marker of [
      'Healing isn’t optional.',
      'Holding onto the pain is.',
      '<LandingProductStories />',
      '<ComparisonStory />',
      '<FinalCallToAction />'
    ]) expect(landing).toContain(marker);

    for (const marker of [
      'landing-stories__labels',
      'landing-story__label',
      'demo-card',
      'landing-story--${story.id}'
    ]) expect(stories).toContain(marker);

    expect(approvedCss).toContain('founder story on one quiet editorial rail');
  });

  it('tracks the real iOS visual viewport through browser chrome and orientation changes', () => {
    expect(main).toContain('function installMobileViewportStability()');
    expect(main).toContain('window.visualViewport');
    expect(main).toContain("window.addEventListener('orientationchange', syncViewport");
    expect(main).toContain("window.visualViewport?.addEventListener('resize', syncViewport");
    expect(main).toContain("--sovereign-viewport-height");
    expect(main).toContain("dataset.sovereignOrientation");
    expect(main).toContain('installMobileViewportStability();');
  });

  it('lets vertical page scrolling and horizontal field rotation coexist', () => {
    expect(heroCss).toContain('touch-action: pan-y pinch-zoom');
    expect(heroCss).toContain('overscroll-behavior-x: none');
    expect(heroCss).toContain('-webkit-user-select: none');
    expect(heroCss).toContain('-webkit-touch-callout: none');
    expect(heroCss).toContain('backface-visibility: hidden');
  });

  it('preserves the approved portrait composition around iOS safe areas', () => {
    expect(heroCss).toContain('min-height: calc(68px + env(safe-area-inset-top))');
    expect(heroCss).toContain('min-height: max(900px, calc(var(--v8-stable-viewport-height) - 68px + env(safe-area-inset-bottom)))');
    expect(heroCss).toContain('padding-bottom: calc(82px + env(safe-area-inset-bottom))');
    expect(heroCss).toContain('height: calc(82px + env(safe-area-inset-bottom))');
    expect(heroCss).toContain("@supports (-webkit-touch-callout: none)");
  });

  it('handles landscape rotation without creating a second mobile design', () => {
    expect(heroCss).toContain('@media (max-width: 980px) and (orientation: landscape) and (max-height: 560px)');
    expect(heroCss).toContain('min-height: 680px !important');
    expect(heroCss).toContain('height: 350px');
    expect(heroCss).toContain('width: min(720px, 112vw)');
    expect(heroCss).not.toContain('mobile-redesign');
  });

  it('keeps the mobile hero visually clean and reduced-motion complete', () => {
    expect(heroCss).toContain('.landing-expression-slice__readout,');
    expect(heroCss).toContain('.landing-expression-slice__instructions');
    expect(heroCss).toContain('display: none;');
    expect(heroCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(heroCss).toContain('animation: none');
    expect(heroCss).toContain('opacity: 1');
  });
});
