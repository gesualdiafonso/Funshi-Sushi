import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG } from '../js/config.js';
import * as MENU from '../js/data/menu.js';
import {
  PAGES, START, END, applyBlock, buildSeo, headBlock, menuJsonLd, pageText, restaurantJsonLd, robotsTxt, siteBase, sitemapXml,
} from '../tools/seo.mjs';

const root = new URL('..', import.meta.url).pathname;
const read = (file) => readFileSync(join(root, file), 'utf8');
const page = (file) => PAGES.find((p) => p.file === file);

/** A fully configured, launched site — test values, never shipped. */
const LAUNCHED = {
  ...CONFIG,
  site: { url: 'https://example.test/Funshi-Sushi', allowIndexing: true },
  locale: 'pt-BR',
  currency: 'BRL',
  phone: '+55 11 0000-0000',
  address: { street: 'Test Street 123', area: 'Test Area', city: 'Test City', region: 'TS', postalCode: '00000-000', country: 'BR' },
  hours: { mon: [], tue: [['18:00', '23:00']], wed: [['18:00', '23:00']], thu: [['18:00', '23:00']], fri: [['18:00', '01:00']], sat: [['12:00', '15:00'], ['18:00', '01:00']], sun: [] },
  social: [{ label: 'Instagram', url: 'https://instagram.test/funshi' }],
};
const REAL_MENU = { ...MENU, IS_DEMO_MENU: false };

test('the pages in the repository are up to date with js/config.js (run node tools/build-seo.mjs)', () => {
  const { files } = buildSeo({ config: CONFIG, menuData: MENU, read });
  for (const [file, content] of Object.entries(files)) assert.equal(read(file), content, `${file} is out of date`);
});

test('site URL: normalized to a trailing slash; invalid values refused', () => {
  assert.equal(siteBase({ site: { url: null } }), null);
  assert.equal(siteBase({ site: { url: 'https://example.test/Funshi-Sushi' } }), 'https://example.test/Funshi-Sushi/');
  assert.equal(siteBase({ site: { url: 'https://example.test' } }), 'https://example.test/');
  assert.throws(() => siteBase({ site: { url: 'example.test' } }));
  assert.throws(() => siteBase({ site: { url: 'ftp://example.test/' } }));
  assert.throws(() => siteBase({ site: { url: 'https://example.test/?a=1' } }));
});

test('shipped config: no invented URLs — no canonical, og:url, og:image, base or sitemap; pages ask not to be indexed', () => {
  assert.equal(CONFIG.site.url, null, 'the real domain is an owner input');
  const { files, remove } = buildSeo({ config: CONFIG, menuData: MENU, read });
  for (const file of ['index.html', 'menu.html', '404.html']) {
    assert.doesNotMatch(files[file], /rel="canonical"|og:url|og:image|<base /, file);
  }
  for (const file of ['index.html', 'menu.html']) assert.match(files[file], /<meta name="robots" content="noindex">/);
  assert.ok(remove.includes('sitemap.xml'));
  assert.doesNotMatch(files['robots.txt'], /Sitemap:/);
});

test('launched config: canonical, og:url and og:image are absolute; the home page is the site root, not /index.html', () => {
  const base = siteBase(LAUNCHED);
  const home = headBlock(page('index.html'), read('index.html'), { config: LAUNCHED, menuData: REAL_MENU, base });
  assert.match(home, /<link rel="canonical" href="https:\/\/example.test\/Funshi-Sushi\/">/);
  assert.match(home, /og:url" content="https:\/\/example.test\/Funshi-Sushi\/"/);
  assert.match(home, /og:image" content="https:\/\/example.test\/Funshi-Sushi\/assets\/brand\/og-image.jpg"/);
  assert.match(home, /twitter:card" content="summary_large_image"/);
  assert.match(home, /og:locale" content="pt_BR"/);
  assert.doesNotMatch(home, /noindex/);
  const menu = headBlock(page('menu.html'), read('menu.html'), { config: LAUNCHED, menuData: REAL_MENU, base });
  assert.match(menu, /rel="canonical" href="https:\/\/example.test\/Funshi-Sushi\/menu.html"/);
  const notFound = headBlock(page('404.html'), read('404.html'), { config: LAUNCHED, menuData: REAL_MENU, base });
  assert.match(notFound, /<base href="\/Funshi-Sushi\/">/);
  assert.doesNotMatch(notFound, /canonical|og:/);
});

test('og:title and og:description come from the page itself', () => {
  const html = read('menu.html');
  const { title, description } = pageText(html);
  const block = headBlock(page('menu.html'), html, { config: CONFIG, menuData: MENU, base: null });
  assert.ok(block.includes(`og:title" content="${title}"`));
  assert.ok(block.includes(`og:description" content="${description}"`));
});

test('Restaurant JSON-LD: shipped config has only the name and cuisine — nothing invented', () => {
  const data = restaurantJsonLd(CONFIG, { base: null, isDemoMenu: true });
  assert.deepEqual(Object.keys(data).sort(), ['@context', '@type', 'name', 'servesCuisine']);
});

test('Restaurant JSON-LD: configured facts only; never ratings, reviews, price range or reservations', () => {
  const data = restaurantJsonLd(LAUNCHED, { base: siteBase(LAUNCHED), isDemoMenu: false });
  assert.equal(data.telephone, '+55 11 0000-0000');
  assert.deepEqual(data.address, { '@type': 'PostalAddress', streetAddress: 'Test Street 123, Test Area', addressLocality: 'Test City', addressRegion: 'TS', postalCode: '00000-000', addressCountry: 'BR' });
  assert.equal(data.openingHoursSpecification.length, 6, 'one entry per shift; closed days omitted');
  assert.deepEqual(data.openingHoursSpecification[3], { '@type': 'OpeningHoursSpecification', dayOfWeek: 'https://schema.org/Friday', opens: '18:00', closes: '01:00' });
  assert.equal(data.hasMenu, 'https://example.test/Funshi-Sushi/menu.html');
  assert.deepEqual(data.sameAs, ['https://instagram.test/funshi']);
  const json = JSON.stringify(data);
  for (const key of ['aggregateRating', 'review', 'priceRange', 'acceptsReservations', 'starRating']) assert.ok(!json.includes(key), key);
  assert.equal(restaurantJsonLd(LAUNCHED, { base: siteBase(LAUNCHED), isDemoMenu: true }).hasMenu, undefined, 'no menu link while the menu is a sample');
});

test('Menu JSON-LD: none for the sample menu or without a currency', () => {
  assert.equal(menuJsonLd(MENU, LAUNCHED, { base: null }), null);
  assert.equal(menuJsonLd(REAL_MENU, { ...LAUNCHED, currency: null }, { base: null }), null);
  const block = headBlock(page('menu.html'), read('menu.html'), { config: LAUNCHED, menuData: MENU, base: siteBase(LAUNCHED) });
  assert.doesNotMatch(block, /ld\+json/);
});

test('Menu JSON-LD for a real menu: sections, items, prices from the data in decimal, sizes as separate offers', () => {
  const data = menuJsonLd(REAL_MENU, LAUNCHED, { base: siteBase(LAUNCHED) });
  assert.equal(data['@type'], 'Menu');
  assert.equal(data.inLanguage, 'pt-BR');
  const items = data.hasMenuSection.flatMap((s) => s.hasMenuItem);
  assert.equal(items.length, MENU.PRODUCTS.length);
  const simple = MENU.PRODUCTS.find((p) => !p.variants && Number.isSafeInteger(p.price));
  const item = items.find((i) => i.name === simple.name);
  assert.deepEqual(item.offers, { '@type': 'Offer', price: (simple.price / 100).toFixed(2), priceCurrency: 'BRL' });
  assert.match(item.url, /menu\.html\?dish=/);
  const sized = MENU.PRODUCTS.find((p) => p.variants?.length > 1);
  assert.equal(items.find((i) => i.name === sized.name).offers.length, sized.variants.length);
  const json = JSON.stringify(data);
  assert.ok(!json.includes('aggregateRating') && !json.includes('review'));
});

test('JSON-LD cannot close its <script> early', () => {
  const html = headBlock(page('index.html'), read('index.html'), { config: { ...CONFIG, brandName: 'A</script><b>' }, menuData: MENU, base: null });
  assert.equal(html.match(/<\/script>/g).length, 1);
});

test('robots.txt and sitemap.xml', () => {
  const base = siteBase(LAUNCHED);
  assert.match(robotsTxt({ config: LAUNCHED, base }), /User-agent: \*\nDisallow:\n\nSitemap: https:\/\/example.test\/Funshi-Sushi\/sitemap.xml\n$/);
  const sitemap = sitemapXml({ config: LAUNCHED, base });
  assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]), ['https://example.test/Funshi-Sushi/', 'https://example.test/Funshi-Sushi/menu.html']);
  assert.equal(sitemapXml({ config: { ...LAUNCHED, site: { ...LAUNCHED.site, allowIndexing: false } }, base }), null);
});

test('applyBlock replaces the block in place and can remove it', () => {
  const html = '<head>\n  <meta name="description" content="x">\n  <link>\n</head>';
  const once = applyBlock(html, `  ${START}\n  <a>\n  ${END}`);
  const twice = applyBlock(once, `  ${START}\n  <b>\n  ${END}`);
  assert.match(twice, /<b>/);
  assert.doesNotMatch(twice, /<a>/);
  assert.equal(applyBlock(twice, null), html);
});
