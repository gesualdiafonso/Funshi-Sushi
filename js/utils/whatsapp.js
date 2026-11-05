import { isValidWhatsAppNumber } from './validate.js';

/**
 * Builds the text of a contact message sent through WhatsApp.
 * Pure function: no DOM, no globals.
 *
 * @param {{name: string, email?: string, topic: string, message: string}} data
 * @param {string} restaurantName
 * @returns {string}
 */
export function buildContactMessage({ name, email, topic, message }, restaurantName) {
  const lines = [
    `Hello ${restaurantName}, I'm ${name.trim()}.`,
    `Topic: ${topic}`,
    '',
    message.trim(),
  ];
  const trimmedEmail = (email ?? '').trim();
  if (trimmedEmail) lines.push('', `Email: ${trimmedEmail}`);
  return lines.join('\n');
}

/**
 * Returns a wa.me URL, or null when the number is missing or malformed.
 * @param {string} number digits only, international format
 * @param {string} text
 */
export function buildWhatsAppUrl(number, text) {
  if (!isValidWhatsAppNumber(number)) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
