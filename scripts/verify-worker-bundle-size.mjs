import { mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const CLOUDFLARE_FREE_LIMIT_BYTES = 3 * 1024 * 1024;
const INTERNAL_BUDGET_BYTES = 2_500 * 1024;
const outputDirectory = resolve(process.cwd(), '.artifacts/worker-bundle-size');

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

const result = spawnSync('pnpm', [
  '--filter',
  '@sovereign/worker',
  'exec',
  'wrangler',
  'deploy',
  '--dry-run',
  '--config',
  '../../wrangler.jsonc',
  '--env=',
  '--outdir',
  outputDirectory
], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
});

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
process.stdout.write(output);

if (result.error) throw result.error;
if (result.status !== 0) throw new Error(`Wrangler bundle inspection failed with exit code ${result.status ?? 'unknown'}`);

const match = output.match(/gzip:\s*([\d.]+)\s*(B|KiB|MiB)/i);
if (!match) throw new Error('Wrangler did not report a compressed Worker upload size.');

const compressedBytes = toBytes(Number(match[1]), match[2]);
if (!Number.isFinite(compressedBytes)) throw new Error('Wrangler reported an invalid compressed Worker upload size.');

console.log(`Compressed Worker upload: ${formatBytes(compressedBytes)}`);
console.log(`Internal release budget: ${formatBytes(INTERNAL_BUDGET_BYTES)}`);
console.log(`Cloudflare Workers Free limit: ${formatBytes(CLOUDFLARE_FREE_LIMIT_BYTES)}`);

if (compressedBytes > CLOUDFLARE_FREE_LIMIT_BYTES) {
  throw new Error('Compressed Worker upload exceeds the Cloudflare Workers Free 3 MiB limit.');
}

if (compressedBytes > INTERNAL_BUDGET_BYTES) {
  throw new Error('Compressed Worker upload exceeds the 2,500 KiB Sovereign.OS release budget.');
}

function toBytes(value, unit) {
  if (unit.toLowerCase() === 'mib') return value * 1024 * 1024;
  if (unit.toLowerCase() === 'kib') return value * 1024;
  return value;
}

function formatBytes(value) {
  return `${(value / 1024).toFixed(2)} KiB`;
}
