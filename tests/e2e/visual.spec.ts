import { test, expect, Page } from '@playwright/test';

async function imageLoaded(page: Page, altSubstring: string): Promise<boolean> {
  return await page.evaluate((alt) => {
    const img = Array.from(document.querySelectorAll('img'))
      .find((el) => (el.getAttribute('alt') || '').toLowerCase().includes(alt.toLowerCase())) as HTMLImageElement | null;
    return !!img && img.complete && img.naturalWidth > 0;
  }, altSubstring);
}

async function noHorizontalOverflow(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const el = document.scrollingElement!;
    return Math.round(el.scrollWidth) <= Math.round(el.clientWidth);
  });
}

async function rectsOf(page: Page, selector: string) {
  return await page.$$eval(selector, (els) => els.map((el) => {
    const r = (el as HTMLElement).getBoundingClientRect();
    return { top: r.top, left: r.left, right: r.right, bottom: r.bottom };
  }));
}

function anyOverlap(rects: {top:number,left:number,right:number,bottom:number}[]): boolean {
  const overlaps = (a: any, b: any) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    if (overlaps(rects[i], rects[j])) return true;
  }
  return false;
}

test.describe('Visual layout guards (generic desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
  });

  test('Brand image is loaded on home route', async ({ page }) => {
    const url = process.env.VISUAL_HOME_URL || '/';
    const brandAlt = process.env.VISUAL_BRAND_ALT || 'logo';
    await page.goto(url);
    await expect.poll(() => imageLoaded(page, brandAlt)).toBeTruthy();
    await expect.poll(() => noHorizontalOverflow(page)).toBeTruthy();
  });

  test('KPI row does not wrap and does not overlap (if present)', async ({ page }) => {
    const url = process.env.VISUAL_KPI_URL || '/';
    await page.goto(url);
    const selectors = [
      '[data-qa="kpi-card"]',
      '[data-testid="kpi-card"]',
      '[aria-label="KPIs"] [role="article"], [aria-label="KPIs"] [role="group"]',
    ];
    let selector = '';
    for (const cand of selectors) {
      const cnt = await page.locator(cand).count();
      if (cnt > 0) { selector = cand; break; }
    }
    if (!selector) test.skip(true, 'No KPI selector matched; add data-qa="kpi-card" to enable this check.');

    const expectedCount = Number(process.env.VISUAL_KPI_COUNT || 6);
    const cards = page.locator(selector);
    await expect(cards).toHaveCount(expectedCount);
    const rects = await rectsOf(page, selector);
    const tops = rects.map(r => r.top);
    const ref = tops[0];
    const sameRow = tops.every(t => Math.abs(t - ref) <= 4);
    expect(sameRow, 'KPI cards must be on one row (no wrapping).').toBeTruthy();
    expect(anyOverlap(rects), 'KPI cards overlap.').toBeFalsy();
  });

  test('No unintended horizontal overflow on secondary route', async ({ page }) => {
    const url = process.env.VISUAL_SECONDARY_URL || '/';
    await page.goto(url);
    await expect.poll(() => noHorizontalOverflow(page)).toBeTruthy();
  });
});


