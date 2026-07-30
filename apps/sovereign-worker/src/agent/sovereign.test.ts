import { describe, expect, it } from 'vitest';
import { sovereignRuntimePromptV2 } from './prompt-v1';
import { compareBaselineToCurrentConditions } from '../adapters/sovv';
import type { SovereignAnswerV2 } from './recognition';
import { retrieveScripture } from '../covenant/scripture';

const fakeEnv = { APP_ENV: 'test', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '' } as never;

describe('Sovereign runtime behavior contract', () => {
  it('is Baseline-first and does not force an incident or action plan', () => {
    expect(sovereignRuntimePromptV2).toContain('A user does not need to report a problem');
    expect(sovereignRuntimePromptV2).toContain('Give the direct answer first');
    expect(sovereignRuntimePromptV2).toContain('Do not turn every answer into an action plan');
    expect(sovereignRuntimePromptV2).toContain('Shadow and Gift');
    expect(sovereignRuntimePromptV2).toContain('Alignment is not a score');
  });

  it('keeps exact data, interpretation, current context, and synthesis separate', () => {
    expect(sovereignRuntimePromptV2).toContain('Keep four layers separate');
    expect(sovereignRuntimePromptV2).toContain('Select IDs only in basis_refs');
    expect(sovereignRuntimePromptV2).toContain('Never fill missing data');
    expect(sovereignRuntimePromptV2).toContain('Covenant activates only');
  });
});

describe('current-condition adapter fallback', () => {
  it('returns exact temporary context without raw birth or exact location data', async () => {
    const result = await compareBaselineToCurrentConditions(fakeEnv, 'self');
    const json = JSON.stringify(result);
    expect(result.contractVersion).toBe('1');
    expect(result.uncertainty).toBe('high');
    expect(json).not.toMatch(/birthDate|birthTime|latitude|longitude/i);
    expect(result.data.current.headline).toContain('Exact current positions');
  });
});

describe('Cloudflare Gateway answer adapter', () => {
  it('validates sovereign-answer.v2, attaches exact Basis, and keeps account identity pseudonymous', async () => {
    const calls: Array<{ model: string; input: unknown; options: unknown }> = [];
    const { runSovereignResult } = await import('./sovereign');
    const basis = {
      id: 'natal.sun',
      category: 'natal',
      display: '☉ CAN 04.2°',
      accessibleLabel: 'Sun in Cancer at 4.2 degrees',
      computedAt: '2026-07-28T12:00:00.000Z',
      uncertainty: 'low',
      provenance: 'NASA/JPL Horizons',
      subject: 'self'
    };
    const env = {
      APP_ENV: 'test',
      APP_VERSION: 'test',
      AI_PROVIDER: 'cloudflare-gateway',
      AI_MODEL: '@cf/zai-org/glm-4.7-flash',
      AI_GATEWAY_ID: 'sovereign',
      STRIPE_SECRET_KEY: '',
      STRIPE_WEBHOOK_SECRET: '',
      SESSION_SIGNING_SECRET: 'test',
      DB: {
        prepare(sql: string) {
          return {
            bind() {
              return {
                async first() { return null; },
                async all() {
                  return {
                    results: sql.includes('user_corrections')
                      ? [{ correction: 'yes', note: null, created_at: '2026-07-28 12:00:00' }]
                      : []
                  };
                }
              };
            }
          };
        }
      },
      AI: {
        async run(model: string, input: unknown, options: unknown) {
          calls.push({ model, input, options });
          return {
            output_text: JSON.stringify({
              version: 'sovereign-answer.v2',
              mode: 'baseline',
              depth: 'standard',
              headline: 'Direction can become responsibility quickly.',
              direct_answer: 'You may be quick to create direction when a situation has no clear owner. That capacity becomes costly when consequences become yours without matching authority.',
              sections: [
                { id: 'shadow', label: 'Shadow', body: 'You may end uncertainty by taking over before responsibility is shared.' },
                { id: 'gift', label: 'Gift', body: 'You can create structure while leaving ownership visible and shared.' }
              ],
              basis_refs: ['natal.sun'],
              correction_prompt: 'Does this fit your experience?',
              actions: [],
              confidence: 'supported',
              safety_mode: 'standard'
            })
          };
        }
      }
    } as never;

    const result = await runSovereignResult('Who am I beneath the roles I learned to perform?', {
      env,
      accountId: 'acct_test',
      threadId: 'thread_test',
      traceId: 'trace_test',
      covenantEnabled: false,
      plan: 'free',
      authorizedContext: {
        kind: 'baseline',
        personId: 'person_private',
        label: 'Private Name',
        baseline: { basisRegistry: [basis] }
      }
    });

    expect(result.answer.version).toBe('sovereign-answer.v2');
    expect(result.basis[0]?.display).toBe('☉ CAN 04.2°');
    expect(result.text).toContain('Direction can become responsibility quickly.');
    expect(calls).toHaveLength(1);
    expect(calls[0]?.model).toBe('@cf/zai-org/glm-4.7-flash');
    expect(calls[0]?.input).toMatchObject({ max_output_tokens: 3_200 });
    expect(calls[0]?.options).toMatchObject({
      gateway: {
        id: 'sovereign',
        skipCache: true,
        collectLog: false,
        metadata: { plan: 'free', response_contract: 'sovereign-answer.v2' }
      }
    });
    expect((calls[0]?.options as any).gateway.metadata.account_ref).toMatch(/^[a-f0-9]{32}$/);
    expect(JSON.stringify(calls[0]?.options)).not.toContain('acct_test');
    expect(JSON.stringify(calls[0]?.input)).toContain('Authorized exact Basis registry');
    expect(JSON.stringify(calls[0]?.input)).toContain('U✓');
    expect(JSON.stringify(calls[0]?.input)).not.toMatch(/person_private|Private Name/);
  });
});

describe('Covenant Scripture grounding', () => {
  it('replaces model Scripture with a retrieved passage and rejects citations outside that section', async () => {
    const { groundCovenantScripture } = await import('./sovereign');
    const covenantAnswer = {
      version: 'sovereign-answer.v2',
      mode: 'covenant',
      depth: 'deep',
      headline: 'A family role through Covenant',
      direct_answer: 'The comparison is a reflection lens, not an identity assignment or promised outcome.',
      sections: [
        { id: 'system', label: 'Biblical parallel', body: 'Joseph’s family story may offer a comparison without assigning anyone a biblical identity.' },
        { id: 'steady', label: 'Scripture', body: 'Model-authored passage text must not survive.' },
        { id: 'gift', label: 'Teaching', body: 'Hold responsibility and care together.' },
        { id: 'experiment', label: 'Application', body: 'Name the responsibility that can be examined directly.' },
        { id: 'unknowns', label: 'Boundary', body: 'No relationship outcome or private motive is established.' }
      ],
      basis_refs: [],
      correction_prompt: 'Does this lens help?',
      actions: [],
      confidence: 'exploratory',
      safety_mode: 'grounded'
    } as SovereignAnswerV2;
    groundCovenantScripture(covenantAnswer, [retrieveScripture('Genesis 37:3-4')]);
    expect(covenantAnswer.sections.find((section) => section.label === 'Scripture')?.body)
      .toContain('Genesis 37:3–4 (WEB)');
    expect(JSON.stringify(covenantAnswer)).not.toContain('Model-authored passage text');

    const invented = structuredClone(covenantAnswer);
    invented.direct_answer = 'Psalm 1:1 proves the outcome, which is not an authorized citation.';
    expect(() => groundCovenantScripture(invented, [retrieveScripture('Genesis 37:3-4')]))
      .toThrow('Scripture citations must remain');
  });
});

describe('answer language review', () => {
  it('reviews every user-visible answer field', async () => {
    const { sanitizeSovereignAnswerLanguage } = await import('./sovereign');
    const answer = {
      version: 'sovereign-answer.v2',
      mode: 'relationship',
      depth: 'deep',
      headline: 'A relationship question',
      direct_answer: 'Your mother is trying to control you.',
      sections: [
        { id: 'you', label: 'You', body: 'You are the overfunctioner.' },
        { id: 'other', label: 'Other', body: 'They secretly want control.' },
        { id: 'interaction', label: 'Interaction', body: 'One possibility needs direct confirmation.' },
        { id: 'unknowns', label: 'Unknown', body: 'Their actual state is not known.' }
      ],
      basis_refs: [],
      correction_prompt: 'Does this fit?',
      actions: [{ type: 'open_person', label: 'Open this relationship', target_id: 'person_1' }],
      confidence: 'exploratory',
      safety_mode: 'standard'
    } as SovereignAnswerV2;
    sanitizeSovereignAnswerLanguage(answer, true);
    expect(JSON.stringify(answer)).not.toMatch(/trying to control|overfunctioner|secretly want/i);
  });
});
