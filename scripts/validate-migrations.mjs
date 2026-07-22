import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const dir = 'apps/sovereign-worker/migrations';
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
if (!files.length) throw new Error('No D1 migrations found');
for (const file of files) {
  const sql = readFileSync(join(dir, file), 'utf8');
  if (/DROP\s+TABLE/i.test(sql)) throw new Error(`${file}: destructive DROP TABLE is not allowed in foundation migrations`);
  if (!/CREATE\s+TABLE/i.test(sql)) throw new Error(`${file}: migration does not create any tables`);
}
console.log(`Validated ${files.length} D1 migration file(s) for non-destructive structure.`);
