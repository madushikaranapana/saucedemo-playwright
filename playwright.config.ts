import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration for the whole suite
 * end-to-end purchase test (see tests/e2e-purchase.spec.ts).
 */
export const TIMEOUTS = {
  test: 30_000, // overall per-test timeout
  expect: 5_000, // web-first assertion timeout
  action: 10_000, // click / fill / hover ... timeout
  navigation: 15_000, // goto / waitForURL / reload ... timeout
} as const;

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',

  // Overall test timeout
  timeout: TIMEOUTS.test,

  expect: {
    // Web-first assertion timeout (expect(locator).toBeVisible(), etc.)
    timeout: TIMEOUTS.expect,
  },

  // Every test is independent, so they can safely run in parallel.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['allure-playwright', { resultsDir: 'allure-results' }],
],
  use: {
    baseURL: 'https://www.saucedemo.com/',

    // SauceDemo marks elements with `data-test`, not Playwright's default `data-testid`.
    testIdAttribute: 'data-test',

    // Action timeout (click, fill, hover, ...)
    actionTimeout: TIMEOUTS.action,
    // Navigation timeout (goto, waitForURL, ...)
    navigationTimeout: TIMEOUTS.navigation,

    // Failure diagnostics: artifacts are kept only when a test fails.
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
