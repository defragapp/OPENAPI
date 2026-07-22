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
assert(app.includes('Sovereign.OS is a private Baseline environment.'), 'public homepage hero missing');
assert(app.includes('One Sovereign workspace.'), 'public product page missing');
assert(app.includes('Create a free account'), 'signup CTA missing');
assert(app.includes('Sovereign+'), 'Sovereign+ pricing missing');
assert(app.includes('Support the work'), 'support link copy missing');
assert(app.includes('Email verification, Turnstile protection, secure signed sessions'), 'passwordless auth public copy missing');
assert(app.includes('Baseline onboarding'), 'Baseline onboarding public copy missing');
assert(app.includes('Covenant') && app.includes('disabled'), 'Covenant default/off language missing');
assert(!app.includes('Describe the moment'), 'incident-first legacy copy present');
assert(!app.includes('Live a life you’d choose to watch again'), 'rejected slogan present');
assert(!app.includes('Core') && !app.includes('Studio'), 'legacy tier copy present');
assert(html.includes('og:title') && html.includes('canonical'), 'metadata missing');

run('pnpm', ['smoke:auth']);
run('pnpm', ['smoke:product']);
run('pnpm', ['smoke:stripe']);
console.log('Release smoke passed public_home=true signup=true auth=true baseline=true today=true sovereign_stream=true explore=true entitlements=true people=true systems=true library=true covenant=true support_link_non_entitling=true export=true deletion=true signout=true');
