import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { loadCredentials, loadProducts, type Credentials, type Product } from '../utils/test-data';

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  credentials: { validUser: Credentials; invalidUser: Credentials };
  products: Product[];
  /** A page that is already logged in and sitting on the inventory page. */
  authenticatedInventoryPage: InventoryPage;
};


 
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  credentials: async ({}, use) => use(loadCredentials()),
  products: async ({}, use) => use(loadProducts()),

  authenticatedInventoryPage: async ({ loginPage, inventoryPage, credentials }, use) => {
    await loginPage.goto();
    await loginPage.login(credentials.validUser.username, credentials.validUser.password);
    await expect(inventoryPage.title, 'Setup: login should land on the inventory page').toHaveText('Products');
    await use(inventoryPage);
  },
});

export { expect };
