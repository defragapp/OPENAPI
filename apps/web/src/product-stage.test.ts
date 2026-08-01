import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const landingStyles = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');
const hardening = readFileSync(new URL('./premium-surface-hardening.css', import.meta.url), 'utf8');
const completion = readFileSync(new URL('./selective-visual-port.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');

describe('shared Sovereign answer stage', () => {
  it('uses the same answer hierarchy publicly and after authentication', () => {
    expect(landing).toContain('EXAMPLE ANSWER');
    expect(landing).toContain('DIRECT ANSWER');
    expect(landing).toContain('THE PERSONAL CONNECTION');
    expect(landing).toContain('A PRACTICAL NEXT STEP');
    expect(landing).toContain('Why this is personal');
    expect(landing).toContain('visual-reasoning-panel');
    expect(landing).toContain('className="visual-evidence-chips"');
    expect(workspace).toContain('<SovereignAnswerView');
    expect(workspace).toContain('<RelationshipAnswer');
    expect(workspace).toContain('<SystemAnswer');
    expect(workspace).toContain('<BasisStrip');
  });

  it('distinguishes stable, temporary, confirmed, and unknown information', () => {
    expect(landing).toContain('YOUR BASELINE');
    expect(landing).toContain('WHAT MAY BE ACTIVE NOW');
    expect(landing).toContain('YOUR CONFIRMATION');
    expect(landing).toContain('STILL UNKNOWN');
  });

  it('is keyboard-ready, responsive, and reduced-motion safe', () => {
    expect(landing).toContain('aria-label="Permitted family system map"');
    expect(landing).toContain('aria-pressed={activeId === member.id}');
    expect(landing).toContain('onClick={() => setActiveId(member.id)}');
    expect(workspace).toContain('const limit = mobile ? 3 : 5');
    expect(landingStyles).toContain('@media (max-width: 760px)');
    expect(hardening).toContain('@media (max-width: 680px)');
    expect(hardening).toContain('@media (prefers-reduced-motion: reduce)');
    expect(hardening).toContain('@media (forced-colors: active)');
    expect(completion).toContain('@media (max-width: 680px)');
    expect(completion).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
