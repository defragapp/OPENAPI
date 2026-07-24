PRAGMA foreign_keys = ON;

ALTER TABLE persons ADD COLUMN bound_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL;

ALTER TABLE invitations ADD COLUMN invited_email_normalized TEXT;
ALTER TABLE invitations ADD COLUMN token_hash TEXT;
ALTER TABLE invitations ADD COLUMN expires_at TEXT;
ALTER TABLE invitations ADD COLUMN accepted_by_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE invitations ADD COLUMN accepted_subject TEXT;
ALTER TABLE invitations ADD COLUMN requested_scopes_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE invitations ADD COLUMN policy_version TEXT NOT NULL DEFAULT '2026-07-24';

CREATE UNIQUE INDEX invitations_token_hash_idx ON invitations(token_hash) WHERE token_hash IS NOT NULL;
CREATE INDEX invitations_invitee_account_idx ON invitations(accepted_by_account_id, status, accepted_at DESC);
CREATE INDEX persons_bound_account_idx ON persons(bound_account_id, account_id);

ALTER TABLE consent_grants ADD COLUMN invitation_id TEXT REFERENCES invitations(id) ON DELETE SET NULL;
ALTER TABLE consent_grants ADD COLUMN granted_by_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE consent_grants ADD COLUMN policy_version TEXT NOT NULL DEFAULT '2026-07-24';

ALTER TABLE consent_versions ADD COLUMN invitation_id TEXT REFERENCES invitations(id) ON DELETE SET NULL;
ALTER TABLE consent_versions ADD COLUMN decided_by_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE consent_versions ADD COLUMN policy_version TEXT NOT NULL DEFAULT '2026-07-24';

CREATE INDEX consent_grants_identity_idx ON consent_grants(person_id, scope, granted_by_account_id, revoked_at);
CREATE INDEX consent_versions_invitation_idx ON consent_versions(invitation_id, person_id, scope, version);
