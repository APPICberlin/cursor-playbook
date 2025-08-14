import { test, expect } from '@playwright/test';
import fs from 'node:fs';

function ensureScreensDir() {
  if (!fs.existsSync('screens')) fs.mkdirSync('screens', { recursive: true });
}

async function snap(page, name: string) {
  ensureScreensDir();
  await page.screenshot({ path: `screens/${name}`, fullPage: true });
}

test.describe('Leads screenshots (E4-01/E4-02/E4-08)', () => {
  test('list renders, search debounced, and states', async ({ page }) => {
    await page.goto('/leads?role=Admin');

    await expect(page.getByRole('table', { name: 'Leads Tabelle' })).toBeVisible();

    // E4-01: basic table render
    await snap(page, 'e4-01-table.png');

    // E4-02: search by name/domain (debounced)
    const search = page.getByRole('textbox', { name: 'Leads Suche' });
    await search.fill('stuttgart');
    await page.waitForTimeout(350);
    await snap(page, 'e4-02-search-stuttgart.png');

    await search.fill('mueller.de');
    await page.waitForTimeout(350);
    await snap(page, 'e4-02-search-domain.png');

    await search.clear();
    await page.waitForTimeout(350);

    // E4-08: loading state (with artificial delay)
    await page.goto('/leads?role=Admin&leadsDelayMs=1200');
    await expect(page.getByRole('status', { name: 'Leads werden geladen…' })).toBeVisible();
    await snap(page, 'e4-08-loading.png');
    await expect(page.getByRole('table', { name: 'Leads Tabelle' })).toBeVisible();

    // E4-08: empty state
    await page.goto('/leads?role=Admin&leadsEmpty=1');
    await expect(page.getByRole('table', { name: 'Leads Tabelle' })).toBeVisible();
    await expect(page.getByText('Keine Leads vorhanden. Legen Sie oben den ersten Lead an.')).toBeVisible();
    await snap(page, 'e4-08-empty.png');

    // E4-08: error state and retry
    await page.goto('/leads?role=Admin&leadsError=1');
    await expect(page.getByText('Fehler beim Laden der Leads.')).toBeVisible();
    await snap(page, 'e4-08-error.png');
    await page.getByRole('button', { name: 'Erneut versuchen' }).click();
    // After retry without error param (same URL still has error=1). Navigate to OK URL for recovery screenshot
    await page.goto('/leads?role=Admin');
    await expect(page.getByRole('table', { name: 'Leads Tabelle' })).toBeVisible();
    await snap(page, 'e4-08-recovered.png');
  });
});