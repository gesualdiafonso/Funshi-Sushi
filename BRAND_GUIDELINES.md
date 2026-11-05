# Funshi Sushi — Brand Guidelines

**Phase:** 02 — Brand Identity & Art Direction  
**Status:** Proposal for review; approval required before adopting or changing the complete design system.  
**Date:** 2026-11-04  
**Scope:** Visual direction for the website. This document proposes a system; it does not change application code or establish unconfirmed business facts.

## 1. Brand direction

### Proposed positioning

Position Funshi Sushi as a **contemporary, quality-focused Japanese-inspired sushi restaurant with an approachable direct-ordering experience**. The brand should feel considered and confident, but not formal or intimidating. The website should make the food and menu easy to understand and ordering easy to complete.

This is a proposed digital positioning, not a confirmed statement about the restaurant's sourcing, preparation, service model, heritage, or quality certifications. Copy must not make those claims unless the owner verifies them.

### Art-direction concept: “Quiet craft, vivid food”

Use the editorial restraint of a well-designed menu—clear type, purposeful whitespace, strong alignment, and a few tactile details—so real food photography can be the most expressive element. Japanese influence should come through in typography, composition, and subtle material references rather than decorative shorthand.

**Desired qualities**

- Contemporary, warm, precise, and hospitable.
- Editorial rather than template-like.
- Product-forward, with clear prices, portions, and ingredients once confirmed.
- Calm visual rhythm with deliberate contrast and a small number of strong accents.

**Avoid**

- Cherry blossoms, rising suns, flags, torii, faux calligraphy, or repeated “Japanese” motifs as decoration.
- Using “authentic,” “traditional,” “fresh daily,” “sustainable,” or similar claims without owner confirmation.
- Overusing dark backgrounds, gold foil effects, gradients, shadows, rounded cards, or ornamental patterns.
- Making placeholder food photography or provisional logo artwork look like approved production assets.

## 2. Existing identity assessment

### Logo and mark

The only current brand graphic is the provisional [favicon.svg](./assets/images/brand/favicon.svg): a burgundy rounded square with a white serif “F.” The page repeats an “F” seal beside the text “Funshi Sushi.”

- **Strengths:** simple, legible at a glance, compact, and uses the original repository's burgundy.
- **Limitations:** it is a placeholder rather than a confirmed logo; a single initial is not distinctive; no custom wordmark or approved source artwork exists. At favicon size, fine serif details may lose clarity.
- **Historical issue:** the original [styles.css](./styles.css) refers to an invalid image path. The current page does not load that stylesheet, and there is no corresponding logo image in the assets.

**Recommendation:** retain the seal-and-wordmark lockup as a temporary interface mark only. Before launch, ask the owner whether a logo exists or whether a new identity should be commissioned. If a custom mark is developed, test it as a one-color mark, at small icon sizes, in light/dark contexts, and without relying on the letter “F” alone. No final logo is approved by this document.

### Existing palette

The current CSS uses an “ice and nori” palette with dark greens, cool off-white, warm neutral, and the original burgundy. This is a coherent, restrained foundation and is more ownable than the initial brown-on-beige styling. The direction is suitable to refine rather than discard.

One important constraint: the bright mint accent (`#00A88D`) has insufficient contrast for small text on light surfaces. Reserve it for non-text decoration, or use the darker accessible link color. All final combinations must be contrast-tested in implementation.

## 3. Proposed color palette

The following keeps the current palette as a **working proposal**, not a final approved identity. Color names are descriptive design tokens, not claims about ingredients or restaurant provenance.

| Role | Proposed token | Value | Use |
|---|---|---:|---|
| Primary ink | `--color-nori` | `#113912` | Body text, headings, dark footer/bands |
| Primary action / brand green | `--color-forest` | `#004D40` | Primary buttons, selected states, focus ring |
| Page surface | `--color-ice` | `#F2F9FF` | Main page background |
| Raised surface | `--color-white` | `#FFFFFF` | Forms, dialogs, menu surfaces |
| Warm supporting surface | `--color-hinoki` | `#E9DFCC` | Occasional story or information band, tags |
| Accent | `--color-wasabi` | `#00A88D` | Fine rules, decorative marks, non-text indicators |
| Accessible link accent | `--color-wasabi-ink` | `#007A66` | Links on light surfaces |
| Legacy burgundy accent | `--color-maguro` | `#4B011D` | Provisional seal or rare small accent only |
| Muted text | `--color-stone` | `#4A5A55` | Secondary text where contrast is verified |
| Divider | `--color-mist` | `#D5E3E0` | Hairlines and subtle boundaries |
| Error | `--color-error` | `#B3261E` | Error state with text/icon, not color alone |
| Success | `--color-success` | `#1E6B3A` | Confirmation state with text/icon |

### Palette rules

1. Use semantic roles in components rather than scattering raw hex values.
2. Keep most large surfaces light; use dark green as a deliberate anchor, not a full-page default.
3. Use burgundy sparingly. It is inherited from the original project, but it does not need to become a defining food color.
4. Do not set small text in the bright mint accent on light backgrounds. Use `#007A66` for link text.
5. Verify WCAG AA contrast for normal text (4.5:1), large text (3:1), controls, focus indicators, hover, disabled, error, and inverse states when tokens are implemented. Published contrast values are not a substitute for testing rendered pairings.
6. Never use color alone to communicate allergens, availability, validation, or order status.

## 4. Typography and hierarchy

The repository already includes self-hosted, SIL OFL-licensed Latin-subset fonts:

- **Display:** Shippori Mincho B1, weight 700.
- **Text and interface:** Zen Kaku Gothic New, weights 400, 500, and 700.

This pairing offers a Japanese typographic reference without using brush-script imitation. Keep it as the leading proposal, subject to owner approval and language/content fit. Verify glyph coverage for the final site language; the existing subsets cover common Latin accents, not necessarily every script the business may need.

| Style | Typeface / weight | Proposed size | Line height | Use |
|---|---|---:|---:|---|
| Display | Shippori Mincho B1 / 700 | Fluid, approx. 40–80px | 1.1 | One concise hero headline |
| H1 | Shippori Mincho B1 / 700 | Fluid, approx. 32–52px | 1.1 | Page title; one per page |
| H2 | Shippori Mincho B1 / 700 | Fluid, approx. 26–36px | 1.25 | Major section headings |
| H3 | Zen Kaku Gothic New / 700 | Fluid, approx. 20–24px | 1.25 | Menu category, product, and panel headings |
| Lead | Zen Kaku Gothic New / 400 | 18–20px | 1.5–1.6 | Introductory copy |
| Body | Zen Kaku Gothic New / 400 | 16–17px | 1.6 | Descriptions, story, instructions |
| Navigation | Zen Kaku Gothic New / 500 | 16px | 1.3 | Primary navigation |
| Label / button | Zen Kaku Gothic New / 500–700 | 15–16px | 1.3 | Form labels and controls |
| Caption | Zen Kaku Gothic New / 400 | At least 13px | 1.45 | Secondary metadata, allergens, legal notes |

### Type rules

- Use sentence case. Avoid all-caps micro-labels and unnecessary letter spacing.
- Use Mincho for expressive headlines, not for long body copy, dense menu descriptions, or tiny controls.
- Keep paragraphs to approximately 45–65 characters per line where layout allows.
- Use fluid `rem`-based sizes that respect zoom and browser text preferences.
- Keep menu names, prices, portions, and allergen information easy to scan; use consistent alignment and figures.
- Do not reduce required consumer information to caption size merely to fit a layout.

## 5. Layout, spacing, and composition

### Editorial principles

- Create hierarchy with scale, alignment, spacing, and photography—not a stack of decorative labels and cards.
- Use asymmetric layouts selectively for the story and campaign imagery; keep the menu orderly and predictable.
- Prefer menu rows or restrained photo-led tiles with shared alignment. The layout must work for long product names, prices, tags, and translated copy.
- Give each section one clear purpose and one primary action.
- Keep line length and content width controlled; let images break the grid only when the crop remains useful on mobile.

### Spacing proposal

Use a 4px base spacing scale, with a consistent step-up for larger group and section spacing. The existing values are reasonable starting points:

`4, 8, 12, 16, 24, 32, 48, 64, 96px`

- Inline icon-to-label gap: 8–12px.
- Form field/control spacing: 16–24px.
- Heading-to-content spacing: 24–32px.
- Section separation: fluid, approximately 56–112px on larger screens, reduced where mobile content requires.
- Page gutters: fluid, approximately 16–40px.
- Use a small set of max-width containers for running text, general content, and wide imagery.
- Avoid arbitrary one-off spacing where a shared token works; allow exceptions when actual content or photography needs them.

## 6. Image direction

### Production photography

Food and people should feel real, appetizing, and specific to the restaurant. Commission or obtain owner-approved images; do not invent dishes, staff, interiors, sourcing, or service details.

**Recommended shot approach**

- Natural-looking directional light, controlled highlights, and realistic food color.
- Close detail mixed with wider sharing/serving scenes; vary crops and scale.
- Clean, tactile surfaces and restrained props. Let the dish remain the focal point.
- Show accurate portion size and actual plating; do not retouch ingredients or garnish in a way that misrepresents the food.
- Include preparation, staff, and restaurant imagery only when it represents the actual business and people have consented.
- Capture landscape and portrait crops where possible; compose with responsive crops in mind.

**Website use**

- Hero: one strong, confirmed signature or menu image (the featured item must be real and available).
- Menu: accurate product imagery where available; avoid assigning a photo of one dish to a different menu item.
- Story/location: genuine restaurant or team imagery if approved.
- Use explicit image dimensions/aspect ratios and responsive formats/sizes. Give the hero suitable priority; lazy-load below-the-fold images.
- Use descriptive alt text for informative product images; use empty alt text for decorative imagery.
- Until real images are provided, keep clearly labelled placeholders and the preview notice. Do not remove placeholder labels merely to make the site look finished.

## 7. Iconography

- Use a consistent family of simple outline icons with a common stroke weight, rounded joins, and a 24px view box.
- Prefer the existing inline SVG sprite pattern for small interface icons; keep decorative icons hidden from assistive technology when adjacent text already names the action.
- Icons supplement clear text labels; never rely on an icon alone for an unfamiliar action.
- Keep icon geometry quiet and functional. Do not introduce themed pictograms (chopsticks, fans, lanterns) as generic decoration.
- Set accessible names on icon-only controls, and provide visible focus and minimum target sizes.

## 8. Borders, radii, and elevation

Proposed standards based on existing tokens:

- **1px** subtle divider for grouping; use a stronger, contrast-appropriate border for input fields and controls.
- **4px radius** for buttons, inputs, and small tags.
- **8px radius** for image frames, panels, and dialogs.
- **16px radius** only for large sheet/overlay geometry when appropriate.
- Reserve pill shapes for small count/status badges where the shape conveys a count.
- Keep cards mostly flat. Use restrained, tinted shadows only for floating overlays and sticky controls.
- Avoid decorative outlines around every content block; use whitespace and alignment first.

## 9. Button and control styles

### Primary

- Solid forest green with high-contrast light label.
- Bold, verb-led wording such as “Add to order” or “Review order.”
- Use for the most important action in a context; do not make every action primary.
- Hover/focus/pressed states must be distinguishable and tested for contrast.

### Secondary

- Transparent or surface-colored background with a strong forest border and text.
- Use for alternate actions such as “View details” or “Continue browsing.”

### Text / tertiary

- Underlined or clearly differentiated text action for lower-priority actions.
- Do not make destructive actions visually indistinguishable from normal navigation.

### Control rules

- Minimum interactive target: 44 × 44 CSS pixels where practical.
- Labels describe the outcome; avoid vague labels such as “Submit” or icon-only actions without accessible names.
- Provide visible keyboard focus, disabled state, and error/validation text.
- Do not rely on hover for essential information or functionality.
- Motion is brief and purposeful; respect `prefers-reduced-motion`.
- The WhatsApp hand-off should use Funshi's primary action styling, not an unverified imitation of WhatsApp branding. Clearly explain that the customer still confirms/sends the message in WhatsApp.

## 10. Graphic language and motion

- Use subtle line work, restrained pattern, and intentional negative space; the existing wave pattern can remain a placeholder treatment, not a motif on every surface.
- Maintain a consistent photo treatment rather than applying a uniform filter that changes food appearance.
- Use motion only to clarify feedback or state change. Avoid autoplay, parallax, and scroll-triggered animation as decoration.
- Ensure all meaningful motion has an immediate or static alternative for reduced-motion preferences.
- Keep content stable during image loading and interactions to avoid layout shift.

## 11. Responsive and accessibility requirements

- Mobile-first composition; do not simply shrink desktop layouts.
- Keep menu labels, prices, controls, navigation, and checkout details readable without horizontal page scrolling.
- Ensure text reflows at zoom and narrow widths; do not clip product names or important instructions.
- Use semantic headings and controls; maintain logical reading and keyboard order.
- Focus must be visible against both light and dark surfaces.
- Validate contrast and touch targets in rendered components, including all interactive states.
- Test imagery and typography with final localized content before approving production.

## 12. Pending owner decisions

No answers are assumed. The following are required before final identity or production artwork can be approved:

- Is “Funshi Sushi” the confirmed public-facing brand name?
- Does an existing approved logo or brand guide exist? Who owns the rights to supplied assets?
- Which site language(s), locale, and currency should the design support?
- Is the current “ice and nori” green/cool palette acceptable, or should the original burgundy become more prominent?
- Does Shippori Mincho B1 + Zen Kaku Gothic New fit the desired brand and final language?
- Are owner-provided food, team, restaurant, and logo images available, with usage permissions?
- Which dishes may be described or featured as signature/popular, and what claims about ingredients or preparation are approved?
- Are there contrast, cultural, or visual preferences the owner wants to require or avoid?

## 13. Approval gate and implementation plan

This deliverable is a proposal only. The existing CSS tokens, fonts, logo treatment, and page styling have **not** been changed by this phase.

After explicit approval:

1. Confirm or revise the palette, type pairing, and temporary/permanent logo direction.
2. Confirm language and content needs before settling typography and text scales.
3. Build or refine design tokens and components in the existing Vanilla CSS architecture.
4. Integrate approved identity and real imagery only after rights and accuracy are confirmed.
5. Validate responsive behavior, accessibility, reduced motion, and visual consistency across key page states.

