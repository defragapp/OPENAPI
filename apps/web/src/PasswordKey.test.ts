import { describe, expect, it } from 'vitest';
import { createPasswordEnvelope, passwordProofMessage, signPasswordChallenge } from './PasswordKey';

describe('browser-held password credential', () => {
  it('encrypts the private key and signs the server challenge after password unlock', async () => {
    const password = 'A careful private password 2026';
    const email = 'person@example.com';
    const envelope = await createPasswordEnvelope(password);
    const payload = {
      challengeId: 'challenge_12345678901234567890',
      challenge: Buffer.alloc(32, 7).toString('base64url'),
      credential: {
        encryptedPrivateKey: envelope.encryptedPrivateKey,
        encryptionIv: envelope.encryptionIv,
        kdfSalt: envelope.kdfSalt,
        kdfIterations: envelope.kdfIterations,
        credentialVersion: envelope.credentialVersion
      }
    };

    const signature = await signPasswordChallenge(email, password, payload);
    const publicKey = await crypto.subtle.importKey('jwk', envelope.publicKeyJwk, { name: 'Ed25519' }, false, ['verify']);
    const verified = await crypto.subtle.verify(
      'Ed25519',
      publicKey,
      Buffer.from(signature, 'base64url'),
      passwordProofMessage(email, payload.challengeId, payload.challenge)
    );

    expect(verified).toBe(true);
    expect(envelope.encryptedPrivateKey).not.toContain(password);
    expect(envelope.kdfIterations).toBe(600_000);
  }, 20_000);
});
