/**
 * Shared startup for every page (TECHNICAL_ARCHITECTURE §5.3).
 * Page entry modules call `startPage()` with their own page-specific setup.
 *
 * Every page gets: config check, menu catalog, header, business info,
 * opening hours, and the cart (store, count, drawer, quick add).
 */

import { CONFIG } from './config.js';
import { buildCatalog } from './core/catalog.js';
import { deriveFeatures } from './core/features.js';
import * as MENU from './data/menu.js';
import { t } from './strings.js';
import { createCartStore } from './cart/cart-store.js';
import { initQuickAdd } from './ui/add-to-cart.js';
import { initBusinessInfo } from './ui/business-info.js';
import { initCartDrawer } from './ui/cart-drawer.js';
import { initCartIndicators } from './ui/cart-indicators.js';
import { noticeMessages } from './ui/cart-messages.js';
import { showToast } from './ui/toast.js';
import { initFocusClear } from './ui/focus-clear.js';
import { initHeader } from './ui/header.js';
import { initHoursView } from './ui/hours-view.js';
import { installListeners } from './ui/overlay.js';

/**
 * @typedef {Object} AppContext
 * @property {typeof CONFIG} config
 * @property {import('./core/features.js').Features} features
 * @property {import('./core/catalog.js').Catalog} catalog
 * @property {boolean} isDemoMenu
 * @property {ReturnType<typeof createCartStore>} store
 * @property {{ open: (trigger?: HTMLElement | null) => void } | null} drawer  null on pages without one
 */

/** @returns {AppContext} */
function initApp() {
  const features = deriveFeatures(CONFIG);
  if (features.missing.length > 0) {
    console.warn(
      `[config] Not configured yet — dependent features are off: ${features.missing.join(', ')}`,
    );
  }

  const { catalog, problems } = buildCatalog(MENU);
  if (problems.length > 0) {
    console.warn(`[menu] ${problems.length} problem(s) in js/data/menu.js:\n  ${problems.join('\n  ')}`);
  }

  installListeners();
  initFocusClear();
  initHeader();
  initBusinessInfo(CONFIG, features);
  initHoursView(CONFIG, features);
  initPreviewNotice(features, MENU.IS_DEMO_MENU);

  // Cart: prices always come from `catalog`, never from storage.
  const store = createCartStore(catalog, CONFIG.limits);
  const notices = store.load();
  const drawer = initCartDrawer({ store, config: CONFIG });
  initCartIndicators({ store, config: CONFIG, drawer });
  initQuickAdd({ store, catalog, config: CONFIG });
  for (const message of noticeMessages(notices, catalog)) showToast({ message, timeout: 10000 });

  return { config: CONFIG, features, catalog, isDemoMenu: MENU.IS_DEMO_MENU, store, drawer };
}

/**
 * Run the shared startup, then the page's own setup.
 * Any failure leaves the static page usable and shows a notice (UX E1).
 * @param {(context: AppContext) => void} [setupPage]
 */
export function startPage(setupPage) {
  try {
    const context = initApp();
    setupPage?.(context);
    document.documentElement.dataset.app = 'ready';
  } catch (error) {
    console.error('[app] Startup failed', error);
    // Ends the loading state (skeletons) even though startup failed.
    document.documentElement.dataset.app = 'error';
    showStartupError();
  }
}

/** The preview banner stays until the menu is real and every business fact is filled in. */
function initPreviewNotice(features, isDemoMenu) {
  const banner = document.querySelector('[data-preview-notice]');
  if (banner instanceof HTMLElement) banner.hidden = !isDemoMenu && features.missing.length === 0;
}

function showStartupError() {
  const banner = document.querySelector('[data-app-error]');
  if (!(banner instanceof HTMLElement)) return;
  const text = banner.querySelector('[data-field="message"]');
  if (text) text.textContent = t('app.startFailed');
  banner.hidden = false;
}
