import { test, expect } from '../src/fixtures/test-fixtures';
import { buildValidatedCart } from '../src/utils/flows';
import { calculateExpectedTotals, formatPrice } from '../src/utils/pricing';
import { loadCustomers } from '../src/utils/test-data';

const customers = loadCustomers();

test.describe('Task 05 : Checkout (CSV-driven customer data)', () => {
  // One independent test per CSV record.
  for (const customer of customers) {
    test(`completes checkout for customer ${customer.firstName} ${customer.lastName} (${customer.postalCode})`, async ({
      page,
      authenticatedInventoryPage: inventoryPage,
      cartPage,
      checkoutPage,
      products,
    }) => {
      const remaining = await buildValidatedCart(inventoryPage, cartPage, products);
      await cartPage.proceedToCheckout();

      await test.step('Enter customer information from CSV', async () => {
        await checkoutPage.fillCustomerInformation(customer);
        await expect(checkoutPage.firstNameInput).toHaveValue(customer.firstName);
        await expect(checkoutPage.lastNameInput).toHaveValue(customer.lastName);
        await expect(checkoutPage.postalCodeInput).toHaveValue(customer.postalCode);
        await checkoutPage.continueToOverview();
        await expect(page, 'Checkout overview should open').toHaveURL(/\/checkout-step-two\.html$/);
      });

      await test.step('Overview shows the two remaining products and correct pricing', async () => {
        await expect(checkoutPage.overviewItems, 'Overview should list exactly 2 products').toHaveCount(remaining.length);
        for (const product of remaining) {
          await expect(checkoutPage.overviewItem(product.name)).toBeVisible();
          await expect(checkoutPage.overviewItemPrice(product.name)).toHaveText(formatPrice(product.price));
        }

        const expected = calculateExpectedTotals(remaining.map((p) => p.price));
        await expect(checkoutPage.subtotalLabel, 'Item total should equal the sum of item prices').toHaveText(
          `Item total: ${formatPrice(expected.itemTotal)}`,
        );
        await expect(checkoutPage.taxLabel, 'Tax should be 8% of the item total').toHaveText(
          `Tax: ${formatPrice(expected.tax)}`,
        );
        await expect(checkoutPage.totalLabel, 'Final total should be item total + tax').toHaveText(
          `Total: ${formatPrice(expected.total)}`,
        );
      });

      await test.step('Finish the order and verify confirmation', async () => {
        await checkoutPage.finishOrder();
        await expect(page).toHaveURL(/\/checkout-complete\.html$/);
        await expect(checkoutPage.completeHeader, 'Order confirmation header should be displayed').toHaveText(
          'Thank you for your order!',
        );
      });
    });
  }
});
