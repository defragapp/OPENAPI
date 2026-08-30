import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
mkdirSync(resolve(here, 'qa'), { recursive: true });

// Session minting via the existing authorized preview-session mechanism.
// The local signing secret comes from the gitignored .dev.vars and is never printed.
const devVars = readFileSync(resolve(root, 'apps/sovereign-worker/.dev.vars'), 'utf8');
const signingSecret = devVars.match(/^SESSION_SIGNING_SECRET=(.+)$/m)?.[1]?.trim();
if (!signingSecret) throw new Error('local SESSION_SIGNING_SECRET not found in apps/sovereign-worker/.dev.vars');
const minted = spawnSync('node', ['--import', 'tsx', 'scripts/create-preview-session.ts'], {
  cwd: root, encoding: 'utf8',
  env: { ...process.env, PREVIEW_SESSION_SIGNING_SECRET: signingSecret },
  timeout: 30000
});
if (minted.status !== 0) throw new Error('preview session mint failed: ' + minted.stderr);
const sessionCookie = minted.stdout.trim().split(';')[0]; // __Host-sovereign_session=<token>
const sessionValue = sessionCookie.split('=')[1];

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900, dsf: 2 },
  { name: 'desktop-1280', width: 1280, height: 800, dsf: 2 },
  { name: 'desktop-1024', width: 1024, height: 768, dsf: 2 },
  { name: 'mobile-390', width: 390, height: 844, dsf: 3, isMobile: true, hasTouch: true },
  { name: 'mobile-430', width: 430, height: 932, dsf: 3, isMobile: true, hasTouch: true }
];

const PUBLIC_SET = [
  { base: 'https://sovereign.defrag.app', path: '/', name: 'landing' },
  { base: 'https://sovereign.defrag.app', path: '/how-it-works', name: 'how-it-works' },
  { base: 'https://sovereign.defrag.app', path: '/pricing', name: 'pricing' },
  { base: 'https://sovereign.defrag.app', path: '/faq', name: 'faq' },
  { base: 'https://sovereign.defrag.app', path: '/privacy', name: 'privacy' },
  { base: 'https://sovereign.defrag.app', path: '/terms', name: 'terms' },
  { base: 'https://app.defrag.app', path: '/login', name: 'login' },
  { base: 'https://app.defrag.app', path: '/signup', name: 'signup' }
];

const LOCAL_SET = [
  { base: 'http://127.0.0.1:8787', path: '/app', name: 'workspace', authed: true },
  { base: 'http://127.0.0.1:8787', path: '/onboarding', name: 'onboarding', authed: true }
];

const ALL_PAGES = [...PUBLIC_SET, ...LOCAL_SET];
const report = [];

function newPageCollector() {
  return { console: [], pageErrors: [], failedRequests: [] };
}

async function auditPage(page, collector, { isMobile, shotName }) {
  await page.evaluateHandle(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(600);

  const audit = await page.evaluate((mobile) => {
    const out = {};
    out.title = document.title;
    out.h1 = document.querySelector('h1')?.textContent?.trim().slice(0, 90) || '(no h1)';
    out.overflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;

    // worst horizontal offender
    if (out.overflowX > 1) {
      const vw = document.documentElement.clientWidth;
      let worst = null;
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 && (!worst || r.right > worst.right)) {
          worst = { right: r.right, sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(/\s+/).slice(0, 2).join('.') : '') };
        }
      }
      out.overflowOffender = worst ? `${worst.sel} (right=${Math.round(worst.right)}px)` : 'unknown';
    }

    if (mobile) {
      // touch targets below 44px
      const small = [];
      for (const el of document.querySelectorAll('a,button,input,textarea,select,[role="button"]')) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.pointerEvents === 'none') continue;
        if (r.width < 44 || r.height < 44) {
          small.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + String(el.className).split(/\s+/).slice(0, 2).join('.') : ''} ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
        if (small.length >= 8) break;
      }
      out.smallTouchTargets = small;
    }

    // a11y quick pass
    out.imagesMissingAlt = [...document.querySelectorAll('img:not([alt])')].length;
    out.unnamedButtons = [...document.querySelectorAll('button')].filter((b) => {
      const r = b.getBoundingClientRect();
      if (r.width === 0) return false;
      const label = (b.getAttribute('aria-label') || b.textContent || '').trim();
      return !label;
    }).length;

    // focus visibility probe on first interactive element
    const first = document.querySelector('a[href], button:not([disabled])');
    if (first) {
      const before = getComputedStyle(first).outlineWidth;
      first.focus({ preventScroll: true });
      const after = getComputedStyle(first);
      out.focusProbe = {
        outlineWidth: after.outlineWidth,
        outlineColor: after.outlineColor,
        boxShadow: after.boxShadow !== 'none',
        changed: after.outlineWidth !== before || after.boxShadow !== 'none'
      };
      first.blur();
    }
    return out;
  }, Boolean(isMobile));

  const shot = resolve(here, 'qa', `${shotName}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  return { ...audit, shot };
}

const browser = await chromium.launch({ headless: true });

for (const vp of VIEWPORTS) {
  for (const entry of ALL_PAGES) {
    const collector = newPageCollector();
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dsf,
      isMobile: vp.isMobile || false,
      hasTouch: vp.hasTouch || false,
      reducedMotion: 'no-preference'
    });
    if (entry.authed) {
      await ctx.addCookies([{
        name: '__Host-sovereign_session', value: sessionValue,
        url: entry.base, path: '/', secure: true, httpOnly: true, sameSite: 'Lax'
      }]);
    }
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') collector.console.push(m.text().slice(0, 200)); });
    page.on('pageerror', (e) => collector.pageErrors.push(String(e.message).slice(0, 200)));
    page.on('response', (r) => {
      if (r.status() >= 400) collector.failedRequests.push(`${r.status()} ${new URL(r.url()).pathname}`);
    });

    let result;
    try {
      await page.goto(entry.base + entry.path, { waitUntil: 'networkidle', timeout: 30000 });
      result = await auditPage(page, collector, { isMobile: vp.isMobile, shotName: `${vp.name}-${entry.name}` });
    } catch (err) {
      result = { error: String(err.message).slice(0, 160) };
      await page.screenshot({ path: resolve(here, 'qa', `${vp.name}-${entry.name}-ERROR.png`), fullPage: false }).catch(() => {});
    }
    const line = {
      viewport: vp.name, page: entry.name, ...result,
      consoleErrors: collector.console.slice(0, 4),
      pageErrors: collector.pageErrors.slice(0, 2),
      failedRequests: [...new Set(collector.failedRequests)].slice(0, 5)
    };
    report.push(line);
    console.log(`[${vp.name}] ${entry.name}: ` + (result.error ? `ERROR ${result.error}` : `h1="${result.h1}" overflowX=${result.overflowX}${result.overflowOffender ? ` (${result.overflowOffender})` : ''} smallTargets=${result.smallTouchTargets?.length ?? 'n/a'} consoleErr=${line.consoleErrors.length} failedReq=${line.failedRequests.length}`));
    await ctx.close();
  }
}

// reduced-motion spot check on the live landing page
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('https://sovereign.defrag.app/', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  const rm = await page.evaluate(() => {
    const animated = [...document.querySelectorAll('*')].filter((el) => {
      const cs = getComputedStyle(el);
      return (cs.animationName !== 'none' && parseFloat(cs.animationDuration) > 0) || (cs.transitionDuration !== '0s' && parseFloat(cs.transitionDuration) >= 1);
    });
    return { matchMedia: matchMedia('(prefers-reduced-motion: reduce)').matches, animatedElements: animated.length, sample: animated.slice(0, 3).map((el) => el.tagName.toLowerCase() + '.' + String(el.className).split(/\s+/)[0]) };
  });
  report.push({ viewport: 'desktop-1440', page: 'landing-reduced-motion', ...rm });
  console.log(`[reduced-motion] landing: matchMedia=${rm.matchMedia} animatedElements=${rm.animatedElements} sample=${rm.sample.join(',') || 'none'}`);
  await ctx.close();
}

await browser.close();
const { writeFileSync } = await import('node:fs');
writeFileSync(resolve(here, 'qa', 'qa-report.json'), JSON.stringify(report, null, 1));
console.log('\nQA capture complete → visual-inspection/qa/ + qa-report.json');
