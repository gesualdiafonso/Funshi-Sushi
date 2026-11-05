/**
 * Cart model — pure functions on an immutable cart value.
 * No DOM, no storage, no globals: tested in tests/cart-model.test.js.
 *
 * TRUST RULE (PRODUCT_BRIEF OR-21, UX D7): a cart holds only WHICH dish,
 * WHICH size, HOW MANY and a NOTE. It never holds prices, names or totals —
 * those always come from the current menu data (see js/core/pricing.js).
 * Anything read back from the browser is parsed strictly and re-checked
 * against the menu before use; unknown fields are dropped.
 */

import { checkOrderable } from '../core/catalog.js';

export const CART_VERSION = 1;

/**
 * @typedef {Object} CartLine
 * @property {string} key          productId|variantId|note — one line per distinct request
 * @property {string} productId
 * @property {string | null} variantId
 * @property {number} qty          Integer, 1…limits.maxQtyPerItem
 * @property {string} note         '' when none
 *
 * @typedef {Object} Cart
 * @property {1} v
 * @property {CartLine[]} lines
 * @property {string} orderNote
 *
 * @typedef {Object} Limits
 * @property {number} maxQtyPerItem
 * @property {number} maxItemsPerOrder
 * @property {number} noteMaxLength      order note
 * @property {number} itemNoteMaxLength  per-dish note
 */

/** @returns {Cart} */
export function emptyCart() {
  return { v: CART_VERSION, lines: [], orderNote: '' };
}

/** Trim, collapse whitespace, drop control characters, cap length. */
export function normalizeNote(text, maxLength) {
  return String(text ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/** Line identity: the same dish with a different size or note is a separate line. */
export function lineKey(productId, variantId, note) {
  return `${productId}|${variantId ?? ''}|${note.toLowerCase()}`;
}

/** @returns {number | null} the quantity if it is a whole number ≥ 1, else null */
export function parseQty(value) {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return Number.isInteger(n) && n >= 1 ? n : null;
}

export const itemCount = (cart) => cart.lines.reduce((sum, line) => sum + line.qty, 0);


/**
 * Add a dish. Merges into an existing line with the same key.
 * Quantities are clamped to the per-dish and per-order limits; the result
 * says how many were actually added and why fewer, if so.
 * @param {Cart} cart
 * @param {{ productId: string, variantId?: string | null, qty?: unknown, note?: string }} request
 * @param {import('../core/catalog.js').Catalog} catalog
 * @param {Limits} limits
 * @returns {{ cart: Cart, added: number, key?: string, error?: string, limited?: 'line' | 'order' }}
 */
export function addItem(cart, request, catalog, limits) {
  const variantId = request.variantId ?? null;
  const check = checkOrderable(catalog.byId.get(request.productId), variantId);
  if (!check.ok) return { cart, added: 0, error: check.reason };

  const qty = parseQty(request.qty ?? 1);
  if (qty === null) return { cart, added: 0, error: 'invalid-qty' };

  const note = normalizeNote(request.note, limits.itemNoteMaxLength);
  const key = lineKey(request.productId, variantId, note);
  const index = cart.lines.findIndex((line) => line.key === key);
  const current = index === -1 ? 0 : cart.lines[index].qty;

  const roomInLine = limits.maxQtyPerItem - current;
  const roomInOrder = limits.maxItemsPerOrder - itemCount(cart);
  const added = Math.max(0, Math.min(qty, roomInLine, roomInOrder));
  if (added === 0) {
    return { cart, added: 0, key, error: roomInLine <= 0 ? 'line-limit' : 'order-limit' };
  }
  const limited = added < qty ? (roomInLine < roomInOrder ? 'line' : 'order') : undefined;

  const line = { key, productId: request.productId, variantId, qty: current + added, note };
  const lines = index === -1 ? [...cart.lines, line] : cart.lines.map((l, i) => (i === index ? line : l));
  return { cart: { ...cart, lines }, added, key, limited };
}

/**
 * Set a line's quantity. 0 removes the line; above the limits is clamped.
 * @returns {{ cart: Cart, qty: number, error?: string, limited?: 'line' | 'order' }}
 */
export function setQty(cart, key, value, limits) {
  const index = cart.lines.findIndex((line) => line.key === key);
  if (index === -1) return { cart, qty: 0, error: 'unknown-line' };
  if (value === 0 || value === '0') return { cart: removeLine(cart, key).cart, qty: 0 };
  const wanted = parseQty(value);
  if (wanted === null) return { cart, qty: cart.lines[index].qty, error: 'invalid-qty' };

  const others = itemCount(cart) - cart.lines[index].qty;
  const qty = Math.min(wanted, limits.maxQtyPerItem, limits.maxItemsPerOrder - others);
  if (qty < 1) return { cart, qty: cart.lines[index].qty, error: 'order-limit' };
  const limited = qty < wanted ? (wanted > limits.maxQtyPerItem ? 'line' : 'order') : undefined;
  const lines = cart.lines.map((line, i) => (i === index ? { ...line, qty } : line));
  return { cart: { ...cart, lines }, qty, limited };
}

/** @returns {{ cart: Cart, removed: { line: CartLine, index: number } | null }} */
export function removeLine(cart, key) {
  const index = cart.lines.findIndex((line) => line.key === key);
  if (index === -1) return { cart, removed: null };
  return { cart: { ...cart, lines: cart.lines.filter((_, i) => i !== index) }, removed: { line: cart.lines[index], index } };
}

/** Undo a removal: put the line back where it was (merging if re-added meanwhile). */
export function restoreLine(cart, removed, catalog, limits) {
  if (!removed) return { cart };
  const without = cart.lines.filter((line) => line.key !== removed.line.key);
  const existing = cart.lines.find((line) => line.key === removed.line.key);
  const merged = { ...removed.line, qty: (existing?.qty ?? 0) + removed.line.qty };
  const lines = [...without];
  lines.splice(Math.min(removed.index, lines.length), 0, merged);
  // Re-run the limits through reconcile so an undo can never exceed them.
  return reconcile({ ...cart, lines }, catalog, limits);
}

export function setOrderNote(cart, text, limits) {
  return { ...cart, orderNote: normalizeNote(text, limits.noteMaxLength) };
}

/**
 * Strictly parse a cart read back from storage. Returns null for anything
 * that isn't a well-formed cart of the current version. Only known fields
 * are copied, so injected values (e.g. a "price") are discarded.
 * @param {unknown} raw
 * @returns {Cart | null}
 */
export function parseSavedCart(raw) {
  if (!raw || typeof raw !== 'object' || raw.v !== CART_VERSION || !Array.isArray(raw.lines)) return null;
  const lines = [];
  for (const item of raw.lines) {
    if (!item || typeof item !== 'object') return null;
    const { productId, variantId, qty, note } = item;
    if (typeof productId !== 'string' || productId === '') return null;
    if (variantId !== null && typeof variantId !== 'string') return null;
    if (!Number.isInteger(qty)) return null;
    if (typeof note !== 'string') return null;
    lines.push({ productId, variantId, qty, note });
  }
  const orderNote = typeof raw.orderNote === 'string' ? raw.orderNote : '';
  return { v: CART_VERSION, lines, orderNote };
}

/**
 * @typedef {Object} Notice
 * @property {'removed' | 'unavailable' | 'clamped' | 'invalid'} type
 * @property {string} [productId]
 * @property {number} [qty]
 */

/**
 * Re-check a cart against the current menu and limits (UX_ARCHITECTURE §8.3).
 *  • dish or size no longer on the menu → line removed
 *  • dish unavailable or price unconfirmed → kept, flagged by pricing, blocks checkout
 *  • quantity < 1 or not whole → line removed; above a limit → clamped
 *  • duplicate lines → merged; keys and notes rebuilt (never trusted)
 * @param {{ lines: Omit<CartLine, 'key'>[] & Partial<CartLine>[], orderNote?: string }} cart
 * @param {import('../core/catalog.js').Catalog} catalog
 * @param {Limits} limits
 * @returns {{ cart: Cart, notices: Notice[] }}
 */
export function reconcile(cart, catalog, limits) {
  const notices = [];
  const merged = new Map();

  for (const raw of cart.lines) {
    const product = catalog.byId.get(raw.productId);
    const variantId = raw.variantId ?? null;
    const variantOk = product && (Array.isArray(product.variants)
      ? product.variants.some((v) => v.id === variantId)
      : variantId === null);
    if (!product || !variantOk) {
      notices.push({ type: 'removed', productId: raw.productId });
      continue;
    }
    if (!Number.isInteger(raw.qty) || raw.qty < 1) {
      notices.push({ type: 'invalid', productId: raw.productId });
      continue;
    }
    const note = normalizeNote(raw.note, limits.itemNoteMaxLength);
    const key = lineKey(raw.productId, variantId, note);
    const qty = (merged.get(key)?.qty ?? 0) + raw.qty;
    merged.set(key, { key, productId: raw.productId, variantId, qty, note });
  }

  let total = 0;
  const lines = [];
  for (const line of merged.values()) {
    const qty = Math.min(line.qty, limits.maxQtyPerItem, limits.maxItemsPerOrder - total);
    if (qty < line.qty) notices.push({ type: 'clamped', productId: line.productId, qty });
    if (qty < 1) continue;
    total += qty;
    lines.push({ ...line, qty });
  }

  for (const line of lines) {
    if (!checkOrderable(catalog.byId.get(line.productId), line.variantId).ok) {
      notices.push({ type: 'unavailable', productId: line.productId });
    }
  }

  return {
    cart: { v: CART_VERSION, lines, orderNote: normalizeNote(cart.orderNote, limits.noteMaxLength) },
    notices,
  };
}
