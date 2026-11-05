# Design System — Funshi Sushi

**Phase:** 1 — Architecture & Design Foundation
**Status:** Proposed. Awaiting approval.
**Tokens:** `css/tokens.css` · **Fonts:** `css/fonts.css` · **Live specimen:** `docs/design-system/preview.html` (serve the repo root over HTTP and open it)
**Screenshots:** `specimen-desktop.png`, `specimen-mobile.png`

---

## 1. Direction

**Concept: "Ice and nori."** Fish on crushed ice is the oldest sign of freshness at a sushi counter, and nori is the deep green that wraps every roll. The site uses a cool, clean page (ice), deep greens for ink and brand (nori, forest), one bright wasabi accent, a warm cypress-wood neutral for small surfaces, and the original repo's burgundy as a hanko-style seal.

**The one bold element:** large Japanese Mincho display type in the hero and section headings. Everything else stays quiet: few shadows, thin dividers, small radii.

**Avoiding the default look.** We do not use: a cream background with a terracotta accent, dark mode with a neon accent, all-caps labels above every heading, identical rounded cards with the same grey shadow, gradient washes, cherry blossoms, or brush-script fonts. The menu is laid out like a printed menu (rows with thumbnails), not as a grid of product cards.

## 2. Color

### 2.1 Evaluation of the suggested palette

| Suggested | Verdict | Reason |
|---|---|---|
| Forest Green `#004D40` | **Keep** as brand / primary action | 9.3:1 on Ice; reads as nori and wasabi leaf |
| Deep Green `#113912` | **Keep** as text ink and inverse bands | 12.2:1 on Ice. Darker and warmer than Forest, so the two don't compete |
| Mint Accent `#00A88D` | **Keep, restricted** | Only 2.8:1 on Ice and 3.0:1 on white: **fails for text on light backgrounds**. Used for decoration (badges, active underline, status dot) and on dark backgrounds (4.3:1 on Nori). Added `#007A66` (5.0:1) for links on light |
| Ice White `#F2F9FF` | **Keep** as page background | The cool tint supports the freshness story and avoids the generic cream look |
| Warm Neutral (TBD) | **Defined: Hinoki `#E9DFCC`** | Cypress-wood counter color. Used for tags and info panels only, never as a page background. Nori on it: 9.8:1 |
| Charcoal `#121212` | **Demoted** to photo scrims | Deep Green is the text color instead. Charcoal would add a third near-black that competes with Nori |
| *(from repo)* Burgundy `#4B011D` | **Added as "Maguro"** | The original project's only design decision. It becomes the logo seal and the "Chef's pick" badge, used in small doses only |

### 2.2 Final palette

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--color-nori` | `#113912` | Body text, headings, inverse bands | 12.2:1 on Ice |
| `--color-forest` | `#004D40` | Primary buttons, focus ring, brand | 9.3:1 on Ice |
| `--color-wasabi` | `#00A88D` | Decoration, status dot, active nav underline, links on dark | 2.8:1 on Ice ✗ text · 4.3:1 on Nori (large/bold only) |
| `--color-wasabi-ink` | `#007A66` | Links on light | 5.0:1 on Ice |
| `--color-ice` | `#F2F9FF` | Page background, text on dark | — |
| `--color-white` | `#FFFFFF` | Raised surfaces (dialog, drawer, inputs) | — |
| `--color-hinoki` | `#E9DFCC` | Tags, info panels | Nori 9.8:1 |
| `--color-maguro` | `#4B011D` | Seal, "Chef's pick" | Ice on it 15.0:1 |
| `--color-stone` | `#4A5A55` | Muted text, form borders | 6.9:1 on Ice |
| `--color-mist` | `#D5E3E0` | Dividers (non-text) | — |
| `--color-error` | `#B3261E` | Errors | 6.2:1 on Ice |
| `--color-success` | `#1E6B3A` | Confirmations | 6.1:1 on Ice |

Components use **semantic tokens** only (`--text-primary`, `--surface-page`, `--action-primary-bg` …). See `tokens.css` §1b.

### 2.3 Rules

1. Text on light backgrounds: Nori, Stone, Forest or Wasabi ink only.
2. Wasabi is never used for text on light backgrounds.
3. Color is never the only signal: errors also get an icon and text, and the "Open now" status has a text label.
4. Maguro appears at most once per screen area (the seal, or one badge per item).
5. WhatsApp's brand green (`#25D366`) is **not** used. It fails contrast with white text, and the order button is our action, not WhatsApp's. The WhatsApp icon identifies the channel.

## 3. Typography

### 3.1 Evaluation of Poppins and Yantramanav

The brief mentions "existing Poppins and Yantramanav fonts". **Neither is present in the repository** (see `docs/audit/TECHNICAL_AUDIT.md`); the original CSS uses Times New Roman. Both were evaluated as candidates:

| | Poppins | Yantramanav | Verdict |
|---|---|---|---|
| Style | Geometric sans, very round | Roboto-derived grotesque | — |
| Character | Friendly but extremely common on templates and SaaS sites; nothing Japanese or culinary about it | Neutral, closely resembles Roboto/Android UI | Neither says "premium Japanese restaurant" |
| Latin size (400) | 7 KB | 16 KB | Both light |
| Spanish/Portuguese accents | ✓ | ✓ | — |
| Tabular figures | No | No | — |

**Recommendation: replace both** with a pair designed in the Japanese type tradition:

| Role | Family | Why |
|---|---|---|
| Display, H1, H2 | **Shippori Mincho B1** 700 | A Japanese Mincho (the serif style of Japanese books and menus). Its Latin letters have calligraphic contrast and sharp wedge serifs, so it reads as Japanese without imitating brush strokes. Distinctive at large sizes |
| H3, body, UI, prices | **Zen Kaku Gothic New** 400 / 500 / 700 | A Japanese gothic (sans) built to pair with Mincho. Its open, slightly square Latin letters are very readable on small screens and feel calmer than Poppins |

Both are on Google Fonts under the SIL Open Font License. They are **self-hosted** (Latin subset only, ~68 KB for all four files) for speed, privacy and reliability. **Fallback option:** if you prefer to keep Poppins for UI text, it can replace Zen Kaku Gothic with no other changes.

**Known limitation:** none of the four fonts has tabular (fixed-width) figures. Prices are right-aligned in lists and totals, so they still line up visually.

### 3.2 Hierarchy

| Level | Family | Weight | Size (360 → 1280px) | Line height | Use |
|---|---|---|---|---|---|
| Display | Mincho | 700 | 40 → 80px | 1.1 | Hero headline only, max 12 words |
| H1 | Mincho | 700 | 32 → 52px | 1.1 | Page title (404, legal) |
| H2 | Mincho | 700 | 26 → 36px | 1.25 | Section titles: Menu, Our story, Visit us |
| H3 | Gothic | 700 | 20 → 24px | 1.25 | Category names, card and dialog titles |
| Lead | Gothic | 400 | 18 → 20px | 1.6 | Section intros, max 45ch |
| Body | Gothic | 400 | 16 → 17px | 1.6 | Descriptions, story, help text, max 65ch |
| Navigation | Gothic | 500 | 16px | 1.3 | Header links |
| Label | Gothic | 500 | 15px | 1.3 | Form labels; buttons use 700 |
| Caption | Gothic | 400 | 13px | 1.45 | Allergens, photo notes, legal |

Menu item names use H3 weight at body size (17px) so a long list stays calm.

### 3.3 Type rules

- Sentence case everywhere. No all-caps labels.
- No single highlighted word inside a headline.
- Sizes in `rem`, so the visitor's browser font-size setting is respected.
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs (ignored safely by older browsers).

## 4. Spacing

4px base, nine steps. Components use the scale; arbitrary values are not allowed.

| Token | rem | px | Typical use |
|---|---|---|---|
| `--space-1` | 0.25 | 4 | Icon–text gap, badge padding |
| `--space-2` | 0.5 | 8 | Button vertical padding, tag padding |
| `--space-3` | 0.75 | 12 | Gap between buttons |
| `--space-4` | 1 | 16 | Menu row padding, paragraph spacing |
| `--space-5` | 1.5 | 24 | Field spacing, button horizontal padding |
| `--space-6` | 2 | 32 | Group spacing |
| `--space-7` | 3 | 48 | Heading → content in large sections |
| `--space-8` | 4 | 64 | — |
| `--space-9` | 6 | 96 | — |
| `--section-space` | fluid | 56 → 112 | Vertical padding of each page section |
| `--gutter` | fluid | 16 → 40 | Side padding of containers |

## 5. Layout

| Token | Value | Use |
|---|---|---|
| `--container-text` | 42rem (672px) | Story, checkout form, menu list on desktop |
| `--container` | 72rem (1152px) | Default section width |
| `--container-wide` | 84rem (1344px) | Hero, header, footer |
| `--header-height` | 4rem (64px) | Sticky header; used for `scroll-margin-top` |
| `--tap-target` | 2.75rem (44px) | Minimum interactive size |

Breakpoints are in `RESPONSIVE_STANDARDS.md`.

## 6. Shape and depth

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 4px | Buttons, inputs, tags, stepper |
| `--radius-md` | 8px | Photos, dialog, info panels |
| `--radius-lg` | 16px | Top corners of the mobile bottom sheet |
| `--radius-round` | 999px | Cart count badge only |

Radii follow hierarchy: small controls are nearly square and containers are softer. Nothing is pill-shaped except the count badge.

**Shadows only on things that float:** `--shadow-raised` (sticky mobile cart bar) and `--shadow-overlay` (drawer, dialog). Cards and menu rows sit flat on the page and are separated by dividers. Shadows are tinted with Nori instead of grey.

## 7. Components

Visual specs are in the specimen; full behavior is built in later phases.

### Buttons

| Variant | Look | Use |
|---|---|---|
| Primary | Forest fill, Ice text, bold | One per view: "Add to order" in dialog, "Send order on WhatsApp" |
| Secondary | 2px Forest outline, Forest text | "Add" in menu rows, "View details", "Cart" |
| Ghost | Text only, underline on hover | "Remove", "Clear cart", "Cancel" |

- Minimum 44px tall; label 15px bold.
- Hover: Primary darkens to Nori, Secondary gains a white fill. Takes 120ms.
- Disabled: 45% opacity plus `disabled` attribute; an adjacent text explains why (for example "Add at least one item").
- Labels say what happens: "Add to order", "Send order on WhatsApp". Never "Submit", "Click here" or a trailing "→".

### Links

- Inline links: Wasabi ink, underlined, `text-underline-offset: 0.2em`.
- On dark: Wasabi, bold, underlined.
- Navigation links: Nori, no underline. The current section gets a 2px Wasabi underline and `aria-current="true"`.

### Focus

`outline: 2px solid var(--focus-ring)`, offset 3px, on `:focus-visible` only. On dark backgrounds the ring is Wasabi. Never `outline: none` without a replacement.

### Menu item (row, not card)

```
┌──────────┬─────────────────────────────────────────┐
│  photo   │ Salmon nigiri (2 pcs)          $ 0.000  │
│   1:1    │ One-line description in muted text      │
│          │ [Fish] [Sesame] [Chef's pick]           │
│          │                               [ Add ]   │
└──────────┴─────────────────────────────────────────┘
───────────────────────── divider ───────────────────
```

- After the first "Add", the button becomes a quantity stepper (− 1 +).
- Tapping the photo or name opens the product dialog.
- Thumbnail 88px on mobile, 120px from 640px.
- From 960px the list becomes two columns; still rows, not cards.

### Tags

Hinoki background, Nori text, 13px, 4px radius. Used for allergens and diet. "Chef's pick" uses Maguro.

### Quantity stepper

44 × 44 buttons, value in an `<output>`, group labelled "Quantity for {product}". Range 1–20; at 1 the "−" becomes "Remove".

### Segmented control (delivery / pickup)

Native radio buttons inside labels; the selected option has a Forest fill. Keyboard: arrow keys, inherited from native radios.

### Form fields

- Label above the field, 15px medium. Optional fields are marked "(optional)"; required ones aren't starred.
- 44px minimum height, 1px Stone border, white fill.
- Errors: 2px red border, message below linked with `aria-describedby`, and `aria-invalid="true"`. Validated on blur and on submit; on submit, focus moves to the first invalid field.
- Correct `autocomplete`, `inputmode` and `type` on each field (`tel`, `name`, `street-address`).

### Inverse band

Nori background, Ice text. Used once or twice per page (hours and location, footer) to give the page rhythm.

### Overlays

- **Product dialog:** native `<dialog>`, white, `--radius-md`, overlay shadow, scrim `rgb(18 18 18 / 55%)`.
- **Cart:** bottom sheet on mobile (full height, `--radius-lg` top corners), right-side drawer 420px wide from 960px.
- **Toast:** Nori background, bottom-center, `aria-live="polite"`, auto-hides after 3 seconds.

### Logo (provisional)

A Maguro square seal with a Mincho "F", plus the wordmark "Funshi Sushi" in Mincho 700. It will be replaced by the real logo if one exists (blocker B6).

## 8. Image ratios

| Token | Ratio | Use |
|---|---|---|
| `--ratio-dish` | 1:1 | Menu thumbnails |
| `--ratio-detail` | 4:3 | Product dialog |
| `--ratio-hero-mobile` | 4:5 | Hero photo below 960px |
| `--ratio-hero` | 16:9 | Hero photo from 960px (or 4:5 in a split layout) |
| `--ratio-ambience` | 3:2 | Story and restaurant photos |

All images use `aspect-ratio` plus `object-fit: cover` and have explicit `width`/`height` to prevent layout shift. Dish photos are shot or cropped top-down or at 45°, with the dish centered so a square crop works.

## 9. Section spacing

- Every top-level section: `padding-block: var(--section-space)` (56 → 112px).
- Section heading to content: `--space-6` (32px). Lead paragraph to content: `--space-5`.
- Sections are separated by background change (Ice → Nori band → Ice) or a 1px Mist divider, never both.
- Anchor targets get `scroll-margin-top: calc(var(--header-height) + var(--space-4))` so the sticky header doesn't cover headings.

## 10. Motion

**Principle: motion answers actions.** The page is calm while you read; things move when you act.

| Moment | Motion | Duration |
|---|---|---|
| Hover / press on buttons | Background color change | 120ms |
| Add to cart | Cart count badge scales 1 → 1.2 → 1 once; toast appears | 200ms |
| Drawer / sheet / dialog | Slide + fade in, reverse out | 320ms, `--ease-out` |
| Category chip change | Instant content swap, no animation | — |
| Page load | One moment only: the hero headline fades in | 320ms |

- **Not used:** scroll-triggered fade-ins on every section, parallax, carousels that move on their own, hover lift on cards.
- `prefers-reduced-motion: reduce` sets all durations to 0ms (already in `tokens.css`).
- Only `transform` and `opacity` are animated, for smooth 60fps performance.

## 11. Voice (UI copy)

Plain, warm, specific. Buttons say what they do. Errors say how to fix the problem ("Enter a phone number with area code"). An empty cart invites action ("Your order is empty. Start with the menu."). Copy language is still pending (blocker B2).
