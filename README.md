# Funshi Sushi

Website for Funshi Sushi, a Japanese restaurant: digital menu, cart, and ordering by WhatsApp.
Built with plain HTML, CSS and JavaScript modules — no framework, no build step.

> **Status:** in development. Design system, home page, digital menu, cart, checkout with
> WhatsApp ordering, interactions and motion, and SEO and accessibility are in place (phases 05–11).
> **Ordering is switched off until the restaurant's WhatsApp number is added** to `js/config.js`; the menu
> is sample content and says so on every page; **search engines are asked not to index** the preview.

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

## Motion

Animations are short (140–420 ms) and use only `opacity` and `translate`/`scale`.
With *reduce motion* turned on in the operating system, everything still works with no movement:
`css/base.css` cuts every animation and transition to 1 ms and turns off smooth scrolling.
Overlays (cart, dish details, mobile menu) animate in and out; browsers without
`transition-behavior: allow-discrete` support close them at once, without the exit animation.

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

## Turning on WhatsApp ordering

Set `whatsappNumber` in `js/config.js` to the restaurant's number — digits only, with country code
(e.g. `5511999999999`). Until then the checkout explains that ordering isn't set up and sends nothing.
Optional settings in the same file: delivery fee or zones, free-delivery threshold, minimum order,
payment methods, opening hours and what happens when the restaurant is closed (`outOfHoursPolicy`:
`warn` or `block`).

What the customer gets: WhatsApp opens with the order written out as a **request**; the page tells them
the order is confirmed only when the restaurant replies. Nothing is paid or stored on a server.

## How the cart stores data

The cart is saved in the browser (`localStorage`, key `funshi.cart.v1`) with only the dish id, size,
quantity and notes. Prices and totals are **never** stored or read back: they are recalculated from
`js/data/menu.js` every time, and a saved cart is re-checked against the current menu on every page
(dishes removed from the menu disappear, unavailable ones block checkout, quantities are capped by
`limits` in `js/config.js`).

## Editing business information

All business facts live in `js/config.js`. Each unknown value is `null` with its placeholder name in a
comment — replace it with the real value. Features that depend on a missing value stay switched off;
the site never shows or sends an invented value.

## Publishing: search engines and link previews

Canonical URLs, link-preview images (`og:image`), `sitemap.xml` and the `<base>` on the 404 page need the
site's real address, so they are generated, never written by hand:

1. In `js/config.js`, set `site.url` to the home page's full address, for example
   `'https://www.example.com/'` or `'https://user.github.io/Funshi-Sushi/'`.
2. At launch, once the menu and business facts are real, set `site.allowIndexing: true`.
3. Run `node tools/build-seo.mjs`. It updates the marked `<!-- seo:start -->` block in each page,
   `robots.txt` and `sitemap.xml`, and warns about facts still missing from the structured data.

`npm test` fails if the pages are out of date with the config (it runs the same generator).

What the generator writes, and what it never does:

| | Preview (shipped) | Launched |
|---|---|---|
| `<meta name="robots">` on home/menu | `noindex` | none (indexable) |
| Canonical, `og:url`, `og:image` | none (no invented domain) | absolute URLs |
| `sitemap.xml` | none | home + menu |
| Restaurant JSON-LD (home) | name and cuisine only | + URL, logo, and the address, phone and hours **from the config** |
| Menu JSON-LD | none (sample menu) | sections, dishes, prices **from `menu.js`**, once `IS_DEMO_MENU` is false and the currency is set |

It never writes ratings, reviews, price ranges or reservation claims.
The checkout, 404 and design-system pages are always `noindex`.

**GitHub Pages project sites:** search engines only read `robots.txt` at the root of a domain
(`user.github.io/robots.txt`), so the copy in this folder only takes effect on a custom domain. The pages'
own `noindex` tags and canonical URLs work everywhere.

Icons and the share image are generated from the brand fonts (text drawn as outlines, so they look the
same everywhere): `python3 tools/brand_assets.py`, then `node tools/build-icons.mjs` (needs `sharp`).

## Credits

- Typefaces: [Shippori Mincho B1](https://github.com/fontdasu/ShipporiMincho) and Zen Kaku Gothic New — SIL Open Font License 1.1 (`assets/fonts/LICENSE-*.txt`).
- Icons: [Lucide](https://lucide.dev) — ISC License (`assets/icons/LICENSE-lucide.txt`).
