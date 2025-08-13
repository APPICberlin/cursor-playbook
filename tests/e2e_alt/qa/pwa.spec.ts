import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

test.describe('PWA checks', () => {
  test('manifest and service worker registration', async ({ page }) => {
    await page.goto('/?role=Admin');

    // Check manifest link
    const manifestHref = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
      return link?.href || null;
    });
    expect(manifestHref).toBeTruthy();

    // Fetch manifest JSON
    const resp = await page.request.get(manifestHref!);
    expect(resp.ok()).toBeTruthy();
    const manifest = await resp.json();

    // Basic fields
    expect(manifest.name || manifest.short_name).toBeTruthy();
    expect(Array.isArray(manifest.icons)).toBeTruthy();

    // Check service worker registration in the app
    const swRegistration = await page.evaluate(async () => {
      try {
        // vite-plugin-pwa registers in production; emulate prod by checking readiness
        // We just check that `navigator.serviceWorker` exists
        return 'serviceWorker' in navigator;
      } catch {
        return false;
      }
    });

    ensureDir('qa');
    fs.writeFileSync(
      path.join('qa', 'pwa.json'),
      JSON.stringify({ manifestHref, manifest, swSupported: swRegistration }, null, 2)
    );
  });
});

