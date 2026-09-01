import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseWranglerJson, runWranglerCli, wranglerFailure, wranglerRows } from './d1-utils.mjs';
import { assertReleaseSha } from './release-evidence-lib.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const DEFAULT_PRODUCTION_CONFIG_PATH = resolve(root, '.wrangler.production-direct.generated.jsonc');
const SOURCE_CONFIG_PATH = resolve(root, 'wrangler.production-direct.jsonc');
const CANONICAL_CONFIG_PATH = resolve(root, 'wrangler.jsonc');
const DATABASE_NAME = 'sovereign-openapi-db';
const WORKER_NAME = 'sovv-web';

export function prepareProductionConfig({
  commitSha,
  runWrangler = runWranglerCli,
  generatedConfigPath = DEFAULT_PRODUCTION_CONFIG_PATH,
  sourceConfigPath = SOURCE_CONFIG_PATH,
  canonicalConfigPath = CANONICAL_CONFIG_PATH,
  preserveExistingRoutes = false
} = {}) {
  const sha = assertReleaseSha(commitSha);
  const source = JSON.parse(readFileSync(sourceConfigPath, 'utf8'));
  const canonical = JSON.parse(readFileSync(canonicalConfigPath, 'utf8'));
  if (JSON.stringify(source) !== JSON.stringify(canonical)) {
    throw new Error('wrangler.jsonc and wrangler.production-direct.jsonc must remain structurally identical');
  }

  const envDatabaseId = String(process.env.D1_DATABASE_ID || '').trim();
  let databaseId = envDatabaseId || '497e5df9-c82a-499e-9be6-d809c992e8ce';
  if (!envDatabaseId) {
    try {
      const listResult = runWrangler(['d1', 'list', '--json'], { timeoutMs: 15_000 });
      if (!listResult.error && listResult.status === 0) {
        const databases = wranglerRows(parseWranglerJson(listResult.stdout || listResult.stderr, 'wrangler d1 list'));
        const database = databases.find((entry) => entry?.name === DATABASE_NAME || entry?.database_name === DATABASE_NAME);
        if (database?.uuid || database?.id || database?.database_id) {
          databaseId = database.uuid || database.id || database.database_id;
        }
      }
    } catch {
      // Use fallback
    }
  }

  source.name = WORKER_NAME;
  source.vars = { ...source.vars, APP_VERSION: sha };
  source.d1_databases = [{
    binding: 'DB',
    database_name: DATABASE_NAME,
    database_id: databaseId,
    migrations_dir: 'apps/sovereign-worker/migrations'
  }];
  if (preserveExistingRoutes) {
    delete source.routes;
    delete source.route;
  }
  writeFileSync(generatedConfigPath, `${JSON.stringify(source, null, 2)}\n`);
  return {
    generatedConfigPath,
    databaseId,
    databaseName: DATABASE_NAME,
    workerName: WORKER_NAME,
    commitSha: sha,
    routesManagedByDeploy: !preserveExistingRoutes
  };
}

export function cleanupProductionConfig(path = DEFAULT_PRODUCTION_CONFIG_PATH) {
  rmSync(path, { force: true });
}
