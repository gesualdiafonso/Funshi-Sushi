import { restaurant } from '../data/restaurant.js';
import { qs } from '../utils/dom.js';
import { isValidWhatsAppNumber } from '../utils/validate.js';

/**
 * Fills contact details, footer and preview banner from js/data/restaurant.js.
 * Empty values keep the "To be confirmed" text already in the HTML.
 */
export function initContactInfo() {
  const banner = qs('[data-js="preview-banner"]');
  if (banner) banner.hidden = !restaurant.isPreview;

  const year = qs('[data-js="year"]');
  if (year) year.textContent = String(new Date().getFullYear());

  const details = qs('[data-js="contact-details"]');
  if (details) fillDetails(details);

  const pickup = qs('[data-js="pickup-address"]');
  if (pickup && restaurant.address) setText(pickup, restaurant.address);

  fillFooter();
}

function fillDetails(details) {
  const field = (name) => qs(`[data-field="${name}"]`, details);

  if (isValidWhatsAppNumber(restaurant.whatsapp)) {
    setLink(field('whatsapp'), `https://wa.me/${restaurant.whatsapp}`, `+${restaurant.whatsapp}`, true);
  }
  if (restaurant.phone) {
    setLink(field('phone'), `tel:${restaurant.phone.replace(/[^\d+]/g, '')}`, restaurant.phone);
  }
  if (restaurant.email) {
    setLink(field('email'), `mailto:${restaurant.email}`, restaurant.email);
  }
  if (restaurant.address) {
    if (restaurant.mapsUrl) setLink(field('address'), restaurant.mapsUrl, restaurant.address, true);
    else setText(field('address'), restaurant.address);
  }
  if (restaurant.hours.length > 0) {
    const target = field('hours');
    const list = document.createElement('ul');
    for (const { days, time } of restaurant.hours) {
      const item = document.createElement('li');
      item.textContent = `${days}: ${time}`;
      list.append(item);
    }
    target.classList.remove('tbc');
    target.replaceChildren(list);
  }
}

function fillFooter() {
  const contactList = qs('[data-js="footer-contact"]');
  if (contactList) {
    const items = [];
    if (restaurant.phone) items.push(makeLinkItem(`tel:${restaurant.phone.replace(/[^\d+]/g, '')}`, restaurant.phone));
    if (restaurant.email) items.push(makeLinkItem(`mailto:${restaurant.email}`, restaurant.email));
    if (restaurant.address) {
      const item = document.createElement('li');
      item.textContent = restaurant.address;
      items.push(item);
    }
    if (items.length > 0) contactList.replaceChildren(...items);
  }

  const socialBlock = qs('[data-js="footer-social"]');
  const socialList = qs('[data-js="footer-social-list"]');
  if (socialBlock && socialList && restaurant.social.length > 0) {
    socialList.replaceChildren(
      ...restaurant.social.map(({ label, url }) => makeLinkItem(url, label, true)),
    );
    socialBlock.hidden = false;
  }
}

function setText(element, text) {
  if (!element) return;
  element.classList.remove('tbc');
  element.textContent = text;
}

function setLink(element, href, text, external = false) {
  if (!element) return;
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  if (external) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  element.classList.remove('tbc');
  element.replaceChildren(link);
}

function makeLinkItem(href, text, external = false) {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  if (external) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  item.append(link);
  return item;
}
