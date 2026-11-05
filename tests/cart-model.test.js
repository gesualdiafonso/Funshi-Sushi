import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog } from '../js/core/catalog.js';
import {
  addItem, emptyCart, itemCount, lineKey, normalizeNote, parseQty, parseSavedCart, reconcile, removeLine, restoreLine,
  setOrderNote, setQty,
} from '../js/cart/cart-model.js';
import * as MENU from '../js/data/menu.js';

const LIMITS = { maxQtyPerItem: 20, maxItemsPerOrder: 100, noteMaxLength: 280, itemNoteMaxLength: 120 };
const { catalog } = buildCatalog(MENU);
const add = (cart, request) => addItem(cart, request, catalog, LIMITS);

test('parseQty accepts only whole numbers ≥ 1', () => {
  assert.equal(parseQty(3), 3);
  assert.equal(parseQty('4'), 4);
  for (const bad of [0, -1, 1.5, NaN, Infinity, '', '2abc', null, undefined, '1e3x', true, {}]) {
    assert.equal(parseQty(bad), null, String(bad));
  }
});

test('notes: trimmed, whitespace collapsed, control characters removed, capped', () => {
  assert.equal(normalizeNote('  no \n\t wasabi ', 120), 'no wasabi');
  assert.equal(normalizeNote('a\u0000b', 120), 'a b');
  assert.equal(normalizeNote('x'.repeat(500), 120).length, 120);
});

test('add a simple dish; adding again merges the line', () => {
  let r = add(emptyCart(), { productId: 'p-salmon-nigiri' });
  assert.equal(r.added, 1);
  r = add(r.cart, { productId: 'p-salmon-nigiri', qty: 2 });
  assert.equal(r.cart.lines.length, 1);
  assert.equal(r.cart.lines[0].qty, 3);
});

test('different size or note → separate lines; note match ignores case', () => {
  let { cart } = add(emptyCart(), { productId: 'p-salmon-uramaki', variantId: '8' });
  cart = add(cart, { productId: 'p-salmon-uramaki', variantId: '16' }).cart;
  cart = add(cart, { productId: 'p-salmon-uramaki', variantId: '8', note: 'No sesame' }).cart;
  cart = add(cart, { productId: 'p-salmon-uramaki', variantId: '8', note: '  no SESAME ' }).cart;
  assert.equal(cart.lines.length, 3);
  assert.equal(cart.lines[2].qty, 2);
});

test('refuses what cannot be ordered', () => {
  const cases = [
    [{ productId: 'nope' }, 'unknown-product'],
    [{ productId: 'p-white-fish-nigiri' }, 'unavailable'],
    [{ productId: 'p-salmon-uramaki' }, 'variant-required'],
    [{ productId: 'p-salmon-uramaki', variantId: '99' }, 'unknown-variant'],
    [{ productId: 'p-salmon-nigiri', variantId: '8' }, 'unknown-variant'],
    [{ productId: 'p-salmon-nigiri', qty: 0 }, 'invalid-qty'],
    [{ productId: 'p-salmon-nigiri', qty: -3 }, 'invalid-qty'],
    [{ productId: 'p-salmon-nigiri', qty: 1.5 }, 'invalid-qty'],
  ];
  for (const [request, error] of cases) {
    const r = add(emptyCart(), request);
    assert.equal(r.error, error, JSON.stringify(request));
    assert.equal(r.added, 0);
    assert.equal(r.cart.lines.length, 0);
  }
});

test('refuses dishes whose price is unconfirmed or invalid', () => {
  for (const price of [null, -100, 12.5, Number.MAX_SAFE_INTEGER + 2]) {
    const { catalog: c } = buildCatalog({ ...MENU, PRODUCTS: [{ ...MENU.PRODUCTS[0], price }] });
    const product = c.byId.get('p-salmon-nigiri');
    if (!product) continue; // catalog rejected the invalid price outright — also fine
    assert.equal(addItem(emptyCart(), { productId: product.id }, c, LIMITS).error, 'unpriced', String(price));
  }
});

test('per-dish limit: clamps and reports it', () => {
  let r = add(emptyCart(), { productId: 'p-edamame', qty: 25 });
  assert.equal(r.cart.lines[0].qty, 20);
  assert.equal(r.limited, 'line');
  r = add(r.cart, { productId: 'p-edamame' });
  assert.equal(r.error, 'line-limit');
});

test('per-order limit across lines', () => {
  let cart = emptyCart();
  const ids = ['p-salmon-nigiri', 'p-tuna-nigiri', 'p-shrimp-nigiri', 'p-eel-nigiri', 'p-edamame'];
  for (const productId of ids) cart = add(cart, { productId, qty: 20 }).cart;
  assert.equal(itemCount(cart), 100);
  const r = add(cart, { productId: 'p-gyoza' });
  assert.equal(r.error, 'order-limit');
  const lowered = setQty(cart, cart.lines[0].key, 19, LIMITS).cart;
  const r2 = add(lowered, { productId: 'p-gyoza', qty: 5 });
  assert.equal(r2.added, 1);
  assert.equal(r2.limited, 'order');
});

test('setQty: clamps, 0 removes, rejects junk', () => {
  const { cart } = add(emptyCart(), { productId: 'p-gyoza', qty: 2 });
  const key = cart.lines[0].key;
  assert.equal(setQty(cart, key, 50, LIMITS).qty, 20);
  assert.equal(setQty(cart, key, 0, LIMITS).cart.lines.length, 0);
  for (const bad of [-1, 2.5, 'abc', null]) {
    const r = setQty(cart, key, bad, LIMITS);
    assert.equal(r.error, 'invalid-qty', String(bad));
    assert.equal(r.cart.lines[0].qty, 2);
  }
  assert.equal(setQty(cart, 'missing', 3, LIMITS).error, 'unknown-line');
});

test('remove and undo restore the same position', () => {
  let cart = emptyCart();
  for (const productId of ['p-salmon-nigiri', 'p-gyoza', 'p-edamame']) cart = add(cart, { productId }).cart;
  const { cart: without, removed } = removeLine(cart, cart.lines[1].key);
  assert.deepEqual(without.lines.map((l) => l.productId), ['p-salmon-nigiri', 'p-edamame']);
  const back = restoreLine(without, removed, catalog, LIMITS).cart;
  assert.deepEqual(back.lines.map((l) => l.productId), ['p-salmon-nigiri', 'p-gyoza', 'p-edamame']);
});

test('order note is normalized and capped', () => {
  assert.equal(setOrderNote(emptyCart(), ` ring \n twice ${'x'.repeat(400)}`, LIMITS).orderNote.length, 280);
});

// ---- Browser-stored values are never trusted -------------------------------
test('parseSavedCart rejects malformed data and drops unknown fields', () => {
  for (const bad of [null, 'x', 42, [], {}, { v: 2, lines: [] }, { v: 1, lines: 'no' },
    { v: 1, lines: [{ productId: 'p', variantId: null, qty: '2', note: '' }] },
    { v: 1, lines: [{ productId: 'p', variantId: 3, qty: 2, note: '' }] },
    { v: 1, lines: [null] }]) {
    assert.equal(parseSavedCart(bad), null, JSON.stringify(bad));
  }
  const parsed = parseSavedCart({
    v: 1, orderNote: 'hi', evil: true,
    lines: [{ productId: 'p-gyoza', variantId: null, qty: 2, note: '', price: 1, lineTotal: 1, key: 'forged' }],
  });
  assert.deepEqual(parsed, { v: 1, orderNote: 'hi', lines: [{ productId: 'p-gyoza', variantId: null, qty: 2, note: '' }] });
});

test('reconcile: removes unknown dishes/sizes, drops bad quantities, clamps, merges, flags unavailable', () => {
  const { cart, notices } = reconcile({
    lines: [
      { productId: 'p-deleted', variantId: null, qty: 1, note: '' },
      { productId: 'p-salmon-uramaki', variantId: '32', qty: 1, note: '' },
      { productId: 'p-gyoza', variantId: null, qty: 0, note: '' },
      { productId: 'p-edamame', variantId: null, qty: 999, note: '' },
      { productId: 'p-miso-soup', variantId: null, qty: 2, note: 'Hot' },
      { productId: 'p-miso-soup', variantId: null, qty: 3, note: 'hot ' },
      { productId: 'p-white-fish-nigiri', variantId: null, qty: 1, note: '' },
    ],
    orderNote: '',
  }, catalog, LIMITS);
  assert.deepEqual(cart.lines.map((l) => [l.productId, l.qty]), [['p-edamame', 20], ['p-miso-soup', 5], ['p-white-fish-nigiri', 1]]);
  assert.deepEqual(notices.map((n) => n.type).sort(), ['clamped', 'invalid', 'removed', 'removed', 'unavailable']);
  assert.equal(cart.lines[1].key, lineKey('p-miso-soup', null, 'hot'));
});
