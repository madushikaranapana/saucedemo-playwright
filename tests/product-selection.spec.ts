import { test, expect } from '../src/fixtures/test-fixtures';
import { formatPrice } from '../src/utils/pricing';

test.describe('Task 03 - Product selection (JSON-driven, locator chaining)', () => {
  test('adds every product from products.json and verifies names, prices and cart badge', async ({
    authenticatedInventoryPage: inventoryPage,
    products,
  }) => {
    // Verify names and prices on the inventory page against the JSON data first.
    for (const product of products) {
      await expect(
        inventoryPage.productName(product.name),
        `Product "${product.name}" should be listed on the inventory page`,
      ).toBeVisible();
      await expect(
        inventoryPage.productPrice(product.name),
        `Displayed price for "${product.name}" should match products.json`,
      ).toHaveText(formatPrice(product.price));
    }

    // Select each product via its own container + chained button locator.
    for (const [index, product] of products.entries()) {
      await inventoryPage.addProductToCart(product.name);

      await expect(
        inventoryPage.removeButton(product.name),
        `"${product.name}" button should switch to Remove after being added`,
      ).toBeVisible();
      await expect(
        inventoryPage.cartBadge,
        `Cart badge should show ${index + 1} after adding "${product.name}"`,
      ).toHaveText(String(index + 1));
    }

    await expect(inventoryPage.cartBadge, 'Cart badge should equal the number of selected products').toHaveText(
      String(products.length),
    );
  });
});
