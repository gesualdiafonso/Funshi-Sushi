/**
 * Toasts — brief messages with an optional action (Undo, View cart).
 * Rendered inside the open modal dialog if there is one (everything outside
 * a modal is inert), otherwise in the page's region. Read out through the
 * shared announcer. Paused while hovered or focused (WCAG 2.2.1).
 */

import { announce } from './announcer.js';
import { getOpenOverlay } from './overlay.js';

const DEFAULT_TIMEOUT = 7000;
const MAX_TOASTS = 3;
/** Longest the exit transition may take before the toast is removed anyway. */
const LEAVE_MAX = 400;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * @param {{ message: string, action?: { label: string, onClick: () => void }, timeout?: number }} options
 * @returns {() => void} dismiss
 */
export function showToast({ message, action, timeout = DEFAULT_TIMEOUT }) {
  const region = regionForNow();
  announce(action ? `${message} ${action.label}.` : message);
  if (!region) return () => {};

  const toast = document.createElement('div');
  toast.className = 'toast';
  const text = document.createElement('p');
  text.className = 'toast__message';
  text.textContent = message;
  toast.append(text);

  if (action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'toast__action';
    button.textContent = action.label;
    button.addEventListener('click', () => {
      dismiss();
      action.onClick();
    });
    toast.append(button);
  }

  let timer = 0;
  const start = () => { timer = window.setTimeout(dismiss, timeout); };
  const stop = () => window.clearTimeout(timer);
  toast.addEventListener('pointerenter', stop);
  toast.addEventListener('pointerleave', start);
  toast.addEventListener('focusin', stop);
  toast.addEventListener('focusout', start);

  function dismiss() {
    stop();
    leave(toast);
  }

  region.append(toast);
  const shown = region.querySelectorAll('.toast:not([data-leaving])');
  for (let i = 0; i < shown.length - MAX_TOASTS; i++) shown[i].remove();
  start();
  return dismiss;
}

/**
 * Fade a toast out, then remove it. It stops taking input at once.
 * @param {HTMLElement} toast
 */
function leave(toast) {
  if (toast.hasAttribute('data-leaving')) return;
  if (reducedMotion.matches || !toast.isConnected) {
    toast.remove();
    return;
  }
  toast.setAttribute('data-leaving', '');
  toast.inert = true;
  const done = () => toast.remove();
  toast.addEventListener('transitionend', done, { once: true });
  window.setTimeout(done, LEAVE_MAX);
}

// A modal makes everything behind it inert: page-level toasts would sit
// unreachable under its backdrop, so they go when an overlay opens.
document.addEventListener('overlay:open', () => {
  for (const toast of document.querySelectorAll('[data-toasts]:not(dialog [data-toasts]) > .toast')) toast.remove();
});

function regionForNow() {
  const overlay = getOpenOverlay();
  const inOverlay = overlay instanceof HTMLDialogElement ? overlay.querySelector('[data-toasts]') : null;
  return inOverlay ?? document.querySelector('[data-toasts]:not(dialog [data-toasts])');
}
