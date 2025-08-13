import { test, expect } from '@playwright/test';

async function createMission(page: import('@playwright/test').Page, title: string) {
	await page.getByRole('button', { name: 'Neu' }).click();
	await expect(page.getByRole('dialog', { name: 'Neue Mission erstellen' })).toBeVisible();
	await page.fill('#mission-name', title);
	await page.getByRole('button', { name: 'Speichern' }).click();
	await expect(page.getByText('Mission erstellt')).toBeVisible();
	await expect(page.getByRole('row', { name: new RegExp(title) })).toBeVisible();
}

test.describe('Manager overview and missions management', () => {
	test('KPIs, oversight controls, and missions flows', async ({ page }) => {
		page.on('pageerror', (e) => console.log('[pageerror]', e.message));
		page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()));

		await page.goto('/wochenplanung?role=Admin');
		await page.locator('button[aria-label="Manager"]').click();
		await expect(page).toHaveURL(/\/manager/);

		// Wait for team table and toggle
		await expect(page.getByText('Teammitglieder')).toBeVisible({ timeout: 15000 });

		// Oversight: toggle outside-region and reason field
		const toggle = page.locator('label:has-text("Erlauben") input[type="checkbox"]').first();
		await toggle.check();
		const reason = page.locator('input[placeholder="Begründung"]').first();
		await expect(reason).toBeEnabled();
		await toggle.uncheck();

		// Open read-only plan and close
		await page.getByRole('button', { name: /Tagesplan .* ansehen/ }).first().click();
		await expect(page.getByRole('dialog', { name: 'Tagesplan (Read-only)' })).toBeVisible();
		await page.locator('div[role="dialog"][aria-label="Tagesplan (Read-only)"] button:has-text("Schließen")').click();

		// Switch to missions tab
		await page.getByRole('button', { name: 'Missionen' }).click();
		await expect(page.getByRole('tab', { selected: true, name: 'Aktiv' })).toBeVisible();

		const missionTitle = `E2E Mission ${Date.now()}`;
		await createMission(page, missionTitle);

		const row = page.getByRole('row', { name: new RegExp(missionTitle) }).first();
		await row.locator('button[aria-label="Mehr"]').click();
		await page.getByRole('menuitem', { name: 'Abschluss bewerten…' }).click();
		await expect(page.getByRole('dialog', { name: 'Mission bewerten' })).toBeVisible();
		await page.getByLabel('Entscheider angetroffen').check();
		await page.getByLabel('Demo durchgeführt').check();
		await page.getByLabel('Gewonnen (EUR)').fill('500');
		await page.getByRole('button', { name: 'Speichern' }).click();
		await expect(page.getByText('Bewertung gespeichert')).toBeVisible();

		// Archive and verify in Archiv tab
		await row.locator('button[aria-label="Mehr"]').click();
		await page.getByRole('menuitem', { name: 'Archivieren' }).click();
		await expect(page.getByText('Archiviert')).toBeVisible();
		await page.getByRole('tab', { name: 'Archiv' }).click();
		await expect(page.getByRole('row', { name: new RegExp(missionTitle) })).toBeVisible();
	});
});