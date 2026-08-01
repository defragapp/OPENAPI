import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const v0Styles = readFileSync(new URL('./v0-visual-port.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');

describe('shared Sovereign intelligence stage', () => {
  it('uses visible v0 reasoning publicly and the real answer hierarchy after authentication', () => {
    expect(landing).toContain('How Sovereign works it through');
    expect(landing).toContain('How Sovereign reads both of you');
    expect(landing).toContain('className="v0-baseline-trace"');
    expect(landing).toContain('function ProcessingFlow(');
    expect(landing).toContain('className="v0-window v0-flow"');
    expect(landing).toContain('className="v0-family-map"');
    expect(workspace).toContain('<SovereignAnswerView');
    expect(workspace).toContain('<RelationshipAnswer');
    expect(workspace).toContain('<SystemAnswer');
    expect(workspace).toContain('<BasisStrip');
  });

  it('keeps stable evidence, interpretation, and actual experience distinct', () => {
    expect(landing).toContain('Grounded in');
    expect(landing).toContain('Illustrative Baseline');
    expect(landing).toContain('That is a possible coordination pattern—not a verdict about any person.');
    expect(landing).toContain('The actual experience still belongs to each person to confirm.');
    expect(landing).toContain('No private-thought claims');
  });

  it('is responsive, interactive, and reduced-motion safe', () => {
    expect(landing).toContain('aria-label="Illustrative family system map"');
    expect(landing).toContain('role="tab"');
    expect(landing).toContain('aria-selected={index === questionIndex}');
    expect(workspace).toContain('const limit = mobile ? 3 : 5');
    expect(v0Styles).toContain('@media (max-width: 760px)');
    expect(v0Styles).toContain('@media (max-width: 430px)');
    expect(v0Styles).toContain('@media (prefers-reduced-motion: reduce)');
  });
});