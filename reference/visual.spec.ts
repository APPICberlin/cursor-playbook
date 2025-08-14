import { test, expect, Page } from '@playwright/test';

async function logoIsLoaded(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const img = document.querySelector('img[alt*="clanda" i]') as HTMLImageElement | null;
    return !!img && img.complete && img.naturalWidth > 0;
  });
}

async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const el = document.scrollingElement!;
    return Math.round(el.scrollWidth) <= Math.round(el.clientWidth);
  });
}

async function getRects(page: Page, selector: string) {
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

test.describe('Visual layout guards (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
  });

  test('Logo loaded on Wochenplanung', async ({ page }) => {
    await page.goto('/wochenplanung');
    await expect.poll(() => logoIsLoaded(page)).toBeTruthy();
    await expect.poll(() => hasNoHorizontalOverflow(page)).toBeTruthy();
  });

  test('KPI row: 6 cards on Manager in one row without overlap', async ({ page }) => {
    await page.goto('/manager');
    const selectorCandidates = [
      '[data-qa="kpi-card"]',
      '[data-testid="kpi-card"]',
      '[aria-label="KPIs"] [role="article"], [aria-label="KPIs"] [role="group"]',
    ];
    let selector = '';
    for (const cand of selectorCandidates) {
      const cnt = await page.locator(cand).count();
      if (cnt > 0) { selector = cand; break; }
    }
    expect(selector, 'No KPI card selector matched; add data-qa="kpi-card" to KPI tiles.').not.toEqual('');
    const cards = page.locator(selector);
    await expect(cards).toHaveCount(6);
    const rects = await getRects(page, selector);
    const tops = rects.map(r => r.top);
    const ref = tops[0];
    const sameRow = tops.every(t => Math.abs(t - ref) <= 4);
    expect(sameRow, 'KPI cards must be on one row (no wrapping).').toBeTruthy();
    expect(anyOverlap(rects), 'KPI cards overlap.').toBeFalsy();
  });

  test('Daily view has no horizontal overflow', async ({ page }) => {
    await page.goto('/tagesplanung');
    await expect.poll(() => hasNoHorizontalOverflow(page)).toBeTruthy();
  });
});


