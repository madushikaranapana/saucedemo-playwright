import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  cartItem(name: string): Locator {
    return this.items.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  itemPrice(name: string): Locator {
    return this.cartItem(name).getByTestId('inventory-item-price');
  }

  async removeItem(name: string): Promise<void> {
    await this.cartItem(name).getByRole('button', { name: 'Remove' }).click();
  }

  /** waiting  for  the DOM to settle via auto-wait */
  async getItemNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
