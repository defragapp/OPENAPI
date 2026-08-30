import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const migrationsDir = 'apps/sovereign-worker/migrations';
const databaseName = 'sovereign-openapi-db';

function runWranglerCli(args, options = {}) {
  const result = spawnSync('pnpm', ['--filter', '@sovereign/worker', 'exec', 'wrangler', ...args], {
    cwd: options.cwd || root,
    env: options.env || process.env,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024
  });
  return {
    status: result.status ?? (result.error ? 1 : 0),
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    error: result.error
  };
}

function parseWranglerJson(output) {
  const text = String(output || '').trim();
  if (!text) throw new Error('Wrangler returned no JSON');
  try {
    return JSON.parse(text);
  } catch {
    const starts = [text.indexOf('{'), text.indexOf('[')].filter((index) => index >= 0);
    if (!starts.length) throw new Error('Wrangler returned no JSON payload');
    return JSON.parse(text.slice(Math.min(...starts)));
  }
}

function wranglerRows(value) {
  if (Array.isArray(value)) {
    const nested = value.flatMap((entry) => Array.isArray(entry?.results) ? entry.results : []);
    return nested.length ? nested : value;
  }
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.result)) {
    const nested = value.result.flatMap((entry) => Array.isArray(entry?.results) ? entry.results : []);
    return nested.length ? nested : value.result;
  }
  if (Array.isArray(value?.databases)) return value.databases;
  if (Array.isArray(value?.secrets)) return value.secrets;
  return [];
}

function executeD1({ databaseName = 'sovereign-openapi-db', configPath, sql } = {}) {
  if (!configPath) throw new Error('A generated Wrangler config is required for D1 execution');
  if (!String(sql || '').trim()) throw new Error('A non-empty D1 SQL command is required');
  const result = spawnSync('pnpm', ['--filter', '@sovereign/worker', 'exec', 'wrangler', 'd1', 'execute', databaseName, '--remote', '--config', configPath, '--json', '--command', String(sql)], {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024
  });
  return {
    status: result.status ?? (result.error ? 1 : 0),
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    error: result.error
  };
}

function getProductionSchema(configPath) {
  const tablesResult = executeD1({ configPath, sql: "SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name" });
  if (tablesResult.status !== 0) throw new Error(`Failed to query production tables: ${tablesResult.stderr}`);
  const tables = wranglerRows(parseWranglerJson(tablesResult.stdout));
  
  const indexesResult = executeD1({ configPath, sql: "SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' ORDER BY name" });
  if (indexesResult.status !== 0) throw new Error(`Failed to query production indexes: ${indexesResult.stderr}`);
  const indexes = wranglerRows(parseWranglerJson(indexesResult.stdout));
  
  return { tables, indexes };
}

function getExpectedSchema() {
  const migrationFiles = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  const db = new (require('node:sqlite').DatabaseSync)(':memory:');
  
  for (const file of migrationFiles) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    db.exec(sql);
  }
  
  const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name").all();
  const indexes = db.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' ORDER BY name").all();
  
  return { tables, indexes };
}

function compareSchemas(expected, actual) {
  const expectedTables = new Map(expected.tables.map(t => [t.name, t.sql]));
  const actualTables = new Map(actual.tables.map(t => [t.name, t.sql]));
  
  const expectedIndexes = new Map(expected.indexes.map(i => [`${i.tbl_name}.${i.name}`, i.sql]));
  const actualIndexes = new Map(actual.indexes.map(i => [`${i.tbl_name}.${i.name}`, i.sql]));
  
  const missingTables = [...expectedTables.keys()].filter(name => !actualTables.has(name));
  const extraTables = [...actualTables.keys()].filter(name => !expectedTables.has(name));
  
  const schemaMismatches = [];
  for (const [name, expectedSql] of expectedTables) {
    const actualSql = actualTables.get(name);
    if (actualSql && normalizeSql(expectedSql) !== normalizeSql(actualSql)) {
      schemaMismatches.push({ table: name, expected: expectedSql, actual: actualSql });
    }
  }
  
  const missingIndexes = [...expectedIndexes.keys()].filter(key => !actualIndexes.has(key));
  const extraIndexes = [...actualIndexes.keys()].filter(key => !expectedIndexes.has(key));
  
  const indexMismatches = [];
  for (const [key, expectedSql] of expectedIndexes) {
    const actualSql = actualIndexes.get(key);
    if (actualSql && normalizeSql(expectedSql) !== normalizeSql(actualSql)) {
      indexMismatches.push({ index: key, expected: expectedSql, actual: actualSql });
    }
  }
  
  return {
    missingTables,
    extraTables,
    schemaMismatches,
    missingIndexes,
    extraIndexes,
    indexMismatches,
    parity: missingTables.length === 0 && extraTables.length === 0 && schemaMismatches.length === 0 && missingIndexes.length === 0 && extraIndexes.length === 0 && indexMismatches.length === 0
  };
}

function normalizeSql(sql) {
  return String(sql || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/\s*,\s*/g, ',')
    .trim();
}

function main() {
  const configPath = process.env.WRANGLER_CONFIG_PATH;
  if (!configPath) {
    console.error('ERROR: WRANGLER_CONFIG_PATH environment variable is required');
    process.exit(1);
  }
  
  console.log('Fetching production D1 schema...');
  const actual = getProductionSchema(configPath);
  console.log(`Found ${actual.tables.length} tables and ${actual.indexes.length} indexes in production`);
  
  console.log('Computing expected schema from migrations...');
  const expected = getExpectedSchema();
  console.log(`Expected ${expected.tables.length} tables and ${expected.indexes.length} indexes`);
  
  console.log('Comparing schemas...');
  const diff = compareSchemas(expected, actual);
  
  console.log('\n=== PRODUCTION D1 PARITY REPORT ===');
  console.log(`Parity: ${diff.parity ? 'MATCH' : 'DRIFT DETECTED'}`);
  console.log(`Missing tables: ${diff.missingTables.length}`);
  console.log(`Extra tables: ${diff.extraTables.length}`);
  console.log(`Schema mismatches: ${diff.schemaMismatches.length}`);
  console.log(`Missing indexes: ${diff.missingIndexes.length}`);
  console.log(`Extra indexes: ${diff.extraIndexes.length}`);
  console.log(`Index mismatches: ${diff.indexMismatches.length}`);
  
  if (diff.missingTables.length) {
    console.log('\n--- Missing Tables ---');
    for (const name of diff.missingTables) console.log(`  ${name}`);
  }
  if (diff.extraTables.length) {
    console.log('\n--- Extra Tables ---');
    for (const name of diff.extraTables) console.log(`  ${name}`);
  }
  if (diff.schemaMismatches.length) {
    console.log('\n--- Schema Mismatches ---');
    for (const m of diff.schemaMismatches) {
      console.log(`  Table: ${m.table}`);
      console.log(`    Expected: ${m.expected}`);
      console.log(`    Actual:   ${m.actual}`);
    }
  }
  if (diff.missingIndexes.length) {
    console.log('\n--- Missing Indexes ---');
    for (const name of diff.missingIndexes) console.log(`  ${name}`);
  }
  if (diff.extraIndexes.length) {
    console.log('\n--- Extra Indexes ---');
    for (const name of diff.extraIndexes) console.log(`  ${name}`);
  }
  if (diff.indexMismatches.length) {
    console.log('\n--- Index Mismatches ---');
    for (const m of diff.indexMismatches) {
      console.log(`  Index: ${m.index}`);
      console.log(`    Expected: ${m.expected}`);
      console.log(`    Actual:   ${m.actual}`);
    }
  }
  
  if (!diff.parity) {
    console.log('\nERROR: Production D1 schema drift detected!');
    process.exit(1);
  }
  
  console.log('\nSUCCESS: Production D1 schema matches expected migrations.');
}

main();