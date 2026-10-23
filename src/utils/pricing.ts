/**
 * SauceDemo pricing rules (as observed in the application):
 *   - Item total = sum of the item prices
 *   - Tax        = 8 % of the item total, rounded to the nearest cent
 *   - Total      = item total + tax
 *
 * All maths is done in integer cents to avoid floating-point drift.
 */
export const TAX_RATE = 0.08;

export interface ExpectedTotals {
  itemTotal: number;
  tax: number;
  total: number;
}

const toCents = (amount: number): number => Math.round(amount * 100);
const fromCents = (cents: number): number => cents / 100;

export function calculateExpectedTotals(prices: number[]): ExpectedTotals {
  const itemTotalCents = prices.reduce((sum, price) => sum + toCents(price), 0);
  const taxCents = Math.round(itemTotalCents * TAX_RATE);
  return {
    itemTotal: fromCents(itemTotalCents),
    tax: fromCents(taxCents),
    total: fromCents(itemTotalCents + taxCents),
  };
}

/** 29.99 -> "$29.99" */
export const formatPrice = (amount: number): string => `$${amount.toFixed(2)}`;

/** "Item total: $45.98" -> 45.98 */
export function parsePrice(text: string): number {
  const match = text.match(/\$\s*([\d,]+\.\d{2})/);
  if (!match) {
    throw new Error(`Could not find a price in text: "${text}"`);
  }
  return Number(match[1].replace(/,/g, ''));
}
