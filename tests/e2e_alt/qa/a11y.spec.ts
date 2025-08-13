import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slugify(input: string): string {
  return input
    .replace(/[/?#=&:%]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'root';
}

test.describe('Accessibility (axe) — non-blocking scan', () => {
  const routes = [
    '/',
    '/wochenplanung',
    '/tagesplanung',
    '/leads',
    '/cockpit',
    '/manager',
  ];

  for (const route of routes) {
    test(`Scan ${route}`, async ({ page }) => {
      const url = route.includes('?') ? route : `${route}?role=Admin`;
      await page.goto(url);

      // Run axe with common tags; do not fail test on violations
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      ensureDir('qa/axe');
      const out = path.join('qa/axe', `${slugify(route)}.json`);
      fs.writeFileSync(out, JSON.stringify({ route, url, results }, null, 2));
    });
  }
});

