import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveFeatures } from '../js/core/features.js';
import { CONFIG } from '../js/config.js';

const complete = {
  ...CONFIG,
  locale: 'pt-BR',
  currency: 'BRL',
  timeZone: 'America/Sao_Paulo',
  whatsappNumber: '5511999999999',
  phone: '+55 11 99999-9999',
  address: { street: 'x', area: 'x', city: 'x', region: 'x', postalCode: 'x', country: 'BR' },
  hours: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
  payments: [{ id: 'cash', label: 'Cash' }],
};

test('the shipped config (all placeholders) disables ordering, and lists what is missing', () => {
  const f = deriveFeatures(CONFIG);
  assert.equal(f.canOrder, false);
  assert.equal(f.canFormatMoney, false);
  assert.equal(f.showOpenStatus, false);
  for (const key of ['locale', 'currency', 'whatsappNumber', 'hours', 'payments']) {
    assert.ok(f.missing.includes(key), `missing should list ${key}`);
  }
});

test('a complete config enables every feature', () => {
  const f = deriveFeatures(complete);
  assert.equal(f.canOrder, true);
  assert.equal(f.canFormatMoney, true);
  assert.equal(f.showOpenStatus, true);
  assert.equal(f.showAddress, true);
  assert.deepEqual(f.missing, []);
});

test('an invalid WhatsApp number never enables ordering', () => {
  for (const bad of ['+55 11 99999-9999', '123', 'abc12345678', '1234567890123456']) {
    const f = deriveFeatures({ ...complete, whatsappNumber: bad });
    assert.equal(f.canOrder, false, bad);
  }
});

test('ordering needs a valid WhatsApp number and at least one fulfilment mode (payments optional)', () => {
  const noModes = {
    ...complete,
    fulfilment: { delivery: { enabled: false }, pickup: { enabled: false } },
  };
  assert.equal(deriveFeatures(noModes).canOrder, false);
  assert.equal(deriveFeatures({ ...complete, payments: null }).canOrder, true);
  assert.equal(deriveFeatures({ ...complete, payments: null }).hasPayments, false);
  assert.equal(deriveFeatures({ ...complete, whatsappNumber: null }).canOrder, false);
});

test('open status needs both hours and time zone', () => {
  assert.equal(deriveFeatures({ ...complete, timeZone: null }).showOpenStatus, false);
  assert.equal(deriveFeatures({ ...complete, hours: null }).showOpenStatus, false);
});
