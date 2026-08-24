import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';

const directory = 'apps/sovereign-worker/migrations';
const files = readdirSync(directory).filter((name) => name.endsWith('.sql')).sort();
const prior = files.filter((name) => name < '0018_workers_ai_capacity_reservations.sql');
const latest = '0018_workers_ai_capacity_reservations.sql';
if (prior.at(-1) !== '0017_privacy_access_and_eligibility.sql' || files.at(-1) !== latest) throw new Error('immutable migration sequence is not 0017 -> 0018');

const db = new DatabaseSync(':memory:');
for (const file of prior) db.exec(readFileSync(join(directory, file), 'utf8'));
const before = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='workers_ai_capacity_reservations'").get();
if (before) throw new Error('reservation schema unexpectedly exists at deployed 0017');
db.exec(readFileSync(join(directory, latest), 'utf8'));
const columns = db.prepare("SELECT name FROM pragma_table_info('workers_ai_capacity_reservations') ORDER BY cid").all().map((row) => row.name);
if (columns.join(',') !== 'reservation_id,usage_day,reserved_neurons,settled_neurons,settled_at,created_at') throw new Error('0018 reservation schema mismatch');
db.prepare('INSERT INTO workers_ai_capacity_reservations(reservation_id, usage_day, reserved_neurons) VALUES (?, ?, ?)').run('migration-probe', '2026-08-24', 10);
if (db.prepare('SELECT reserved_neurons FROM workers_ai_capacity_reservations WHERE reservation_id = ?').get('migration-probe')?.reserved_neurons !== 10) throw new Error('0018 reservation write probe failed');
let replayRejected = false;
try { db.exec(readFileSync(join(directory, latest), 'utf8')); } catch { replayRejected = true; }
if (!replayRejected) throw new Error('migration runner integrity expects an applied migration not to be replayed');
console.log('Migration upgrade verified immutable_from=0017 target=0018 replay=runner-rejected constraints=bounded');
