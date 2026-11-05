import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog, displayPrice, featuredProducts, pieceRange } from '../js/core/catalog.js';
import * as MENU from '../js/data/menu.js';

const CATEGORIES = [{ id: 'c1', slug: 'c1', name: 'C1' }];
const TAGS = [{ id: 'raw', label: 'Raw', filter: true }];
const base = { categoryId: 'c1', description: 'd', tags: [], image: null, available: true };
const product = (over) => ({ ...base, id: 'p1', slug: 'p1', name: 'P1', price: 100, ...over });

test('the shipped demo menu is valid', () => {
  const { catalog, problems } = buildCatalog(MENU);
  assert.deepEqual(problems, []);
  assert.equal(catalog.products.length, MENU.PRODUCTS.length);
});

test('sample prices only while the menu is flagged as sample content', () => {
  const hasPrices = MENU.PRODUCTS.some((p) => (p.variants ? p.variants.some((v) => v.price !== null) : p.price !== null));
  if (hasPrices) assert.equal(MENU.IS_DEMO_MENU, true, 'demo prices present but IS_DEMO_MENU is false');
});

test('demo menu covers every display state', () => {
  const { catalog } = buildCatalog(MENU);
  assert.ok(catalog.products.some((p) => !p.available && p.image), 'an unavailable dish with an image');
  assert.ok(catalog.products.some((p) => !p.available && !p.image), 'an unavailable dish without an image');
  assert.ok(catalog.products.some((p) => p.variants), 'a dish with sizes');
  assert.ok(catalog.products.some((p) => p.image === null), 'a dish shown as a tile');
  assert.ok(catalog.categories.every((c) => catalog.byCategory.get(c.id).length > 0), 'no empty category');
});

test('invalid products are excluded and reported; valid ones kept', () => {
  const { catalog, problems } = buildCatalog({
    CATEGORIES,
    TAGS,
    PRODUCTS: [
      product(),
      product({ id: 'p2', slug: 'p1' }), // duplicate slug
      product({ id: 'p3', slug: 'p3', categoryId: 'nope' }),
      product({ id: 'p4', slug: 'p4', price: 12.5 }), // float price
      product({ id: 'p5', slug: 'p5', price: undefined }), // missing price
      product({ id: 'p6', slug: 'p6', variants: [] }),
      product({ id: 'p7', slug: 'p7', name: ' ' }),
    ],
  });
  assert.deepEqual(catalog.products.map((p) => p.id), ['p1']);
  assert.equal(problems.length, 6);
});

test('unknown allergens dropped; bad image becomes null; dish kept', () => {
  const { catalog, problems } = buildCatalog({
    CATEGORIES, TAGS, ALLERGENS: [{ id: 'fish', label: 'Fish' }],
    PRODUCTS: [product({ allergens: ['fish', 'nuts'], image: { file: 'Bad Name.png', alt: 'x' } })],
  });
  const p = catalog.byId.get('p1');
  assert.deepEqual(p.allergens, ['fish']);
  assert.equal(p.image, null);
  assert.equal(problems.length, 2);
  assert.deepEqual(catalog.byCategory.get('c1').map((x) => x.id), ['p1']);
});

test('unknown tags are dropped, product kept', () => {
  const { catalog, problems } = buildCatalog({ CATEGORIES, TAGS, PRODUCTS: [product({ tags: ['raw', 'bogus'] })] });
  assert.deepEqual(catalog.byId.get('p1').tags, ['raw']);
  assert.equal(problems.length, 1);
});

test('display price: single, "from" for variants, null when any is unconfirmed', () => {
  assert.deepEqual(displayPrice(product()), { amount: 100, from: false });
  const v = (prices) => product({ variants: prices.map((price, i) => ({ id: `${i}`, label: `${i}`, price })) });
  assert.deepEqual(displayPrice(v([900, 1600])), { amount: 900, from: true });
  assert.deepEqual(displayPrice(v([900, 900])), { amount: 900, from: false });
  assert.deepEqual(displayPrice(v([900, null])), { amount: null, from: false });
  assert.deepEqual(displayPrice(product({ price: null })), { amount: null, from: false });
});

test('piece range and featured selection', () => {
  assert.deepEqual(pieceRange(product({ pieces: 2 })), { min: 2, max: 2 });
  assert.deepEqual(pieceRange(product({ variants: [{ id: 'a', label: 'a', price: 1, pieces: 8 }, { id: 'b', label: 'b', price: 2, pieces: 16 }] })), { min: 8, max: 16 });
  assert.equal(pieceRange(product()), null);
  const { catalog } = buildCatalog({
    CATEGORIES, TAGS,
    PRODUCTS: [product({ featured: true }), product({ id: 'p2', slug: 'p2', featured: true, available: false })],
  });
  assert.deepEqual(featuredProducts(catalog).map((p) => p.id), ['p1']);
});
