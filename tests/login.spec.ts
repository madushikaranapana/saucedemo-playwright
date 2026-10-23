import { test, expect } from '../src/fixtures/test-fixtures';

test.describe('Task 02 : Login (POM)', () => {
  test('Standard_user can log in and reach the inventory page', async ({
    page,
    loginPage,
    inventoryPage,
    credentials,
  }) => {
    await loginPage.goto();
    await loginPage.login(credentials.validUser.username, credentials.validUser.password);

    // Business assertions stay in the test; interactions stay in the page object.
    await expect(page, 'Login should redirect to the inventory URL').toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title, 'Inventory page heading should be "Products"').toHaveText('Products');
    await expect(inventoryPage.inventoryList, 'Product list should be displayed after login').toBeVisible();
  });
});
