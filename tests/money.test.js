import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, formatPrice, minorDigits } from '../js/core/money.js';

const norm = (s) => s.replace(/\s/g, ' '); // Intl uses non-breaking spaces

test('minor digits per currency', () => {
  assert.equal(minorDigits('BRL'), 2);
  assert.equal(minorDigits('ARS'), 2);
  assert.equal(minorDigits('JPY'), 0);
});

test('formats integers in minor units', () => {
  assert.equal(norm(formatMoney(2490, { locale: 'pt-BR', currency: 'BRL' })), 'R$ 24,90');
  assert.equal(norm(formatMoney(1250000, { locale: 'es-AR', currency: 'ARS' })), '$ 12.500,00');
  assert.equal(norm(formatMoney(1200, { locale: 'ja-JP', currency: 'JPY' })), '￥1,200');
});

test('unknown amount or config → null (shown as "price to be confirmed")', () => {
  assert.equal(formatMoney(null, { locale: 'pt-BR', currency: 'BRL' }), null);
  assert.equal(formatMoney(2490, { locale: null, currency: 'BRL' }), null);
  assert.equal(formatMoney(2490, { locale: 'pt-BR', currency: null }), null);
});

test('rejects non-integers (floats would hide rounding errors)', () => {
  assert.throws(() => formatMoney(24.9, { locale: 'pt-BR', currency: 'BRL' }), TypeError);
});

test('formatPrice: currency when configured, neutral number otherwise', () => {
  assert.equal(norm(formatPrice(2490, { locale: 'pt-BR', currency: 'BRL' })), 'R$ 24,90');
  assert.equal(formatPrice(2490, { locale: null, currency: null }), '24.90');
  assert.equal(formatPrice(2490, { locale: 'pt-BR', currency: null }), '24,90');
  assert.equal(formatPrice(11490, { locale: 'es-AR', currency: null }), '114,90');
  assert.equal(formatPrice(null, { locale: null, currency: null }), null);
});
