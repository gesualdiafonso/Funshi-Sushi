/**
 * Pure validation helpers. No DOM access, so they run under `node --test`.
 * Each validator returns an error message string, or '' when valid.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const LIMITS = Object.freeze({
  nameMin: 2,
  nameMax: 80,
  messageMin: 10,
  messageMax: 1000,
});

export function validateName(value) {
  const name = String(value ?? '').trim();
  if (!name) return 'Enter your name.';
  if (name.length < LIMITS.nameMin) return `Enter at least ${LIMITS.nameMin} characters.`;
  if (name.length > LIMITS.nameMax) return `Use ${LIMITS.nameMax} characters or fewer.`;
  return '';
}

/** Email is optional: empty is valid, anything else must look like an address. */
export function validateOptionalEmail(value) {
  const email = String(value ?? '').trim();
  if (!email) return '';
  if (!EMAIL_PATTERN.test(email)) return 'Enter an email address like name@example.com, or leave it empty.';
  return '';
}

export function validateRequiredChoice(value, allowed) {
  const choice = String(value ?? '');
  if (!choice) return 'Choose a topic.';
  if (!allowed.includes(choice)) return 'Choose one of the listed topics.';
  return '';
}

export function validateMessage(value) {
  const message = String(value ?? '').trim();
  if (!message) return 'Write your message.';
  if (message.length < LIMITS.messageMin) return `Write at least ${LIMITS.messageMin} characters.`;
  if (message.length > LIMITS.messageMax) return `Keep it under ${LIMITS.messageMax} characters.`;
  return '';
}

/** WhatsApp numbers for wa.me links: digits only, 8–15 long (E.164 without "+"). */
export function isValidWhatsAppNumber(value) {
  return /^\d{8,15}$/.test(String(value ?? ''));
}
