import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configureCloudflareDmarc } from './configure-cloudflare-dmarc.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const result = spawnSync(process.execPath, ['scripts/cloudflare-production-deploy-v3.mjs'], {
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

const dmarc = await configureCloudflareDmarc();
console.log(JSON.stringify({ cloudflareDmarc: dmarc }, null, 2));
