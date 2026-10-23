import { test, expect } from '../src/fixtures/test-fixtures';

/**
 * Task 06 - Mouse interactions on real SauceDemo elements.
 * Kept separate from the purchase workflow on purpose.
 */
test.describe('Task 6: Demonstrate meaningful mouse interactions', () => {
  test('Hover  a product image does not change application state', async ({
    authenticatedInventoryPage: inventoryPage,
    products,
  }) => {
    const product = products[0];

    await inventoryPage.productImage(product.name).hover();

    await expect(inventoryPage.productCard(product.name), 'Product card should stay visible while hovered').toBeVisible();
    await expect(
      inventoryPage.addToCartButton(product.name),
      'Hover alone must not add the product to the cart',
    ).toBeEnabled();
    await expect(inventoryPage.cartBadge, 'Cart badge should not appear after hover').toHaveCount(0);
  });

  test('Double-click a meaningful visible element, such as a product name, to demonstrate the interaction. Verify the outcome if one is defined.', async ({
    page,
    authenticatedInventoryPage: inventoryPage,
    products,
  }) => {
    const product = products[0];

    await inventoryPage.productName(product.name).dblclick();

    await expect(page, 'Double-clicking the product link should open its detail page').toHaveURL(
      /\/inventory-item\.html\?id=\d+/,
    );
    await expect(page.getByTestId('inventory-item-name')).toHaveText(product.name);
    await expect(page.getByTestId('shopping-cart-badge'), 'No product should have been added').toHaveCount(0);
  });

  test('Right-click a product element and observe the actual result. Assert only deterministic, supported behavior.', async ({
    page,
    authenticatedInventoryPage: inventoryPage,
    products,
  }) => {
    const product = products[0];

    await inventoryPage.productName(product.name).click({ button: 'right' });

    await expect(page, 'Right-click must not navigate away from the inventory page').toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.productCard(product.name)).toBeVisible();
    await expect(inventoryPage.cartBadge, 'Right-click must not add anything to the cart').toHaveCount(0);
  });
});
