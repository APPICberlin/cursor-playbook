import { test, expect } from '@playwright/test';
import fs from 'node:fs';

function ensureScreensDir() {
	if (!fs.existsSync('screens')) fs.mkdirSync('screens', { recursive: true });
}

async function snap(page: import('@playwright/test').Page, name: string) {
	ensureScreensDir();
	await page.screenshot({ path: `screens/${name}`, fullPage: true });
}

test.describe('Manager screenshots (E7-02/E7-03)', () => {
	test('capture KPIs and missions dialogs', async ({ page }) => {
		page.on('pageerror', (e) => console.log('[pageerror]', e.message));
		page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()));

		await page.goto('/wochenplanung?role=Admin');
		await page.locator('button[aria-label="Manager"]').click();
		await expect(page).toHaveURL(/\/manager/);

		// E7-02: KPIs and oversight
		await page.waitForSelector('div[role="region"][aria-label="Manager KPIs"]', { timeout: 15000 });
		await snap(page, 'e7-02-kpis.png');

		// Toggle oversight control for visual
		await expect(page.getByText('Teammitglieder')).toBeVisible({ timeout: 15000 });
		const toggle = page.locator('label:has-text("Erlauben") input[type="checkbox"]').first();
		await toggle.check();
		await snap(page, 'e7-02-oversight.png');
		await toggle.uncheck();

		// E7-03: Missions list and dialogs
		await page.getByRole('button', { name: 'Missionen' }).click();
		await expect(page.getByRole('table')).toBeVisible();
		await snap(page, 'e7-03-missions-list.png');

		await page.getByRole('button', { name: 'Neu' }).click();
		await expect(page.getByRole('dialog', { name: 'Neue Mission erstellen' })).toBeVisible();
		await snap(page, 'e7-03-create-modal.png');
		await page.getByRole('button', { name: 'Abbrechen' }).click();

		// If any mission exists, open rating modal for first
		const moreBtn = page.locator('button[aria-label="Mehr"]').first();
		if (await moreBtn.count()) {
			await moreBtn.click();
			await page.getByRole('menuitem', { name: 'Abschluss bewerten…' }).click();
			await expect(page.getByRole('dialog', { name: 'Mission bewerten' })).toBeVisible();
			await snap(page, 'e7-03-rate-modal.png');
			await page.getByRole('button', { name: 'Abbrechen' }).click();
		}
	});
});