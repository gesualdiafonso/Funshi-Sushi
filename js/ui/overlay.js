/**
 * Overlay controller — one behavior for every overlay (dialogs, drawers,
 * sheets, the mobile navigation panel). UX_ARCHITECTURE §12.3–12.4,
 * TECHNICAL_ARCHITECTURE §8.3.
 *
 *  • <dialog> elements open with showModal(): the browser provides focus
 *    containment, Esc and the top layer. Other elements (the nav panel) get
 *    `data-open`, and everything marked [data-inert-on-overlay] becomes inert.
 *  • One overlay at a time: opening one closes the other.
 *  • Back button closes the overlay instead of leaving the page.
 *  • Focus returns to the element that opened it.
 *  • Page scroll is locked while an overlay is open.
 *
 * Declarative use (no extra JS per trigger):
 *   <button data-overlay-target="#filters" aria-controls="filters">Filters</button>
 *   <button data-overlay-close>Close</button>   (inside the overlay)
 */

import { delegate, on, qsa } from './dom.js';

/**
 * @typedef {Object} OverlayOptions
 * @property {string} [id]              History state id (defaults to the element id)
 * @property {string} [url]             URL to show while open (e.g. '?dish=salmon')
 * @property {string} [closeUrl]        URL to restore on close when opened from a deep link
 * @property {boolean} [fromDeepLink]   The page loaded with this overlay's URL: don't push history
 * @property {HTMLElement | null} [returnFocus]  Focus target after closing
 * @property {HTMLElement | null} [initialFocus] Focus target after opening
 * @property {() => void} [onClose]
 */

/** @type {null | (OverlayOptions & { el: HTMLElement, id: string, isDialog: boolean, pushed: boolean })} */
let current = null;
let ignoreNextPop = false;
/** @type {null | (() => void)} run once the history entry has been consumed */
let afterPop = null;
let installed = false;

/** @returns {HTMLElement | null} the open overlay element, if any */
export function getOpenOverlay() {
  return current?.el ?? null;
}

/**
 * @param {HTMLElement} el
 * @param {OverlayOptions} [options]
 */
export function openOverlay(el, options = {}) {
  installListeners();
  if (current?.el === el) return;

  const id = options.id ?? el.id;
  if (!id) throw new Error('openOverlay: the overlay needs an id or options.id');

  // Switching overlays reuses the existing history entry instead of stacking.
  let reuseEntry = false;
  if (current) {
    reuseEntry = current.pushed;
    closeOverlay(current.el, { keepHistory: true });
  }

  const isDialog = el instanceof HTMLDialogElement;
  let pushed = false;
  if (!options.fromDeepLink) {
    const state = { ...(history.state ?? {}), overlay: id };
    const url = options.url ?? location.href;
    if (reuseEntry) history.replaceState(state, '', url);
    else history.pushState(state, '', url);
    pushed = true;
  }

  current = { ...options, el, id, isDialog, pushed };

  if (isDialog) {
    el.showModal();
  } else {
    el.dataset.open = '';
    for (const region of qsa('[data-inert-on-overlay]')) region.inert = true;
  }
  document.documentElement.style.overflow = 'hidden';

  const focusTarget = options.initialFocus ?? (isDialog ? null : el.querySelector('a, button, input'));
  focusTarget?.focus();

  el.dispatchEvent(new CustomEvent('overlay:open', { bubbles: true }));
}

/**
 * @param {HTMLElement} el
 * @param {{ fromHistory?: boolean, keepHistory?: boolean, afterClose?: () => void, restoreFocus?: boolean }} [flags]
 *   fromHistory  — closing because the user went back (don't touch history)
 *   keepHistory  — closing because another overlay is opening (reuse the entry)
 *   afterClose   — run after history has settled (e.g. navigate to a link's href);
 *                  avoids racing history.back() against a new navigation
 *   restoreFocus — return focus to the opener (default true)
 */
export function closeOverlay(el, { fromHistory = false, keepHistory = false, afterClose, restoreFocus = true } = {}) {
  if (!current || current.el !== el) return;
  const closing = current;
  current = null; // cleared first: dialog.close() fires 'close', which re-enters here

  if (closing.isDialog) {
    if (/** @type {HTMLDialogElement} */ (el).open) /** @type {HTMLDialogElement} */ (el).close();
  } else {
    delete el.dataset.open;
    for (const region of qsa('[data-inert-on-overlay]')) region.inert = false;
  }
  document.documentElement.style.overflow = '';

  let deferred = false;
  if (!fromHistory && !keepHistory) {
    if (closing.pushed && history.state?.overlay === closing.id) {
      ignoreNextPop = true;
      afterPop = afterClose ?? null;
      deferred = Boolean(afterClose);
      history.back();
    } else if (closing.fromDeepLink && closing.closeUrl) {
      const { overlay, ...rest } = history.state ?? {};
      history.replaceState(rest, '', closing.closeUrl);
    }
  }
  if (afterClose && !deferred) afterClose();

  if (!keepHistory && restoreFocus) {
    const target = closing.returnFocus?.isConnected ? closing.returnFocus : document.getElementById('main');
    target?.focus({ preventScroll: Boolean(closing.returnFocus?.isConnected) });
  }

  closing.onClose?.();
  el.dispatchEvent(new CustomEvent('overlay:close', { bubbles: true }));
}

/** Global listeners, installed once on first use (or by app.js at startup). */
export function installListeners() {
  if (installed) return;
  installed = true;

  // Back / forward: close the open overlay if its history entry was left.
  on(window, 'popstate', () => {
    if (ignoreNextPop) {
      ignoreNextPop = false;
      const run = afterPop;
      afterPop = null;
      run?.();
      return;
    }
    if (current && history.state?.overlay !== current.id) {
      closeOverlay(current.el, { fromHistory: true });
    }
  });

  // Esc for non-dialog overlays (dialogs get a native 'cancel' event).
  on(document, 'keydown', (event) => {
    if (event.key === 'Escape' && current && !current.isDialog) {
      event.preventDefault();
      closeOverlay(current.el);
    }
  });

  // Native dialog events, captured for every dialog on the page.
  on(document, 'cancel', (event) => {
    if (current && event.target === current.el) {
      event.preventDefault(); // we close it ourselves, keeping history in sync
      closeOverlay(current.el);
    }
  }, true);

  on(document, 'close', (event) => {
    if (current && event.target === current.el) closeOverlay(current.el);
  }, true);

  // Backdrop click: with showModal, clicks on ::backdrop target the <dialog> itself.
  on(document, 'click', (event) => {
    if (current?.isDialog && event.target === current.el) closeOverlay(current.el);
  });

  // Declarative triggers.
  delegate(document, 'click', '[data-overlay-target]', (event, trigger) => {
    const target = document.querySelector(trigger.dataset.overlayTarget ?? '');
    if (target instanceof HTMLElement) {
      event.preventDefault();
      openOverlay(target, { returnFocus: trigger });
    }
  });

  delegate(document, 'click', '[data-overlay-close]', (event) => {
    if (current) {
      event.preventDefault();
      closeOverlay(current.el);
    }
  });
}
