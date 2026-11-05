/**
 * "Remember my details on this device" (PRODUCT_BRIEF FR-55, NFR-10).
 * Opt-in only, off by default. Stored locally, never sent anywhere by the site.
 */

import { FIELD_LIMITS } from '../core/validate.js';
import { readJSON, remove, writeJSON } from '../services/storage.js';

export const CUSTOMER_KEY = 'funshi.customer.v1';
const FIELDS = { name: FIELD_LIMITS.name[1], phone: 30, street: FIELD_LIMITS.street[1], apartment: FIELD_LIMITS.apartment, area: FIELD_LIMITS.area[1], reference: FIELD_LIMITS.reference };

/** Strict parse: only known text fields, capped. Pure. */
export function parseCustomer(raw) {
  if (!raw || typeof raw !== 'object' || raw.v !== 1) return null;
  const out = { v: 1 };
  for (const [field, max] of Object.entries(FIELDS)) {
    out[field] = typeof raw[field] === 'string' ? raw[field].slice(0, max) : '';
  }
  return out;
}

export const loadCustomer = () => parseCustomer(readJSON(CUSTOMER_KEY));

export function saveCustomer(values) {
  return writeJSON(CUSTOMER_KEY, parseCustomer({ ...values, v: 1 }));
}

export const forgetCustomer = () => remove(CUSTOMER_KEY);
