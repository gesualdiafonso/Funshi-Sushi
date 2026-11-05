/**
 * Reads the color tokens from css/tokens.css and checks every approved
 * pairing in BRAND_GUIDELINES §3.4 against WCAG 2.1 thresholds.
 * If someone edits a token, this fails before the change ships.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/tokens.css', import.meta.url), 'utf8');
const tokens = Object.fromEntries(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, hex]) => [name, hex]),
);

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = 4.5; // WCAG AA, normal text
const UI = 3; // WCAG AA, UI components and focus indicators

// [foreground, background, minimum, use]
const PAIRS = [
  ['shari', 'urushi', TEXT, 'text on dark'],
  ['shari', 'akami', TEXT, 'primary button on light'],
  ['shari', 'akami-hover', TEXT, 'primary button hover'],
  ['urushi', 'shari', TEXT, 'body text on light'],
  ['urushi', 'shari-deep', TEXT, 'text on inset surfaces'],
  ['akami', 'shari', TEXT, 'headings and links on light'],
  ['akami', 'shari-deep', TEXT, 'chip text / links on inset'],
  ['kinari', 'urushi', TEXT, 'muted text on dark'],
  ['kinari', 'akami', TEXT, 'muted text on akami'],
  ['stone', 'shari', TEXT, 'muted text on light'],
  ['stone', 'shari-deep', TEXT, 'muted text on inset'],
  ['urushi', 'shari-deep', TEXT, 'primary button hover on dark'],
  ['wasabi', 'urushi', TEXT, 'signal text on dark'],
  ['urushi', 'wasabi', TEXT, 'count badge / added state on dark'],
  ['wasabi-deep', 'shari', TEXT, 'signal text on light'],
  ['shari', 'wasabi-deep', TEXT, 'count badge / added state on light'],
  ['error', 'shari', TEXT, 'errors on light'],
  ['error-on-dark', 'urushi', TEXT, 'errors on dark'],
  ['stone', 'shari', UI, 'input borders on light'],
  ['kinari', 'urushi', UI, 'outline buttons on dark'],
  ['akami', 'shari', UI, 'focus ring on light'],
  ['wasabi', 'urushi', UI, 'focus ring on dark'],
  // Akami band (CTA section) uses the dark role tokens on an akami surface.
  ['wasabi', 'akami', UI, 'focus ring on the akami band'],
  ['wasabi', 'akami', TEXT, 'signal text on the akami band'],
  ['urushi', 'shari', TEXT, 'primary button on the akami band'],
  ['error-on-dark', 'akami', TEXT, 'errors on the akami band'],
];

test('all color tokens are present', () => {
  for (const [fg, bg] of PAIRS) {
    assert.ok(tokens[fg], `--color-${fg} missing`);
    assert.ok(tokens[bg], `--color-${bg} missing`);
  }
});

for (const [fg, bg, min, use] of PAIRS) {
  test(`${fg} on ${bg} ≥ ${min}:1 (${use})`, () => {
    const r = ratio(tokens[fg], tokens[bg]);
    assert.ok(r >= min, `${r.toFixed(2)}:1 is below ${min}:1`);
  });
}
