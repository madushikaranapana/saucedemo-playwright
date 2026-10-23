import { test, expect } from '../src/fixtures/test-fixtures';
import { calculateExpectedTotals, formatPrice } from '../src/utils/pricing';
import { PRODUCT_TO_REMOVE_INDEX } from '../src/utils/flows';
import { selectCustomer } from '../src/utils/test-data';

test.describe('End-to-end purchase workflow (Tasks 02-05 )', () => {
  test('Customer logged in, adds 3 products, removes 1, checks out and  order confirmation', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
    credentials,
    products,
  }, testInfo) => {
// This task validates the timeout configuration established in Task 1 and the reliability of the suite built in Tasks 2–7.
    test.setTimeout(45_000);
    expect(testInfo.timeout, 'Override should be 45 s for this designated test').toBe(45_000);

    const customer = selectCustomer();
    const removed = products[PRODUCT_TO_REMOVE_INDEX];
    const remaining = products.filter((p) => p.name !== removed.name);

    await test.step('Log in', async () => {
      await loginPage.goto();
      await loginPage.login(credentials.validUser.username, credentials.validUser.password);
      await expect(page, 'Step "Log in": inventory URL expected').toHaveURL(/\/inventory\.html$/);
    });

    await test.step('Select products from products.json', async () => {
      await inventoryPage.addProducts(products);
      // Explicit, shorter assertion timeout (default is 5 s): the badge updates client-side, instantly.
      await expect(inventoryPage.cartBadge, 'Step "Select products": badge should show 3').toHaveText(
        String(products.length),
        { timeout: 3_000 },
      );
    });

    await test.step('Modify the cart', async () => {
      await inventoryPage.openCart();
      await expect(cartPage.items, 'Step "Modify the cart": 3 items expected').toHaveCount(products.length);
      await cartPage.removeItem(removed.name);
      await expect(cartPage.cartItem(removed.name), `"${removed.name}" should be removed`).toHaveCount(0);

      expect(
        await cartPage.getItemNames(),
        `Cart must contain exactly [${remaining.map((p) => p.name).join(', ')}] before checkout`,
      ).toEqual(remaining.map((p) => p.name));
    });

    await test.step(`Enter checkout details for ${customer.firstName} ${customer.lastName}`, async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.fillCustomerInformation(customer);
      await checkoutPage.continueToOverview();
      await expect(page, 'Step "Checkout details": overview expected').toHaveURL(/\/checkout-step-two\.html$/);
    });

    await test.step('Validate overview and pricing', async () => {
      await expect(checkoutPage.overviewItems).toHaveCount(remaining.length);
      for (const product of remaining) {
        await expect(checkoutPage.overviewItemPrice(product.name)).toHaveText(formatPrice(product.price));
      }
      const expected = calculateExpectedTotals(remaining.map((p) => p.price));
      expect(await checkoutPage.getDisplayedTotals(), 'Step "Pricing": displayed totals should match pricing rules').toEqual(
        expected,
      );
    });

    await test.step('Complete the order', async () => {
      await checkoutPage.finishOrder();
      await expect(checkoutPage.completeHeader, 'Step "Complete order": confirmation expected').toHaveText(
        'Thank you for your order!',
      );
    });
  });
});
