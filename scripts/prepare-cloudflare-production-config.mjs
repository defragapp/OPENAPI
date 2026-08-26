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
  let databaseId;
  if (envDatabaseId) {
    databaseId = envDatabaseId;
  } else {
    const listResult = runWrangler(['d1', 'list', '--json']);
    const listFailure = wranglerFailure(listResult, 'wrangler d1 list');
    if (listFailure) throw listFailure;
    const databases = wranglerRows(parseWranglerJson(listResult.stdout || listResult.stderr, 'wrangler d1 list'));
    const database = databases.find((entry) => entry?.name === DATABASE_NAME || entry?.database_name === DATABASE_NAME);
    databaseId = database?.uuid || database?.id || database?.database_id;
    if (!databaseId) throw new Error(`Unable to resolve existing D1 database ${DATABASE_NAME}`);
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
