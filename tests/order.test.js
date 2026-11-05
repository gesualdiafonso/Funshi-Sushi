import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog } from '../js/core/catalog.js';
import { orderTotals, priceCart } from '../js/core/pricing.js';
import { addItem, emptyCart, reconcile } from '../js/cart/cart-model.js';
import { buildOrder, orderReference } from '../js/checkout/order.js';
import { parseCustomer } from '../js/checkout/customer.js';
import * as MENU from '../js/data/menu.js';

const LIMITS = { maxQtyPerItem: 20, maxItemsPerOrder: 100, noteMaxLength: 280, itemNoteMaxLength: 120 };
const { catalog } = buildCatalog(MENU);
let cart = emptyCart();
cart = addItem(cart, { productId: 'p-salmon-uramaki', variantId: '16', qty: 2, note: 'no sesame' }, catalog, LIMITS).cart; // 9180
cart = addItem(cart, { productId: 'p-gyoza' }, catalog, LIMITS).cart; // 1890
const priced = priceCart(cart, catalog);
const F = (delivery = {}, pickup = {}) => ({
  delivery: { enabled: true, minOrder: null, fee: null, zones: null, ...delivery },
  pickup: { enabled: true, minOrder: null, ...pickup },
});

test('totals: pickup has no delivery fee', () => {
  const t = orderTotals(priced, { mode: 'pickup' }, F({ fee: 500 }));
  assert.deepEqual([t.subtotal, t.deliveryFee, t.feePending, t.total], [11070, null, false, 11070]);
});

test('totals: flat delivery fee; unknown fee is pending, never invented', () => {
  assert.equal(orderTotals(priced, { mode: 'delivery' }, F({ fee: 500 })).total, 11570);
  const pending = orderTotals(priced, { mode: 'delivery' }, F({ fee: null }));
  assert.deepEqual([pending.deliveryFee, pending.feePending, pending.total], [null, true, 11070]);
});

test('totals: fee by zone, and free above a threshold', () => {
  const zones = [{ id: 'n', label: 'North', fee: 300 }, { id: 's', label: 'South', fee: 900 }];
  assert.equal(orderTotals(priced, { mode: 'delivery', zoneId: 's' }, F({ zones })).deliveryFee, 900);
  assert.equal(orderTotals(priced, { mode: 'delivery', zoneId: null }, F({ zones })).feePending, true);
  assert.equal(orderTotals(priced, { mode: 'delivery' }, F({ fee: 500, freeAbove: 10000 })).deliveryFee, 0);
});

test('totals: minimum order per mode', () => {
  const t = orderTotals(priced, { mode: 'delivery' }, F({ fee: 0, minOrder: 15000 }));
  assert.deepEqual([t.minOrder, t.shortBy], [15000, 3930]);
  assert.equal(orderTotals(priced, { mode: 'pickup' }, F({ minOrder: 15000 })).shortBy, 0);
});

test('order reference: FS-YYMMDD-XXXX in the restaurant time zone, unambiguous letters', () => {
  const ref = orderReference(new Date('2026-11-06T02:30:00Z'), 'America/Sao_Paulo', (a) => a.fill(7));
  assert.equal(ref, 'FS-261105-9999'); // 23:30 on the 5th in São Paulo
  const random = orderReference(new Date(), null, (a) => crypto.getRandomValues(a));
  assert.match(random, /^FS-\d{6}-[2-9A-HJKMNP-TV-Z]{4}$/);
});

test('buildOrder: items and totals from the priced cart; address only for delivery', () => {
  const totals = orderTotals(priced, { mode: 'delivery' }, F({ fee: 500 }));
  const clean = { fulfilment: 'delivery', name: 'Ana', phone: '+5511999999999', street: 'Rua 1', apartment: '', area: 'n', reference: '', payment: 'cash', changeFor: 20000 };
  const order = buildOrder({ clean, priced, totals, orderNote: 'Ring twice', ref: 'FS-1', zones: [{ id: 'n', label: 'North' }], payments: [{ id: 'cash', label: 'Cash' }] });
  assert.deepEqual(order.items[0], { qty: 2, name: 'Salmon uramaki', variant: '16 pcs', note: 'no sesame', lineTotal: 9180 });
  assert.equal(order.address.area, 'North');
  assert.deepEqual(order.payment, { label: 'Cash', changeFor: 20000 });
  const pickup = buildOrder({ clean: { ...clean, fulfilment: 'pickup' }, priced, totals, orderNote: '', ref: 'FS-1', zones: null, payments: null });
  assert.equal(pickup.address, null);
  assert.equal(pickup.payment, null);
});

test('buildOrder refuses carts with lines that cannot be ordered', () => {
  const blocked = priceCart(reconcile({ lines: [{ productId: 'p-white-fish-nigiri', variantId: null, qty: 1, note: '' }] }, catalog, LIMITS).cart, catalog);
  assert.throws(() => buildOrder({ clean: {}, priced: blocked, totals: {}, orderNote: '', ref: '', zones: null, payments: null }));
});

test('saved customer details: strict parse, capped, unknown fields dropped', () => {
  assert.equal(parseCustomer({ v: 2 }), null);
  const c = parseCustomer({ v: 1, name: 'Ana', phone: 5, street: 'x'.repeat(500), evil: '<script>' });
  assert.deepEqual(Object.keys(c).sort(), ['apartment', 'area', 'name', 'phone', 'reference', 'street', 'v']);
  assert.equal(c.phone, '');
  assert.equal(c.street.length, 100);
});
