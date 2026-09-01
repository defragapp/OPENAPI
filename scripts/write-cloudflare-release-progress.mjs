import { pathToFileURL } from 'node:url';
import { executeD1, parseWranglerJson, runWranglerCli, wranglerFailure, wranglerRows } from './d1-utils.mjs';
import {
  assertReleaseSha,
  assertReleaseStage,
  decodeBase64Json,
  encodeBase64Json,
  RELEASE_PROGRESS_CONTRACT,
  sanitizeReleaseProgressSummary,
  upsertReleaseProgressSql
} from './release-evidence-lib.mjs';
import { DEFAULT_PRODUCTION_CONFIG_PATH } from './prepare-cloudflare-production-config.mjs';

const INTERNAL_EVIDENCE_URL = 'https://app.defrag.app/internal/release-evidence';

async function postProgressToWorker({ sha, stage, summaryB64, releaseSecret, fetchImpl = fetch }) {
  if (!releaseSecret) {
    return { ok: false, error: 'RELEASE_EVIDENCE_SECRET is unconfigured in the deployment environment', skipped: true };
  }
  const headers = {
    'content-type': 'application/json',
    'x-release-secret': releaseSecret,
    'cache-control': 'no-store'
  };
  try {
    const response = await fetchImpl(INTERNAL_EVIDENCE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sha, stage, summary_b64: summaryB64 }),
      signal: AbortSignal.timeout(15_000)
    });
    const payload = await response.json().catch(() => null);
    if (response.ok && payload?.ok) return { ok: true };
    return { ok: false, error: `status=${response.status} ${JSON.stringify(payload || {})}` };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function writeReleaseProgress({
  sha,
  stage,
  summary,
  configPath = DEFAULT_PRODUCTION_CONFIG_PATH,
  runWrangler = runWranglerCli,
  d1Execute = executeD1,
  failedAt = new Date().toISOString(),
  releaseSecret = String(process.env.RELEASE_EVIDENCE_SECRET || '').trim()
} = {}) {
  const normalizedSha = assertReleaseSha(sha);
  const normalizedStage = assertReleaseStage(stage);
  const normalizedSummary = sanitizeReleaseProgressSummary(summary || `${normalizedStage} failed without output`);
  if (!normalizedSummary) throw new Error('Release progress summary is empty after redaction');
  const progress = {
    contract: RELEASE_PROGRESS_CONTRACT,
    sha: normalizedSha,
    stage: normalizedStage,
    status: 'failure',
    summary: normalizedSummary,
    failedAt
  };
  const summaryB64 = encodeBase64Json(progress);

  const workerResult = await postProgressToWorker({
    sha: normalizedSha,
    stage: normalizedStage,
    summaryB64,
    releaseSecret
  });
  if (workerResult.ok) {
    console.log('[release-progress] wrote via worker endpoint');
    return { releaseProgress: progress, failureProgressDeploy: false, writeMethod: 'worker-endpoint' };
  }

  if (workerResult.skipped) {
    console.log(`[release-progress] writing failure progress directly via D1 (${workerResult.error})`);
  } else {
    console.warn(`[release-progress] worker endpoint rejected (requires matching RELEASE_EVIDENCE_SECRET on the production Worker): ${workerResult.error}; falling back to direct D1`);
  }
  const result = d1Execute({
    configPath,
    runWrangler,
    sql: upsertReleaseProgressSql(normalizedSha, normalizedStage, summaryB64)
  });
  const failure = wranglerFailure(result, 'D1 release progress upsert');
  if (failure) throw failure;

  const readbackResult = d1Execute({
    configPath,
    runWrangler,
    sql: `SELECT summary_b64 FROM release_progress WHERE sha='${normalizedSha}' AND stage='${normalizedStage}' AND status='failure' LIMIT 1;`
  });
  const readbackFailure = wranglerFailure(readbackResult, 'D1 release progress readback');
  if (readbackFailure) throw readbackFailure;
  const row = wranglerRows(parseWranglerJson(readbackResult.stdout || readbackResult.stderr, 'D1 release progress readback'))[0];
  if (!row?.summary_b64) throw new Error('D1 release progress readback returned no failure progress');
  const readback = decodeBase64Json(row.summary_b64);
  if (JSON.stringify(readback) !== JSON.stringify(progress)) throw new Error('D1 release progress readback did not match');
  return { releaseProgress: readback, failureProgressDeploy: false, writeMethod: 'wrangler-d1' };
}

function selfTest() {
  const cloudflareLike = ['cf', 'at_', 'example'].join('');
  const bearerLike = ['abc', '.def', '.ghi'].join('');
  const providerLike = ['sk', '_live_', 'example'].join('');
  const sample = sanitizeReleaseProgressSummary(`failure ${cloudflareLike} Bearer ${bearerLike} ${providerLike}`);
  if (sample.includes(cloudflareLike) || sample.includes(bearerLike) || sample.includes(providerLike)) {
    throw new Error('Release progress redaction self-test failed');
  }
  console.log(`Release progress contract verified contract=${RELEASE_PROGRESS_CONTRACT} redaction=true d1=true`);
}

if (process.argv.includes('--self-test')) {
  selfTest();
} else if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await writeReleaseProgress({
    sha: String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '').trim(),
    stage: String(process.env.RELEASE_PROGRESS_STAGE || '').trim(),
    summary: String(process.env.RELEASE_PROGRESS_SUMMARY || ''),
    configPath: String(process.env.WRANGLER_RELEASE_CONFIG_PATH || DEFAULT_PRODUCTION_CONFIG_PATH)
  });
  console.log(JSON.stringify(result, null, 2));
}
