# Funshi Sushi

Website for Funshi Sushi, a Japanese restaurant: digital menu, cart, and ordering by WhatsApp.
Built with plain HTML, CSS and JavaScript modules — no framework, no build step.

> **Status:** in development. The design system (phase 05), home page (phase 06) and digital menu
> (phase 07) are in place; cart and checkout arrive next. The menu is **sample content** — not the
> restaurant's dishes or prices — and says so on every page. Business details (address, hours, WhatsApp
> number, prices) are not provided yet and appear as clearly marked placeholders.

## Run locally

JavaScript modules don't load from `file://`, so serve the folder with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

The design-system reference lives at `/styleguide.html` (not linked, not indexed).

## Tests

```bash
npm test
```

Uses Node's built-in test runner (Node 20+). No packages to install — `package.json` only defines
the test command. The tests cover config/feature logic, color contrast of every approved token pairing,
and project consistency rules (shared header/footer identical on every page, no inline styles or scripts,
no `innerHTML`, every referenced asset and icon exists, CSS layer discipline).

## Structure

```
index.html  menu.html  checkout.html  404.html  styleguide.html
css/          tokens → reset → base → layout → components/* → utilities (cascade layers)
js/           config.js (business facts) · strings.js (UI text) · app.js (shared startup)
  core/       pure logic, no DOM (tested in Node)
  ui/         DOM modules (dom helpers, overlay controller, header, announcer)
  pages/      one entry module per page
  data/       menu.js (categories, tags, dishes — demo data for now)
assets/       fonts (self-hosted, OFL) · icons (Lucide sprite, ISC) · images (AVIF/WebP/JPEG)
tools/        dev-only scripts: illustrations, image pipeline, icon sprite
docs/         phase documents: audit, product brief, brand, UX, architecture, phase reports
tests/        node:test suites
```

## Images

Illustrations are generated from code, and every image ships as AVIF, WebP and JPEG at several widths.
Dev-time only (the site needs none of this):

```bash
python3 tools/illustrations.py        # hero and story SVG sources
python3 tools/product_illustrations.py  # one sample illustration per dish
npm install --no-save sharp
node tools/build-images.mjs           # AVIF/WebP/JPEG for hero, story and every dish
```

When real photos arrive, point `tools/build-images.mjs` at them and keep the output names.

## Editing the menu

Everything on the menu comes from `js/data/menu.js` — categories, labels, allergens and dishes. The file
starts with an editing guide. Prices are whole numbers in the currency's smallest unit (`1890` = 18.90).
Dish images go in `assets/images/products/` (see Images above); a dish without one shows a typographic tile.
When the real menu is in, set `IS_DEMO_MENU = false` to remove the sample notices. Run `npm test` after
editing: it checks the data, and that every referenced image exists.

## Editing business information

All business facts live in `js/config.js`. Each unknown value is `null` with its placeholder name in a
comment — replace it with the real value. Features that depend on a missing value stay switched off;
the site never shows or sends an invented value.

## Credits

- Typefaces: [Shippori Mincho B1](https://github.com/fontdasu/ShipporiMincho) and Zen Kaku Gothic New — SIL Open Font License 1.1 (`assets/fonts/LICENSE-*.txt`).
- Icons: [Lucide](https://lucide.dev) — ISC License (`assets/icons/LICENSE-lucide.txt`).
