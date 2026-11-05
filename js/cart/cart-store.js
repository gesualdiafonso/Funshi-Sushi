/**
 * Cart store — the single owner of cart state (TECHNICAL_ARCHITECTURE §6.2).
 * Actions validate through cart-model.js, save to localStorage, then notify
 * subscribers once with the priced view. Other tabs stay in sync.
 */

import { priceCart } from '../core/pricing.js';
import { isAvailable, readJSON, remove, writeJSON } from '../services/storage.js';
import {
  addItem, emptyCart, parseSavedCart, reconcile, removeLine, restoreLine, setOrderNote, setQty,
} from './cart-model.js';

export const STORAGE_KEY = 'funshi.cart.v1';

/**
 * @typedef {'load' | 'add' | 'qty' | 'remove' | 'restore' | 'note' | 'clear' | 'sync'} ChangeType
 * @typedef {{ type: ChangeType, key?: string, added?: number, limited?: string }} Change
 * @typedef {(view: import('../core/pricing.js').PricedCart & { orderNote: string }, change: Change) => void} Listener
 */

/**
 * @param {import('../core/catalog.js').Catalog} catalog
 * @param {import('./cart-model.js').Limits} limits
 */
export function createCartStore(catalog, limits) {
  /** @type {import('./cart-model.js').Cart} */
  let cart = emptyCart();
  /** @type {Set<Listener>} */
  const listeners = new Set();
  let persistent = false;

  const view = () => ({ ...priceCart(cart, catalog), orderNote: cart.orderNote });

  function commit(next, change) {
    cart = next;
    if (cart.lines.length === 0 && cart.orderNote === '') remove(STORAGE_KEY);
    else writeJSON(STORAGE_KEY, cart);
    notify(change);
  }

  function notify(change) {
    const current = view();
    for (const listener of listeners) listener(current, change);
  }

  /** Read the saved cart, re-check it against the current menu. */
  function readSaved() {
    const raw = readJSON(STORAGE_KEY);
    if (raw === null) return { cart: emptyCart(), notices: [] };
    const parsed = parseSavedCart(raw);
    if (!parsed) return { cart: emptyCart(), notices: [{ type: 'reset' }] };
    return reconcile(parsed, catalog, limits);
  }

  return {
    /** Load once at startup. Returns notices to show the customer (removed, unavailable…). */
    load() {
      persistent = isAvailable();
      const { cart: loaded, notices } = readSaved();
      cart = loaded;
      // Save the cleaned version so the same notices don't repeat on every page.
      if (notices.length > 0) commit(cart, { type: 'load' });
      if (persistent) {
        window.addEventListener('storage', (event) => {
          if (event.key !== STORAGE_KEY && event.key !== null) return;
          cart = readSaved().cart;
          notify({ type: 'sync' });
        });
      }
      return notices;
    },

    /** false when the browser won't let us save (private mode, blocked storage). */
    isPersistent: () => persistent,

    getView: view,

    /** @param {Listener} listener  @returns {() => void} unsubscribe */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    add(request) {
      const result = addItem(cart, request, catalog, limits);
      if (result.added > 0) commit(result.cart, { type: 'add', key: result.key, added: result.added, limited: result.limited });
      return result;
    },

    setQty(key, qty) {
      const result = setQty(cart, key, qty, limits);
      if (!result.error) commit(result.cart, { type: result.qty === 0 ? 'remove' : 'qty', key, limited: result.limited });
      return result;
    },

    remove(key) {
      const result = removeLine(cart, key);
      if (result.removed) commit(result.cart, { type: 'remove', key });
      return result.removed;
    },

    restore(removed) {
      commit(restoreLine(cart, removed, catalog, limits).cart, { type: 'restore', key: removed?.line.key });
    },

    setOrderNote(text) {
      const next = setOrderNote(cart, text, limits);
      if (next.orderNote !== cart.orderNote) commit(next, { type: 'note' });
    },

    clear() {
      commit(emptyCart(), { type: 'clear' });
    },
  };
}
