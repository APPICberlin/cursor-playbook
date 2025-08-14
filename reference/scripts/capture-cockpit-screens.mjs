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
    // E5-01: KPI cards scaffold
    await page.goto('http://127.0.0.1:4173/cockpit?role=Admin');
    await page.waitForSelector('[data-testid="kpi-cards"]', { timeout: 10000 });
    await page.screenshot({ path: path.join(screensDir, 'e5-01-cockpit-kpis.png'), fullPage: true });

    // E5-02: KPIs wired to selectors (reactive)
    await page.goto('http://127.0.0.1:4173/cockpit?role=Admin');
    await page.waitForSelector('[data-testid="kpi-cards"]', { timeout: 10000 });
    await page.screenshot({ path: path.join(screensDir, 'e5-02-cockpit-kpis-reactive.png'), fullPage: true });

    // E5-05: Loading/empty skeletons for widgets
    await page.goto('http://127.0.0.1:4173/cockpit?role=Admin&forceLoading=1');
    // Wait for page and give time for forced skeletons
    await page.waitForSelector('[data-testid="kpi-cards"]', { timeout: 10000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screensDir, 'e5-05-cockpit-skeletons.png'), fullPage: true });
  } finally {
    await browser.close();
    try { process.kill(-preview.pid, 'SIGTERM'); } catch {}
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});