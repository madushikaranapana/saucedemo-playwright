import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'csv-parse/sync';

const DATA_DIR = path.resolve(__dirname, '..', 'test-data');

export interface Product {
  name: string;
  price: number;
}

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface Credentials {
  username: string;
  password: string;
}

/** Reads the products (name + expected price) from products.json. */
export function loadProducts(): Product[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8');
  return JSON.parse(raw) as Product[];
}

/** Reads and parses customers.csv using csv-parse (header row -> object keys). */
export function loadCustomers(): Customer[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'customers.csv'), 'utf-8');
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Customer[];
}

/** Reads login credentials from credentials.json. */
export function loadCredentials(): { validUser: Credentials; invalidUser: Credentials } {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'credentials.json'), 'utf-8');
  return JSON.parse(raw);
}

/**
 * Picks the customer record used by single-customer scenarios (e.g. the
 * end-to-end purchase). Override with the CUSTOMER_INDEX environment variable.
 */
export function selectCustomer(customers: Customer[] = loadCustomers()): Customer {
  const index = Number(process.env.CUSTOMER_INDEX ?? 0);
  if (!Number.isInteger(index) || index < 0 || index >= customers.length) {
    throw new Error(
      `CUSTOMER_INDEX=${process.env.CUSTOMER_INDEX} is invalid. ` +
        `Expected an integer between 0 and ${customers.length - 1}.`,
    );
  }
  return customers[index];
}
