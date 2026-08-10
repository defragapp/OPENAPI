import type { Env } from './env';
import { safeReturnTo } from './auth-public';
import { createAccountSessionResponse } from './auth-session';
import { buildSovereignEmail, sendOperationalEmail } from './email';
import { requireAuth } from './security/auth';
import {
  MAX_CREDENTIAL_BYTES,
  base64Url,
  constantTimeString,
  decodeBase64Url,
  parseRegistration,
  sha256Hex,
  stableUserHandle,
  validateClientData,
  verifyAssertion
} from './security/webauthn-es256';

const CHALLENGE_TTL_MINUTES = 5;
const DEFAULT_APP_URL = 'https://app.defrag.app';

type ChallengePurpose = 'register' | 'login';
type ChallengeRow = {
  id: string;
  account_id: string | null;
  purpose: ChallengePurpose;
  challenge_hash: string;
  origin: string;
  rp_id: string;
  return_to: string;
};
type PublicKeyCredentialInput = {
  id?: string;
  rawId?: string;
  type?: string;
  response?: {
    clientDataJSON?: string;
    attestationObject?: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string | null;
    transports?: string[];
  };
};
type PasskeyRow = {
  id: string;
  account_id: string;
  credential_id: string;
  public_key_jwk: string;
  sign_count: number;
  label: string;
  created_at: string;
  last_used_at: string | null;
};

function noStore(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
}

function invalidPasskey(reason = 'invalid_passkey', status = 400): Response {
  return noStore({ status: 'error', reason }, status);
}

function relyingParty(request: Request): { origin: string; rpId: string } {
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  if (hostname === 'defrag.app' || hostname.endsWith('.defrag.app')) return { origin: url.origin, rpId: 'defrag.app' };
  if (hostname.endsWith('.workers.dev')) return { origin: url.origin, rpId: hostname };
  if (hostname === 'localhost' || hostname === '127.0.0.1') return { origin: url.origin, rpId: hostname };
  throw new Response('Passkeys are unavailable on this host', { status: 400 });
}

function randomChallenge(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

function emailFromAuthSubject(subject?: string | null): string | undefined {
  if (!subject?.startsWith('email:')) return undefined;
  const email = subject.slice('email:'.length).trim().toLowerCase();
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

async function sendPasskeyAddedNotice(env: Env, accountId: string, passkeyId: string, label: string): Promise<void> {
  try {
    const account = await env.DB.prepare('SELECT auth_subject FROM accounts WHERE id = ?')
      .bind(accountId)
      .first<{ auth_subject: string }>();
    const recipient = emailFromAuthSubject(account?.auth_subject);
    if (!recipient) return;

    const actionUrl = new URL('/app', env.PUBLIC_APP_URL || DEFAULT_APP_URL);
    actionUrl.searchParams.set('panel', 'account');
    const message = buildSovereignEmail({
      eyebrow: 'Account security',
      title: 'A passkey was added to your Sovereign.OS account.',
      intro: `The passkey labeled “${label}” can now be used to sign in on supported devices.`,
      actionLabel: 'Review account security',
      actionUrl: actionUrl.toString(),
      details: [
        'Sovereign.OS never receives the biometric or device unlock information used by your authenticator.',
        'Email link and six-digit code recovery remain available for the account.',
        'Remove an unfamiliar passkey from You → Account access.'
      ],
      footer: 'If you did not add this passkey, sign in through email recovery, remove it, and contact info@defrag.app.'
    });
    await sendOperationalEmail(env, {
      to: recipient,
      subject: 'A passkey was added to your Sovereign.OS account',
      text: message.text,
      html: message.html,
      idempotencyKey: `passkey-added:${passkeyId}`,
      category: 'account_security'
    });
  } catch (error) {
    console.warn('passkey_added_notification_failed', {
      accountId,
      reason: error instanceof Error ? error.name : 'response'
    });
  }
}

async function issueChallenge(env: Env, accountId: string | null, purpose: ChallengePurpose, origin: string, rpId: string, returnTo = '/app') {
  const challenge = randomChallenge();
  const challengeId = `passkey_challenge_${crypto.randomUUID()}`;
  await env.DB.prepare("DELETE FROM auth_passkey_challenges WHERE expires_at <= datetime('now') OR used_at IS NOT NULL").run();
  await env.DB.prepare("INSERT INTO auth_passkey_challenges (id, account_id, purpose, challenge_hash, origin, rp_id, return_to, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '+5 minutes'))")
    .bind(challengeId, accountId, purpose, await sha256Hex(challenge), origin, rpId, safeReturnTo(returnTo))
    .run();
  return { challenge, challengeId };
}

async function loadChallenge(env: Env, challengeId: string, purpose: ChallengePurpose, challenge: string): Promise<ChallengeRow> {
  if (!/^passkey_challenge_[A-Za-z0-9-]{20,}$/.test(challengeId)) throw new Error('invalid_challenge');
  const row = await env.DB.prepare("SELECT id, account_id, purpose, challenge_hash, origin, rp_id, return_to FROM auth_passkey_challenges WHERE id = ? AND purpose = ? AND used_at IS NULL AND expires_at > datetime('now')")
    .bind(challengeId, purpose)
    .first<ChallengeRow>();
  if (!row || !constantTimeString(row.challenge_hash, await sha256Hex(challenge))) throw new Error('invalid_challenge');
  return row;
}

async function consumeChallenge(env: Env, id: string): Promise<void> {
  const result = await env.DB.prepare("UPDATE auth_passkey_challenges SET used_at = datetime('now') WHERE id = ? AND used_at IS NULL AND expires_at > datetime('now')")
    .bind(id)
    .run();
  if ((result.meta?.changes ?? 0) !== 1) throw new Error('challenge_used');
}

async function markCredentialUsed(env: Env, passkey: PasskeyRow, signCount: number): Promise<void> {
  if (passkey.sign_count > 0 && signCount > 0 && signCount <= passkey.sign_count) throw new Error('signature_counter_replayed');
  await env.DB.prepare("UPDATE auth_passkeys SET sign_count = ?, last_used_at = datetime('now') WHERE id = ? AND account_id = ?")
    .bind(Math.max(passkey.sign_count, signCount), passkey.id, passkey.account_id)
    .run();
}

export async function createPasskeyLoginOptions(request: Request, env: Env): Promise<Response> {
  const { origin, rpId } = relyingParty(request);
  const body = await request.json().catch(() => ({})) as { returnTo?: string };
  const issued = await issueChallenge(env, null, 'login', origin, rpId, safeReturnTo(body.returnTo));
  return noStore({
    challengeId: issued.challengeId,
    publicKey: {
      challenge: issued.challenge,
      timeout: CHALLENGE_TTL_MINUTES * 60_000,
      rpId,
      userVerification: 'required'
    }
  });
}

export async function verifyPasskeyLogin(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { challengeId?: string; credential?: PublicKeyCredentialInput };
    const credential = body.credential;
    if (!body.challengeId || !credential || credential.type !== 'public-key' || !credential.rawId || !credential.response?.clientDataJSON || !credential.response.authenticatorData || !credential.response.signature) throw new Error('credential_incomplete');
    const party = relyingParty(request);
    const clientData = await validateClientData(credential.response.clientDataJSON, 'webauthn.get', party.origin);
    const challenge = await loadChallenge(env, body.challengeId, 'login', clientData.challenge);
    if (challenge.origin !== party.origin || challenge.rp_id !== party.rpId) throw new Error('challenge_origin_mismatch');
    const credentialId = base64Url(decodeBase64Url(credential.rawId, MAX_CREDENTIAL_BYTES));
    const passkey = await env.DB.prepare('SELECT id, account_id, credential_id, public_key_jwk, sign_count, label, created_at, last_used_at FROM auth_passkeys WHERE credential_id = ?')
      .bind(credentialId)
      .first<PasskeyRow>();
    if (!passkey) throw new Error('credential_unknown');
    if (credential.response.userHandle) {
      const suppliedHandle = base64Url(decodeBase64Url(credential.response.userHandle, 64));
      if (!constantTimeString(suppliedHandle, await stableUserHandle(passkey.account_id))) throw new Error('user_handle_mismatch');
    }
    const assertion = await verifyAssertion({
      authenticatorData: credential.response.authenticatorData,
      signature: credential.response.signature,
      clientDataBytes: clientData.bytes,
      publicKeyJwk: JSON.parse(passkey.public_key_jwk) as JsonWebKey,
      rpId: challenge.rp_id
    });
    await consumeChallenge(env, challenge.id);
    await markCredentialUsed(env, passkey, assertion.signCount);
    const account = await env.DB.prepare('SELECT auth_subject FROM accounts WHERE id = ?')
      .bind(passkey.account_id)
      .first<{ auth_subject: string }>();
    if (!account?.auth_subject) throw new Error('account_missing');
    return createAccountSessionResponse(env, passkey.account_id, account.auth_subject, false, safeReturnTo(challenge.return_to));
  } catch (error) {
    console.warn('passkey_login_failed', { reason: error instanceof Error ? error.message : 'invalid' });
    return invalidPasskey();
  }
}

export async function createPasskeyRegistrationOptions(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  const { origin, rpId } = relyingParty(request);
  const account = await env.DB.prepare("SELECT a.auth_subject, p.display_name FROM accounts a LEFT JOIN persons p ON p.account_id = a.id AND p.role = 'self' WHERE a.id = ? LIMIT 1")
    .bind(auth.accountId)
    .first<{ auth_subject: string; display_name: string | null }>();
  if (!account) return invalidPasskey('account_missing', 404);
  const existing = await env.DB.prepare('SELECT credential_id FROM auth_passkeys WHERE account_id = ? ORDER BY created_at DESC')
    .bind(auth.accountId)
    .all<{ credential_id: string }>();
  const issued = await issueChallenge(env, auth.accountId, 'register', origin, rpId);
  const email = account.auth_subject.startsWith('email:') ? account.auth_subject.slice(6) : 'sovereign-user';
  return noStore({
    challengeId: issued.challengeId,
    publicKey: {
      challenge: issued.challenge,
      rp: { id: rpId, name: 'Sovereign.OS' },
      user: { id: await stableUserHandle(auth.accountId), name: email, displayName: account.display_name?.trim() || email },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      timeout: CHALLENGE_TTL_MINUTES * 60_000,
      attestation: 'none',
      authenticatorSelection: { residentKey: 'required', requireResidentKey: true, userVerification: 'required' },
      excludeCredentials: (existing.results ?? []).map((row) => ({ id: row.credential_id, type: 'public-key' }))
    }
  });
}

export async function verifyPasskeyRegistration(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  try {
    const body = await request.json() as { challengeId?: string; label?: string; credential?: PublicKeyCredentialInput };
    const credential = body.credential;
    if (!body.challengeId || !credential || credential.type !== 'public-key' || !credential.rawId || !credential.response?.clientDataJSON || !credential.response.attestationObject) throw new Error('credential_incomplete');
    const party = relyingParty(request);
    const clientData = await validateClientData(credential.response.clientDataJSON, 'webauthn.create', party.origin);
    const challenge = await loadChallenge(env, body.challengeId, 'register', clientData.challenge);
    if (challenge.account_id !== auth.accountId || challenge.origin !== party.origin || challenge.rp_id !== party.rpId) throw new Error('challenge_account_mismatch');
    const registration = await parseRegistration(credential.response.attestationObject, credential.rawId, challenge.rp_id);
    await consumeChallenge(env, challenge.id);
    const transports = (credential.response.transports ?? []).filter((value) => ['internal', 'hybrid', 'usb', 'nfc', 'ble'].includes(value)).slice(0, 8);
    const label = body.label?.trim().slice(0, 80) || 'Passkey';
    const passkeyId = `passkey_${crypto.randomUUID()}`;
    await env.DB.prepare('INSERT INTO auth_passkeys (id, account_id, credential_id, public_key_jwk, sign_count, transports_json, label) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(passkeyId, auth.accountId, registration.credentialId, JSON.stringify(registration.publicKeyJwk), registration.signCount, JSON.stringify(transports), label)
      .run();
    await sendPasskeyAddedNotice(env, auth.accountId, passkeyId, label);
    return noStore({ status: 'success', label });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'invalid';
    console.warn('passkey_registration_failed', { accountId: auth.accountId, reason });
    return invalidPasskey(reason.includes('UNIQUE') ? 'passkey_already_registered' : 'registration_failed');
  }
}

export async function listPasskeys(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  const rows = await env.DB.prepare('SELECT id, label, created_at, last_used_at FROM auth_passkeys WHERE account_id = ? ORDER BY created_at DESC')
    .bind(auth.accountId)
    .all<{ id: string; label: string; created_at: string; last_used_at: string | null }>();
  return noStore({ passkeys: rows.results ?? [] });
}

export async function deletePasskey(request: Request, env: Env, passkeyId: string): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!/^passkey_[A-Za-z0-9-]{20,}$/.test(passkeyId)) return invalidPasskey('invalid_passkey_id');
  const result = await env.DB.prepare('DELETE FROM auth_passkeys WHERE id = ? AND account_id = ?')
    .bind(passkeyId, auth.accountId)
    .run();
  return noStore({ status: 'success', deleted: (result.meta?.changes ?? 0) === 1 });
}