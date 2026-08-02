export const V0_ARCHIVE_SHA256 = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';

export const V0_SEQUENCE_FINGERPRINT = 'sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|rotating-real-life-questions|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';

export const PUBLIC_LANDING_CONTRACT = 'v0-public-landing-v2';
export const PUBLIC_LANDING_FIELD_CONTRACT = 'landing-expression-field-v3';
export const PUBLIC_LANDING_EVIDENCE = 'Relative expression inside one sanitized example';

export function installV0ReleaseFingerprint(): void {
  document.documentElement.dataset.sovereignVisualContract = 'v0-landing-selective-port';
  document.documentElement.dataset.sovereignV0Archive = V0_ARCHIVE_SHA256;
  document.documentElement.dataset.sovereignV0Sequence = V0_SEQUENCE_FINGERPRINT;
  document.documentElement.dataset.sovereignPublicLanding = PUBLIC_LANDING_CONTRACT;
  document.documentElement.dataset.sovereignLandingField = PUBLIC_LANDING_FIELD_CONTRACT;
  document.documentElement.dataset.sovereignLandingEvidence = PUBLIC_LANDING_EVIDENCE;
}
