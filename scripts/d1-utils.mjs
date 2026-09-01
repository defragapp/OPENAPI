import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

export function runWranglerCli(args, options = {}) {
  const result = spawnSync('pnpm', ['--filter', '@sovereign/worker', 'exec', 'wrangler', ...args], {
    cwd: options.cwd || root,
    env: options.env || process.env,
    encoding: 'utf8',
    input: options.input,
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
    timeout: options.timeoutMs || 120_000
  });
  return {
    status: result.status ?? (result.error ? 1 : 0),
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    error: result.error
  };
}

export function parseWranglerJson(output, label = 'Wrangler') {
  const text = String(output || '').trim();
  if (!text) throw new Error(`${label} returned no JSON`);
  try {
    return JSON.parse(text);
  } catch {
    const starts = [text.indexOf('{'), text.indexOf('[')].filter((index) => index >= 0);
    if (!starts.length) throw new Error(`${label} returned no JSON payload`);
    return JSON.parse(text.slice(Math.min(...starts)));
  }
}

export function wranglerRows(value) {
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

export function wranglerFailure(result, label) {
  if (!result?.error && result?.status === 0) return null;
  const detail = String(result?.stderr || result?.stdout || result?.error?.message || `exit ${result?.status}`).trim();
  return new Error(`${label} failed: ${detail}`);
}

export function applyD1Migrations({
  databaseName = 'sovereign-openapi-db',
  configPath,
  runWrangler = runWranglerCli
} = {}) {
  if (!configPath) throw new Error('A generated Wrangler config is required before applying migrations');
  return runWrangler(['d1', 'migrations', 'apply', databaseName, '--remote', '--config', configPath]);
}

export function executeD1({
  databaseName = 'sovereign-openapi-db',
  configPath,
  sql,
  runWrangler = runWranglerCli
} = {}) {
  if (!configPath) throw new Error('A generated Wrangler config is required for D1 execution');
  if (!String(sql || '').trim()) throw new Error('A non-empty D1 SQL command is required');
  return runWrangler([
    'd1', 'execute', databaseName,
    '--remote',
    '--config', configPath,
    '--json',
    '--command', String(sql)
  ]);
}
