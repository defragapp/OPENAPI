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
    from: "      assert(ready.json?.migrationVersion === migrationVersion, 'migration version mismatch');",
    to: "      assert(ready.json?.migrationVersion === migrationVersion, 'migration version mismatch');\n      assert(ready.json?.latestMigrationVersion === migrationVersion, 'latest migration version mismatch');\n      assert(ready.json?.dependencies?.migrationParity === 'current', 'migration parity is not current');\n      assert(ready.json?.visualRelease?.contract === 'v0-public-landing-v3', 'visual contract mismatch');\n      assert(ready.json?.visualRelease?.field === 'landing-expression-field-v3', 'field contract mismatch');\n      assert(ready.json?.visualRelease?.sequenceFingerprint === sequenceFingerprint, 'visual sequence mismatch');"
  },
  {
    from: "  assert(health.json?.dependencies?.stripe === 'configured', 'Stripe is not configured');",
    to: "  assert(health.json?.dependencies?.stripe === 'configured', 'Stripe is not configured');\n  assert(health.json?.dependencies?.passkeys === 'configured', 'passkeys are not configured');\n  assert(health.json?.dependencies?.migrationParity === 'current', 'health migration parity is not current');\n  assert(health.json?.migrationVersion === migrationVersion, 'health migration version mismatch');\n  assert(health.json?.latestMigrationVersion === migrationVersion, 'health latest migration version mismatch');\n  assert(health.json?.visualRelease?.contract === 'v0-public-landing-v3', 'health visual contract mismatch');\n  assert(health.json?.visualRelease?.field === 'landing-expression-field-v3', 'health field contract mismatch');\n  assert(health.json?.visualRelease?.sequenceFingerprint === sequenceFingerprint, 'health visual sequence mismatch');"
  },
  {
    from: "    'v0-landing-selective-port',\n    'v0-public-landing-v2',",
    to: "    'v0-landing-selective-port',\n    'v0-public-landing-v3',"
  },
  {
    from: "    'See what is active before it repeats.',",
    to: "    'Bring the question you actually have.',"
  },
  {
    from: "    'Hover, focus, or tap a line.',",
    to: "    'Drag to rotate · select a line to inspect its relative reach',"
  },
  {
    from: "    'An interactive field of eight Cloudflare-blue lines radiating from one stable point.',",
    to: "    'spherical-360',"
  },
  {
    from: "    'Relative expression inside one sanitized example',",
    to: "    'Relative expression · sanitized example',"
  },
  {
    from: "      contract: 'v0-public-landing-v2',",
    to: "      contract: 'v0-public-landing-v3',\n      field: 'landing-expression-field-v3',"
  },
  {
    from: "  const workersDevUrl = deployOutput.match(/https:\\/\\/[^\\s]+\\.workers\\.dev/)?.[0] || null;",
    to: "  const productionWorkersDev = false;"
  },
  {
    from: "    workersDevUrl,",
    to: "    productionWorkersDev,"
  }
];

let generated = readFileSync(sourcePath, 'utf8');
for (const replacement of replacements) {
  if (!generated.includes(replacement.from)) {
    throw new Error(`Production deploy v3 could not locate required v2 release marker: ${replacement.from.slice(0, 120)}`);
  }
  generated = generated.replace(replacement.from, replacement.to);
}

for (const staleMarker of [
  '|rotating-real-life-questions|',
  "'v0-public-landing-v2',",
  "'See what is active before it repeats.',",
  "'Hover, focus, or tap a line.',",
  "'An interactive field of eight Cloudflare-blue lines radiating from one stable point.',",
  "'Relative expression inside one sanitized example',",
  'workersDevUrl'
]) {
  if (generated.includes(staleMarker)) {
    throw new Error(`Production deploy v3 still contains stale landing or routing verification: ${staleMarker}`);
  }
}
if (!generated.includes("contract: 'v0-public-landing-v3'")) {
  throw new Error('Production deploy v3 did not promote the visual contract to v3');
}
if (!generated.includes("field: 'landing-expression-field-v3'")) {
  throw new Error('Production deploy v3 did not publish the field contract');
}
if (!generated.includes("const migrationVersion = '0014_passkey_authentication';")) {
  throw new Error('Production deploy v3 did not promote the migration contract to 0014');
}
if (!generated.includes("dependencies?.migrationParity === 'current'")) {
  throw new Error('Production deploy v3 does not enforce migration parity');
}
if (!generated.includes('productionWorkersDev = false')) {
  throw new Error('Production deploy v3 does not record workers.dev retirement');
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
