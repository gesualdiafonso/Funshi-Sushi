import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildContactMessage, buildWhatsAppUrl } from '../js/utils/whatsapp.js';
import { formatPrice, formatDishMeta } from '../js/utils/format.js';

const data = { name: ' Ana ', email: '', topic: 'Feedback', message: ' Great rolls & rice? 100%! ' };

test('message includes name, topic and trimmed message; omits empty email', () => {
  const text = buildContactMessage(data, 'Funshi Sushi');
  assert.equal(text, "Hello Funshi Sushi, I'm Ana.\nTopic: Feedback\n\nGreat rolls & rice? 100%!");
});

test('message appends email when given', () => {
  const text = buildContactMessage({ ...data, email: 'ana@example.com' }, 'Funshi Sushi');
  assert.match(text, /\n\nEmail: ana@example\.com$/);
});

test('url is null without a valid number', () => {
  assert.equal(buildWhatsAppUrl('', 'hi'), null);
  assert.equal(buildWhatsAppUrl('+54 11', 'hi'), null);
});

test('url encodes special characters and newlines', () => {
  const url = buildWhatsAppUrl('5491100000000', 'a & b?\nc #1');
  assert.equal(url, 'https://wa.me/5491100000000?text=a%20%26%20b%3F%0Ac%20%231');
});

test('price and meta formatting', () => {
  assert.equal(formatPrice(null), 'Price to be confirmed');
  assert.match(formatPrice(4800), /4,800/);
  assert.equal(formatDishMeta({ category: 'Nigiri', pieces: 2 }), 'Nigiri, 2 pieces');
  assert.equal(formatDishMeta({ category: 'Nigiri', pieces: 1 }), 'Nigiri, 1 piece');
  assert.equal(formatDishMeta({ category: 'Sides', pieces: null }), 'Sides');
});
