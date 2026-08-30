import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
mkdirSync(resolve(here, 'qa'), { recursive: true });

// Session minting via the existing authorized preview-session mechanism.
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

const LOCAL_BASE = 'http://localhost:5173';
const ALL_PAGES = [
  { base: LOCAL_BASE, path: '/', name: 'landing' },
  { base: LOCAL_BASE, path: '/how-it-works', name: 'how-it-works' },
  { base: LOCAL_BASE, path: '/pricing', name: 'pricing' },
  { base: LOCAL_BASE, path: '/faq', name: 'faq' },
  { base: LOCAL_BASE, path: '/privacy', name: 'privacy' },
  { base: LOCAL_BASE, path: '/terms', name: 'terms' },
  { base: LOCAL_BASE, path: '/login', name: 'login' },
  { base: LOCAL_BASE, path: '/signup', name: 'signup' },
  { base: LOCAL_BASE, path: '/app', name: 'workspace', authed: true },
  { base: LOCAL_BASE, path: '/onboarding', name: 'onboarding', authed: true }
];

const report = [];

async function auditPage(page, { isMobile, shotName }) {
  await page.evaluateHandle(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(600);

  const audit = await page.evaluate((mobile) => {
    const out = {};
    out.title = document.title;
    out.h1 = document.querySelector('h1')?.textContent?.trim().slice(0, 90) || '(no h1)';
    out.overflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;

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

    out.imagesMissingAlt = [...document.querySelectorAll('img:not([alt])')].length;
    out.unnamedButtons = [...document.querySelectorAll('button')].filter((b) => {
      const r = b.getBoundingClientRect();
      if (r.width === 0) return false;
      const label = (b.getAttribute('aria-label') || b.textContent || '').trim();
      return !label;
    }).length;

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
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dsf,
      isMobile: vp.isMobile || false,
      hasTouch: vp.hasTouch || false,
      reducedMotion: 'no-preference'
    });
    if (entry.authed) {
      try {
        await ctx.addCookies([{
          name: 'sovereign_session',
          value: sessionValue,
          url: LOCAL_BASE,
          path: '/',
        }]);
      } catch (e) {
        console.log(`[COOKIE ERROR] ${entry.name}: ${e.message}`);
      }
    }
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') console.log(`[CONSOLE ERROR] ${entry.name} (${vp.name}): ${m.text()}`); });
    page.on('pageerror', (e) => { console.log(`[PAGE ERROR] ${entry.name} (${vp.name}): ${e.message}`); });

    let result;
    try {
      await page.goto(entry.base + entry.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);
      result = await auditPage(page, { isMobile: vp.isMobile, shotName: `${vp.name}-${entry.name}` });
    } catch (err) {
      result = { error: String(err.message).slice(0, 160) };
      await page.screenshot({ path: resolve(here, 'qa', `${vp.name}-${entry.name}-ERROR.png`), fullPage: false }).catch(() => {});
    }
    report.push({ viewport: vp.name, page: entry.name, ...result });
    console.log(`[${vp.name}] ${entry.name}: ` + (result.error ? `ERROR ${result.error}` : `h1="${result.h1}" overflowX=${result.overflowX}`));
    await ctx.close();
  }
}

await browser.close();
writeFileSync(resolve(here, 'qa', 'qa-report.json'), JSON.stringify(report, null, 1));
console.log('\nLocal QA capture complete → visual-inspection/qa/ + qa-report.json');
