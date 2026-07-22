import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

if (Number(process.versions.node.split('.')[0]) < 22 && !process.env.SOVEREIGN_NODE22_REEXEC) {
  const pnpm = spawnSync('command', ['-v', 'pnpm'], { shell: true, encoding: 'utf8' }).stdout.trim() || 'pnpm';
  const result = spawnSync('npx', ['-y', 'node@22', process.argv[1]], { cwd: root, stdio: 'inherit', env: { ...process.env, SOVEREIGN_NODE22_REEXEC: '1', PNPM_BIN: pnpm } });
  process.exit(result.status ?? 1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: false, ...options });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

mkdirSync(resolve(root, '.tmp'), { recursive: true });

const pnpm = process.env.PNPM_BIN || 'pnpm';
run(pnpm, ['--filter', '@sovereign/web', 'build']);

const dist = resolve(root, 'apps/web/dist');
for (const required of ['index.html', 'manifest.webmanifest', 'sw.js']) {
  if (!existsSync(resolve(dist, required))) throw new Error(`Preview assets missing ${required}`);
}

const configPath = resolve(root, 'apps/sovereign-worker/wrangler.jsonc');
const wrangler = readJson(configPath);
if (!wrangler.assets?.directory || wrangler.assets.binding !== 'ASSETS') throw new Error('Wrangler assets binding is not configured');
const preview = wrangler.env?.preview;
if (!preview) throw new Error('Wrangler preview environment is missing');
for (const key of ['d1_databases', 'durable_objects', 'migrations', 'ai', 'assets']) {
  if (!preview[key]) throw new Error(`Preview environment missing ${key}`);
}
if (preview.name === wrangler.name) throw new Error('Preview Worker name must not equal top-level Worker name');

run(pnpm, ['--filter', '@sovereign/baseline-worker', 'exec', 'wrangler', 'types', resolve(root, '.tmp/preview-baseline-configuration.d.ts'), '--env', 'preview']);
run(pnpm, ['--filter', '@sovereign/baseline-worker', 'exec', 'wrangler', 'deploy', '--env', 'preview', '--dry-run', '--outdir', 'dist']);
run(pnpm, ['--filter', '@sovereign/worker', 'exec', 'wrangler', 'types', resolve(root, '.tmp/preview-worker-configuration.d.ts'), '--env', 'preview']);
run(pnpm, ['--filter', '@sovereign/worker', 'exec', 'wrangler', 'deploy', '--env', 'preview', '--dry-run', '--outdir', 'dist']);
console.log('Preview build verified: assets, private Baseline Worker dry-run, wrangler preview environment, generated binding types, and Sovereign Worker dry-run passed.');
