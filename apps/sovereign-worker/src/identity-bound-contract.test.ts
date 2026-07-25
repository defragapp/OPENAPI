import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const invitationService = readFileSync(new URL('./invitation-service.ts', import.meta.url), 'utf8');
const people = readFileSync(new URL('./db/people.ts', import.meta.url), 'utf8');
const relational = readFileSync(new URL('./relational-context.ts', import.meta.url), 'utf8');
const entry = readFileSync(new URL('./entry.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../migrations/0008_identity_bound_invitations.sql', import.meta.url), 'utf8');
const app = readFileSync(new URL('../../web/src/App.tsx', import.meta.url), 'utf8');
const consentPage = readFileSync(new URL('../../web/public/consent.html', import.meta.url), 'utf8');
const wrangler = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');

describe('identity-bound multi-user contract', () => {
  it('stores only a hashed one-time invitation token with expiry and accepted identity', () => {
    expect(migration).toContain('token_hash TEXT');
    expect(migration).toContain('expires_at TEXT');
    expect(migration).toContain('accepted_by_account_id TEXT');
    expect(migration).toContain('bound_account_id TEXT');
    expect(invitationService).toContain('const tokenHash = await sha256(token)');
    expect(invitationService).toContain('token_hash = NULL');
    expect(invitationService).not.toContain('INSERT INTO invitations (id, account_id, invited_person_id, status');
  });

  it('attributes consent to the authenticated invitee and re-checks identity on every use', () => {
    expect(invitationService).toContain('accepted_by_account_id = ? AND accepted_subject = ?');
    expect(invitationService).toContain('granted_by_account_id');
    expect(invitationService).toContain('decided_by_account_id');
    expect(people).toContain('cg.granted_by_account_id = p.bound_account_id');
    expect(people).toContain("i.status = 'accepted'");
    expect(people).toContain('Only the authenticated invited person may grant consent.');
  });

  it('builds real pair and system contexts from separate reduced Baselines', () => {
    expect(relational).toContain("participant('self', 'You', 'self', ownerBaseline, true)");
    expect(relational).toContain('loadReducedBaseline(env, person.bound_account_id)');
    expect(relational).toContain("await requireConsent(env, accountId, personId, 'pair.compare')");
    expect(relational).toContain("await requireConsent(env, accountId, personId, 'system.include')");
    expect(relational).toContain('rawBirthInputShared: false');
    expect(relational).toContain('exactPrivateLocationShared: false');
    expect(relational).not.toContain('twoPlausiblePerspectives');
  });

  it('requires separate framework permission before invited exact Basis values enter shared context', () => {
    expect(relational).toContain("hasConsent(env, accountId, personId, 'framework.display')");
    expect(relational).toContain('frameworkDetailShared: frameworkAllowed');
    expect(relational).toContain('if (frameworkAllowed && Object.keys(baseline.exactBasis).length)');
    expect(relational).toContain("['humanDesign', 'geneKeys', 'natalPlacements', 'numerology', 'currentAstronomy']");
  });

  it('removes owner-side granting and exposes invitee revocation controls', () => {
    expect(app).toContain('Send private invitation');
    expect(app).toContain('You decide what may be shared.');
    expect(app).not.toContain('>Grant</button>');
    expect(consentPage).toContain('Your permissions remain yours.');
    expect(consentPage).toContain('Do not allow');
    expect(consentPage).toContain('/api/v1/invitations/mine');
  });

  it('routes Cloudflare through the hardened entry and keeps legacy UI paths protected', () => {
    expect(wrangler).toContain('"main": "src/entry.ts"');
    expect(entry).toContain('/people\\/([^/]+)\\/compare');
    expect(entry).toContain('/systems\\/([^/]+)\\/members');
    expect(entry).toContain('/systems\\/([^/]+)\\/alignment');
    expect(entry).toContain('/threads\\/([^/]+)\\/messages');
    expect(entry).toContain('buildPairComparison');
    expect(entry).toContain('buildSystemAnalysis');
    expect(entry).toContain('runSovereignResult');
  });
});
