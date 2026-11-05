/**
 * Entry module — Menu page (menu.html).
 */

import { startPage } from '../app.js';
import { qs } from '../ui/dom.js';
import { initMenuFilters } from '../ui/menu-filters.js';
import { renderMenu } from '../ui/menu-view.js';
import { initProductDialog } from '../ui/product-dialog.js';

startPage(({ catalog, config, isDemoMenu, store, drawer }) => {
  const root = qs('[data-menu-page]');
  const view = renderMenu(catalog, config, qs('[data-menu]', root));
  qs('[data-sample-menu]', root).hidden = !isDemoMenu;
  // Shown before the filters start, so they can measure the category row.
  qs('[data-menu-ui]', root).hidden = false;
  initMenuFilters(catalog, view, root);

  const { missingDish } = initProductDialog(catalog, config, { isDemo: isDemoMenu, items: view.items, store, drawer });
  qs('[data-dish-missing]', root).hidden = !missingDish;
});
