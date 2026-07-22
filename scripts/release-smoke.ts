import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

function run(name: string, args: string[]) {
  const result = spawnSync(name, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const app = readFileSync('apps/web/src/App.tsx', 'utf8');
const html = readFileSync('apps/web/index.html', 'utf8');
for (const label of ['Today', 'Explore', 'People', 'Systems', 'Library', 'You']) assert(app.includes(label), `authenticated navigation missing ${label}`);
assert(!app.includes('function HomePage') && !app.includes('function PricingPage') && !app.includes('function AboutPage'), 'external marketing page shell present');
assert(app.includes('Email verification, Turnstile protection, secure signed sessions'), 'passwordless auth public copy missing');
assert(app.includes('Baseline onboarding'), 'Baseline onboarding public copy missing');
assert(app.includes('Covenant') && app.includes('disabled'), 'Covenant default/off language missing');
assert(!app.includes('Describe the moment'), 'incident-first legacy copy present');
assert(!app.includes('Core') && !app.includes('Studio'), 'legacy tier copy present');
assert(html.includes('og:title') && html.includes('canonical'), 'metadata missing');

run('pnpm', ['smoke:auth']);
run('pnpm', ['smoke:product']);
run('pnpm', ['smoke:stripe']);
console.log('Release smoke passed authenticated_shell=true signup=true auth=true baseline=true today=true sovereign_stream=true explore=true entitlements=true people=true systems=true library=true covenant=true export=true deletion=true signout=true');
