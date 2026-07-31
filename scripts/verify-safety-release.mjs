import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const assert = (value, message) => { if (!value) throw new Error(message); };
const requireAll = (label, source, values) => values.forEach((value) => assert(source.includes(value), `${label} is missing ${value}`));

const recognition = read('apps/sovereign-worker/src/agent/recognition.ts');
const router = read('apps/sovereign-worker/src/agent/input-safety.ts');
const resources = read('apps/sovereign-worker/src/agent/safety-resources.ts');
const entry = read('apps/sovereign-worker/src/entry.ts');
const runtime = read('apps/web/src/SafetyResponseRuntime.ts');
const css = read('apps/web/src/safety-response-runtime.css');
const routerTests = read('apps/sovereign-worker/src/agent/input-safety.test.ts');
const runtimeTests = read('apps/web/src/SafetyResponseRuntime.test.ts');

requireAll('server safety contract', recognition, [
  "'sovereign-safety-response.v1'",
  "'supportive_resources'",
  "'emergency'",
  "'secure_refusal'",
  "'safety-resources.2026-07-31.1'",
  "if (parsed.safety) throw new Error('Model-authored safety metadata is not accepted')"
]);

requireAll('deterministic safety router', router, [
  'normalizeSovereignSafetyInput',
  'dangerousIngestionPatterns',
  'medicalUrgencyPatterns',
  'severeConfusionPatterns',
  'indirectSelfHarmPatterns',
  'abuseOrCoercionPatterns',
  'acuteDistressPatterns',
  'minorSexualExploitationPatterns',
  'protectedSystemPatterns',
  'resourcesForSafetyPresentation',
  "resource_catalog_version: SAFETY_RESOURCE_CATALOG_VERSION"
]);

requireAll('reviewed safety resources', resources, [
  "id: 'us-988'",
  "href: 'tel:988'",
  "href: 'https://988lifeline.org/get-help/'",
  "id: 'ca-988'",
  "href: 'https://988.ca/'",
  "id: 'au-lifeline'",
  "href: 'tel:131114'",
  "href: 'https://www.lifeline.org.au/get-help/'",
  "id: 'uk-ie-samaritans'",
  "href: 'tel:116123'",
  "href: 'https://www.samaritans.org/how-we-can-help/contact-samaritan/talk-us-phone/'"
]);

const safetyDecisionIndex = entry.indexOf('const safetyDecision = decideSovereignInputSafety(message);');
const entitlementIndex = entry.indexOf('const entitlements = await getEntitlements(env, auth.accountId);');
const gatewayIndex = entry.indexOf('const aiConfig = resolveAiModelConfig(env);');
const reserveIndex = entry.indexOf('await reserveAiTurn(');
assert(safetyDecisionIndex >= 0, 'The deterministic safety decision is missing from the message route.');
assert(entitlementIndex > safetyDecisionIndex, 'Safety must execute before entitlement lookup.');
assert(gatewayIndex > safetyDecisionIndex, 'Safety must execute before Gateway/model resolution.');
assert(reserveIndex > safetyDecisionIndex, 'Safety must execute before monthly AI-turn reservation.');

requireAll('explicit safety presentation runtime', runtime, [
  'registerSovereignSafetyPayload',
  "version: 'sovereign-safety-response.v1'",
  "resource_catalog_version: 'safety-resources.2026-07-31.1'",
  'collectSafetyPayload',
  'renderResources',
  'data-sovereign-safety-resources'
]);
assert(!runtime.includes('SAFETY_HEADLINES'), 'Safety presentation must not infer state from hard-coded headlines.');

requireAll('safety-specific interface', css, [
  "[data-sovereign-safety] .answer-actions",
  "[data-sovereign-safety] .answer-evidence-row",
  '.sovereign-safety-resources',
  'min-height: 44px',
  ':focus-visible',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('router regression fixtures', routerTests, [
  'dangerous_ingestion',
  'medical_urgency',
  'severe_confusion',
  'indirect_self_harm',
  'abuse_or_coercion',
  'acute_distress',
  'minor_sexual_exploitation',
  'syste\\u200Bm prompt',
  'Me voy a matar esta noche.',
  'Je vais me suicider ce soir.',
  "another user's messages and Baseline"
]);

requireAll('presentation regression fixtures', runtimeTests, [
  'registerSovereignSafetyPayload',
  "'supportive_resources'",
  "'emergency'",
  'does not infer safety state from a headline without validated metadata'
]);

console.log(JSON.stringify({
  ok: true,
  safetyContract: 'sovereign-safety-response.v1',
  resourceCatalog: 'safety-resources.2026-07-31.1',
  deterministicBeforeAi: true,
  headlineInferenceRetired: true,
  ordinaryControlsSuppressed: true
}, null, 2));
