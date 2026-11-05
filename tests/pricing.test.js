import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog } from '../js/core/catalog.js';
import { priceCart } from '../js/core/pricing.js';
import { addItem, emptyCart, reconcile } from '../js/cart/cart-model.js';
import * as MENU from '../js/data/menu.js';

const LIMITS = { maxQtyPerItem: 20, maxItemsPerOrder: 100, noteMaxLength: 280, itemNoteMaxLength: 120 };
const { catalog } = buildCatalog(MENU);

test('prices come from the menu: unit × qty, summed in integers', () => {
  let cart = emptyCart();
  cart = addItem(cart, { productId: 'p-salmon-nigiri', qty: 3 }, catalog, LIMITS).cart; // 1490
  cart = addItem(cart, { productId: 'p-salmon-uramaki', variantId: '16' }, catalog, LIMITS).cart; // 4590
  const p = priceCart(cart, catalog);
  assert.deepEqual(p.lines.map((l) => [l.unitPrice, l.lineTotal]), [[1490, 4470], [4590, 4590]]);
  assert.equal(p.subtotal, 9060);
  assert.equal(p.total, 9060);
  assert.equal(p.itemCount, 4);
  assert.equal(p.hasBlocking, false);
});

test('a price edited in the menu applies to an existing cart (nothing cached)', () => {
  const cart = addItem(emptyCart(), { productId: 'p-gyoza', qty: 2 }, catalog, LIMITS).cart;
  const changed = buildCatalog({ ...MENU, PRODUCTS: MENU.PRODUCTS.map((p) => (p.id === 'p-gyoza' ? { ...p, price: 2000 } : p)) }).catalog;
  assert.equal(priceCart(cart, changed).subtotal, 4000);
});

test('unavailable and unpriced lines are excluded from totals and block checkout', () => {
  const { cart } = reconcile({ lines: [
    { productId: 'p-white-fish-nigiri', variantId: null, qty: 2, note: '' },
    { productId: 'p-gyoza', variantId: null, qty: 1, note: '' },
  ] }, catalog, LIMITS);
  const p = priceCart(cart, catalog);
  assert.equal(p.subtotal, 1890);
  assert.equal(p.itemCount, 3);
  assert.equal(p.orderableCount, 1);
  assert.equal(p.lines[0].status, 'unavailable');
  assert.equal(p.lines[0].lineTotal, null);
  assert.equal(p.hasBlocking, true);

  const unpriced = buildCatalog({ ...MENU, PRODUCTS: MENU.PRODUCTS.map((x) => (x.id === 'p-gyoza' ? { ...x, price: null } : x)) }).catalog;
  const q = priceCart(cart, unpriced);
  assert.equal(q.lines[1].status, 'unpriced');
  assert.equal(q.subtotal, 0);
});

test('an empty cart totals zero', () => {
  assert.deepEqual(
    (({ subtotal, total, itemCount, hasBlocking }) => ({ subtotal, total, itemCount, hasBlocking }))(priceCart(emptyCart(), catalog)),
    { subtotal: 0, total: 0, itemCount: 0, hasBlocking: false },
  );
});
