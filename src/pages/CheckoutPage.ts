import { type Locator, type Page } from '@playwright/test';
import type { Customer } from '../utils/test-data';
import { parsePrice } from '../utils/pricing';

export class CheckoutPage {
  // customer information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;

  // overview
  readonly overviewItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  // Complete
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });

    this.overviewItems = page.getByTestId('inventory-item');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByRole('button', { name: 'Finish' });

    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
  }

  async fillCustomerInformation(customer: Customer): Promise<void> {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.postalCodeInput.fill(customer.postalCode);
  }

  async continueToOverview(): Promise<void> {
    await this.continueButton.click();
  }

  overviewItem(name: string): Locator {
    return this.overviewItems.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  overviewItemPrice(name: string): Locator {
    return this.overviewItem(name).getByTestId('inventory-item-price');
  }

  async getOverviewItemNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  /** Read the displayed item total / tax / total as numbers. */
  async getDisplayedTotals(): Promise<{ itemTotal: number; tax: number; total: number }> {
    return {
      itemTotal: parsePrice(await this.subtotalLabel.innerText()),
      tax: parsePrice(await this.taxLabel.innerText()),
      total: parsePrice(await this.totalLabel.innerText()),
    };
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }
}
