import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const ensureScreensDir = () => {
  const dir = path.resolve('screens');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

test('E6-01 screenshot', async ({ page }) => {
  const dir = ensureScreensDir();
  await page.goto('/wochenplanung?role=Admin');
  await expect(page.getByText('Wochenübersicht', { exact: false })).toBeVisible();
  await page.screenshot({ path: path.join(dir, 'e6-01-wochenplanung.png'), fullPage: true });
});

test('E6-02 screenshot', async ({ page }) => {
  const dir = ensureScreensDir();
  await page.goto('/missionen?role=Admin');
  await expect(page.getByText('Missionen', { exact: false })).toBeVisible();
  await page.screenshot({ path: path.join(dir, 'e6-02-missionen.png'), fullPage: true });
});

test('E6-07 screenshot', async ({ page }) => {
  const dir = ensureScreensDir();
  await page.goto('/manager?role=Admin');
  await expect(page.getByText('Manager', { exact: false })).toBeVisible();
  await page.screenshot({ path: path.join(dir, 'e6-07-manager.png'), fullPage: true });
});