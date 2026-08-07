import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const worker = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
const space = readFileSync(new URL('../../web/src/SovereignIntelligenceSpace.tsx', import.meta.url), 'utf8');
const agent = readFileSync(new URL('./agent/sovereign.ts', import.meta.url), 'utf8');

describe('advertised AI context transport', () => {
  it('keeps the authenticated space and worker on the structured answer contract', () => {
    expect(space).toContain("'accept': 'application/vnd.sovereign.answer+json'");
    expect(space).toContain('body: JSON.stringify({ message: clean, context: messageContext })');
    expect(worker).toContain("context.req.header('accept')?.includes('application/vnd.sovereign.answer+json')");
    expect(worker).toContain('const result = await runSovereignResult(message, sovereignContext)');
    expect(worker).toContain('return context.json({ text: result.text, answer: result.answer, basis: result.basis }');
  });

  it('passes selected person, system, and explicitly enabled Covenant context into the agent', () => {
    expect(worker).toContain('personId?: string;');
    expect(worker).toContain('systemId?: string;');
    expect(worker).toContain('covenantEnabled?: boolean;');
    expect(worker).toContain("requireFeature(entitlements, 'people.compare')");
    expect(worker).toContain("requireFeature(entitlements, 'covenant.lens')");
    expect(worker).toContain("? 'systems.family'");
    expect(worker).toContain(": 'systems.team'");
    expect(worker).toContain("await requireConsent(context.env, auth.accountId, personId, 'pair.compare')");
    expect(worker).toContain("await requireConsent(context.env, auth.accountId, personId, 'trait.display')");
    expect(worker).toContain("await requireConsent(context.env, auth.accountId, personId, 'covenant.include')");
    expect(worker).toContain('...(personId ? { personId } : {})');
    expect(worker).toContain('...(systemId ? { systemId } : {})');
    expect(worker).toContain('covenantEnabled,');
  });

  it('preserves authorized context and structured answers for thread continuity', () => {
    expect(worker).toContain("'user_message', { text: message, context: messageContext }");
    expect(worker).toContain('answer: result.answer');
    expect(worker).toContain('basis: result.basis');
    expect(agent).toContain('if (context.systemId) return projectModelSafeConversationContext(await buildSystemAnalysis');
    expect(agent).toContain('if (context.personId) return projectModelSafeConversationContext(await buildPairComparison');
  });
});
