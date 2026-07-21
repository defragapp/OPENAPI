import { createSignedSessionToken } from '../apps/sovereign-worker/src/security/auth';

async function main() {
  const secret = process.env.PREVIEW_SESSION_SIGNING_SECRET || process.env.SESSION_SIGNING_SECRET;
  if (!secret) throw new Error('PREVIEW_SESSION_SIGNING_SECRET is required');
  const subject = process.env.PREVIEW_SESSION_SUBJECT || 'preview:user:sovereign-smoke';
  const exp = Math.floor(Date.now() / 1000) + 60 * 30;
  const token = await createSignedSessionToken({ sub: subject, exp }, secret);
  process.stdout.write(`__Host-sovereign_session=${token}; Path=/; Secure; HttpOnly; SameSite=Lax`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
