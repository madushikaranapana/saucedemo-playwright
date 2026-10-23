import { test, expect } from '../src/fixtures/test-fixtures';
import { TIMEOUTS } from '../playwright.config';

test.describe('Task 08-A - Timeout configuration and handling', () => {
  test('Central timeout values are applied to the suite', async ({}, testInfo) => {
    expect(testInfo.timeout, 'Overall test timeout should be 30 s').toBe(30_000);
    expect(testInfo.project.timeout, 'Project-level test timeout should be 30 s').toBe(30_000);
    expect(testInfo.project.use.actionTimeout, 'Action timeout should be 10 s').toBe(10_000);
    expect(testInfo.project.use.navigationTimeout, 'Navigation timeout should be 15 s').toBe(15_000);

    // The constants in playwright.config.ts are the single source of truth.
    expect(TIMEOUTS).toEqual({ test: 30_000, expect: 5_000, action: 10_000, navigation: 15_000 });
  });

  test('A missing element fails an assertion with a descriptive, bounded timeout error', async ({ page }) => {
    await page.goto('/');

    // Explicit shorter timeout (1 s) than the 5 s default, so this negative check stays fast.
    const error = await expect(page.getByTestId('element-that-does-not-exist'))
      .toBeVisible({ timeout: 1_000 })
      .then(
        () => undefined,
        (e: Error) => e,
      );

    expect(error, 'Assertion on a missing element must fail rather than wait indefinitely').toBeDefined();
    expect(error!.message).toContain('toBeVisible'); // The assertion name is included in the error message.
    expect(error!.message).toMatch(/Timeout:? 1000ms/); // The timeout value is included in the error message.
  });

  test('A click on a missing element fails with a descriptive action timeout error', async ({ page }) => {
    await page.goto('/');

    const error = await page
      .getByRole('button', { name: 'Button that does not exist' })
      .click({ timeout: 1_000 })
      .then(
        () => undefined,
        (e: Error) => e,
      );

    expect(error, 'Action on a missing element must fail rather than wait indefinitely').toBeDefined();// The error message is descriptive and includes the timeout value.
    expect(error!.message).toContain('Timeout 1000ms exceeded'); // The timeout value is included in the error message.
  });

  // The next two tests use NO per-call timeout, so the failure message proves which
  // centrally configured default (assertion 5 s / action 10 s) is actually in effect.
  test('Default web-first assertion timeout is 5 s', async ({ page }) => {
    await page.goto('/');

    const error = await expect(page.getByTestId('element-that-does-not-exist'))
      .toBeVisible()
      .then(
        () => undefined,
        (e: Error) => e,
      );

    expect(error, 'Assertion on a missing element must fail').toBeDefined(); // The error message is descriptive and includes the timeout value.
    expect(error!.message).toMatch(/Timeout:? 5000ms/); // The timeout value is included in the error message.
  });

  test('Default action timeout is 10 s', async ({ page }) => {
    await page.goto('/');

    const error = await page
      .getByRole('button', { name: 'Button that does not exist' })
      .click()
      .then(
        () => undefined,
        (e: Error) => e,
      );

    expect(error, 'Action on a missing element must fail').toBeDefined(); // The error message is descriptive and includes the timeout value.
    expect(error!.message).toContain('Timeout 10000ms exceeded'); // The timeout value is included in the error message.
  });
});
