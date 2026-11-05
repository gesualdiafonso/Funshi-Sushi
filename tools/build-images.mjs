/**
 * Build responsive images (dev-time only; the site itself has no build step).
 *
 * Rasterizes the SVG illustration sources — or, later, resizes real photos —
 * into AVIF, WebP and JPEG at the widths listed below (BRAND_GUIDELINES §6.4).
 *
 *   npm install --no-save sharp
 *   node tools/build-images.mjs
 *
 * When real photography arrives: put the master file in assets/images/src/,
 * point `src` at it, keep the output names, and the pages need no change.
 */

import sharp from 'sharp';
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Crops are in source pixels. Optional `jpeg`: widths that also get a JPEG (default: all). */
const IMAGES = [
  {
    // Art direction: phones get their own composition (4:5), not a crop of the wide one.
    src: 'assets/images/src/hero-portrait.svg',
    outputs: [
      { name: 'hero/hero-portrait', crop: { left: 0, top: 0, width: 1600, height: 2000 }, widths: [480, 800, 1200, 1600] },
    ],
  },
  {
    src: 'assets/images/src/hero.svg',
    outputs: [
      { name: 'hero/hero-landscape', crop: { left: 0, top: 200, width: 2000, height: 1600 }, widths: [640, 960, 1280, 1600] },
    ],
  },
  {
    src: 'assets/images/src/counter.svg',
    outputs: [
      { name: 'story/counter', crop: { left: 0, top: 0, width: 2400, height: 1600 }, widths: [640, 1024, 1600] },
    ],
  },
];

// Menu dishes: square, one source per dish (file name = `image.file` in js/data/menu.js).
// AVIF + WebP at every width; one JPEG fallback width for very old browsers.
const PRODUCT_DIR = 'assets/images/src/products';
for (const file of readdirSync(join(root, PRODUCT_DIR)).filter((f) => f.endsWith('.svg')).sort()) {
  const name = file.replace(/\.svg$/, '');
  IMAGES.push({
    src: `${PRODUCT_DIR}/${file}`,
    outputs: [{ name: `products/${name}`, crop: { left: 0, top: 0, width: 1000, height: 1000 }, widths: [240, 480, 800], jpeg: [480] }],
  });
}

const FORMATS = [
  ['avif', (img) => img.avif({ quality: 52, effort: 6 })],
  ['webp', (img) => img.webp({ quality: 74, effort: 6 })],
  ['jpg', (img) => img.jpeg({ quality: 78, mozjpeg: true })],
];

for (const { src, outputs } of IMAGES) {
  const master = await sharp(join(root, src), { density: 72 }).png().toBuffer();
  for (const { name, crop, widths, jpeg } of outputs) {
    const cropped = await sharp(master).extract(crop).toBuffer();
    for (const width of widths) {
      for (const [ext, encode] of FORMATS) {
        if (ext === 'jpg' && jpeg && !jpeg.includes(width)) continue;
        const out = join(root, 'assets/images', `${name}-${width}.${ext}`);
        mkdirSync(dirname(out), { recursive: true });
        await encode(sharp(cropped).resize({ width })).toFile(out);
        console.log(`${(statSync(out).size / 1024).toFixed(1).padStart(7)} KB  ${name}-${width}.${ext}`);
      }
    }
  }
}
