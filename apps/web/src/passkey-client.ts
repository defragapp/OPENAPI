export type ServerRequestOptions = {
  challenge: string;
  timeout?: number;
  rpId?: string;
  userVerification?: UserVerificationRequirement;
  allowCredentials?: Array<{ id: string; type: PublicKeyCredentialType; transports?: AuthenticatorTransport[] }>;
};

export type ServerCreationOptions = {
  challenge: string;
  rp: PublicKeyCredentialRpEntity;
  user: Omit<PublicKeyCredentialUserEntity, 'id'> & { id: string };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  excludeCredentials?: Array<{ id: string; type: PublicKeyCredentialType; transports?: AuthenticatorTransport[] }>;
};

export function passkeysSupported(): boolean {
  return typeof window !== 'undefined'
    && window.isSecureContext
    && 'PublicKeyCredential' in window
    && Boolean(navigator.credentials);
}

export function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function bytesToBase64Url(value: ArrayBuffer | ArrayBufferView): string {
  const bytes = value instanceof ArrayBuffer
    ? new Uint8Array(value)
    : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]!);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function descriptor(input: { id: string; type: PublicKeyCredentialType; transports?: AuthenticatorTransport[] }): PublicKeyCredentialDescriptor {
  return {
    id: base64UrlToBytes(input.id),
    type: input.type,
    ...(input.transports ? { transports: input.transports } : {})
  };
}

export function decodeRequestOptions(input: ServerRequestOptions): PublicKeyCredentialRequestOptions {
  return {
    challenge: base64UrlToBytes(input.challenge),
    ...(typeof input.timeout === 'number' ? { timeout: input.timeout } : {}),
    ...(input.rpId ? { rpId: input.rpId } : {}),
    ...(input.userVerification ? { userVerification: input.userVerification } : {}),
    ...(input.allowCredentials ? { allowCredentials: input.allowCredentials.map(descriptor) } : {})
  };
}

export function decodeCreationOptions(input: ServerCreationOptions): PublicKeyCredentialCreationOptions {
  return {
    challenge: base64UrlToBytes(input.challenge),
    rp: input.rp,
    user: { ...input.user, id: base64UrlToBytes(input.user.id) },
    pubKeyCredParams: input.pubKeyCredParams,
    ...(typeof input.timeout === 'number' ? { timeout: input.timeout } : {}),
    ...(input.attestation ? { attestation: input.attestation } : {}),
    ...(input.authenticatorSelection ? { authenticatorSelection: input.authenticatorSelection } : {}),
    ...(input.excludeCredentials ? { excludeCredentials: input.excludeCredentials.map(descriptor) } : {})
  };
}

export function serializeAssertion(credential: PublicKeyCredential) {
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: bytesToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bytesToBase64Url(response.clientDataJSON),
      authenticatorData: bytesToBase64Url(response.authenticatorData),
      signature: bytesToBase64Url(response.signature),
      userHandle: response.userHandle ? bytesToBase64Url(response.userHandle) : null
    }
  };
}

export function serializeRegistration(credential: PublicKeyCredential) {
  const response = credential.response as AuthenticatorAttestationResponse;
  const transports = typeof response.getTransports === 'function' ? response.getTransports() : [];
  return {
    id: credential.id,
    rawId: bytesToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bytesToBase64Url(response.clientDataJSON),
      attestationObject: bytesToBase64Url(response.attestationObject),
      transports
    }
  };
}

export function passkeyErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') return 'The passkey request was cancelled or timed out.';
    if (error.name === 'InvalidStateError') return 'This passkey is already added to your account.';
    if (error.name === 'NotSupportedError') return 'This browser or device cannot use passkeys here.';
    if (error.name === 'SecurityError') return 'Passkeys are unavailable on this page. Try email sign-in instead.';
  }
  return 'The passkey could not be completed. Try again or use email sign-in.';
}