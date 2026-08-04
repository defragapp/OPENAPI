import assert from 'node:assert/strict';
import {
  deliverReleaseReport,
  formatReleaseReportDelivery,
  sanitizeReleaseReportOutput
} from './release-report-client.mjs';

const sha = '992e5a153516d7acf51f070ac1250cade69b78af';

let retryCalls = 0;
const retryResult = await deliverReleaseReport({
  url: 'https://release.example.test/api/report',
  key: 'test-key',
  sha,
  phase: 'build',
  stage: 'tests',
  status: 'success',
  output: 'ok',
  attempts: 3,
  timeoutMs: 100,
  delayImpl: async () => {},
  fetchImpl: async () => {
    retryCalls += 1;
    if (retryCalls === 1) return new Response('temporary failure', { status: 503 });
    return new Response('{"ok":true}', { status: 200 });
  }
});
assert.equal(retryCalls, 2);
assert.equal(retryResult.ok, true);
assert.equal(retryResult.attempt, 2);
assert.equal(retryResult.httpStatus, 200);

const deniedResult = await deliverReleaseReport({
  url: 'https://release.example.test/api/report',
  key: 'test-key',
  sha,
  phase: 'deploy',
  stage: 'production-deploy',
  status: 'failure',
  attempts: 1,
  timeoutMs: 100,
  delayImpl: async () => {},
  fetchImpl: async () => new Response('invalid release report key', { status: 403 })
});
assert.equal(deniedResult.ok, false);
assert.equal(deniedResult.httpStatus, 403);
assert.equal(deniedResult.responseText, 'invalid release report key');
assert.match(
  formatReleaseReportDelivery(deniedResult, {
    phase: 'deploy',
    stage: 'production-deploy',
    status: 'failure'
  }),
  /delivery=failure.*http=403.*invalid release report key/
);

const redacted = sanitizeReleaseReportOutput(
  'CLOUDFLARE_API_TOKEN=cfat_example Bearer abc.def.ghi sk-live-example'
);
assert.equal(redacted.includes('cfat_example'), false);
assert.equal(redacted.includes('abc.def.ghi'), false);
assert.equal(redacted.includes('sk-live-example'), false);

console.log('Release report delivery verified retries=3 http-diagnostics=true redaction=true');
