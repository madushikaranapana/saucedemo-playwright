import { expect } from '@playwright/test';
import type { InventoryPage } from '../pages/InventoryPage';
import type { CartPage } from '../pages/CartPage';
import type { Product } from './test-data';

/** Index (in products.json) of the product removed from the cart: "Sauce Labs Bike Light". */
export const PRODUCT_TO_REMOVE_INDEX = 1;

/**
 * Reusable setup for specs that "continue" from an earlier task:
 * adds every product, opens the cart, removes one item and validates the cart state.
 * Returns the products expected to remain in the cart.
 */
export async function buildValidatedCart(
  inventoryPage: InventoryPage,
  cartPage: CartPage,
  products: Product[],
): Promise<Product[]> {
  const toRemove = products[PRODUCT_TO_REMOVE_INDEX];
  const expectedRemaining = products.filter((p) => p.name !== toRemove.name);

  await inventoryPage.addProducts(products);
  await inventoryPage.openCart();
  await cartPage.removeItem(toRemove.name);

  // Conditional gate: fail loudly (not skip) if the cart is not in the expected state.
  expect(
    await cartPage.getItemNames(),
    `Cart must contain exactly [${expectedRemaining.map((p) => p.name).join(', ')}] before checkout`,
  ).toEqual(expectedRemaining.map((p) => p.name));

  return expectedRemaining;
}
