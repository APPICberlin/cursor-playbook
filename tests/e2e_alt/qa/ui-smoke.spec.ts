import { test, expect } from '@playwright/test';
import fs from 'node:fs';

function ensureScreensDir() {
  if (!fs.existsSync('screens')) fs.mkdirSync('screens', { recursive: true });
}

async function snap(page: import('@playwright/test').Page, name: string) {
  ensureScreensDir();
  await page.screenshot({ path: `screens/${name}`, fullPage: true });
}

test.describe('UI smoke flows', () => {
  test('Weekly → Day → Manager → Leads basic navigation', async ({ page }) => {
    await page.goto('/wochenplanung?role=Admin');
    await expect(page.getByTestId('next-week')).toBeVisible({ timeout: 15000 });
    await snap(page, 'qa-weekly.png');

    // Click a day cell if present
    const dayButton = page.locator('[role="button"]').first();
    if (await dayButton.count()) {
      await dayButton.click();
    }
    await snap(page, 'qa-weekly-day-click.png');

    await page.goto('/tagesplanung?role=Admin');
    // Most robust: rely on visible text containing 'Tagesplanung'
    await expect(page.getByText(/Tagesplanung/i)).toBeVisible({ timeout: 15000 });
    await snap(page, 'qa-daily.png');

    await page.goto('/manager?role=Admin');
    await expect(page.getByRole('region', { name: /Manager KPIs/i })).toBeVisible({ timeout: 15000 });
    await snap(page, 'qa-manager.png');

    await page.goto('/leads?role=Admin');
    await expect(page.getByRole('table', { name: /Leads/i })).toBeVisible({ timeout: 10000 });
    await snap(page, 'qa-leads.png');
  });
});

