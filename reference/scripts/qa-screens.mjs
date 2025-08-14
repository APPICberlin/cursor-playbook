import { spawn } from 'node:child_process';
import waitOn from 'wait-on';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

async function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function capture(page, url, outName) {
	await page.goto(url);
	await page.waitForLoadState('domcontentloaded');
	await page.screenshot({ path: path.join('screens', outName), fullPage: true });
}

async function run() {
	await ensureDir('screens');

	// Start dev server for fast loading of dynamic routes
	const dev = spawn('npm', ['run', 'dev'], { stdio: 'ignore', detached: true });
	try {
		await waitOn({ resources: ['http://127.0.0.1:5173'], timeout: 30000, interval: 250 });
	} catch (e) {
		try { process.kill(-dev.pid, 'SIGTERM'); } catch {}
		throw e;
	}

	const browser = await chromium.launch();
	const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
	const page = await context.newPage();

	try {
		await capture(page, 'http://127.0.0.1:5173/wochenplanung?role=Admin', 'weekly.png');
		await capture(page, 'http://127.0.0.1:5173/tagesplanung?role=Admin', 'daily.png');
		await capture(page, 'http://127.0.0.1:5173/leads?role=Admin', 'leads.png');

		// Mission Control may be /mission-control or legacy /manager
		try {
			await capture(page, 'http://127.0.0.1:5173/mission-control?role=Admin', 'mission-control.png');
		} catch {
			await capture(page, 'http://127.0.0.1:5173/manager?role=Admin', 'mission-control.png');
		}
	} finally {
		await browser.close();
		try { process.kill(-dev.pid, 'SIGTERM'); } catch {}
	}
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});