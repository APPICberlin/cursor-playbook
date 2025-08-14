import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { chromium } from 'playwright';

const distDir = resolve('dist');
const screensDir = resolve('screens');
if (!existsSync(screensDir)) mkdirSync(screensDir, { recursive: true });

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

const server = createServer((req, res) => {
  try {
    let url = req.url || '/';
    if (url === '/') url = '/index.html';
    const requestedPath = join(distDir, url.startsWith('/') ? url.slice(1) : url);
    const servedPath = existsSync(requestedPath) ? requestedPath : join(distDir, 'index.html');
    const content = readFileSync(servedPath);
    res.setHeader('Content-Type', mime[extname(servedPath)] || 'text/html');
    res.end(content);
  } catch (e) {
    res.statusCode = 500;
    res.end('Server error');
  }
});

async function run() {
  await new Promise((r) => server.listen(5173, r));
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();

  const tag = (process.env.SCREENSHOT_TAG || process.env.TICKET_ID || '').toLowerCase();
  const prefix = tag ? `${tag}-` : '';

  try {
    // Header before/after (Wochenplanung→Tagesplanung)
    await page.goto('http://127.0.0.1:5173/wochenplanung?role=Admin');
    await page.waitForSelector('header .header-nav-link', { timeout: 15000 });
    await page.screenshot({ path: join(screensDir, `${prefix}e8-03-header-before.png`), fullPage: true });

    // Route hop week→day via monthly calendar day click
    const dayButton = page.locator('[aria-label^="Tag "]');
    if (await dayButton.count()) {
      await dayButton.nth(0).click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: join(screensDir, `${prefix}e8-03-week-to-day.png`), fullPage: true });

    // Header after (navigate to Tagesplanung explicitly)
    await page.goto('http://127.0.0.1:5173/tagesplanung?role=Admin');
    await page.waitForSelector('header .header-nav-link-active', { timeout: 15000 });
    await page.screenshot({ path: join(screensDir, `${prefix}e8-03-header-after.png`), fullPage: true });

    // Tabs active/inactive (simulate tabs usage if present on page components)
    await page.goto('http://127.0.0.1:5173/manager?role=Admin');
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(screensDir, `${prefix}e8-03-tabs.png`), fullPage: true });
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((e) => {
  console.error(e);
  server.close();
  process.exit(1);
});