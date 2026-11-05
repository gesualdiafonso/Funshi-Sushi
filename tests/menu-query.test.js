import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog } from '../js/core/catalog.js';
import {
  buildSearchIndex, isFiltered, menuUrlSearch, normalize, parseMenuUrl, queryMenu, searchTerms, EMPTY_STATE,
} from '../js/core/menu-query.js';
import * as MENU from '../js/data/menu.js';

const { catalog } = buildCatalog(MENU);
const index = buildSearchIndex(catalog);
const run = (state) => queryMenu(catalog, index, { ...EMPTY_STATE, ...state });
const ids = (result) => result.sections.flatMap((s) => s.products.map((p) => p.slug));

test('normalize: case, accents, whitespace', () => {
  assert.equal(normalize('  Salmão   GRELHADO '), 'salmao grelhado');
  assert.equal(normalize('Piña'), 'pina');
  assert.deepEqual(searchTerms('a  roll  é'), ['roll']); // 1-letter words ignored
});

test('no filters: every dish, all categories in menu order', () => {
  const r = run({});
  assert.equal(r.count, MENU.PRODUCTS.length);
  assert.equal(r.total, MENU.PRODUCTS.length);
  assert.deepEqual(r.sections.map((s) => s.category.slug), MENU.CATEGORIES.map((c) => c.slug));
});

test('unavailable dishes stay listed, at the end of their category', () => {
  const nigiri = run({ category: 'nigiri' }).sections[0].products;
  assert.equal(nigiri.at(-1).slug, 'white-fish-nigiri');
  assert.equal(nigiri.at(-1).available, false);
  assert.ok(nigiri.slice(0, -1).every((p) => p.available));
});

test('category filter shows one category only', () => {
  const r = run({ category: 'sides' });
  assert.deepEqual(r.sections.map((s) => s.category.slug), ['sides']);
  assert.equal(r.count, 4);
});

test('search matches name, ingredients and category; ignores case and accents', () => {
  assert.ok(ids(run({ query: 'GYOZA' })).includes('gyoza'));
  assert.ok(ids(run({ query: 'cucumber' })).includes('california-uramaki')); // ingredient
  assert.equal(run({ query: 'sashimi' }).count, 3); // category name
  assert.deepEqual(ids(run({ query: 'edamamé' })), ['edamame']);
});

test('search: every word must match (AND)', () => {
  const r = ids(run({ query: 'salmon cheese' }));
  assert.ok(r.includes('salmon-uramaki'));
  assert.ok(r.includes('hot-salmon-roll'));
  assert.ok(!r.includes('salmon-nigiri'));
});

test('tags combine with AND, and with search and category', () => {
  assert.deepEqual(ids(run({ tags: ['vegan', 'spicy'] })), ['wakame-salad']);
  assert.ok(ids(run({ tags: ['cooked'] })).every((slug) => catalog.bySlug.get(slug).tags.includes('cooked')));
  assert.deepEqual(ids(run({ category: 'uramaki', tags: ['vegetarian'] })), ['vegetable-uramaki']);
  assert.equal(run({ category: 'drinks', query: 'salmon' }).count, 0);
});

test('isFiltered', () => {
  assert.equal(isFiltered(EMPTY_STATE), false);
  assert.equal(isFiltered({ ...EMPTY_STATE, query: 'a' }), false); // too short to search
  assert.equal(isFiltered({ ...EMPTY_STATE, query: 'tuna' }), true);
  assert.equal(isFiltered({ ...EMPTY_STATE, tags: ['raw'] }), true);
});

test('URL: parse validates everything, ignores unknown values', () => {
  const s = parseMenuUrl('?category=nope&tags=raw,bogus,raw&q=tuna&dish=x', catalog);
  assert.deepEqual(s, { category: null, tags: ['raw'], query: 'tuna', dish: 'x' });
  assert.equal(parseMenuUrl('?category=sides', catalog).category, 'sides');
  assert.equal(parseMenuUrl(`?q=${'x'.repeat(500)}`, catalog).query.length, 80);
});

test('URL: round trip, and empty state gives an empty query string', () => {
  const state = { category: 'uramaki', tags: ['vegetarian', 'spicy'], query: 'avocado roll' };
  const search = menuUrlSearch(state);
  const back = parseMenuUrl(search, catalog);
  assert.deepEqual({ category: back.category, tags: back.tags, query: back.query }, state);
  assert.equal(menuUrlSearch(EMPTY_STATE), '');
  assert.equal(menuUrlSearch(EMPTY_STATE, { dish: 'gyoza' }), '?dish=gyoza');
});
