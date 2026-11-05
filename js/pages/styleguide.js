/**
 * Entry module — styleguide.html (internal design-system reference).
 * Demonstrates component states and the global event handling.
 */

import { startPage } from '../app.js';
import { announce } from '../ui/announcer.js';
import { delegate, icon, qs } from '../ui/dom.js';

const ICONS = [
  'shopping-bag', 'plus', 'minus', 'x', 'search', 'sliders-horizontal', 'map-pin', 'clock',
  'phone', 'message-circle', 'chevron-down', 'chevron-left', 'chevron-right', 'trash-2',
  'check', 'circle-alert', 'info', 'menu', 'bike', 'store', 'flame', 'leaf',
];

startPage(() => {
  const iconList = qs('[data-sg-icons]');
  for (const name of ICONS) {
    const item = document.createElement('li');
    const label = document.createElement('code');
    label.textContent = name;
    item.append(icon(name, { size: 'lg' }), label);
    iconList?.append(item);
  }

  // "Added" confirmation state (BRAND_GUIDELINES §10.3).
  delegate(document, 'click', '[data-sg-add]', (event, button) => {
    if (button.dataset.state === 'added') return;
    const label = button.textContent;
    button.dataset.state = 'added';
    button.replaceChildren(icon('check', { size: 'sm' }), 'Added');
    announce('Added salmon nigiri. Cart: 1 item.');
    window.setTimeout(() => {
      delete button.dataset.state;
      button.textContent = label;
    }, 1200);
  });

  // Busy state.
  delegate(document, 'click', '[data-sg-busy]', (event, button) => {
    if (button.getAttribute('aria-busy') === 'true') return;
    button.setAttribute('aria-busy', 'true');
    window.setTimeout(() => button.removeAttribute('aria-busy'), 1500);
  });

  // Toggle chips.
  delegate(document, 'click', '[data-sg-toggle]', (event, chip) => {
    const pressed = chip.getAttribute('aria-pressed') === 'true';
    chip.setAttribute('aria-pressed', String(!pressed));
  });

  delegate(document, 'click', '[data-sg-announce]', () => {
    announce('This is a polite announcement from the shared live region.');
  });
});
