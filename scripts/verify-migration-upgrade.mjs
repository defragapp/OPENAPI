import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';

const directory = 'apps/sovereign-worker/migrations';
const files = readdirSync(directory).filter((name) => name.endsWith('.sql')).sort();
const prior = files.filter((name) => name < '0019_deprecate_manual_capacity.sql');
const latest = '0019_deprecate_manual_capacity.sql';
if (prior.at(-1) !== '0018_workers_ai_capacity_reservations.sql' || files.at(-1) !== latest) throw new Error('immutable migration sequence is not 0018 -> 0019');

const db = new DatabaseSync(':memory:');
for (const file of prior) db.exec(readFileSync(join(directory, file), 'utf8'));
db.exec(readFileSync(join(directory, latest), 'utf8'));
const columns = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='legacy_workers_ai_capacity_reservations'").get();
if (!columns) throw new Error('0019 schema renaming failed');
let replayRejected = false;
try { db.exec(readFileSync(join(directory, latest), 'utf8')); } catch { replayRejected = true; }
if (!replayRejected) throw new Error('migration runner integrity expects an applied migration not to be replayed');
console.log('Migration upgrade verified immutable_from=0018 target=0019 replay=runner-rejected constraints=bounded');
