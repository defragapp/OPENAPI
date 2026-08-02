import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourcePath = resolve(root, 'scripts/cloudflare-production-deploy-v2.mjs');
const generatedPath = resolve(root, 'scripts/.cloudflare-production-deploy-v3.generated.mjs');

const replacements = [
  {
    from: "const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|rotating-real-life-questions|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;",
    to: "const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;"
  },
  {
    from: "const migrationVersion = '0013_workers_ai_free_capacity';",
    to: "const migrationVersion = '0014_passkey_authentication';"
  },
  {
    from: "    'v0-landing-selective-port',\n    'v0-public-landing-v2',",
    to: "    'v0-landing-selective-port',\n    'v0-public-landing-v3',\n    'v0-public-landing-v2',"
  },
  {
    from: "      contract: 'v0-public-landing-v2',",
    to: "      contract: 'v0-public-landing-v3',"
  }
];

let generated = readFileSync(sourcePath, 'utf8');
for (const replacement of replacements) {
  if (!generated.includes(replacement.from)) {
    throw new Error(`Production deploy v3 could not locate required v2 release marker: ${replacement.from.slice(0, 120)}`);
  }
  generated = generated.replace(replacement.from, replacement.to);
}

if (generated.includes('|rotating-real-life-questions|')) {
  throw new Error('Production deploy v3 still contains the stale rotating-question release sequence');
}
if (!generated.includes("contract: 'v0-public-landing-v3'")) {
  throw new Error('Production deploy v3 did not promote the visual contract to v3');
}
if (!generated.includes("const migrationVersion = '0014_passkey_authentication';")) {
  throw new Error('Production deploy v3 did not promote the migration contract to 0014');
}

writeFileSync(generatedPath, generated);
try {
  const result = spawnSync(process.execPath, [generatedPath], {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
} finally {
  rmSync(generatedPath, { force: true });
}
