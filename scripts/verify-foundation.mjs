import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const required = [
  'README.md',
  'docs/architecture.md',
  'apps/web/src/App.tsx',
  'apps/sovereign-worker/src/index.ts',
  'apps/sovereign-worker/migrations/0001_initial.sql'
];

for (const path of required) await stat(join(root, path));

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await walk(path));
    else output.push(path);
  }
  return output;
}

for (const file of await walk(root)) {
  if (file.endsWith('package.json') || file.endsWith('manifest.webmanifest')) {
    JSON.parse(await readFile(file, 'utf8'));
  }
}

const migration = await readFile(join(root, 'apps/sovereign-worker/migrations/0001_initial.sql'), 'utf8');
for (const table of ['accounts','persons','relationships','systems','consent_grants','threads','thread_events','entitlement_cache','webhook_events']) {
  if (!migration.includes(`CREATE TABLE ${table}`)) throw new Error(`Missing table: ${table}`);
}

console.log(`Foundation verified: ${required.length} required files, JSON valid, core D1 tables present.`);
