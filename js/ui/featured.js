/**
 * Featured dishes on the home page, rendered from the menu data.
 * The title opens the dish on the menu page (menu.html?dish=<slug>);
 * "Add" puts a simple dish in the order, "Choose" opens a dish with sizes.
 */

import { featuredProducts } from '../core/catalog.js';
import { addControl } from './add-to-cart.js';
import { cloneTemplate, qs, qsa, setText } from './dom.js';
import { dishImage } from './picture.js';
import { piecesText, setPrice, tagBadges } from './product-info.js';

const MAX_FEATURED = 4;
const CARD_SIZES = '(min-width: 64rem) 18rem, (min-width: 40rem) 42vw, 78vw';

/**
 * @param {import('../core/catalog.js').Catalog} catalog
 * @param {typeof import('../config.js').CONFIG} config
 * @param {{ isDemo: boolean }} options
 */
export function initFeatured(catalog, config, { isDemo }) {
  for (const note of qsa('[data-demo-note]')) note.hidden = !isDemo;

  const list = qs('[data-featured]');
  if (!list) return;
  const products = featuredProducts(catalog, MAX_FEATURED);
  if (products.length === 0) {
    // No empty box (UX_ARCHITECTURE §10): hide the whole section.
    list.closest('section')?.setAttribute('hidden', '');
    return;
  }
  list.replaceChildren(...products.map((product) => card(product, catalog, config)));
}

function card(product, catalog, config) {
  const item = cloneTemplate('tpl-feature-card');
  const article = item.querySelector('article');
  const titleId = `dish-${product.slug}`;

  setText(item, 'name', product.name);
  item.querySelector('.dish-card__title').id = titleId;
  article.setAttribute('aria-labelledby', titleId);
  setText(item, 'description', product.description);
  setText(item, 'pieces', piecesText(product));
  item.querySelector('.dish-card__meta').append(...tagBadges(product, catalog));
  setPrice(item.querySelector('[data-field="price"]'), product, config);

  const category = catalog.categoryById.get(product.categoryId)?.name ?? product.name;
  item.querySelector('[data-media]').append(dishImage(product, { sizes: CARD_SIZES, tileText: category }));

  // The title opens the dish's details on the menu page.
  item.querySelector('[data-field-link="menu"]').href = `menu.html?dish=${encodeURIComponent(product.slug)}`;

  // Add (simple dish) or Choose (sizes → its details on the menu page).
  const control = addControl(product, { linkToMenu: true });
  const action = item.querySelector('[data-action]');
  if (control) action.append(control);
  else action.remove();
  return item;
}
