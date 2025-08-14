import { spawn } from 'node:child_process';
import waitOn from 'wait-on';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function run() {
  const screensDir = path.resolve('screens');
  await ensureDir(screensDir);

  // Start preview server
  const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], {
    stdio: 'ignore',
    detached: true,
  });

  try {
    await waitOn({ resources: ['http://127.0.0.1:4173'], timeout: 30000, interval: 250 });
  } catch (e) {
    try { process.kill(-preview.pid, 'SIGTERM'); } catch {}
    throw e;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  try {
    // Week → Day hop
    await page.goto('http://127.0.0.1:4173/wochenplanung?role=Admin');
    await page.waitForSelector('[data-testid="next-week"]', { timeout: 10000 });
    await page.screenshot({ path: path.join(screensDir, 'e8-01-week.png'), fullPage: true });
    const dayButton = page.locator('[role="button"]').first();
    if (await dayButton.count()) {
      await dayButton.click();
    }
    await page.goto('http://127.0.0.1:4173/tagesplanung?role=Admin');
    await page.waitForSelector('text=Tagesplanung', { timeout: 10000 });
    await page.screenshot({ path: path.join(screensDir, 'e8-01-day.png'), fullPage: true });

    // Header before/after (light/dark toggle via localStorage)
    await page.evaluate(() => localStorage.setItem('theme', 'light'));
    await page.reload();
    await page.waitForSelector('text=Tagesplanung', { timeout: 10000 });
    await page.screenshot({ path: path.join(screensDir, 'e8-01-header-light.png'), fullPage: true });

    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.reload();
    await page.waitForSelector('text=Tagesplanung', { timeout: 10000 });
    await page.screenshot({ path: path.join(screensDir, 'e8-01-header-dark.png'), fullPage: true });

    // Tabs active/inactive
    await page.goto('http://127.0.0.1:4173/manager?role=Admin');
    await page.waitForSelector('text=Manager', { timeout: 10000 });
    await page.screenshot({ path: path.join(screensDir, 'e8-01-tabs.png'), fullPage: true });
  } finally {
    await browser.close();
    try { process.kill(-preview.pid, 'SIGTERM'); } catch {}
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});