import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { passwordProofMessage, verifyPasswordSignature } from './auth-password';

const passwordRuntime = readFileSync(new URL('./auth-password.ts', import.meta.url), 'utf8');
const oauth = readFileSync(new URL('./auth-oauth.ts', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('./runtime-auth-entry.ts', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./onboarding.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../migrations/0010_auth_password_oauth_onboarding.sql', import.meta.url), 'utf8');

describe('modern account access', () => {
  it('verifies an Ed25519 challenge proof and rejects a changed message', async () => {
    const pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']) as CryptoKeyPair;
    const publicKeyJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
    const message = passwordProofMessage('person@example.com', 'challenge_12345678901234567890', 'challenge-value');
    const signature = new Uint8Array(await crypto.subtle.sign('Ed25519', pair.privateKey, message));
    const encoded = Buffer.from(signature).toString('base64url');

    await expect(verifyPasswordSignature(publicKeyJwk, encoded, message)).resolves.toBe(true);
    await expect(verifyPasswordSignature(
      publicKeyJwk,
      encoded,
      passwordProofMessage('person@example.com', 'challenge_12345678901234567890', 'different-value')
    )).resolves.toBe(false);
  });

  it('keeps expensive password stretching out of the Worker request path', () => {
    expect(passwordRuntime).not.toContain("name: 'PBKDF2'");
    expect(passwordRuntime).toContain("crypto.subtle.verify('Ed25519'");
    expect(passwordRuntime).toContain('auth_password_challenges');
    expect(passwordRuntime).toContain('encrypted_private_key');
    expect(passwordRuntime).toContain('kdf_iterations');
  });

  it('verifies provider tokens and browser-bound state before linking an identity', () => {
    for (const required of [
      "header.alg !== 'RS256'",
      'issuers.includes(claims.iss)',
      'audiences.includes(audience)',
      'claims.exp <= Math.floor(Date.now() / 1000)',
      'crypto.subtle.verify',
      'state.nonce_hash',
      'email_verified',
      'auth_external_identities',
      'readCookie(request, OAUTH_STATE_COOKIE)',
      'await sha256(browserState) !== stateHash',
      'HttpOnly; Secure; SameSite=None'
    ]) {
      expect(oauth).toContain(required);
    }
  });

  it('routes password challenge recovery OAuth and onboarding through production', () => {
    for (const route of [
      '/api/v1/auth/password/signup',
      '/api/v1/auth/password/challenge',
      '/api/v1/auth/password/login',
      '/api/v1/auth/password/forgot',
      '/api/v1/auth/password/reset',
      '/api/v1/auth/oauth/',
      '/api/v1/onboarding/status',
      '/api/v1/onboarding/plan',
      '/api/v1/onboarding/complete'
    ]) {
      expect(runtime).toContain(route);
    }
  });

  it('keeps plan selection and Baseline completion connected', () => {
    expect(onboarding).toContain('selected_plan = excluded.selected_plan');
    expect(onboarding).toContain("stage = 'baseline'");
    expect(onboarding).toContain('Build your Baseline before finishing setup.');
    expect(onboarding).toContain("checkoutRequired: row.selected_plan === 'sovereign_plus'");
  });

  it('stores only encrypted credentials hashed tokens and abuse-control indexes', () => {
    for (const required of [
      'public_key_jwk TEXT NOT NULL',
      'encrypted_private_key TEXT NOT NULL',
      'kdf_salt TEXT NOT NULL',
      'kdf_iterations INTEGER NOT NULL',
      'token_hash TEXT NOT NULL UNIQUE',
      'state_hash TEXT NOT NULL UNIQUE',
      'nonce_hash TEXT NOT NULL',
      'auth_password_challenges_email_created_idx',
      'auth_login_attempts_email_created_idx',
      'auth_login_attempts_ip_created_idx'
    ]) {
      expect(migration).toContain(required);
    }
    expect(migration).not.toContain('password_hash');
    expect(migration).not.toContain('password_salt');
  });
});
