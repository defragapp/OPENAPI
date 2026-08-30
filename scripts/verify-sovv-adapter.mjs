import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

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

function checkSOVVAdapter(configPath) {
  console.log('Checking SOVV adapter configuration in production Worker...');
  
  // Get the Worker configuration
  const configResult = spawnSync('pnpm', ['--filter', '@sovereign/worker', 'exec', 'wrangler', 'config', '--config', configPath], {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024
  });
  
  if (configResult.status !== 0) {
    throw new Error(`Failed to get Worker config: ${configResult.stderr}`);
  }
  
  const config = JSON.parse(configResult.stdout);
  const vars = config.vars || {};
  
  console.log('\n=== SOVV Adapter Configuration Check ===');
  
  const sovvBaseUrl = vars.SOVV_INTERNAL_BASE_URL;
  const sovvAuthToken = vars.SOVV_INTERNAL_AUTH_TOKEN;
  
  let hasIssues = false;
  
  if (sovvBaseUrl) {
    console.log(`❌ ISSUE: SOVV_INTERNAL_BASE_URL is set: ${sovvBaseUrl}`);
    hasIssues = true;
  } else {
    console.log('✅ SOVV_INTERNAL_BASE_URL is not set (correct)');
  }
  
  if (sovvAuthToken) {
    console.log('❌ ISSUE: SOVV_INTERNAL_AUTH_TOKEN is set');
    hasIssues = true;
  } else {
    console.log('✅ SOVV_INTERNAL_AUTH_TOKEN is not set (correct)');
  }
  
  // Also check legacySovvAdapter in health check dependencies
  console.log('\n=== Legacy Adapter Dependency Check ===');
  console.log('The production-entry.ts preflight will return 503 if either SOVV_INTERNAL_BASE_URL or SOVV_INTERNAL_AUTH_TOKEN is set and /ready is accessed.');
  
  if (hasIssues) {
    console.log('\n❌ FAILURE: SOVV adapter configuration detected in production!');
    console.log('The SOVV adapter must be completely disabled in production.');
    process.exit(1);
  } else {
    console.log('\n✅ SUCCESS: SOVV adapter is properly disabled in production.');
  }
}

function main() {
  const configPath = process.env.WRANGLER_CONFIG_PATH;
  if (!configPath) {
    console.error('ERROR: WRANGLER_CONFIG_PATH environment variable is required');
    console.error('Usage: WRANGLER_CONFIG_PATH=/path/to/wrangler.jsonc node scripts/verify-sovv-adapter.mjs');
    process.exit(1);
  }
  
  checkSOVVAdapter(configPath);
}

main();