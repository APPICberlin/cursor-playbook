import { test, expect } from '@playwright/test';

const routes = [
  { path: '/wochenplanung?role=Admin', expectText: 'Wochenübersicht', name: 'Wochenplanung' },
  { path: '/tagesplanung?role=Admin', expectText: 'Tagesplanung', name: 'Tagesplanung' },
  { path: '/manager?role=Admin', expectText: 'Manager', name: 'Manager' },
  { path: '/leads?role=Admin', expectRole: { role: 'table', name: 'Leads Tabelle' }, name: 'Leads' },
  { path: '/missionen?role=Admin', expectText: 'Missionen', name: 'Missionen' },
];

test.describe('Smoke: main routes open without errors', () => {
  for (const r of routes) {
    test(`opens ${r.name}`, async ({ page }) => {
      await page.goto(r.path);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(200);
      if (r.expectText) {
        await expect(page.getByText(r.expectText, { exact: false })).toBeVisible();
      }
      if (r.expectRole) {
        // @ts-expect-error playwright types union narrowing for role name pairing
        await expect(page.getByRole(r.expectRole.role as any, { name: r.expectRole.name })).toBeVisible({ timeout: 15000 });
      }
      // Ensure no error boundary visible
      await expect(page.getByText('Ein Fehler ist aufgetreten').first()).toHaveCount(0);
    });
  }
});