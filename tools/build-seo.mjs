/**
 * Write the search and sharing metadata from js/config.js (see tools/seo.mjs).
 * Run after changing `site`, the business facts or the menu:
 *
 *   node tools/build-seo.mjs           update the pages, robots.txt and sitemap.xml
 *   node tools/build-seo.mjs --check   exit 1 if anything is out of date (no writes)
 *
 * No packages needed. The site works without running it; until `site.url` is
 * set, pages simply carry no canonical URL and no share image.
 */

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from '../js/config.js';
import * as MENU from '../js/data/menu.js';
import { buildSeo } from './seo.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const at = (file) => join(root, file);
const check = process.argv.includes('--check');

const { files, remove, warnings } = buildSeo({ config: CONFIG, menuData: MENU, read: (file) => readFileSync(at(file), 'utf8') });

const stale = [];
for (const [file, content] of Object.entries(files)) {
  const current = existsSync(at(file)) ? readFileSync(at(file), 'utf8') : null;
  if (current === content) continue;
  stale.push(file);
  if (!check) writeFileSync(at(file), content);
}
for (const file of remove) {
  if (!existsSync(at(file))) continue;
  stale.push(`${file} (remove)`);
  if (!check) rmSync(at(file));
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (check) {
  if (stale.length) {
    console.error(`Out of date: ${stale.join(', ')}\nRun: node tools/build-seo.mjs`);
    process.exit(1);
  }
  console.log('SEO metadata is up to date.');
} else {
  console.log(stale.length ? `Updated: ${stale.join(', ')}` : 'Nothing to update.');
}
