import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppUrl, formatOrderMessage, isUrlTooLong, MAX_URL_LENGTH } from '../js/checkout/whatsapp.js';
import { t } from '../js/strings.js';
import '../js/checkout/strings.js';

const price = (minor) => (minor / 100).toFixed(2);
const base = {
  ref: 'FS-261105-7K3Q',
  fulfilment: 'delivery',
  customer: { name: 'Ana & Co', phone: '+5511999999999' },
  address: { street: 'Rua das Flores 123', apartment: '', area: 'Centro', reference: '' },
  payment: { label: 'Cash', changeFor: 20000 },
  items: [
    { qty: 2, name: 'Salmon uramaki', variant: '16 pcs', note: 'no sesame', lineTotal: 9180 },
    { qty: 1, name: 'Gyoza', variant: null, note: '', lineTotal: 1890 },
  ],
  totals: { subtotal: 11070, deliveryFee: 500, feePending: false, total: 11570 },
  notes: '',
};
const msg = (over = {}, opts = {}) => formatOrderMessage({ ...base, ...over }, { t, price, brandName: 'Funshi Sushi', isDemo: false, ...opts });

test('message: request wording, items, totals, customer, payment', () => {
  const text = msg();
  assert.match(text, /^\*New order request — Funshi Sushi\*\nRef: FS-261105-7K3Q/);
  assert.ok(text.includes('2× Salmon uramaki (16 pcs) — 91.80\n   Note: no sesame'));
  assert.ok(text.includes('1× Gyoza — 18.90'));
  assert.ok(text.includes('Subtotal: 110.70\nDelivery: 5.00\n*Total: 115.70*'));
  assert.ok(text.includes('Address: Rua das Flores 123 — Centro'));
  assert.ok(text.includes('Payment: Cash (change for 200.00)'));
  assert.ok(text.includes('Please confirm this order and the timing.'));
  assert.doesNotMatch(text, /confirmed|placed|paid/i); // never claims the order is confirmed
});

test('message: empty fields are left out entirely', () => {
  const text = msg();
  assert.doesNotMatch(text, /Reference:|Notes:|Apartment|undefined|null/);
});

test('message: pickup, pending fee, no payment methods, notes, demo label', () => {
  assert.ok(msg({ fulfilment: 'pickup', address: null }).includes('*Pickup at the restaurant*'));
  assert.doesNotMatch(msg({ fulfilment: 'pickup', address: null }), /Delivery:/);
  const pending = msg({ totals: { ...base.totals, deliveryFee: null, feePending: true, total: 11070 } });
  assert.ok(pending.includes('Delivery: to be confirmed\n*Total: 110.70 + delivery*'));
  assert.ok(msg({ payment: null }).includes('Payment: to be agreed'));
  assert.ok(msg({ notes: 'Ring twice' }).includes('Notes: Ring twice'));
  assert.ok(msg({}, { isDemo: true }).split('\n')[1].startsWith('TEST ORDER'));
});

test('URL: wa.me with the number, text fully encoded and recoverable', () => {
  const text = msg({ notes: 'a & b #1 ? 100% — ção 🍣\nline' });
  const url = buildWhatsAppUrl('5500000000000', text);
  assert.ok(url.startsWith('https://wa.me/5500000000000?text='));
  const encoded = url.split('?text=')[1];
  assert.doesNotMatch(encoded, /[ \n#&?]/); // nothing that could break or truncate the URL
  assert.equal(decodeURIComponent(encoded), text);
  assert.equal(new URL(url).searchParams.get('text'), text);
});

test('URL: refuses an invalid number (never a made-up destination)', () => {
  for (const bad of [null, '', '+5511', '55 11 9999 9999', 'abc']) assert.throws(() => buildWhatsAppUrl(bad, 'x'));
});

test('URL length check', () => {
  assert.equal(isUrlTooLong('x'.repeat(MAX_URL_LENGTH)), false);
  assert.equal(isUrlTooLong('x'.repeat(MAX_URL_LENGTH + 1)), true);
});
