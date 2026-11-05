/**
 * Business facts from js/config.js into the page (BR-05: one source of truth).
 * Static HTML carries visible placeholders; this replaces them only when the
 * real value exists, and reveals links (maps, WhatsApp, phone) only then.
 *
 * Hooks:
 *   [data-business="address"]          multi-line postal address
 *   [data-business="address-inline"]   one-line address (header panel, footer)
 *   [data-business="contact-placeholder"]  hidden once any contact exists
 *   [data-business="whatsapp-item"]    footer list item → WhatsApp link
 *   [data-business-link="maps|whatsapp|phone"]  hidden links, revealed with href
 */

import { t } from '../strings.js';
import { icon, qsa } from './dom.js';

/**
 * @param {typeof import('../config.js').CONFIG} config
 * @param {import('../core/features.js').Features} features
 */
export function initBusinessInfo(config, features) {
  if (features.showAddress) {
    const { street, area, city, region, postalCode } = config.address;
    const cityLine = [city, region, postalCode].filter(Boolean).join(', ');
    fill('[data-business="address"]', [street, area, cityLine].filter(Boolean).join('\n'));
    fill('[data-business="address-inline"]', [street, area, city].filter(Boolean).join(', '));
  }

  if (config.mapsUrl) {
    for (const link of reveal('[data-business-link="maps"]', config.mapsUrl)) {
      link.target = '_blank';
      link.rel = 'noopener';
      appendNewTabHint(link);
    }
  }

  const whatsappUrl = features.hasWhatsapp ? `https://wa.me/${config.whatsappNumber}` : null;
  if (whatsappUrl) {
    for (const link of reveal('[data-business-link="whatsapp"]', whatsappUrl)) {
      link.target = '_blank';
      link.rel = 'noopener';
      appendNewTabHint(link);
    }
    for (const item of qsa('[data-business="whatsapp-item"]')) {
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.append(icon('message-circle', { size: 'sm' }), t('contact.whatsappLabel'));
      appendNewTabHint(link);
      item.replaceChildren(link);
    }
  }

  if (features.hasPhone) {
    const digits = String(config.phone).replace(/[^\d+]/g, '');
    for (const link of reveal('[data-business-link="phone"]', `tel:${digits}`)) {
      link.textContent = config.phone;
    }
  }

  if (whatsappUrl || features.hasPhone) {
    for (const el of qsa('[data-business="contact-placeholder"]')) el.hidden = true;
  }
}

function fill(selector, text) {
  for (const el of qsa(selector)) el.textContent = text;
}

/** Set href and unhide; returns the links. */
function reveal(selector, href) {
  const links = /** @type {HTMLAnchorElement[]} */ (qsa(selector));
  for (const link of links) {
    link.href = href;
    link.hidden = false;
  }
  return links;
}

function appendNewTabHint(link) {
  if (link.querySelector('.visually-hidden')) return;
  const hint = document.createElement('span');
  hint.className = 'visually-hidden';
  hint.textContent = ` ${t('contact.newTab')}`;
  link.append(hint);
}
