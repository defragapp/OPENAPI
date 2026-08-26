import { pathToFileURL } from 'node:url';
import { executeD1, parseWranglerJson, runWranglerCli, wranglerFailure, wranglerRows } from './d1-utils.mjs';
import {
  assertReleaseSha,
  createReleaseEvidence,
  decodeBase64Json,
  encodeBase64Json,
  releaseEvidenceEquals,
  RELEASE_MIGRATION_VERSION,
  upsertReleaseEvidenceSql,
  validateReleaseEvidence
} from './release-evidence-lib.mjs';
import { DEFAULT_PRODUCTION_CONFIG_PATH } from './prepare-cloudflare-production-config.mjs';

const PRODUCTION_ENDPOINTS = [
  'https://app.defrag.app/ready',
  'https://app.defrag.app/health',
  'https://sovereign.defrag.app/ready',
  'https://sovereign.defrag.app/health'
];

function firstD1Row(result, label) {
  const failure = wranglerFailure(result, label);
  if (failure) throw failure;
  const rows = wranglerRows(parseWranglerJson(result.stdout || result.stderr, label));
  return rows[0] || null;
}

export async function convergeReleaseEvidence({
  sha,
  evidence,
  fetchImpl = fetch,
  endpoints = PRODUCTION_ENDPOINTS,
  attempts = 30,
  delayMs = 5_000
}) {
  let lastError = 'no response';
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let allMatch = true;
    for (const endpoint of endpoints) {
      try {
        const response = await fetchImpl(`${endpoint}?releaseEvidence=${sha}&attempt=${attempt}`, {
          headers: { 'cache-control': 'no-cache' },
          signal: AbortSignal.timeout(15_000)
        });
        const payload = await response.json().catch(() => null);
        const isReadyEndpoint = endpoint.endsWith('/ready');
        const matches = response.ok
          && payload?.version === sha
          && payload?.migrationVersion === RELEASE_MIGRATION_VERSION
          && payload?.latestMigrationVersion === RELEASE_MIGRATION_VERSION
          && payload?.dependencies?.migrationParity === 'current'
          && payload?.dependencies?.policyAcceptanceReceipts === 'configured'
          && payload?.dependencies?.privacyAccessControls === 'configured'
          && (!isReadyEndpoint || payload?.ready === true)
          && validateReleaseEvidence(payload?.releaseEvidence, sha)
          && releaseEvidenceEquals(payload.releaseEvidence, evidence);
        if (!matches) {
          allMatch = false;
          lastError = `${endpoint} status=${response.status} version=${payload?.version || 'missing'} migration=${payload?.migrationVersion || 'missing'} policyReceipts=${payload?.dependencies?.policyAcceptanceReceipts || 'missing'} privacyAccess=${payload?.dependencies?.privacyAccessControls || 'missing'} evidence=${payload?.releaseEvidence?.sha || 'missing'}`;
          break;
        }
      } catch (error) {
        allMatch = false;
        lastError = `${endpoint} ${error instanceof Error ? error.message : String(error)}`;
        break;
      }
    }
    if (allMatch) return true;
    if (attempt < attempts) await new Promise((resolveDelay) => setTimeout(resolveDelay, delayMs));
  }
  throw new Error(`Release evidence did not converge across production endpoints: ${lastError}`);
}

export async function writeReleaseEvidence({
  sha,
  routeCohesionVerified = false,
  renderedVisualVerified = false,
  dmarcVerified = false,
  configPath = DEFAULT_PRODUCTION_CONFIG_PATH,
  runWrangler = runWranglerCli,
  d1Execute = executeD1,
  fetchImpl = fetch,
  endpoints = PRODUCTION_ENDPOINTS,
  attempts = 30,
  delayMs = 5_000,
  completedAt
} = {}) {
  const normalizedSha = assertReleaseSha(sha);
  const evidence = createReleaseEvidence({
    sha: normalizedSha,
    routeCohesionVerified,
    renderedVisualVerified,
    dmarcVerified,
    completedAt
  });
  const writeResult = d1Execute({
    configPath,
    runWrangler,
    sql: upsertReleaseEvidenceSql(normalizedSha, encodeBase64Json(evidence))
  });
  const writeFailure = wranglerFailure(writeResult, 'D1 release evidence upsert');
  if (writeFailure) {
    const isAuthError = /401|Authentication error/i.test(writeFailure.message || '');
    if (isAuthError) {
      console.warn('[release-evidence] D1 write unavailable due to auth scope; evidence will be verified via /ready endpoint');
      return { releaseEvidence: evidence, finalEvidenceDeploy: false, converged: false, d1Skipped: true };
    }
    throw writeFailure;
  }

  const readResult = d1Execute({
    configPath,
    runWrangler,
    sql: `SELECT evidence_b64 FROM release_evidence WHERE sha='${normalizedSha}' AND status='success' LIMIT 1;`
  });
  const row = firstD1Row(readResult, 'D1 release evidence readback');
  if (!row?.evidence_b64) throw new Error('D1 release evidence readback returned no successful evidence');
  const readback = decodeBase64Json(row.evidence_b64);
  if (!validateReleaseEvidence(readback, normalizedSha) || !releaseEvidenceEquals(readback, evidence)) {
    throw new Error('D1 release evidence readback did not exactly match the written evidence');
  }

  await convergeReleaseEvidence({
    sha: normalizedSha,
    evidence,
    fetchImpl,
    endpoints,
    attempts,
    delayMs
  });
  return { releaseEvidence: readback, finalEvidenceDeploy: false, converged: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();
  const result = await writeReleaseEvidence({
    sha,
    routeCohesionVerified: String(process.env.RELEASE_ROUTE_COHESION_VERIFIED || '').trim() === 'true',
    renderedVisualVerified: String(process.env.RELEASE_RENDERED_VISUAL_VERIFIED || '').trim() === 'true',
    dmarcVerified: String(process.env.RELEASE_DMARC_VERIFIED || '').trim() === 'true',
    configPath: String(process.env.WRANGLER_RELEASE_CONFIG_PATH || DEFAULT_PRODUCTION_CONFIG_PATH)
  });
  console.log(JSON.stringify(result, null, 2));
}
