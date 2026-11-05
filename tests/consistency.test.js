/**
 * Project-wide consistency rules that a no-build static site can't enforce
 * any other way (TECHNICAL_ARCHITECTURE §3.2, §10.1, §11.5).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const PAGES = ['index.html', 'menu.html', 'checkout.html', '404.html'];
const read = (file) => readFileSync(join(root, file), 'utf8');

function block(html, name) {
  const match = html.match(new RegExp(`<!-- shared:${name}:start[\\s\\S]*?<!-- shared:${name}:end -->`));
  return match?.[0];
}

// Allowed per-page differences: the current-page marker, and the home page's transparent header.
const normalize = (html) => html.replace(/ aria-current="page"/g, '').replace(/ site-header--overlay/g, '');

for (const name of ['header', 'footer']) {
  test(`shared ${name} is identical on every page (ignoring allowed per-page markers)`, () => {
    const reference = normalize(block(read(PAGES[0]), name) ?? '');
    assert.ok(reference, `${PAGES[0]} has no shared:${name} block`);
    for (const page of PAGES.slice(1)) {
      assert.equal(normalize(block(read(page), name) ?? ''), reference, `${page} ${name} differs`);
    }
  });
}

test('every page has one <h1>, a skip link, a #main landmark and a lang attribute', () => {
  for (const page of [...PAGES, 'styleguide.html']) {
    const html = read(page);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${page}: exactly one <h1>`);
    assert.match(html, /class="skip-link" href="#main"/, `${page}: skip link`);
    assert.match(html, /<main id="main"/, `${page}: main#main`);
    assert.match(html, /<html lang="[a-z]{2}(-[A-Z]{2})?">/, `${page}: lang`);
  }
});

test('no inline style attributes or inline scripts (CSP: self only)', () => {
  for (const page of [...PAGES, 'styleguide.html']) {
    const html = read(page);
    assert.doesNotMatch(html, /\sstyle="/, `${page}: inline style attribute`);
    const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/g)];
    assert.equal(inlineScripts.length, 0, `${page}: inline <script>`);
  }
});

test('every local asset referenced by a page exists', () => {
  for (const page of [...PAGES, 'styleguide.html']) {
    const html = read(page);
    for (const [, ref] of html.matchAll(/(?:href|src)="([^"#:?]+)(?:[#?][^"]*)?"/g)) {
      if (ref.startsWith('http') || ref.endsWith('.html')) continue;
      assert.ok(existsSync(join(root, ref)), `${page}: ${ref} not found`);
    }
  }
});

test('every icon referenced in HTML exists in the sprite', () => {
  const sprite = read('assets/icons/sprite.svg');
  const ids = new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
  for (const page of [...PAGES, 'styleguide.html']) {
    for (const [, id] of read(page).matchAll(/sprite\.svg#([a-z0-9-]+)/g)) {
      assert.ok(ids.has(id), `${page}: icon "${id}" not in sprite`);
    }
  }
});

function jsFiles(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? jsFiles(join(dir, entry.name)) : entry.name.endsWith('.js') ? [join(dir, entry.name)] : [],
  );
}

test('no innerHTML / outerHTML / insertAdjacentHTML / document.write in site code', () => {
  for (const file of jsFiles('js')) {
    assert.doesNotMatch(read(file), /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write/, file);
  }
});

test('core modules stay DOM-free (testable in Node)', () => {
  for (const file of jsFiles('js/core')) {
    assert.doesNotMatch(read(file), /\b(document|window|localStorage|navigator)\b/, file);
  }
});

test('named exports only (no default exports)', () => {
  for (const file of jsFiles('js')) {
    assert.doesNotMatch(read(file), /export default/, file);
  }
});

test('CSS: every file after tokens.css wraps its rules in a declared layer', () => {
  const declared = read('css/tokens.css').match(/@layer ([a-z, ]+);/)[1].split(/,\s*/);
  const files = ['css/reset.css', 'css/base.css', 'css/layout.css', 'css/utilities.css',
    ...readdirSync(join(root, 'css/components')).map((f) => `css/components/${f}`)];
  for (const file of files) {
    const layers = [...read(file).matchAll(/@layer ([a-z]+)\s*\{/g)].map((m) => m[1]);
    assert.ok(layers.length > 0, `${file}: no @layer block`);
    for (const layer of layers) assert.ok(declared.includes(layer), `${file}: unknown layer ${layer}`);
  }
});

test('CSS: no raw hex colors outside tokens.css', () => {
  const files = ['css/reset.css', 'css/base.css', 'css/layout.css', 'css/utilities.css',
    ...readdirSync(join(root, 'css/components')).map((f) => `css/components/${f}`)];
  for (const file of files) {
    assert.doesNotMatch(read(file), /#[0-9a-f]{3,8}\b(?![^{]*\{)/i, file);
  }
});

test('every dish image exists in every size and format, with alt text', async () => {
  const { PRODUCTS } = await import('../js/data/menu.js');
  const { PRODUCT_IMAGE_FILES } = await import('../js/ui/picture.js');
  for (const product of PRODUCTS.filter((p) => p.image)) {
    assert.ok(product.image.alt.length > 20, `${product.id}: alt text too short`);
    for (const file of PRODUCT_IMAGE_FILES(product.image.file)) {
      assert.ok(existsSync(join(root, file)), `${product.id}: ${file} missing`);
    }
  }
});
