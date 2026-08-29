import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const APP = 'https://app.defrag.app';
const OUT = '/tmp/sovereign-funnel';
mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log('[funnel]', ...a);

async function gm(path) {
  const res = await fetch('https://api.guerrillamail.com/ajax.php' + path, { signal: AbortSignal.timeout(15000) });
  return res.json();
}

async function ensureMailbox() {
  const start = await gm('?f=get_email_address&lang=en');
  const sid = start.sid_token;
  const user = 'sovereign.qa.' + Math.random().toString(36).slice(2, 7);
  await gm(`?f=set_email_user&email_user=${encodeURIComponent(user)}&lang=en&sid_token=${sid}`);
  const info = await gm(`?f=get_email_address&lang=en&sid_token=${sid}`);
  return { sid, address: info.email_addr };
}

async function waitForMagicLink(box, timeoutMs = 150000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const chk = await gm(`?f=check_email&seq=0&sid_token=${box.sid}`);
    for (const item of chk.list ?? []) {
      if (/sovereign|defrag/i.test(`${item.mail_from ?? ''} ${item.mail_subject ?? ''}`)) {
        const full = await gm(`?f=fetch_email&email_id=${item.mail_id}&sid_token=${box.sid}`);
        const cleaned = String(full.mail_body ?? '').replaceAll('&amp;', '&');
        const m = cleaned.match(/https:\/\/app\.defrag\.app\/auth\/redeem\?token=[A-Za-z0-9_-]+&returnTo=[^\"'\s<>]+/);
        if (m) return m[0];
        log('email found but redeem link not matched; subject:', item.mail_subject);
      }
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error('MAGIC_LINK_TIMEOUT');
}

const box = await ensureMailbox();
log('mailbox ready:', box.address);

const browser = await chromium.launch({ headless: false, slowMo: 120, args: ['--disable-blink-features=AutomationControlled'] });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await context.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
const page = await context.newPage();
const apiCalls = [];
page.on('response', async (res) => { if (!res.url().includes('/api/v1/')) return; let body = ''; try { body = (await res.text()).slice(0, 160); } catch {} apiCalls.push(res.status() + ' ' + res.request().method() + ' ' + res.url().replace(APP, '') + ' :: ' + body); });

await page.goto(APP + '/signup', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForSelector('input[type="email"]', { timeout: 30000 });
await page.fill('input[autocomplete="name"]', 'QA Launch');
await page.fill('input[type="email"]', box.address);
const boxes = page.locator('input[type="checkbox"]');
await boxes.nth(0).check();
await boxes.nth(1).check();
log('form filled; waiting for Turnstile verification…');
log('turnstile: attempting click + verification…');
let verified = false;
for (let waited = 0; waited < 180000; waited += 12000) {
  if (!verified) {
    for (const frame of page.frames()) {
      if (!frame.url().includes('challenges.cloudflare.com')) continue;
      for (const sel of ['input[type="checkbox"]', '.ctp-checkbox-label', 'label.ctp-checkbox-label']) {
        try { await frame.locator(sel).first().click({ timeout: 1500 }); log('clicked', sel, 'in challenge frame'); break; } catch {}
      }
    }
  }
  const caption = await page.locator('[data-turnstile-caption]').textContent().catch(() => '');
  const btnEnabled = await page.locator('button.primary-button').isEnabled().catch(() => false);
  log('t+' + waited + 'ms caption=', caption?.trim(), 'buttonEnabled=', btnEnabled);
  if (btnEnabled || /complete/i.test(caption ?? '')) { verified = true; break; }
  await page.waitForTimeout(12000);
}
if (!verified) { await page.screenshot({ path: OUT + '/turnstile-stuck.png', fullPage: true }); throw new Error('TURNSTILE_NOT_VERIFIED'); }
log('turnstile verified');
await page.screenshot({ path: OUT + '/02-signup-verified.png', fullPage: true });
await page.getByRole('button', { name: 'Create account' }).click();
try {
  await page.getByRole('button', { name: 'Check your inbox' }).waitFor({ timeout: 45000 });
  log('signup accepted: magic link requested');
} catch {
  await page.screenshot({ path: OUT + '/submit-failed.png', fullPage: true });
  const note = await page.locator('.status-note').textContent().catch(() => '');
  log('submit did not confirm; status note:', (note ?? '').trim().slice(0, 200));
  log('api calls:', JSON.stringify(apiCalls, null, 1));
  writeFileSync(OUT + '/api-calls.json', JSON.stringify(apiCalls, null, 1));
  throw new Error('SUBMIT_NO_CONFIRM');
}
await page.screenshot({ path: OUT + '/03-link-sent.png', fullPage: true });

const redeemUrl = await waitForMagicLink(box);
log('magic link received');
writeFileSync(OUT + '/redeem-url.txt', redeemUrl);

await page.goto(redeemUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(4000);
const finalUrl = page.url();
const h1 = await page.locator('h1').first().textContent().catch(() => '(no h1)');
const cookieNames = (await context.cookies()).map((c) => c.name).join(',');
await page.screenshot({ path: OUT + '/04-after-redeem.png', fullPage: true });
log('final URL:', finalUrl);
log('h1:', h1);
log('cookies:', cookieNames);
log('api calls:', JSON.stringify(apiCalls, null, 1));
await browser.close();
console.log('FUNNEL_RESULT url=' + finalUrl + ' h1=' + h1);
