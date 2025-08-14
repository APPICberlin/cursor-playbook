import { test, expect } from '@playwright/test';

test.describe('Leads table', () => {
  test('sorts by Score, paginates, and shows empty state', async ({ page }) => {
    await page.goto('/leads?role=Admin');

    // Ensure table loaded
    await expect(page.getByRole('table', { name: 'Leads Tabelle' })).toBeVisible();

    // Sort by Score asc then desc
    const scoreHeader = page.locator('thead tr').first().locator('th').filter({ hasText: 'Score' }).first();
    await scoreHeader.click();
    await scoreHeader.click();

    // Pagination controls
    const next = page.getByRole('button', { name: 'Weiter' });
    const prev = page.getByRole('button', { name: 'Zurück' });
    if (await next.isEnabled()) {
      await next.click();
      await expect(prev).toBeEnabled();
    }

    // Empty state via a search that won't match
    const search = page.getByRole('textbox', { name: 'Leads Suche' });
    await search.fill('@@@no-match-xyz@@@');
    await expect(page.getByText('Keine Einträge für die aktuelle Suche/Filter.')).toBeVisible();
  });
});