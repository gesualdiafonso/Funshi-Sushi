import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone, parseAmount, validateCheckout } from '../js/core/validate.js';

const ctx = { modes: ['delivery', 'pickup'], zones: null, payments: [{ id: 'cash', label: 'Cash', allowsChange: true }, { id: 'card', label: 'Card' }], total: 5000 };
const ok = { fulfilment: 'pickup', name: 'Ana', phone: '+55 11 99999-9999', street: '', noStreetNumber: false, apartment: '', area: '', reference: '', payment: 'card', changeFor: '' };
const errors = (values, c = ctx) => validateCheckout({ ...ok, ...values }, c).errors;

test('phone: plausible numbers only, normalized', () => {
  assert.equal(normalizePhone('+55 (11) 99999-9999'), '+5511999999999');
  assert.equal(normalizePhone('011 4444.5555'), '01144445555');
  for (const bad of ['', '1234567', '12345678901234567', 'call me', '+55 11 9999x9999']) assert.equal(normalizePhone(bad), null, bad);
});

test('amounts: dot or comma decimals, to minor units', () => {
  assert.equal(parseAmount('100'), 10000);
  assert.equal(parseAmount('100,5'), 10050);
  assert.equal(parseAmount(' 100.50 '), 10050);
  for (const bad of ['', 'abc', '1.234,56', '-5', '10.123', '1e3']) assert.equal(parseAmount(bad), null, bad);
});

test('a complete pickup order is valid and cleaned', () => {
  const r = validateCheckout({ ...ok, name: '  Ana   Souza ' }, ctx);
  assert.equal(r.valid, true);
  assert.equal(r.clean.name, 'Ana Souza');
  assert.equal(r.clean.phone, '+5511999999999');
  assert.equal(r.clean.street, undefined); // address not collected for pickup
});

test('required fields', () => {
  assert.deepEqual(errors({ fulfilment: '', name: ' ', phone: '', payment: '' }), {
    fulfilment: 'required', name: 'required', phone: 'required', payment: 'required',
  });
});

test('fulfilment must be an enabled mode', () => {
  assert.equal(errors({ fulfilment: 'delivery' }, { ...ctx, modes: ['pickup'] }).fulfilment, 'required');
});

test('delivery: street needs a number unless ticked; area required; lengths', () => {
  const d = { fulfilment: 'delivery', street: 'Rua das Flores', area: 'Centro' };
  assert.equal(errors(d).street, 'needsNumber');
  assert.equal(errors({ ...d, noStreetNumber: true }).street, undefined);
  assert.equal(errors({ ...d, street: 'Rua das Flores 123' }).street, undefined);
  assert.equal(errors({ ...d, street: 'R1' }).street, 'tooShort');
  assert.equal(errors({ ...d, area: '' }).area, 'required');
  assert.equal(errors({ ...d, street: 'Rua 1', apartment: 'x'.repeat(41) }).apartment, 'tooLong');
  assert.equal(errors({ ...d, street: 'Rua 1', reference: 'x'.repeat(101) }).reference, 'tooLong');
});

test('delivery with zones: must be one of them', () => {
  const z = { ...ctx, zones: [{ id: 'north', label: 'North' }] };
  const d = { fulfilment: 'delivery', street: 'Rua 1' };
  assert.equal(errors({ ...d, area: '' }, z).area, 'required');
  assert.equal(errors({ ...d, area: 'south' }, z).area, 'invalid');
  assert.equal(errors({ ...d, area: 'north' }, z).area, undefined);
});

test('change for: only for methods that allow it; must cover the total', () => {
  assert.equal(errors({ payment: 'cash', changeFor: '20' }).changeFor, 'tooLow');
  assert.equal(errors({ payment: 'cash', changeFor: 'lots' }).changeFor, 'invalid');
  assert.equal(validateCheckout({ ...ok, payment: 'cash', changeFor: '100' }, ctx).clean.changeFor, 10000);
  assert.equal(validateCheckout({ ...ok, payment: 'card', changeFor: '100' }, ctx).clean.changeFor, null);
});

test('no payment methods configured → payment not asked', () => {
  const r = validateCheckout({ ...ok, payment: '' }, { ...ctx, payments: null });
  assert.equal(r.valid, true);
  assert.equal(r.clean.payment, '');
});
