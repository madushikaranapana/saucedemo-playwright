import { test, expect } from '../src/fixtures/test-fixtures';
import { LoginPage } from '../src/pages/LoginPage';
import { InventoryPage } from '../src/pages/InventoryPage';

test.describe('Task 7: Verify browser context and session isolation', () => {
  test('A fresh browser context cannot access inventory without logging in', async ({
    browser,
    baseURL,
    credentials,
  }) => {
    // Two completely isolated contexts: separate cookies, local/session storage and cache.
    const authenticatedContext = await browser.newContext({ baseURL });
    const freshContext = await browser.newContext({ baseURL });

    try {
      await test.step('Context 1: log in and reach inventory', async () => {
        const page = await authenticatedContext.newPage();
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);

        await loginPage.goto();
        await loginPage.login(credentials.validUser.username, credentials.validUser.password);
        await expect(page, 'Context 1 should reach the inventory URL').toHaveURL(/\/inventory\.html$/);
        await expect(inventoryPage.inventoryList, 'Context 1 should see the product list').toBeVisible();
      });

      await test.step('Context 2: direct navigation to inventory is blocked', async () => {
        // No cookies / storage state are copied from context 1.
        const page = await freshContext.newPage();
        const loginPage = new LoginPage(page);
        const inventoryPage = new InventoryPage(page);

        await page.goto('/inventory.html');

        await expect(page, 'Context 2 should be redirected to the login page').toHaveURL(baseURL!);
        await expect(loginPage.loginButton, 'Login form should be shown to the unauthenticated context').toBeVisible();
        await expect(
          loginPage.errorMessage,
          'An access-denied message should explain why inventory was not shown',
        ).toContainText("You can only access '/inventory.html' when you are logged in");
        await expect(inventoryPage.inventoryList, 'Inventory must not be displayed').toHaveCount(0);
      });
    } finally {
      await authenticatedContext.close();
      await freshContext.close();
    }
  });
});
