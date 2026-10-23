import { test, expect } from '../src/fixtures/test-fixtures';

test.describe('Task 08-B - Negative login', () => {
  test('Invalid credentials show an error and do not reach the inventory page', async ({
    page,
    loginPage,
    inventoryPage,
    credentials,
  }) => {
    await loginPage.goto();
    await loginPage.login(credentials.invalidUser.username, credentials.invalidUser.password);

    await expect(loginPage.errorMessage, 'Login error message should be displayed').toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username and password do not match any user in this service');

    await expect(page, 'User must stay on the login page').not.toHaveURL(/inventory/);
    await expect(inventoryPage.inventoryList, 'Inventory must not be displayed after a failed login').toHaveCount(0);
    await expect(loginPage.loginButton, 'Login form should still be available').toBeVisible();
  });
});
