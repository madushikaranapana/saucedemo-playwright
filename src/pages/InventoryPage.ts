import { type Locator, type Page } from '@playwright/test';
import type { Product } from '../utils/test-data';

export class InventoryPage {
  readonly title: Locator;
  readonly inventoryList: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.inventoryList = page.getByTestId('inventory-list');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  /**
   * Locator chaining, step 1: the container of ONE specific product.
   * Every `inventory-item` card is filtered down to the ones name match.
   */
  productCard(name: string): Locator {
    return this.page
      .getByTestId('inventory-item')
      .filter({ has: this.page.getByText(name, { exact: true }) });
  }

  /** Locator chaining, step 2: the button *inside* that product's card. */
  addToCartButton(name: string): Locator {
    return this.productCard(name).getByRole('button', { name: 'Add to cart' });
  }

  removeButton(name: string): Locator {
    return this.productCard(name).getByRole('button', { name: 'Remove' });
  }

  productName(name: string): Locator {
    return this.productCard(name).getByTestId('inventory-item-name');
  }

  productPrice(name: string): Locator {
    return this.productCard(name).getByTestId('inventory-item-price');
  }

  productImage(name: string): Locator {
    return this.productCard(name).getByRole('img');
  }

  async addProductToCart(name: string): Promise<void> {
    await this.addToCartButton(name).click();
  }

  /** One Add to cart click per product record (no hardcoded clicks). */
  async addProducts(products: Product[]): Promise<void> {
    for (const product of products) {
      await this.addProductToCart(product.name);
    }
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
