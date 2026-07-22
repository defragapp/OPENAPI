import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('apps/sovereign-worker/wrangler.jsonc', 'utf8'));
function assertBinding(scope, name) {
  if (!scope?.queues?.producers?.some((item) => item.binding === 'JOBS')) throw new Error(`${name} missing JOBS queue producer`);
  if (!scope?.queues?.consumers?.length) throw new Error(`${name} missing queue consumer`);
  if (!scope?.triggers?.crons?.length) throw new Error(`${name} missing scheduled cleanup trigger`);
  if (!scope?.r2_buckets?.some((item) => item.binding === 'ARTIFACTS')) throw new Error(`${name} missing ARTIFACTS R2 binding`);
}
assertBinding(config, 'default');
assertBinding(config.env?.preview, 'preview');
console.log('Release config verified queues=true consumers=true schedules=true r2=true');
