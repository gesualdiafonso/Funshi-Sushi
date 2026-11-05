# Funshi Sushi — Phase 02 Brand Guidelines

| | |
|---|---|
| **Phase** | 02 — Brand Identity & Art Direction |
| **Date** | 2026-11-04 |
| **Depends on** | `AUDIT_REPORT.md`, `PRODUCT_BRIEF.md` |
| **Status** | Proposal — **awaiting approval before the full design system is implemented** |

---

## 1. Concept: *Urushi & Shari* (lacquer and rice)

A sushi meal is a rhythm of contrasts: the dark lacquered tray and the pale rice, the deep red of tuna and the small green dab of wasabi, the precise cut of the knife and the soft shape formed by the hand.

The identity is built from those materials of the sushi counter itself. It deliberately avoids the visual shorthand usually used to say "Japanese".

**The idea in one sentence:** the website behaves like a well-run counter. The surfaces are calm and dark, the food brings the color, and every detail is placed with intent.

### Design principles

| # | Principle | What it means in practice |
|---|---|---|
| 1 | **Lacquer and rice** | The page alternates between deep lacquer sections (arrival, story, footer) and rice-white sections (menu, checkout), where reading and form-filling need calm and light. |
| 2 | **A little wasabi** | The green accent is a signal, never a decoration. It marks focus, "added to cart", "open now", and selected states. If it appears more than a few times on one screen, something is wrong. |
| 3 | **The cut** | Things you look at (photos, sections, content panels) have precise, nearly square edges. Things you touch (buttons, chips, quantity steppers) are softer, like rice shaped by hand. |
| 4 | **Food is the color** | The interface stays restrained so that photography provides the saturation. There are no gradients, decorative patterns or colored washes. |
| 5 | **Read like a menu** | Use real menu conventions (prices aligned in a column, dot leaders, piece counts) instead of generic web-card styling. |
| 6 | **Japanese used correctly, or not at all** | No fake-Japanese fonts, brush-stroke textures or invented "kanji". Japanese script appears only where it is accurate, verified and useful (see section 4.5). |

### Directions considered and rejected

| Rejected direction | Why |
|---|---|
| Cherry blossoms, red sun disc, Great Wave pattern, bamboo, paper-lantern red | These are tourist shorthand. They say "generic Japanese restaurant", not *this* restaurant. |
| Brush-stroke or "chop-suey" display fonts | Pastiche that reads as dated or stereotyping |
| Near-black background with a single vermilion accent | A common template look. Vermilion would also clash with the brand burgundy. |
| Warm cream background with a terracotta accent and a high-contrast serif | Currently a very common generated-site look. Terracotta is not a sushi color. |
| Minimal "zen" all-white with hairline rules everywhere | Cold, low-appetite, and it throws away the brand burgundy |
| Identical rounded cards with soft grey shadows | The SaaS look; it doesn't read like a restaurant menu |
| Hanko (red seal) logo | Authentic in Japan, but now a cliché in Western Japanese-themed branding. It would also add another red to the burgundy. |

---

## 2. Existing Logo Analysis

| Finding | Detail |
|---|---|
| **Logo file** | **None exists.** `styles.css` references `../Fenshu Sushi/#logo-imag`, which is outside the repository and is not a valid file path (see `AUDIT_REPORT.md` §6.1). |
| **Intended treatment** | A 150×150 px background image in the header. That is too large for mobile, and background images are invisible to screen readers. |
| **Name consistency** | Three spellings appear: Funshi / Suriname / Fenshu. **Must be confirmed.** |
| **Reusable equity** | None in the logo itself. The brand equity worth keeping is the burgundy color. |

### Name caution — please verify with a native speaker

Read in Japanese, *ふんし (funshi)* can correspond to the word **憤死**, meaning roughly "dying of indignation". It is also a baseball term for a runner put out. In everyday use the brand is read in Latin script and this is unlikely to matter. Still, it is the main reason this guide recommends **never writing the brand name in Japanese script** unless a native speaker confirms an intended spelling.

### Recommended logo direction (for approval)

**A — Wordmark only (recommended for v1)**
- "Funshi" set in **Shippori Mincho B1, weight 600**, letter-spacing +0.02em, with "Sushi" beneath in Zen Kaku Gothic New 500 at about 28% of the cap height.
- Supplied as an inline SVG, so it scales cleanly and inherits `currentColor` (shari on dark, akami on light).
- **Favicon / app icon:** a single "F" in Shippori Mincho, shari on an akami square with a 2px corner radius.

**B — Wordmark + "cut" mark (optional exploration)**
- A small mark: a horizontal slab (the fish) resting on a softer rounded base (the rice). These are two geometric shapes taken directly from a nigiri, abstract enough not to be clip-art.
- Only worth pursuing if the owner wants a symbol for packaging or social media avatars.

A professional logo designed by a human designer would replace either option. These are web-ready interim marks.

---

## 3. Color

### 3.1 Evaluation of the existing colors

| Existing | Hex | Verdict |
|---|---|---|
| Burgundy (header) | `#4b011d` | **Keep.** It reads as *akami* (lean bluefin tuna) and *urushi* (red lacquer), a color with real meaning in sushi culture. It becomes the primary brand color. |
| Beige (page background) | `#a79986` | **Evolve.** Too dark and muddy for a full-page background. It is lightened and refined into *Kinari* (unbleached tone), used for secondary text on dark surfaces. |
| Brown (`brown`) text | `#a52a2a` | **Drop.** It fails contrast on every existing background (2.24–2.54:1) and competes with the burgundy. |

### 3.2 Core palette

| Token | Name | Hex | Role |
|---|---|---|---|
| `--color-urushi` | Urushi (lacquer) | `#240910` | Darkest surface: hero, header, footer, overlays. Main ink color on light surfaces. A red-black, not a neutral grey-black. |
| `--color-akami` | Akami (tuna red) | `#4B011D` | **Brand color.** Primary buttons on light surfaces, headings on light, wordmark, active navigation, focus ring on light. |
| `--color-akami-hover` | Akami, raised | `#62102C` | Hover/pressed state of akami fills; alternate dark section surface |
| `--color-shari` | Shari (sushi rice) | `#F2EEE8` | Main light surface (menu, checkout); text on dark surfaces |
| `--color-shari-deep` | Shari, shaded | `#E6DFD5` | Secondary light surface: alternating menu bands, input fills, summary panel |
| `--color-kinari` | Kinari (unbleached) | `#B8A994` | Secondary text and metadata on dark surfaces (evolved from the original `#a79986`) |
| `--color-stone` | Stone | `#6E5F5C` | Secondary text and metadata on light surfaces; input borders |
| `--color-wasabi` | Wasabi | `#A9B96B` | **Signal accent on dark surfaces:** focus ring, "open now", "added", selected filter |
| `--color-wasabi-deep` | Wasabi, deep | `#56632A` | Same signal role on light surfaces, where the light wasabi has too little contrast |

### 3.3 Functional colors

| Token | Hex | Use |
|---|---|---|
| `--color-error` | `#A3231B` | Error text and icons on light surfaces |
| `--color-error-on-dark` | `#F0998C` | Error text on dark surfaces |
| `--color-line` | `#D6CCBF` | Decorative dividers and dot leaders on light surfaces |
| `--color-line-on-dark` | `#4A2A30` | Decorative dividers on dark surfaces |

**Rules for functional colors**
- Errors are never shown by color alone: there is always an icon plus a text message. This matters because the error red sits close to the brand burgundy.
- Success uses wasabi-deep (light surfaces) or wasabi (dark), always with text ("Added to your order").
- Decorative lines are deliberately low contrast. Borders of form controls use `--color-stone` (5.26:1), which passes the 3:1 requirement for UI component boundaries.

### 3.4 Approved pairings (WCAG 2.1, computed)

| Foreground | Background | Ratio | Approved for |
|---|---|---|---|
| Shari | Urushi | **16.20** | All text |
| Shari | Akami | **13.75** | All text, primary buttons |
| Shari | Akami hover | **11.15** | All text |
| Urushi | Shari | **16.20** | Body text on light |
| Urushi | Shari deep | **14.16** | Body text on light |
| Akami | Shari | **13.75** | Headings and links on light |
| Kinari | Urushi | **8.15** | Secondary text on dark |
| Kinari | Akami | **6.92** | Secondary text on akami |
| Stone | Shari | **5.26** | Secondary text on light, input borders |
| Stone | Shari deep | **4.60** | Secondary text (minimum; prefer on shari) |
| Wasabi | Urushi | **8.77** | Signal text, focus ring on dark |
| Urushi | Wasabi | **8.77** | Text on a wasabi badge |
| Wasabi deep | Shari | **5.65** | Signal text on light |
| Error | Shari | **6.46** | Error messages |
| Error on dark | Urushi | **8.60** | Error messages on dark |

**Not allowed**

| Pair | Ratio | Why |
|---|---|---|
| Wasabi on shari | 1.85 | Unreadable. Use wasabi deep instead. |
| Akami on urushi | 1.18 | These are two *surface* tones, never text and background. |
| Any text in `--color-line` | ~1.4 | Lines are decoration only. |

### 3.5 Color distribution

```
Dark sections   ████████████████████ urushi / akami        ~ 40% of the page
Light sections  ████████████████████ shari / shari deep    ~ 55%
Accent          █                    wasabi                 < 2%  — "a little wasabi"
Color from photography               fills the rest
```

### 3.6 Dark mode

The site already alternates dark and light sections by design. Version 1 does **not** follow the operating system's dark mode, so the brand rhythm stays the same for everyone. A full dark theme for the light sections (menu and checkout on urushi) is noted as a *Could* for a later version. The token structure in section 11 already supports it.

---

## 4. Typography

### 4.1 Typefaces

| Role | Typeface | Source | Why |
|---|---|---|---|
| **Display & headings** | **Shippori Mincho B1** (500, 600, 700) | Google Fonts, OFL licence | A real Japanese *Mincho* typeface (the Japanese counterpart of an old-style serif) by a Japanese type foundry. Its Latin letters have the brush-derived contrast and sharp entry strokes of Japanese book typography, so it carries Japanese heritage through craft instead of costume. |
| **Body & interface** | **Zen Kaku Gothic New** (400, 500, 700) | Google Fonts, OFL licence | A Japanese gothic (sans-serif) whose Latin letters are calm and open. It is designed to sit next to Mincho faces, so the pairing is natural, and it reads clearly at small sizes on phones. |
| **Fallback stack (display)** | `"Shippori Mincho B1", "Hiragino Mincho ProN", "Yu Mincho", Georgia, serif` | System | Fallbacks of similar character |
| **Fallback stack (body)** | `"Zen Kaku Gothic New", "Hiragino Sans", "Yu Gothic", system-ui, sans-serif` | System | |

**Why not the usual choices?** Playfair, Cormorant, Inter and Poppins are the default pairings on thousands of restaurant templates. Choosing two Japanese-designed families gives a quieter and more specific identity, and it keeps the option open to set correct Japanese text in matching type (section 4.5).

### 4.2 Technical verification — to be confirmed in Phase 03

These are risks to test, not assumptions:
- **Accented characters** (ã, ç, é, ñ, ü, etc. for Portuguese or Spanish): both families list a `latin-ext` subset. This must be tested against the confirmed site language before final approval.
- **File size:** Google Fonts splits these families into `unicode-range` slices, so a Latin-only page should download only the Latin slices. The target is ≤ 100 KB of font files on first load. Measure, and limit the weights loaded if needed.
- **Tabular (fixed-width) figures for prices:** check `font-variant-numeric: tabular-nums` support. If it's missing, price columns are aligned by layout instead.
- Load with `display=swap` and a fallback metrics override (`size-adjust`) so that text doesn't shift when the web font arrives.

### 4.3 Type scale

The base size is **17px body** on mobile and desktop: generous, because many customers read the menu one-handed on a phone. The scale uses a **1.2 ratio on mobile, growing to 1.333 on wide screens**, interpolated with `clamp()` so there is no jump at a breakpoint.

| Token | Mobile (≈360 px) | Desktop (≈1440 px) | Proposed `clamp()` |
|---|---|---|---|
| `--text-display` | 44 px | 88 px | `clamp(2.75rem, 1.83rem + 4.07vw, 5.5rem)` |
| `--text-h1` | 36 px | 60 px | `clamp(2.25rem, 1.75rem + 2.22vw, 3.75rem)` |
| `--text-h2` | 29 px | 44 px | `clamp(1.8125rem, 1.5rem + 1.39vw, 2.75rem)` |
| `--text-h3` | 22 px | 26 px | `clamp(1.375rem, 1.29rem + 0.37vw, 1.625rem)` |
| `--text-h4` | 19 px | 20 px | `clamp(1.1875rem, 1.17rem + 0.09vw, 1.25rem)` |
| `--text-body` | 17 px | 17 px | `1.0625rem` |
| `--text-small` | 15 px | 15 px | `0.9375rem` |
| `--text-caption` | 13 px | 13 px | `0.8125rem` |

The smallest text that can carry required information (prices, errors, form labels) is **15 px**. 13 px is used only for supplementary captions.

### 4.4 Heading hierarchy and text styles

| Style | Typeface / weight | Size | Line height | Letter spacing | Use |
|---|---|---|---|---|---|
| **Display** | Mincho 500 | `--text-display` | 1.05 | −0.015em | Hero only; one per site |
| **H1** | Mincho 600 | `--text-h1` | 1.1 | −0.01em | Page title; one per page |
| **H2** | Mincho 600 | `--text-h2` | 1.15 | −0.005em | Section titles; menu category titles |
| **H3** | Mincho 600 | `--text-h3` | 1.25 | 0 | Product names, sub-sections |
| **H4** | Gothic 700 | `--text-h4` | 1.3 | 0 | Form groups, footer columns, summary headings |
| **Body** | Gothic 400 | `--text-body` | 1.65 | 0 | Paragraphs, descriptions |
| **Body strong** | Gothic 700 | `--text-body` | 1.65 | 0 | Inline emphasis |
| **Lead** | Gothic 400 | 1.25rem | 1.55 | 0 | Section introductions (one per section at most) |
| **Small** | Gothic 400/500 | `--text-small` | 1.5 | 0.005em | Metadata, piece counts, helper text |
| **Price** | Gothic 500, tabular figures | `--text-body` (cards), `--text-h4` (totals) | 1.3 | 0 | All monetary values |
| **Label** | Gothic 500 | `--text-small` | 1.4 | 0.01em | Form labels, button text, chips |
| **Caption** | Gothic 400 | `--text-caption` | 1.45 | 0.01em | Photo credits, "illustrative image" notes |

### 4.5 Typography rules

- **Sentence case everywhere.** No all-caps labels and no tracked-out "eyebrow" text above headings. A heading that needs a label above it is the wrong heading.
- **No single-word emphasis in headlines.** No one italic or colored word for effect.
- **Line length:** body text at most **65 characters** (`max-width: 65ch`), lead text at most 55 characters.
- **Alignment:** left-aligned throughout. Centered text only for the 404 page and short empty states. Never justified, because Latin text without careful hyphenation develops gaps.
- **Prices:** same weight and size within a list and aligned to the right edge, with a dot leader on menu lines (section 6.3).
- **Numerals and units:** "10 pcs" style with a non-breaking space between number and unit.
- **Japanese script** (optional, needs approval):
  - Allowed only for **menu category names** in their standard, verified form, for example *Nigiri* 握り or *Sashimi* 刺身.
  - It is set in Shippori Mincho and marked `lang="ja"`.
  - It is always secondary to the Latin name and hidden from screen readers (`aria-hidden="true"`) when it duplicates that name.
  - Every term is checked by a native speaker before launch. If unverified, it is left out.

---

## 5. Layout & Visual Language

### 5.1 Editorial grid

| Breakpoint | Columns | Outer gutter | Column gap | Content max-width |
|---|---|---|---|---|
| < 640 px (base) | 4 | 16 px | 16 px | 100% |
| ≥ 640 px | 8 | 24 px | 24 px | 100% |
| ≥ 1024 px | 12 | 40 px | 24 px | 1240 px |
| ≥ 1440 px | 12 | auto (centered) | 32 px | 1240 px |

Breakpoints are content-driven, adjusted where the layout actually breaks. The table gives the defaults.

### 5.2 Composition

Layouts are **asymmetric and left-weighted**, like an editorial food magazine rather than centered stacks of blocks. Images and text overlap the grid in places so the page has depth and pace.

**Home hero (desktop)**

```
┌──────────────────────────────────────────────────────────────┐
│ Funshi                         Menu   Story   Visit   Cart 2 │  urushi header
├──────────────────────────────────────────────────────────────┤
│                                  ┌─────────────────────────┐ │
│  Funshi                          │                         │ │
│  Sushi                           │   top-down photograph   │ │  urushi field
│                                  │   of one signature      │ │
│  Fresh sushi, made with care,    │   piece on dark ceramic │ │
│  ordered in a few taps.          │   (bleeds off the edge) │ │
│                                  │                         │ │
│  [ See the menu ]  Open now ●    │                         │ │
│                                  └─────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Home hero (mobile)**: the photograph comes first at full width, with the 4:5 crop. The display name overlaps the bottom edge of the photograph, and the call to action is reachable by thumb.

**Menu (desktop)**

```
┌──────────┬───────────────────────────────────────────────────┐
│ Nigiri   │ Nigiri                                   握り      │ shari
│ Uramaki ●│ ─────────────────────────────────────────────────  │
│ Hot rolls│ [img] Salmon nigiri ·············· $ 0.000        │
│ Sashimi  │       Two pieces, lightly torched     [ Add ]     │
│ Combos   │ [img] Tuna nigiri ················ $ 0.000        │
│ Drinks   │       Two pieces                      [ Add ]     │
│          │                                                   │
│ sticky   │ Uramaki                                   …       │
│ category │                                                   │
│ rail     │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

On mobile, the category rail becomes a horizontally scrollable row of chips that sticks below the header.

**The memorable element.** Boldness is spent in one place: **the menu itself.** It is set like a printed menu, with Mincho dish names, dot leaders and right-aligned prices, rather than as a grid of identical web cards. Everything around it stays quiet. A compact card view (image-led) is kept as an alternative layout for featured dishes on the home page only.

### 5.3 Surfaces and depth

| Level | Use | Treatment |
|---|---|---|
| 0 — Surface | Sections | Flat urushi or shari fills; **no gradients** |
| 1 — Inset | Inputs, order summary panel | `shari-deep` fill, no shadow |
| 2 — Raised | Sticky header once scrolled | Soft shadow tinted with urushi: `0 1px 0 rgba(36,9,16,.08), 0 8px 24px -12px rgba(36,9,16,.35)` |
| 3 — Overlay | Cart drawer, product dialog | Larger tinted shadow + backdrop `rgba(36,9,16,.6)` |

Shadows always use a tint of urushi, never neutral grey, and they appear only where something truly sits *above* the page.

### 5.4 Motion

| Rule | Value |
|---|---|
| Durations | `--dur-fast 140ms` (hover, press) · `--dur-base 240ms` (drawer, dialog) · `--dur-slow 420ms` (hero reveal) |
| Easing | `--ease-out cubic-bezier(.2,.7,.2,1)` entering · `--ease-in cubic-bezier(.4,0,1,1)` leaving |
| **One** orchestrated moment | On page load, the hero photograph settles from slightly scaled-up (1.03 → 1) while the wordmark fades in. Nothing else animates on load or on scroll. |
| Responsive motion | The cart drawer slides in; the product dialog fades and rises 8 px; the cart count gives a brief "bump" when an item is added. |
| Not used | Fade-and-slide entrances on every section, parallax, hover lifts on every card, looping animations |
| Reduced motion | With `prefers-reduced-motion: reduce`, every movement becomes an instant change or a ≤ 100 ms opacity change |

---

## 6. Image Direction

### 6.1 Photography style

| Aspect | Direction |
|---|---|
| **Light** | A single soft key light from the side, like a sushi counter's overhead or window light. Deep, natural shadows; never flat and evenly lit. |
| **Angles** | **Top-down** for individual pieces and platters; **45°** for rolls and cross-sections; **close crops of hands** (knife work, shaping rice) for the story section |
| **Surfaces** | Dark glazed stoneware, unvarnished light wood, slate. One surface family per menu category so each category looks consistent. |
| **Color** | The fish, garnish and rice provide the color. Grade warm in the shadows and neutral in the whites. No heavy filters and no oversaturation. |
| **Composition** | Generous negative space on one side (room for text in the hero and story); the subject slightly off-center |
| **Honesty** | **Product photos must show the actual dish, at the actual portion size.** |

### 6.2 Avoid

Crossed chopsticks, cherry blossoms, bamboo mats used as backdrops, fans, lanterns, kimono, stock models eating, text set over busy photos, steam or smoke added digitally, any image of a dish that isn't on the menu.

### 6.3 Placeholder policy (until real photography exists)

| Context | Placeholder |
|---|---|
| **Product images** | **A typographic tile, not a stock photo.** The dish name in Mincho on a shari-deep or akami tile, with a subtle cut-line motif. A stock photo of someone else's sushi would misrepresent what the customer receives. |
| **Atmosphere** (hero, story) | Licensed stock imagery (e.g. the Unsplash licence) is allowed, captioned "Illustrative image" and listed in an image-credits file |
| **Removal** | Every placeholder is tracked in the content data so that replacing it is a data edit |

### 6.4 Technical specification

| Use | Aspect ratio | Delivered widths | Format |
|---|---|---|---|
| Hero | 4:5 (mobile) / 5:4 (desktop) via `<picture>` | 480, 800, 1200, 1600 | AVIF → WebP → JPEG |
| Product, menu line | 1:1 | 160, 320 | AVIF → WebP → JPEG |
| Product, detail dialog | 4:5 | 480, 800 | AVIF → WebP → JPEG |
| Story / editorial | 3:2 | 640, 1024, 1600 | AVIF → WebP → JPEG |
| Open Graph image | 1200×630 | — | JPEG |

- Every image has explicit `width` and `height` attributes (so the layout doesn't shift while loading).
- `loading="lazy"` on everything except the hero; `fetchpriority="high"` on the hero image.
- Alt text describes the dish ("Two pieces of salmon nigiri on a dark ceramic plate"), not the brand.

---

## 7. Icon Style

| Aspect | Standard |
|---|---|
| **Set** | **Lucide** (ISC licence), as individual inline SVGs. Only the icons actually used are copied into the project; the full library is not loaded. |
| **Stroke** | 1.75 px at 24 px, which matches the weight of Zen Kaku Gothic New 500 |
| **Caps & joins** | Round (Lucide default) |
| **Sizes** | 16 px (inline with small text) · 20 px (buttons, inputs) · 24 px (navigation, cart) |
| **Color** | `currentColor` only, inheriting the text color |
| **Accessibility** | An icon is never the only carrier of meaning. Icon-only buttons (cart, close, quantity ±) have `aria-label` and a minimum 44×44 px target. Decorative icons have `aria-hidden="true"`. |
| **Dietary labels** | **Text first** ("Vegetarian", "Spicy"); an icon may accompany the text but never replaces it |
| **WhatsApp glyph** | Lucide does not ship brand logos. The official WhatsApp glyph is used only where WhatsApp's brand guidelines allow (identifying the channel, next to the text "WhatsApp"), in monochrome `currentColor`. The button keeps the Funshi primary style, not WhatsApp green. |
| **Not used** | Filled or two-tone icon sets, emoji as icons, decorative "Japanese" icon packs |

**Initial inventory:** `shopping-bag` (cart), `plus`, `minus`, `x`, `search`, `sliders-horizontal` (filters), `map-pin`, `clock`, `phone`, `message-circle`, `chevron-down`, `chevron-left`, `chevron-right`, `trash-2`, `check`, `alert-circle`, `info`, `menu` (mobile nav), `bike` (delivery), `store` (pickup), `flame` (spicy), `leaf` (vegetarian).

---

## 8. Spacing

### 8.1 Scale (4 px base)

| Token | Value | Typical use |
|---|---|---|
| `--space-1` | 4 px | Icon-to-text gap inside small chips |
| `--space-2` | 8 px | Icon-to-label gap in buttons; tight stacks |
| `--space-3` | 12 px | Label-to-input gap; chip padding |
| `--space-4` | 16 px | Mobile gutter; default stack gap; card padding (mobile) |
| `--space-5` | 24 px | Gap between form fields; between menu lines |
| `--space-6` | 32 px | Card padding (desktop); between sub-sections |
| `--space-7` | 48 px | Heading-to-content gap in sections |
| `--space-8` | 64 px | Section padding (mobile) |
| `--space-9` | 96 px | Section padding (tablet) |
| `--space-10` | 128 px | Section padding (desktop) |

### 8.2 Principles

1. **Proximity before borders.** Related items are grouped by spacing first. A line is added only when spacing alone can't separate them.
2. **Section rhythm uses fluid tokens:** `--section-space: clamp(var(--space-8), 4rem + 4vw, var(--space-10))`.
3. **Vertical rhythm comes from the parent.** Parents set the gap between children (with `gap` or a stack utility), and components carry no outer margin. This prevents the margin conflicts listed in the audit.
4. **Touch targets:** at least 44×44 px for every interactive element, and at least 8 px between adjacent targets.
5. **Breathing room scales with importance:** the hero and story sections get the largest spacing; checkout is denser but never cramped.

---

## 9. Borders & Radius

### 9.1 Radius — meaning, not decoration

| Token | Value | Applies to | Reasoning |
|---|---|---|---|
| `--radius-cut` | 2 px | Photos, sections, content panels, dialogs on desktop, the order summary | *The cut:* precise edges for things you look at |
| `--radius-control` | 6 px | Inputs, selects, text areas, standard buttons | Approachable, not bubbly |
| `--radius-sheet` | 16 px (top corners only) | Mobile bottom sheet (cart drawer, product dialog on mobile) | Signals "this slides up and can be dismissed" |
| `--radius-pill` | 999 px | Category chips, filter chips, dietary badges, quantity stepper, cart count | *Hand-shaped:* small, tactile, frequently touched |
| — | 0 | Full-bleed hero image, header, footer | They meet the edge of the screen |

One radius is never applied to everything. Radius follows the role an element plays.

### 9.2 Borders

| Token | Value | Use |
|---|---|---|
| `--border-hairline` | 1 px solid `--color-line` (or `--color-line-on-dark`) | Section and menu-line dividers, the dot-leader color |
| `--border-control` | 1 px solid `--color-stone` | Inputs and outline buttons on light (passes 3:1 against shari) |
| `--border-control-on-dark` | 1 px solid `--color-kinari` | Outline buttons on dark |
| `--border-strong` | 2 px solid `--color-akami` | Selected option cards (delivery/pickup) on light, together with a check icon |
| `--border-error` | 2 px solid `--color-error` | Invalid fields, together with an icon and message |

**Dot leaders** in the menu: `border-bottom: 2px dotted var(--color-line)` on a flexible spacer between the dish name and the price, aligned to the text baseline.

### 9.3 Focus

| Surface | Focus indicator |
|---|---|
| Light | `outline: 3px solid var(--color-akami); outline-offset: 3px` (13.75:1 against shari) |
| Dark | `outline: 3px solid var(--color-wasabi); outline-offset: 3px` (8.77:1 against urushi) |

The indicator appears with `:focus-visible` only and is never removed without a replacement.

---

## 10. Buttons

### 10.1 Variants

| Variant | On light surfaces | On dark surfaces | Use |
|---|---|---|---|
| **Primary** | Akami fill, shari text (13.75:1) | Shari fill, urushi text (16.2:1) | The single most important action in a view: "See the menu", "Add", "Send order via WhatsApp" |
| **Secondary** | Transparent, `--border-control`, urushi text | Transparent, `--border-control-on-dark`, shari text | Second action: "Continue browsing", "View cart" |
| **Tertiary (text)** | Akami text, underline offset 0.2em | Shari text, underline | Low-emphasis navigation: "Clear filters", "Edit order" |
| **Destructive** | Tertiary style in `--color-error`, with a trash icon | Tertiary style in `--color-error-on-dark` | "Remove", "Empty cart". Always followed by a confirmation or undo option. |
| **Icon button** | 44×44 px, transparent, icon in `currentColor`, `aria-label` | Same | Close, quantity ±, cart in header |
| **Chip (toggle)** | Pill, `shari-deep` fill; when selected: akami fill, shari text, `aria-pressed="true"` | Pill, outline kinari; when selected: shari fill, urushi text | Category and filter selection |

**Rule:** at most **one primary button per view** (each card or line counts as its own small view for its "Add" button). When several things seem equally important, the hierarchy needs revisiting, not more primary buttons.

### 10.2 Sizes

| Size | Height | Horizontal padding | Text | Use |
|---|---|---|---|---|
| Compact | 40 px (hit area padded to 44 px) | 16 px | `--text-small`, 500 | "Add" on desktop menu lines |
| Default | 48 px | 24 px | `--text-body`, 500 | Most buttons |
| Large | 56 px | 32 px | `--text-body`, 700 | Hero call to action; checkout send button (full width on mobile) |

### 10.3 States

| State | Treatment |
|---|---|
| Hover (pointer devices only, `@media (hover: hover)`) | Primary on light: akami → akami hover. On dark: shari → shari deep. Secondary: background tint 6%. Transition at `--dur-fast`. |
| Active / pressed | 1 px downward translate plus the darker fill. No scaling. |
| Focus visible | Focus ring from 9.3 |
| Disabled | `aria-disabled="true"` (the button stays focusable so its explanation can be read); 45% opacity; `cursor: not-allowed`; the reason is shown nearby (e.g. "Add $ 0.000 more to reach the delivery minimum") |
| Loading | Label kept, small spinner replaces the leading icon, `aria-busy="true"`; repeated presses are ignored |
| Success (add to cart) | The label briefly changes to "Added" with a check in wasabi or wasabi-deep for 1.2 s, the cart count bumps, and a polite live-region announcement is made |

### 10.4 Button copy

- **Verb first, saying exactly what happens:** "Add", "View cart", "Send order via WhatsApp", "Remove", "Clear filters".
- The same action keeps the same name throughout the whole flow.
- No "Submit", no "Click here", no arrow characters appended to text.

---

## 11. Token Summary (for Phase 03 implementation)

```css
:root {
  /* Color */
  --color-urushi: #240910;
  --color-akami: #4b011d;
  --color-akami-hover: #62102c;
  --color-shari: #f2eee8;
  --color-shari-deep: #e6dfd5;
  --color-kinari: #b8a994;
  --color-stone: #6e5f5c;
  --color-wasabi: #a9b96b;
  --color-wasabi-deep: #56632a;
  --color-error: #a3231b;
  --color-error-on-dark: #f0998c;
  --color-line: #d6ccbf;
  --color-line-on-dark: #4a2a30;

  /* Type */
  --font-display: "Shippori Mincho B1", "Hiragino Mincho ProN", "Yu Mincho", Georgia, serif;
  --font-body: "Zen Kaku Gothic New", "Hiragino Sans", "Yu Gothic", system-ui, sans-serif;
  --text-display: clamp(2.75rem, 1.83rem + 4.07vw, 5.5rem);
  --text-h1: clamp(2.25rem, 1.75rem + 2.22vw, 3.75rem);
  --text-h2: clamp(1.8125rem, 1.5rem + 1.39vw, 2.75rem);
  --text-h3: clamp(1.375rem, 1.29rem + 0.37vw, 1.625rem);
  --text-h4: clamp(1.1875rem, 1.17rem + 0.09vw, 1.25rem);
  --text-body: 1.0625rem;
  --text-small: 0.9375rem;
  --text-caption: 0.8125rem;

  /* Space */
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-5: 1.5rem;  --space-6: 2rem;   --space-7: 3rem;    --space-8: 4rem;
  --space-9: 6rem;    --space-10: 8rem;

  /* Radius */
  --radius-cut: 2px; --radius-control: 6px; --radius-sheet: 16px; --radius-pill: 999px;

  /* Motion */
  --dur-fast: 140ms; --dur-base: 240ms; --dur-slow: 420ms;
  --ease-out: cubic-bezier(.2,.7,.2,1); --ease-in: cubic-bezier(.4,0,1,1);
}
```

In Phase 03 these **base tokens** will be mapped to **role tokens** (`--surface`, `--text`, `--text-muted`, `--accent`, `--focus-ring`) that switch automatically inside `.surface-dark` and `.surface-light` sections. Components then use role tokens only and never refer to a raw color directly.

---

## 12. Voice Quick Reference

| Do | Don't |
|---|---|
| "Add to your order" | "Add to basket now!!" |
| "Closed now · Opens Thursday at 19:00" | "Sorry, we're closed :(" |
| "Enter a phone number with area code" | "Invalid input" |
| "Your order is ready to send. Confirm it in WhatsApp." | "Order placed!" (it isn't, until the restaurant confirms) |
| "No dishes match 'tempura'. Clear filters" | "Oops! Nothing here" |

---

## 13. Approval Checklist

Please confirm or change each item before the design system is implemented:

| # | Decision | Proposal |
|---|---|---|
| 1 | Concept | *Urushi & Shari*: dark lacquer and rice-white sections, wasabi as the signal accent |
| 2 | Palette | Section 3.2 (burgundy kept as the brand color) |
| 3 | Typefaces | Shippori Mincho B1 + Zen Kaku Gothic New (subject to the accented-character test) |
| 4 | Logo | Option A, the interim wordmark (or supply a logo) |
| 5 | Name | Confirm "Funshi Sushi"; no Japanese-script rendering of the name |
| 6 | Japanese category names | Use with native-speaker verification / don't use |
| 7 | Menu presentation | Printed-menu lines (dot leaders) as the main menu layout |
| 8 | Product placeholders | Typographic tiles instead of stock food photos |
| 9 | Dark mode | Not in v1 (brand alternates surfaces by design) |

*End of Phase 02. No repository files were changed. Awaiting approval before implementing the design system.*
