/**
 * Rasterize the brand icons and the social share image (dev-time only).
 * Run `python3 tools/brand_assets.py` first; it writes the SVG sources.
 *
 *   npm install --no-save sharp
 *   node tools/build-icons.mjs
 *
 * Outputs (referenced from every page's <head> and from site.webmanifest):
 *   favicon.ico                          32×32 + 16×16, for browsers that ask for /favicon.ico
 *   assets/brand/apple-touch-icon.png    180×180 (iOS home screen)
 *   assets/brand/icon-192.png, icon-512.png, icon-maskable-512.png   (manifest)
 *   assets/brand/og-image.jpg            1200×630 link-preview image
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const at = (path) => join(root, path);
const png = (svg, size) => sharp(at(svg), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

async function save(path, buffer) {
  writeFileSync(at(path), buffer);
  console.log(`wrote ${path} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

/** An .ico is a small directory of embedded PNGs. */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

await save('favicon.ico', ico([
  { size: 32, data: await png('favicon.svg', 32) },
  { size: 16, data: await png('favicon.svg', 16) },
]));
await save('assets/brand/apple-touch-icon.png', await png('assets/brand/icon-maskable.svg', 180)); // iOS rounds corners itself
await save('assets/brand/icon-192.png', await png('assets/brand/icon.svg', 192));
await save('assets/brand/icon-512.png', await png('assets/brand/icon.svg', 512));
await save('assets/brand/icon-maskable-512.png', await png('assets/brand/icon-maskable.svg', 512));

// Share image: the dish illustration from the hero on the right, wordmark panel on the left.
const dish = await sharp(at('assets/images/hero/hero-landscape-1600.jpg')).resize(640, 630, { fit: 'cover', position: 'centre' }).toBuffer();
const og = await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#240910' } })
  .composite([
    { input: dish, left: 560, top: 0 },
    { input: readFileSync(at('assets/brand/og-overlay.svg')), left: 0, top: 0 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toBuffer();
await save('assets/brand/og-image.jpg', og);
