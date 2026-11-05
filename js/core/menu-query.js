/**
 * Menu search, filtering and URL state (UX_ARCHITECTURE §6.3).
 * Pure — no DOM. Tested in tests/menu-query.test.js.
 *
 * Rules
 *  • Category: one at a time, or all. Tags: combined with AND ("cooked" +
 *    "vegetarian" = both). Search: every word must match somewhere in the
 *    dish (name, description, details, ingredients, category, tags),
 *    ignoring case and accents ("salmao" finds "salmão").
 *  • Unavailable dishes stay listed (customers like to know they exist) but
 *    move to the end of their category.
 */

/**
 * @typedef {Object} MenuState
 * @property {string | null} category  Category slug, or null for all
 * @property {string[]} tags           Tag ids, AND-combined
 * @property {string} query            Raw search text as typed
 */

export const EMPTY_STATE = Object.freeze({ category: null, tags: [], query: '' });
const MAX_QUERY_LENGTH = 80;

/** Lowercase, strip accents, collapse whitespace. */
export function normalize(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Search words: normalized, 2+ characters (single letters match too much). */
export function searchTerms(query) {
  return normalize(query).split(' ').filter((term) => term.length >= 2);
}

/**
 * Searchable text per dish, built once.
 * @param {import('./catalog.js').Catalog} catalog
 * @returns {Map<string, string>} product id → normalized text
 */
export function buildSearchIndex(catalog) {
  const index = new Map();
  for (const product of catalog.products) {
    const parts = [
      product.name,
      product.description,
      product.details,
      ...(product.ingredients ?? []),
      catalog.categoryById.get(product.categoryId)?.name,
      ...product.tags.map((id) => catalog.tagById.get(id)?.label),
    ];
    index.set(product.id, normalize(parts.filter(Boolean).join(' ')));
  }
  return index;
}

/** @param {MenuState} state */
export function isFiltered(state) {
  return Boolean(state.category) || state.tags.length > 0 || searchTerms(state.query).length > 0;
}

/**
 * Apply a menu state.
 * @param {import('./catalog.js').Catalog} catalog
 * @param {Map<string, string>} index  from buildSearchIndex
 * @param {MenuState} state
 * @returns {{ sections: { category: import('./catalog.js').Category, products: import('./catalog.js').Product[] }[], count: number, total: number }}
 *   sections: only categories with at least one match, in menu order;
 *   products in each: available first, then unavailable, otherwise data order.
 */
export function queryMenu(catalog, index, state) {
  const terms = searchTerms(state.query);
  const sections = [];
  let count = 0;

  for (const category of catalog.categories) {
    if (state.category && category.slug !== state.category) continue;
    const matches = (catalog.byCategory.get(category.id) ?? []).filter((product) => {
      if (!state.tags.every((tag) => product.tags.includes(tag))) return false;
      const text = index.get(product.id) ?? '';
      return terms.every((term) => text.includes(term));
    });
    if (matches.length === 0) continue;
    const ordered = [...matches.filter((p) => p.available), ...matches.filter((p) => !p.available)];
    sections.push({ category, products: ordered });
    count += ordered.length;
  }

  return { sections, count, total: catalog.products.length };
}

/**
 * Read the menu state (and an optional dish) from a URL query string.
 * Unknown categories and tags are ignored, never trusted.
 * @param {string} search  e.g. location.search
 * @param {import('./catalog.js').Catalog} catalog
 * @returns {MenuState & { dish: string | null }}
 */
export function parseMenuUrl(search, catalog) {
  const params = new URLSearchParams(search);
  const category = params.get('category');
  const validCategory = catalog.categories.some((c) => c.slug === category) ? category : null;
  const filterTags = new Set(catalog.tags.filter((tag) => tag.filter).map((tag) => tag.id));
  const tags = [...new Set((params.get('tags') ?? '').split(',').filter((id) => filterTags.has(id)))];
  return {
    category: validCategory,
    tags,
    query: (params.get('q') ?? '').slice(0, MAX_QUERY_LENGTH),
    dish: params.get('dish') || null,
  };
}

/**
 * Build a URL query string for a state, keeping it short (empty values left out).
 * @param {MenuState} state
 * @param {{ dish?: string | null }} [extra]
 * @returns {string} '' or '?…'
 */
export function menuUrlSearch(state, { dish = null } = {}) {
  const params = new URLSearchParams();
  if (state.category) params.set('category', state.category);
  if (state.tags.length > 0) params.set('tags', state.tags.join(','));
  const query = state.query.trim();
  if (query) params.set('q', query.slice(0, MAX_QUERY_LENGTH));
  if (dish) params.set('dish', dish);
  const text = params.toString();
  return text ? `?${text}` : '';
}
