import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const dir = 'apps/sovereign-worker/migrations';
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
if (!files.length) throw new Error('No D1 migrations found');
const createdTables = new Map();
for (const file of files) {
  const sql = readFileSync(join(dir, file), 'utf8');
  if (/DROP\s+TABLE/i.test(sql)) throw new Error(`${file}: destructive DROP TABLE is not allowed in foundation migrations`);
  if (!/(CREATE\s+(?:UNIQUE\s+)?(?:TABLE|INDEX)|ALTER\s+TABLE)/i.test(sql)) throw new Error(`${file}: migration has no schema operation`);
  for (const match of sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["'`]?([a-z0-9_]+)/gi)) {
    const table = match[1]?.toLowerCase();
    if (!table) continue;
    const prior = createdTables.get(table);
    if (prior) throw new Error(`${file}: table ${table} is already created by ${prior}`);
    createdTables.set(table, file);
  }
}
console.log(`Validated ${files.length} D1 migration file(s) for non-destructive structure and unique table creation.`);
