/**
 * Render the whole menu once (TECHNICAL_ARCHITECTURE §5.2). Filtering later
 * only shows/hides and reorders these elements — nothing is rebuilt, so
 * images are never reloaded.
 */

import { addControl } from './add-to-cart.js';
import { cloneTemplate, setText } from './dom.js';
import { dishImage } from './picture.js';
import { piecesText, setPrice, tagBadges, unavailableBadge } from './product-info.js';

const THUMB_SIZES = '(min-width: 40rem) 7.5rem, 5.5rem';

/**
 * @param {import('../core/catalog.js').Catalog} catalog
 * @param {typeof import('../config.js').CONFIG} config
 * @param {HTMLElement} root
 * @returns {{ sections: Map<string, HTMLElement>, lists: Map<string, HTMLElement>, items: Map<string, HTMLElement> }}
 *   keyed by category id (sections, lists) and product id (items)
 */
export function renderMenu(catalog, config, root) {
  const sections = new Map();
  const lists = new Map();
  const items = new Map();

  for (const category of catalog.categories) {
    const products = catalog.byCategory.get(category.id) ?? [];
    if (products.length === 0) continue;

    const section = cloneTemplate('tpl-menu-section');
    const headingId = `cat-${category.slug}`;
    section.id = category.slug;
    section.setAttribute('aria-labelledby', headingId);
    setText(section, 'name', category.name);
    section.querySelector('[data-field="name"]').id = headingId;
    setText(section, 'intro', category.intro);

    const list = section.querySelector('[data-items]');
    for (const product of products) {
      const item = menuItem(product, catalog, config);
      items.set(product.id, item);
      list.append(item);
    }
    sections.set(category.id, section);
    lists.set(category.id, list);
    root.append(section);
  }
  return { sections, lists, items };
}

function menuItem(product, catalog, config) {
  const item = cloneTemplate('tpl-menu-item');
  item.dataset.dish = product.slug;
  item.toggleAttribute('data-unavailable', !product.available);

  setText(item, 'name', product.name);
  setText(item, 'description', product.description);
  setText(item, 'pieces', piecesText(product));
  setPrice(item.querySelector('[data-field="price"]'), product, config);

  const meta = item.querySelector('[data-meta]');
  if (!product.available) meta.prepend(unavailableBadge());
  meta.append(...tagBadges(product, catalog));

  item.querySelector('[data-media]').append(dishImage(product, { sizes: THUMB_SIZES }));
  item.querySelector('[data-open-dish]').dataset.openDish = product.slug;

  const control = addControl(product);
  const action = item.querySelector('[data-action]');
  if (control) action.append(control);
  else action.remove();
  return item;
}
