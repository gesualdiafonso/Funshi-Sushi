/** Store + storage, with a fake localStorage (Node has none). */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

class FakeStorage {
  constructor() { this.map = new Map(); this.blocked = false; }
  getItem(k) { if (this.blocked) throw new Error('blocked'); return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { if (this.blocked) throw new Error('blocked'); this.map.set(k, String(v)); }
  removeItem(k) { if (this.blocked) throw new Error('blocked'); this.map.delete(k); }
}
const storage = new FakeStorage();
globalThis.window = { localStorage: storage, addEventListener() {} };

const { buildCatalog } = await import('../js/core/catalog.js');
const { createCartStore, STORAGE_KEY } = await import('../js/cart/cart-store.js');
const MENU = await import('../js/data/menu.js');
const LIMITS = { maxQtyPerItem: 20, maxItemsPerOrder: 100, noteMaxLength: 280, itemNoteMaxLength: 120 };
const { catalog } = buildCatalog(MENU);
const fresh = () => { const s = createCartStore(catalog, LIMITS); return { s, notices: s.load() }; };

beforeEach(() => storage.map.clear());

test('persists after each change and restores on the next page load', () => {
  const { s } = fresh();
  s.add({ productId: 'p-gyoza', qty: 2 });
  s.setOrderNote('Ring twice');
  const saved = JSON.parse(storage.map.get(STORAGE_KEY));
  assert.deepEqual(Object.keys(saved.lines[0]).sort(), ['key', 'note', 'productId', 'qty', 'variantId']); // no prices saved
  const { s: next } = fresh();
  assert.equal(next.getView().itemCount, 2);
  assert.equal(next.getView().orderNote, 'Ring twice');
  assert.equal(next.getView().subtotal, 3780);
});

test('tampered storage: injected prices are ignored, quantities clamped, fake dishes removed', () => {
  storage.map.set(STORAGE_KEY, JSON.stringify({ v: 1, orderNote: '', lines: [
    { productId: 'p-gyoza', variantId: null, qty: 5000, note: '', price: 1, lineTotal: 1, unitPrice: 0 },
    { productId: 'p-free-sushi', variantId: null, qty: 1, note: '', price: 0 },
  ] }));
  const { s, notices } = fresh();
  const v = s.getView();
  assert.equal(v.lines.length, 1);
  assert.equal(v.lines[0].unitPrice, 1890); // from the menu, not from storage
  assert.equal(v.lines[0].line.qty, 20);
  assert.equal(v.subtotal, 1890 * 20);
  assert.deepEqual(notices.map((n) => n.type).sort(), ['clamped', 'removed']);
  // Cleaned version saved: notices don't repeat on the next page.
  assert.deepEqual(fresh().notices, []);
});

test('corrupted storage resets the cart with a notice', () => {
  storage.map.set(STORAGE_KEY, '{not json');
  assert.deepEqual(fresh().notices, []); // unreadable JSON → treated as no cart
  storage.map.set(STORAGE_KEY, JSON.stringify({ v: 1, lines: [{ productId: 7 }] }));
  const { s, notices } = fresh();
  assert.deepEqual(notices, [{ type: 'reset' }]);
  assert.equal(s.getView().itemCount, 0);
});

test('emptying the cart removes the stored entry', () => {
  const { s } = fresh();
  s.add({ productId: 'p-gyoza' });
  s.clear();
  assert.equal(storage.map.has(STORAGE_KEY), false);
});

test('subscribers get one notification per change, with its type', () => {
  const { s } = fresh();
  const changes = [];
  s.subscribe((view, change) => changes.push([change.type, view.itemCount]));
  s.add({ productId: 'p-gyoza' });
  const key = s.getView().lines[0].line.key;
  s.setQty(key, 3);
  const removed = s.remove(key);
  s.restore(removed);
  s.add({ productId: 'p-white-fish-nigiri' }); // refused: no notification
  s.clear();
  assert.deepEqual(changes, [['add', 1], ['qty', 3], ['remove', 0], ['restore', 3], ['clear', 0]]);
});

test('blocked storage: cart works in memory and reports it is not persistent', async () => {
  storage.blocked = true;
  const mod = await import(`../js/services/storage.js?blocked=${Date.now()}`); // fresh availability cache
  assert.equal(mod.isAvailable(), false);
  assert.equal(mod.readJSON('x'), null);
  assert.equal(mod.writeJSON('x', 1), false);
  storage.blocked = false;
});
