import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateName, validateOptionalEmail, validateRequiredChoice, validateMessage, isValidWhatsAppNumber,
} from '../js/utils/validate.js';

test('name: required, trimmed, 2–80 chars', () => {
  assert.notEqual(validateName(''), '');
  assert.notEqual(validateName('   '), '');
  assert.notEqual(validateName('A'), '');
  assert.equal(validateName(' Ana '), '');
  assert.notEqual(validateName('x'.repeat(81)), '');
});

test('email: optional but must be well formed when given', () => {
  assert.equal(validateOptionalEmail(''), '');
  assert.equal(validateOptionalEmail('ana@example.com'), '');
  assert.notEqual(validateOptionalEmail('ana@'), '');
  assert.notEqual(validateOptionalEmail('ana example.com'), '');
});

test('topic: must be one of the allowed values', () => {
  const allowed = ['Feedback', 'Other'];
  assert.notEqual(validateRequiredChoice('', allowed), '');
  assert.notEqual(validateRequiredChoice('Hack', allowed), '');
  assert.equal(validateRequiredChoice('Feedback', allowed), '');
});

test('message: 10–1000 chars after trimming', () => {
  assert.notEqual(validateMessage('short'), '');
  assert.equal(validateMessage('This is long enough.'), '');
  assert.notEqual(validateMessage('x'.repeat(1001)), '');
});

test('whatsapp number: digits only, 8–15', () => {
  assert.equal(isValidWhatsAppNumber(''), false);
  assert.equal(isValidWhatsAppNumber('+5491100000000'), false);
  assert.equal(isValidWhatsAppNumber('5491100000000'), true);
  assert.equal(isValidWhatsAppNumber('1234567'), false);
});
