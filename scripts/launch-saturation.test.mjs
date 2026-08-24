import { strict as assert } from 'node:assert';
import { validateCanaryTarget } from './launch-saturation.mjs';
for (const target of ['https://sovereign.defrag.app', 'https://app.defrag.app', 'https://defrag.app', 'https://release.workers.dev']) assert.throws(() => validateCanaryTarget(target));
assert.equal(validateCanaryTarget('https://isolated-canary.example.test').hostname, 'isolated-canary.example.test');
