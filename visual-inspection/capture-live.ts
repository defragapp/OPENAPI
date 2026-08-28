import { chromium, devices } from 'playwright';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 2 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 3, isMobile: true },
];

const PAGES = [
  { path: '/', name: 'landing' },
  { path: '/how-it-works', name: 'how-it-works' },
  { path: '/pricing', name: 'pricing' },
  { path: '/faq', name: 'faq' },
  { path: '/login', name: 'login' },
  { path: '/signup', name: 'signup' },
  { path: '/pricing#support', name: 'pricing-support' },
];

const BASE_URL = 'https://sovereign.defrag.app';
const APP_URL = 'https://app.defrag.app';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      ...devices['iPhone 13'],
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.deviceScaleFactor,
      isMobile: viewport.isMobile || false,
    });

    const page = await context.newPage();
    
    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`${msg.type()}: ${msg.text()}`);
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(`pageerror: ${err.message}`);
    });

    const base = viewport.isMobile ? APP_URL : BASE_URL;
    const pages = viewport.isMobile ? [{ path: '/login', name: 'login' }, { path: '/signup', name: 'signup' }] : PAGES;

    for (const p of pages) {
      const url = base + p.path;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Wait for fonts to load
        await page.evaluateHandle(() => document.fonts.ready);
        
        // Scroll to capture full page
        await page.evaluate(async () => {
          await new Promise(resolve => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
              const scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;
              if (totalHeight >= scrollHeight) {
                clearInterval(timer);
                window.scrollTo(0, 0);
                resolve(undefined);
              }
            }, 50);
          });
        });
        
        await page.waitForTimeout(500);
        
        const screenshotPath = `visual-inspection/${viewport.name}-${p.name}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        // Get page metrics
        const metrics = await page.evaluate(() => ({
          title: document.title,
          h1: document.querySelector('h1')?.textContent || '',
          scrollHeight: document.documentElement.scrollHeight,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        
        console.log(`[${viewport.name}] ${p.name}: ${metrics.title} | h1: ${metrics.h1?.substring(0, 60)} | scroll: ${metrics.scrollHeight}px | width: ${metrics.clientWidth} | overflow: ${metrics.scrollWidth > metrics.clientWidth ? 'YES' : 'NO'}`);
        
        if (consoleErrors.length) {
          console.log(`  Console errors: ${consoleErrors.join('; ')}`);
          consoleErrors.length = 0;
        }
      } catch (err) {
        console.error(`[${viewport.name}] ${p.name} FAILED: ${err.message}`);
      }
    }
    
    await context.close();
  }
  
  await browser.close();
  console.log('\nVisual capture complete. Check visual-inspection/ folder.');
}

capture().catch(console.error);