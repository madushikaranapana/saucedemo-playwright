import { test, expect } from '../src/fixtures/test-fixtures';
import { formatPrice } from '../src/utils/pricing';
import { PRODUCT_TO_REMOVE_INDEX } from '../src/utils/flows';

test.describe('Task 4: Modify the cart and validate conditional behavior', () => {
  test('Verifies 3 items, removes one, validates 2 remain, then proceeds to checkout', async ({
    page,
    authenticatedInventoryPage: inventoryPage,
    cartPage,
    products,
  }) => {
    const removed = products[PRODUCT_TO_REMOVE_INDEX];
    const remaining = products.filter((p) => p.name !== removed.name);

    await inventoryPage.addProducts(products);
    await inventoryPage.openCart();
    await expect(page, 'Should be on the cart page').toHaveURL(/\/cart\.html$/);

    await test.step('All three selected products are in the cart', async () => {
      await expect(cartPage.items, 'Cart should contain 3 items before removal').toHaveCount(products.length);
      for (const product of products) {
        await expect(cartPage.cartItem(product.name), `"${product.name}" should be in the cart`).toBeVisible();
        await expect(cartPage.itemPrice(product.name)).toHaveText(formatPrice(product.price));
      }
    });

    await test.step(`Remove "${removed.name}"`, async () => {
      await cartPage.removeItem(removed.name);
      await expect(cartPage.cartItem(removed.name), `"${removed.name}" should no longer be displayed`).toHaveCount(0);
      await expect(cartPage.items, 'Exactly two products should remain').toHaveCount(2);
    });

    await test.step('Gate: checkout only if the cart is in the expected state', async () => {
      // Fails with a meaningful message instead of silently skipping checkout.
      expect(
        await cartPage.getItemNames(),
        `Cart must contain exactly [${remaining.map((p) => p.name).join(', ')}] before checkout`,
      ).toEqual(remaining.map((p) => p.name));

      await cartPage.proceedToCheckout();
      await expect(page, 'Checkout step one should open after a valid cart').toHaveURL(/\/checkout-step-one\.html$/);
    });
  });
});
