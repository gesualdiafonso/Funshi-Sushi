/**
 * Menu data — categories, tags, allergens and dishes. Content only: no markup,
 * no formatting, no behaviour (TECHNICAL_ARCHITECTURE §6.1). The menu page,
 * the home page and (later) the cart all read from here.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  SAMPLE CONTENT. This is a realistic demonstration menu, NOT the
 *  restaurant's menu: the dishes, descriptions, prices, ingredients and
 *  allergens are examples, and the images are illustrations. While
 *  IS_DEMO_MENU is true, every page says so. Replace everything below with
 *  the restaurant's real menu ({{MENU_DATA}}, PRODUCT_BRIEF §11), then set
 *  IS_DEMO_MENU to false.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * EDITING GUIDE
 *  • id        Permanent. Carts saved in customers' browsers refer to it.
 *              Renaming a dish? Change `name` and `slug`, keep `id`.
 *  • slug      Used in links (menu.html?dish=salmon-nigiri). Lowercase, dashes.
 *  • price     Whole number in the currency's minor unit: 1890 = 18.90.
 *              `null` = "price to be confirmed".
 *  • variants  Sizes of the same dish, each with its own price. When present,
 *              `price` and `pieces` on the dish are not used.
 *  • image     { file, alt }. `file` is the name in assets/images/products/
 *              (without size or extension). `null` = typographic tile.
 *  • available false = shown as "Unavailable today" and can't be ordered.
 *  • featured  true = shown on the home page (first 4, in this order).
 *  • Order in each list = order on the site.
 */

/** @type {boolean} true → the site labels the menu as sample content */
export const IS_DEMO_MENU = true;

/** @type {import('../core/catalog.js').Category[]} */
export const CATEGORIES = [
  { id: 'cat-nigiri', slug: 'nigiri', name: 'Nigiri', intro: 'A slice of fish over hand-shaped rice. Two pieces per order.' },
  { id: 'cat-sashimi', slug: 'sashimi', name: 'Sashimi', intro: 'Sliced fish, served without rice.' },
  { id: 'cat-uramaki', slug: 'uramaki', name: 'Uramaki', intro: 'Inside-out rolls: rice on the outside, nori and filling within.' },
  { id: 'cat-hot-rolls', slug: 'hot-rolls', name: 'Hot rolls', intro: 'Breaded and fried rolls, served warm.' },
  { id: 'cat-gunkan', slug: 'gunkan', name: 'Gunkan', intro: 'Rice wrapped in a band of nori, topped to the brim.' },
  { id: 'cat-combos', slug: 'combos', name: 'Combos', intro: 'Assortments from across the menu.' },
  { id: 'cat-sides', slug: 'sides', name: 'Sides', intro: 'Soup, salads and small plates.' },
  { id: 'cat-drinks', slug: 'drinks', name: 'Drinks' },
];

/** Dietary and preparation labels. `filter: true` → offered as a menu filter. */
/** @type {import('../core/catalog.js').Tag[]} */
export const TAGS = [
  { id: 'raw', label: 'Raw', filter: true },
  { id: 'cooked', label: 'Cooked', filter: true },
  { id: 'vegetarian', label: 'Vegetarian', filter: true, icon: 'leaf' },
  { id: 'vegan', label: 'Vegan', filter: true, icon: 'leaf' },
  { id: 'spicy', label: 'Spicy', filter: true, icon: 'flame' },
];

/** Allergen vocabulary referenced by dishes. */
/** @type {import('../core/catalog.js').Allergen[]} */
export const ALLERGENS = [
  { id: 'fish', label: 'Fish' },
  { id: 'crustaceans', label: 'Crustaceans' },
  { id: 'soy', label: 'Soy' },
  { id: 'sesame', label: 'Sesame' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'milk', label: 'Milk' },
  { id: 'egg', label: 'Egg' },
];

/** @type {import('../core/catalog.js').Product[]} */
export const PRODUCTS = [
  // ── Nigiri ────────────────────────────────────────────────────────────
  {
    id: 'p-salmon-nigiri',
    slug: 'salmon-nigiri',
    categoryId: 'cat-nigiri',
    name: 'Salmon nigiri',
    description: 'Salmon over hand-shaped rice.',
    details: 'A slice of salmon over seasoned rice, with a touch of wasabi between fish and rice.',
    ingredients: ['salmon', 'rice', 'rice vinegar', 'wasabi'],
    allergens: ['fish'],
    tags: ['raw'],
    pieces: 2,
    price: 1490,
    image: { file: 'salmon-nigiri', alt: 'Illustration: two pieces of salmon nigiri on a lacquered tray.' },
    available: true,
    featured: true,
  },
  {
    id: 'p-tuna-nigiri',
    slug: 'tuna-nigiri',
    categoryId: 'cat-nigiri',
    name: 'Tuna nigiri',
    description: 'Lean tuna over hand-shaped rice.',
    ingredients: ['tuna', 'rice', 'rice vinegar', 'wasabi'],
    allergens: ['fish'],
    tags: ['raw'],
    pieces: 2,
    price: 1790,
    image: { file: 'tuna-nigiri', alt: 'Illustration: two pieces of tuna nigiri on a lacquered tray.' },
    available: true,
  },
  {
    id: 'p-white-fish-nigiri',
    slug: 'white-fish-nigiri',
    categoryId: 'cat-nigiri',
    name: 'White fish nigiri',
    description: 'The day’s white fish over hand-shaped rice.',
    details: 'Depends on the catch. Ask the restaurant which fish is on today.',
    ingredients: ['white fish', 'rice', 'rice vinegar', 'wasabi'],
    allergens: ['fish'],
    tags: ['raw'],
    pieces: 2,
    price: 1590,
    image: { file: 'white-fish-nigiri', alt: 'Illustration: two pieces of white fish nigiri on a lacquered tray.' },
    available: false,
  },
  {
    id: 'p-shrimp-nigiri',
    slug: 'shrimp-nigiri',
    categoryId: 'cat-nigiri',
    name: 'Shrimp nigiri',
    description: 'Poached shrimp over hand-shaped rice.',
    ingredients: ['shrimp', 'rice', 'rice vinegar'],
    allergens: ['crustaceans'],
    tags: ['cooked'],
    pieces: 2,
    price: 1590,
    image: { file: 'shrimp-nigiri', alt: 'Illustration: two pieces of shrimp nigiri on a lacquered tray.' },
    available: true,
  },
  {
    id: 'p-eel-nigiri',
    slug: 'eel-nigiri',
    categoryId: 'cat-nigiri',
    name: 'Eel nigiri',
    description: 'Grilled eel with a sweet soy glaze and a band of nori.',
    ingredients: ['grilled eel', 'rice', 'nori', 'sweet soy glaze', 'sesame'],
    allergens: ['fish', 'soy', 'gluten', 'sesame'],
    tags: ['cooked'],
    pieces: 2,
    price: 1890,
    image: { file: 'eel-nigiri', alt: 'Illustration: two pieces of glazed eel nigiri, each wrapped with a band of nori.' },
    available: true,
  },

  // ── Sashimi ───────────────────────────────────────────────────────────
  {
    id: 'p-salmon-sashimi',
    slug: 'salmon-sashimi',
    categoryId: 'cat-sashimi',
    name: 'Salmon sashimi',
    description: 'Slices of salmon on a shiso leaf.',
    ingredients: ['salmon', 'shiso leaf', 'wasabi'],
    allergens: ['fish'],
    tags: ['raw'],
    pieces: 5,
    price: 2690,
    image: { file: 'salmon-sashimi', alt: 'Illustration: five slices of salmon sashimi on a shiso leaf on a dark slate.' },
    available: true,
  },
  {
    id: 'p-tuna-sashimi',
    slug: 'tuna-sashimi',
    categoryId: 'cat-sashimi',
    name: 'Tuna sashimi',
    description: 'Slices of lean tuna on a shiso leaf.',
    ingredients: ['tuna', 'shiso leaf', 'wasabi'],
    allergens: ['fish'],
    tags: ['raw'],
    pieces: 5,
    price: 2990,
    image: { file: 'tuna-sashimi', alt: 'Illustration: five slices of tuna sashimi on a shiso leaf on a dark slate.' },
    available: true,
  },
  {
    id: 'p-mixed-sashimi',
    slug: 'mixed-sashimi',
    categoryId: 'cat-sashimi',
    name: 'Mixed sashimi',
    description: 'Salmon, tuna and white fish.',
    details: 'An even mix of the three fish, sliced to order.',
    ingredients: ['salmon', 'tuna', 'white fish', 'shiso leaf', 'wasabi'],
    allergens: ['fish'],
    tags: ['raw'],
    variants: [
      { id: '9', label: '9 pcs', pieces: 9, price: 4290 },
      { id: '15', label: '15 pcs', pieces: 15, price: 6890 },
    ],
    image: { file: 'mixed-sashimi', alt: 'Illustration: slices of salmon, tuna and white fish sashimi arranged on a dark slate.' },
    available: true,
  },

  // ── Uramaki ───────────────────────────────────────────────────────────
  {
    id: 'p-salmon-uramaki',
    slug: 'salmon-uramaki',
    categoryId: 'cat-uramaki',
    name: 'Salmon uramaki',
    description: 'Salmon and cream cheese, rolled in sesame.',
    ingredients: ['salmon', 'cream cheese', 'rice', 'nori', 'sesame'],
    allergens: ['fish', 'milk', 'sesame'],
    tags: ['raw'],
    variants: [
      { id: '8', label: '8 pcs', pieces: 8, price: 2490 },
      { id: '16', label: '16 pcs', pieces: 16, price: 4590 },
    ],
    image: { file: 'salmon-uramaki', alt: 'Illustration: three slices of salmon and cream cheese uramaki coated in sesame.' },
    available: true,
    featured: true,
  },
  {
    id: 'p-california-uramaki',
    slug: 'california-uramaki',
    categoryId: 'cat-uramaki',
    name: 'California uramaki',
    description: 'Crab stick, avocado and cucumber, rolled in fish roe.',
    ingredients: ['crab stick', 'avocado', 'cucumber', 'mayonnaise', 'rice', 'nori', 'capelin roe'],
    allergens: ['fish', 'crustaceans', 'egg'],
    tags: ['cooked'],
    pieces: 8,
    price: 2290,
    image: { file: 'california-uramaki', alt: 'Illustration: three slices of California uramaki with crab, avocado and cucumber, coated in orange roe.' },
    available: true,
  },
  {
    id: 'p-spicy-tuna-uramaki',
    slug: 'spicy-tuna-uramaki',
    categoryId: 'cat-uramaki',
    name: 'Spicy tuna uramaki',
    description: 'Chopped tuna with chilli mayonnaise and scallion.',
    ingredients: ['tuna', 'chilli mayonnaise', 'scallion', 'rice', 'nori', 'sesame'],
    allergens: ['fish', 'egg', 'sesame'],
    tags: ['raw', 'spicy'],
    pieces: 8,
    price: 2690,
    image: { file: 'spicy-tuna-uramaki', alt: 'Illustration: three slices of spicy tuna uramaki with a line of orange chilli sauce.' },
    available: true,
  },
  {
    id: 'p-vegetable-uramaki',
    slug: 'vegetable-uramaki',
    categoryId: 'cat-uramaki',
    name: 'Vegetable uramaki',
    description: 'Avocado, cucumber and carrot.',
    ingredients: ['avocado', 'cucumber', 'carrot', 'rice', 'nori', 'sesame'],
    allergens: ['sesame'],
    tags: ['vegetarian', 'vegan'],
    variants: [
      { id: '8', label: '8 pcs', pieces: 8, price: 1890 },
      { id: '16', label: '16 pcs', pieces: 16, price: 3390 },
    ],
    image: { file: 'vegetable-uramaki', alt: 'Illustration: three slices of vegetable uramaki with avocado, cucumber and carrot.' },
    available: true,
  },

  // ── Hot rolls ─────────────────────────────────────────────────────────
  {
    id: 'p-hot-salmon-roll',
    slug: 'hot-salmon-roll',
    categoryId: 'cat-hot-rolls',
    name: 'Hot salmon roll',
    description: 'Salmon and cream cheese, breaded, fried and glazed.',
    ingredients: ['salmon', 'cream cheese', 'rice', 'nori', 'breadcrumbs', 'sweet soy glaze'],
    allergens: ['fish', 'milk', 'gluten', 'soy', 'egg'],
    tags: ['cooked'],
    variants: [
      { id: '8', label: '8 pcs', pieces: 8, price: 2590 },
      { id: '16', label: '16 pcs', pieces: 16, price: 4790 },
    ],
    image: { file: 'hot-salmon-roll', alt: 'Illustration: three slices of breaded hot salmon roll with a dark soy glaze.' },
    available: true,
    featured: true,
  },
  {
    id: 'p-hot-shrimp-roll',
    slug: 'hot-shrimp-roll',
    categoryId: 'cat-hot-rolls',
    name: 'Hot shrimp roll',
    description: 'Shrimp and cream cheese, breaded, fried and glazed.',
    ingredients: ['shrimp', 'cream cheese', 'rice', 'nori', 'breadcrumbs', 'sweet soy glaze'],
    allergens: ['crustaceans', 'milk', 'gluten', 'soy', 'egg'],
    tags: ['cooked'],
    pieces: 8,
    price: 2790,
    image: { file: 'hot-shrimp-roll', alt: 'Illustration: three slices of breaded hot shrimp roll with a dark soy glaze.' },
    available: true,
  },

  // ── Gunkan ────────────────────────────────────────────────────────────
  {
    id: 'p-salmon-tartare-gunkan',
    slug: 'salmon-tartare-gunkan',
    categoryId: 'cat-gunkan',
    name: 'Salmon tartare gunkan',
    description: 'Chopped salmon and scallion in a nori band.',
    ingredients: ['salmon', 'scallion', 'rice', 'nori'],
    allergens: ['fish'],
    tags: ['raw'],
    pieces: 2,
    price: 1690,
    image: { file: 'salmon-tartare-gunkan', alt: 'Illustration: two gunkan topped with chopped salmon and scallion.' },
    available: true,
  },
  {
    id: 'p-salmon-roe-gunkan',
    slug: 'salmon-roe-gunkan',
    categoryId: 'cat-gunkan',
    name: 'Salmon roe gunkan',
    description: 'Salmon roe in a nori band.',
    ingredients: ['salmon roe', 'rice', 'nori'],
    allergens: ['fish'],
    tags: ['raw'],
    pieces: 2,
    price: 2190,
    image: { file: 'salmon-roe-gunkan', alt: 'Illustration: two gunkan filled with glossy orange salmon roe.' },
    available: true,
  },

  // ── Combos ────────────────────────────────────────────────────────────
  {
    id: 'p-counter-combo',
    slug: 'counter-combo',
    categoryId: 'cat-combos',
    name: 'Counter combo',
    description: 'Nigiri, uramaki and hot rolls for one or two.',
    details: '4 nigiri (salmon, tuna), 8 salmon uramaki, 4 vegetable uramaki and 4 hot salmon roll.',
    ingredients: ['salmon', 'tuna', 'cream cheese', 'avocado', 'cucumber', 'carrot', 'rice', 'nori', 'breadcrumbs', 'sesame'],
    allergens: ['fish', 'milk', 'gluten', 'soy', 'sesame', 'egg'],
    tags: ['raw', 'cooked'],
    pieces: 20,
    price: 5990,
    image: { file: 'counter-combo', alt: 'Illustration: a combo of salmon and tuna nigiri with slices of uramaki and hot roll on a wooden board.' },
    available: true,
    featured: true,
  },
  {
    id: 'p-sharing-platter',
    slug: 'sharing-platter',
    categoryId: 'cat-combos',
    name: 'Sharing platter',
    description: 'A full spread of nigiri and rolls for three or four.',
    details: '10 nigiri (salmon, tuna, white fish), 16 uramaki (salmon, vegetable, California) and 14 hot rolls.',
    ingredients: ['salmon', 'tuna', 'white fish', 'crab stick', 'cream cheese', 'avocado', 'cucumber', 'carrot', 'rice', 'nori', 'breadcrumbs', 'sesame'],
    allergens: ['fish', 'crustaceans', 'milk', 'gluten', 'soy', 'sesame', 'egg'],
    tags: ['raw', 'cooked'],
    pieces: 40,
    price: 11490,
    image: { file: 'sharing-platter', alt: 'Illustration: a large wooden board with nigiri, uramaki and hot roll slices.' },
    available: true,
  },

  // ── Sides ─────────────────────────────────────────────────────────────
  {
    id: 'p-miso-soup',
    slug: 'miso-soup',
    categoryId: 'cat-sides',
    name: 'Miso soup',
    description: 'Miso broth with tofu, wakame and scallion.',
    ingredients: ['miso', 'dashi (fish stock)', 'tofu', 'wakame', 'scallion'],
    allergens: ['soy', 'fish'],
    tags: ['cooked'],
    price: 990,
    image: { file: 'miso-soup', alt: 'Illustration: a bowl of miso soup with cubes of tofu, seaweed and scallion.' },
    available: true,
  },
  {
    id: 'p-edamame',
    slug: 'edamame',
    categoryId: 'cat-sides',
    name: 'Edamame',
    description: 'Steamed soybeans in the pod, with sea salt.',
    ingredients: ['soybeans', 'sea salt'],
    allergens: ['soy'],
    tags: ['cooked', 'vegetarian', 'vegan'],
    price: 1190,
    image: { file: 'edamame', alt: 'Illustration: a bowl of green edamame pods sprinkled with salt.' },
    available: true,
  },
  {
    id: 'p-gyoza',
    slug: 'gyoza',
    categoryId: 'cat-sides',
    name: 'Gyoza',
    description: 'Pan-fried pork and cabbage dumplings with a dipping sauce.',
    ingredients: ['pork', 'cabbage', 'garlic', 'ginger', 'wheat dough', 'soy sauce', 'rice vinegar', 'chilli oil'],
    allergens: ['gluten', 'soy', 'sesame'],
    tags: ['cooked'],
    pieces: 5,
    price: 1890,
    image: { file: 'gyoza', alt: 'Illustration: five pan-fried gyoza on a dark slate with a small dish of dipping sauce.' },
    available: true,
  },
  {
    id: 'p-wakame-salad',
    slug: 'wakame-salad',
    categoryId: 'cat-sides',
    name: 'Wakame salad',
    description: 'Seaweed salad with sesame and a little chilli.',
    ingredients: ['wakame', 'sesame', 'rice vinegar', 'sesame oil', 'chilli'],
    allergens: ['sesame'],
    tags: ['vegetarian', 'vegan', 'spicy'],
    price: 1490,
    image: { file: 'wakame-salad', alt: 'Illustration: a bowl of bright green wakame seaweed salad with sesame seeds.' },
    available: true,
  },

  // ── Drinks (no images: shown as typographic tiles) ────────────────────
  {
    id: 'p-green-tea',
    slug: 'green-tea',
    categoryId: 'cat-drinks',
    name: 'Iced green tea',
    description: 'Unsweetened, brewed in house.',
    ingredients: ['green tea', 'water'],
    allergens: [],
    tags: ['vegetarian', 'vegan'],
    price: 890,
    image: null,
    available: true,
  },
  {
    id: 'p-yuzu-lemonade',
    slug: 'yuzu-lemonade',
    categoryId: 'cat-drinks',
    name: 'Yuzu lemonade',
    description: 'Citrus lemonade with yuzu.',
    ingredients: ['yuzu juice', 'lemon juice', 'sugar', 'sparkling water'],
    allergens: [],
    tags: ['vegetarian', 'vegan'],
    price: 1090,
    image: null,
    available: false,
  },
  {
    id: 'p-sparkling-water',
    slug: 'sparkling-water',
    categoryId: 'cat-drinks',
    name: 'Sparkling water',
    description: 'Bottle, 500 ml.',
    allergens: [],
    tags: ['vegetarian', 'vegan'],
    price: 590,
    image: null,
    available: true,
  },
  {
    id: 'p-still-water',
    slug: 'still-water',
    categoryId: 'cat-drinks',
    name: 'Still water',
    description: 'Bottle, 500 ml.',
    allergens: [],
    tags: ['vegetarian', 'vegan'],
    price: 590,
    image: null,
    available: true,
  },
];
