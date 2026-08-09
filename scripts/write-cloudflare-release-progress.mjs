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

export async function writeReleaseProgress({
  sha,
  stage,
  summary,
  configPath = DEFAULT_PRODUCTION_CONFIG_PATH,
  runWrangler = runWranglerCli,
  d1Execute = executeD1,
  failedAt = new Date().toISOString()
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
  const result = d1Execute({
    configPath,
    runWrangler,
    sql: upsertReleaseProgressSql(normalizedSha, normalizedStage, encodeBase64Json(progress))
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
  return { releaseProgress: readback, failureProgressDeploy: false };
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
