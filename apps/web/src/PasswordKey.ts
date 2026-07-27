const encoder = new TextEncoder();
const CREDENTIAL_VERSION = 'browser-key-v1' as const;
const KDF_ITERATIONS = 600_000;
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 128;
const ENCRYPTION_CONTEXT = encoder.encode('Sovereign.OS encrypted password credential v1');

export interface PasswordEnvelope {
  publicKeyJwk: JsonWebKey;
  encryptedPrivateKey: string;
  encryptionIv: string;
  kdfSalt: string;
  kdfIterations: number;
  credentialVersion: typeof CREDENTIAL_VERSION;
}

export interface PasswordChallengePayload {
  challengeId: string;
  challenge: string;
  credential: {
    encryptedPrivateKey: string;
    encryptionIv: string;
    kdfSalt: string;
    kdfIterations: number;
    credentialVersion: string;
  };
}

export async function createPasswordEnvelope(password: string): Promise<PasswordEnvelope> {
  assertPasswordLength(password);
  try {
    const pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']) as CryptoKeyPair;
    const [publicKeyJwk, privateKeyBuffer] = await Promise.all([
      crypto.subtle.exportKey('jwk', pair.publicKey),
      crypto.subtle.exportKey('pkcs8', pair.privateKey)
    ]);
    const privateKeyBytes = new Uint8Array(privateKeyBuffer);
    const kdfSalt = randomBytes(16);
    const encryptionIv = randomBytes(12);

    try {
      const encryptionKey = await deriveEncryptionKey(password, kdfSalt, KDF_ITERATIONS, ['encrypt']);
      const encryptedPrivateKey = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: encryptionIv, additionalData: ENCRYPTION_CONTEXT, tagLength: 128 },
        encryptionKey,
        privateKeyBytes
      );
      return {
        publicKeyJwk,
        encryptedPrivateKey: base64UrlEncode(new Uint8Array(encryptedPrivateKey)),
        encryptionIv: base64UrlEncode(encryptionIv),
        kdfSalt: base64UrlEncode(kdfSalt),
        kdfIterations: KDF_ITERATIONS,
        credentialVersion: CREDENTIAL_VERSION
      };
    } finally {
      privateKeyBytes.fill(0);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Password must')) throw error;
    throw new Error('This browser cannot create a secure password credential. Use Apple, Google, or a current browser.');
  }
}

export async function signPasswordChallenge(
  email: string,
  password: string,
  payload: PasswordChallengePayload
): Promise<string> {
  assertPasswordLength(password);
  try {
    validateChallengePayload(payload);
    const salt = base64UrlDecode(payload.credential.kdfSalt);
    const iv = base64UrlDecode(payload.credential.encryptionIv);
    const encryptedPrivateKey = base64UrlDecode(payload.credential.encryptedPrivateKey);
    const encryptionKey = await deriveEncryptionKey(password, salt, payload.credential.kdfIterations, ['decrypt']);
    const privateKeyBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: ENCRYPTION_CONTEXT, tagLength: 128 },
      encryptionKey,
      encryptedPrivateKey
    );
    const privateKeyBytes = new Uint8Array(privateKeyBuffer);

    try {
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBytes,
        { name: 'Ed25519' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign(
        'Ed25519',
        privateKey,
        passwordProofMessage(email, payload.challengeId, payload.challenge)
      );
      return base64UrlEncode(new Uint8Array(signature));
    } finally {
      privateKeyBytes.fill(0);
    }
  } catch {
    throw new Error('Email or password is incorrect.');
  }
}

export function passwordProofMessage(email: string, challengeId: string, challenge: string): Uint8Array {
  return encoder.encode(`Sovereign.OS password proof v1\n${email.trim().toLowerCase()}\n${challengeId}\n${challenge}`);
}

function assertPasswordLength(password: string): void {
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    throw new Error(`Password must be ${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters.`);
  }
}

function validateChallengePayload(payload: PasswordChallengePayload): void {
  if (
    !payload
    || typeof payload.challengeId !== 'string'
    || !payload.challengeId.startsWith('challenge_')
    || !validBase64Url(payload.challenge, 32, 64)
    || payload.credential?.credentialVersion !== CREDENTIAL_VERSION
    || !validBase64Url(payload.credential.encryptedPrivateKey, 48, 2048)
    || !validBase64Url(payload.credential.encryptionIv, 12, 12)
    || !validBase64Url(payload.credential.kdfSalt, 16, 32)
    || !Number.isInteger(payload.credential.kdfIterations)
    || payload.credential.kdfIterations < KDF_ITERATIONS
    || payload.credential.kdfIterations > 2_000_000
  ) {
    throw new Error('Invalid password challenge.');
  }
}

async function deriveEncryptionKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
  usages: KeyUsage[]
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    usages
  );
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
}

function validBase64Url(value: unknown, minBytes: number, maxBytes: number): value is string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value) || value.length > maxBytes * 2) return false;
  try {
    const bytes = base64UrlDecode(value);
    return bytes.length >= minBytes && bytes.length <= maxBytes;
  } catch {
    return false;
  }
}
