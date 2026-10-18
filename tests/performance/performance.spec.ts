import { test, expect } from '../../src/fixtures/test.fixtures';
import { Logger } from '../../src/utils/logger';

test.describe('Performance & SLA Benchmarks @performance', () => {
  test('TC_PERF_01: Home page loads within acceptable SLA threshold (< 4000ms)', async ({
    page,
    homePage,
  }) => {
    const startTime = Date.now();
    await homePage.navigateTo('/');
    await page.waitForLoadState('domcontentloaded');
    const loadDuration = Date.now() - startTime;

    Logger.info(`Home page DOMContentLoaded duration: ${loadDuration}ms`);

    // Performance timing extraction from browser Navigation Timing API
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        dns: nav ? nav.domainLookupEnd - nav.domainLookupStart : 0,
        tcp: nav ? nav.connectEnd - nav.connectStart : 0,
        ttfb: nav ? nav.responseStart - nav.requestStart : 0,
        domInteractive: nav ? nav.domInteractive - nav.startTime : 0,
        domComplete: nav ? nav.domComplete - nav.startTime : 0,
      };
    });

    Logger.info(`Performance Metrics: TTFB=${timing.ttfb.toFixed(1)}ms, DOM Complete=${timing.domComplete.toFixed(1)}ms`);
    expect(loadDuration).toBeLessThan(4000);
  });

  test('TC_PERF_02: Cart page loads within acceptable SLA threshold (< 3500ms)', async ({
    page,
    cartPage,
  }) => {
    const startTime = Date.now();
    await cartPage.navigateTo('/cart.html');
    await page.waitForLoadState('domcontentloaded');
    const duration = Date.now() - startTime;

    Logger.info(`Cart page DOMContentLoaded duration: ${duration}ms`);
    expect(duration).toBeLessThan(3500);
  });

  test('TC_PERF_03: Product catalog API responds within SLA (< 2000ms)', async ({
    apiClient,
  }) => {
    const start = Date.now();
    const response = await apiClient.getCatalogEntries();
    const latency = Date.now() - start;

    Logger.info(`API /entries response latency: ${latency}ms`);
    expect(response.status()).toBe(200);
    expect(latency).toBeLessThan(2000);
  });
});
