/**
 * Menu filters: category, labels and search (UX_ARCHITECTURE §6.3).
 * State lives in the URL (?category=…&tags=…&q=…) so a filtered menu can be
 * shared and survives a reload. Filtering only shows/hides rendered items.
 */

import {
  buildSearchIndex, EMPTY_STATE, isFiltered, menuUrlSearch, parseMenuUrl, queryMenu, searchTerms,
} from '../core/menu-query.js';
import { t } from '../strings.js';
import { announce } from './announcer.js';
import { delegate, icon, on, qs } from './dom.js';

const SEARCH_DEBOUNCE_MS = 150;

/**
 * @param {import('../core/catalog.js').Catalog} catalog
 * @param {ReturnType<typeof import('./menu-view.js').renderMenu>} view
 * @param {HTMLElement} root  the menu page section
 */
export function initMenuFilters(catalog, view, root) {
  const index = buildSearchIndex(catalog);
  const el = {
    categories: qs('[data-category-filter]', root),
    tags: qs('[data-tag-filter]', root),
    search: /** @type {HTMLInputElement} */ (qs('[data-menu-search]', root)),
    status: qs('[data-menu-status]', root),
    results: qs('[data-menu]', root),
    empty: qs('[data-menu-empty]', root),
    emptyText: qs('[data-menu-empty-text]', root),
    searchAll: qs('[data-menu-search-all]', root),
  };

  const initial = parseMenuUrl(location.search, catalog);
  /** @type {import('../core/menu-query.js').MenuState} */
  let state = { category: initial.category, tags: initial.tags, query: initial.query };

  orderItemsOnce();
  buildCategoryButtons();
  buildTagButtons();
  el.search.value = state.query;
  apply({ updateUrl: false });

  // ---- Controls -------------------------------------------------------
  delegate(el.categories, 'click', '[data-category]', (event, button) => {
    const category = button.dataset.category || null;
    if (category === state.category) return;
    update({ category });
    bringResultsIntoView();
  });

  delegate(el.tags, 'click', '[data-tag]', (event, button) => {
    const tag = button.dataset.tag;
    const tags = state.tags.includes(tag) ? state.tags.filter((id) => id !== tag) : [...state.tags, tag];
    update({ tags });
  });

  let searchTimer = 0;
  on(el.search, 'input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => update({ query: el.search.value }), SEARCH_DEBOUNCE_MS);
  });

  delegate(root, 'click', '[data-menu-clear]', () => {
    el.search.value = '';
    update({ ...EMPTY_STATE });
    el.search.focus();
  });

  delegate(root, 'click', '[data-menu-search-all]', () => update({ category: null }));

  // ---- Rendering --------------------------------------------------------
  function update(changes) {
    state = { ...state, ...changes };
    apply({ announceResult: true });
  }

  function apply({ announceResult = false, updateUrl = true } = {}) {
    const result = queryMenu(catalog, index, state);
    const visible = new Set(result.sections.flatMap((section) => section.products.map((p) => p.id)));
    const visibleSections = new Set(result.sections.map((section) => section.category.id));

    for (const [id, item] of view.items) item.hidden = !visible.has(id);
    for (const [id, section] of view.sections) section.hidden = !visibleSections.has(id);

    for (const button of el.categories.querySelectorAll('[data-category]')) {
      const pressed = (button.dataset.category || null) === state.category;
      button.setAttribute('aria-pressed', String(pressed));
      if (pressed) revealChip(button, { smooth: updateUrl });
    }
    for (const button of el.tags.querySelectorAll('[data-tag]')) {
      button.setAttribute('aria-pressed', String(state.tags.includes(button.dataset.tag)));
    }

    const description = describe(result.count);
    el.status.textContent = description;
    el.results.hidden = result.count === 0;
    el.empty.hidden = result.count > 0;
    if (result.count === 0) {
      el.emptyText.textContent = t('menu.emptyText', { filters: filterPhrase() });
      el.searchAll.hidden = !(state.category && (state.tags.length > 0 || searchTerms(state.query).length > 0));
    }

    if (updateUrl) {
      history.replaceState(history.state, '', `${location.pathname}${menuUrlSearch(state)}${location.hash}`);
    }
    if (announceResult) announce(result.count === 0 ? el.emptyText.textContent : description);
  }

  /** "12 dishes", "4 dishes matching “salmon” in Uramaki · Vegetarian" */
  function describe(count) {
    const text = t('menu.count', { count });
    return isFiltered(state) ? `${text} ${filterPhrase()}` : text;
  }

  function filterPhrase() {
    const parts = [];
    const query = state.query.trim();
    if (searchTerms(query).length > 0) parts.push(t('menu.matching', { query }));
    if (state.category) {
      const name = catalog.categories.find((category) => category.slug === state.category)?.name;
      parts.push(t('menu.inCategory', { category: name }));
    }
    if (state.tags.length > 0) {
      const labels = state.tags.map((id) => catalog.tagById.get(id)?.label).join(', ');
      parts.push(t('menu.withTags', { tags: labels }));
    }
    return parts.join(' ');
  }

  // ---- Setup helpers ------------------------------------------------------
  /** Unavailable dishes go last in their category — a fixed order, set once. */
  function orderItemsOnce() {
    for (const { category, products } of queryMenu(catalog, index, EMPTY_STATE).sections) {
      const list = view.lists.get(category.id);
      for (const product of products) list.append(view.items.get(product.id));
    }
  }

  function buildCategoryButtons() {
    const all = [{ slug: '', name: t('menu.all') }, ...catalog.categories.filter((c) => view.sections.has(c.id))];
    el.categories.replaceChildren(...all.map(({ slug, name }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip menu-categories__item';
      button.dataset.category = slug;
      button.textContent = name;
      return button;
    }));
  }

  function buildTagButtons() {
    el.tags.replaceChildren(...catalog.tags.filter((tag) => tag.filter).map((tag) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      button.dataset.tag = tag.id;
      button.append(icon('check', { size: 'sm', className: 'chip__check' }), tag.label);
      return button;
    }));
  }

  /**
   * On phones the chips scroll sideways: keep the selected one fully in view
   * (e.g. after following a link to ?category=drinks). Scrolls the row only,
   * never the page.
   */
  function revealChip(chip, { smooth }) {
    const row = el.categories;
    if (row.scrollWidth <= row.clientWidth) return;
    const rowBox = row.getBoundingClientRect();
    const box = chip.getBoundingClientRect();
    const pad = 24; // clear of the faded trailing edge
    let left = row.scrollLeft;
    if (box.left < rowBox.left) left -= rowBox.left - box.left + pad;
    else if (box.right > rowBox.right - pad) left += box.right - rowBox.right + pad * 2;
    else return;
    const motion = smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollTo({ left, behavior: motion ? 'smooth' : 'instant' });
  }

  /** After switching category the list shrinks; keep its start in view. */
  function bringResultsIntoView() {
    const top = el.status.getBoundingClientRect().top;
    // Jump, don't glide: the content under the viewport was just replaced.
    if (top < 0) el.status.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}
