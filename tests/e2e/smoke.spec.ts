import { test, expect } from '@playwright/test';

const baseUrl = process.env.SMOKE_URL || 'http://localhost:3000';

test.describe('Smoke', () => {
  test('home renders without error boundary', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Wait for either loader to vanish or main landmark to appear
    const loader = page.locator("[role='status']");
    await Promise.race([
      loader.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {}),
      page.getByRole('main').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
    ]);

    // Assert error boundary is not visible
    await expect(page.locator('text=Ein Fehler ist aufgetreten')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Neu laden/i })).toHaveCount(0);
  });
});


