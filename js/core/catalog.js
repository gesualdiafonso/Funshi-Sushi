/**
 * Menu catalog: validation and lookup indexes (TECHNICAL_ARCHITECTURE §6.1).
 * Pure — tested in tests/catalog.test.js.
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} [nameJa]  Verified Japanese name only (BRAND_GUIDELINES §4.5)
 * @property {string} [intro]
 *
 * @typedef {Object} Tag
 * @property {string} id
 * @property {string} label
 * @property {boolean} filter
 * @property {string} [icon]
 *
 * @typedef {Object} Allergen
 * @property {string} id
 * @property {string} label
 *
 * @typedef {Object} Variant
 * @property {string} id
 * @property {string} label
 * @property {number | null} price  Minor units; null = price to be confirmed
 * @property {number} [pieces]
 *
 * @typedef {Object} ProductImage
 * @property {string} file  Name in assets/images/products/ (no size, no extension)
 * @property {string} alt   Describes the image for screen readers
 *
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} slug
 * @property {string} categoryId
 * @property {string} name
 * @property {string} description
 * @property {string} [details]
 * @property {string[]} [ingredients]
 * @property {string[]} [allergens]  Allergen ids
 * @property {string[]} tags
 * @property {number | null} [price]  Minor units; null = price to be confirmed
 * @property {number} [pieces]
 * @property {Variant[]} [variants]
 * @property {ProductImage | null} image
 * @property {boolean} available
 * @property {boolean} [featured]
 *
 * @typedef {Object} Catalog
 * @property {Category[]} categories
 * @property {Map<string, Category>} categoryById
 * @property {Tag[]} tags
 * @property {Map<string, Tag>} tagById
 * @property {Allergen[]} allergens
 * @property {Map<string, Allergen>} allergenById
 * @property {Map<string, Product[]>} byCategory  Category id → products, data order
 * @property {Product[]} products            Valid products, in data order
 * @property {Map<string, Product>} byId
 * @property {Map<string, Product>} bySlug
 */

const isText = (value) => typeof value === 'string' && value.trim() !== '';
const IMAGE_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isPrice = (value) => value === null || (Number.isInteger(value) && value >= 0);

/**
 * Check one product. Returns a list of problems (empty = valid).
 * @param {Product} product
 * @param {Map<string, Category>} categoryById
 * @returns {string[]}
 */
function productProblems(product, categoryById) {
  const problems = [];
  for (const key of ['id', 'slug', 'name', 'description']) {
    if (!isText(product[key])) problems.push(`"${key}" must be non-empty text`);
  }
  if (!categoryById.has(product.categoryId)) problems.push(`unknown category "${product.categoryId}"`);
  if (typeof product.available !== 'boolean') problems.push('"available" must be true or false');
  if (!Array.isArray(product.tags)) problems.push('"tags" must be a list');
  if (product.ingredients !== undefined && !(Array.isArray(product.ingredients) && product.ingredients.every(isText))) {
    problems.push('"ingredients" must be a list of text');
  }

  if (Array.isArray(product.variants)) {
    if (product.variants.length === 0) problems.push('"variants" is empty');
    const ids = new Set();
    for (const variant of product.variants) {
      if (!isText(variant.id) || !isText(variant.label)) problems.push('a variant needs an id and a label');
      if (ids.has(variant.id)) problems.push(`duplicate variant id "${variant.id}"`);
      ids.add(variant.id);
      if (!isPrice(variant.price)) problems.push(`variant "${variant.id}" price must be a whole number ≥ 0 or null`);
    }
  } else if (!('price' in product) || !isPrice(product.price)) {
    problems.push('"price" must be a whole number ≥ 0 (minor units) or null');
  }
  return problems;
}

/**
 * Validate the menu data and build lookup indexes. Invalid products are left
 * out (and reported) so one data mistake never takes the menu down.
 * @param {{ CATEGORIES: Category[], TAGS: Tag[], ALLERGENS?: Allergen[], PRODUCTS: Product[] }} data
 * @returns {{ catalog: Catalog, problems: string[] }}
 */
export function buildCatalog({ CATEGORIES, TAGS, ALLERGENS = [], PRODUCTS }) {
  const problems = [];
  const categoryById = new Map(CATEGORIES.map((category) => [category.id, category]));
  const tagById = new Map(TAGS.map((tag) => [tag.id, tag]));
  const allergenById = new Map(ALLERGENS.map((allergen) => [allergen.id, allergen]));
  const byCategory = new Map(CATEGORIES.map((category) => [category.id, []]));
  const byId = new Map();
  const bySlug = new Map();
  const products = [];

  for (const product of PRODUCTS) {
    const label = product?.id ?? '(no id)';
    const found = productProblems(product, categoryById);
    if (byId.has(product.id)) found.push('duplicate id');
    if (bySlug.has(product.slug)) found.push(`duplicate slug "${product.slug}"`);
    if (found.length > 0) {
      problems.push(...found.map((problem) => `${label}: ${problem}`));
      continue;
    }

    // Recoverable problems: keep the dish, drop or blank the bad part.
    const unknownTags = product.tags.filter((tag) => !tagById.has(tag));
    if (unknownTags.length > 0) problems.push(`${label}: unknown tags dropped (${unknownTags.join(', ')})`);
    const allergens = product.allergens ?? [];
    const unknownAllergens = allergens.filter((id) => !allergenById.has(id));
    if (unknownAllergens.length > 0) problems.push(`${label}: unknown allergens dropped (${unknownAllergens.join(', ')})`);
    let image = product.image ?? null;
    if (image !== null && !(IMAGE_FILE.test(image.file ?? '') && isText(image.alt))) {
      problems.push(`${label}: image needs a "file" (lowercase-with-dashes) and "alt" text — shown without image`);
      image = null;
    }

    const clean = {
      ...product,
      tags: product.tags.filter((tag) => tagById.has(tag)),
      allergens: product.allergens === undefined ? undefined : allergens.filter((id) => allergenById.has(id)),
      image,
    };

    products.push(clean);
    byId.set(clean.id, clean);
    bySlug.set(clean.slug, clean);
    byCategory.get(clean.categoryId).push(clean);
  }

  return {
    catalog: {
      categories: CATEGORIES,
      categoryById,
      tags: TAGS,
      tagById,
      allergens: ALLERGENS,
      allergenById,
      byCategory,
      products,
      byId,
      bySlug,
    },
    problems,
  };
}

/**
 * The price to show on a menu line or card.
 * @param {Product} product
 * @returns {{ amount: number | null, from: boolean }}
 *   amount null → price to be confirmed; from → "from" price (variants)
 */
export function displayPrice(product) {
  if (!Array.isArray(product.variants)) return { amount: product.price ?? null, from: false };
  const prices = product.variants.map((variant) => variant.price);
  if (prices.some((price) => price === null)) return { amount: null, from: false };
  const lowest = Math.min(...prices);
  return { amount: lowest, from: new Set(prices).size > 1 };
}

/**
 * Piece count text source: a single number, or the variant range.
 * @param {Product} product
 * @returns {{ min: number, max: number } | null}
 */
export function pieceRange(product) {
  if (Array.isArray(product.variants)) {
    const counts = product.variants.map((variant) => variant.pieces).filter(Number.isInteger);
    if (counts.length === 0) return null;
    return { min: Math.min(...counts), max: Math.max(...counts) };
  }
  return Number.isInteger(product.pieces) ? { min: product.pieces, max: product.pieces } : null;
}

/**
 * Products flagged as featured, in data order (max `limit`), available only.
 * @param {Catalog} catalog
 * @param {number} [limit]
 */
export function featuredProducts(catalog, limit = 6) {
  return catalog.products.filter((product) => product.featured && product.available).slice(0, limit);
}

/**
 * Can this dish (and size) be ordered right now?
 * @param {Product | undefined} product
 * @param {string | null} variantId
 * @returns {{ ok: true, variant: Variant | null } | { ok: false, reason: string }}
 *   reason: 'unknown-product' | 'unavailable' | 'variant-required' | 'unknown-variant' | 'unpriced'
 */
export function checkOrderable(product, variantId) {
  if (!product) return { ok: false, reason: 'unknown-product' };
  if (!product.available) return { ok: false, reason: 'unavailable' };
  let variant = null;
  if (Array.isArray(product.variants)) {
    if (variantId === null || variantId === undefined) return { ok: false, reason: 'variant-required' };
    variant = product.variants.find((v) => v.id === variantId) ?? null;
    if (!variant) return { ok: false, reason: 'unknown-variant' };
    if (!isValidPrice(variant.price)) return { ok: false, reason: 'unpriced' };
  } else {
    if (variantId !== null && variantId !== undefined) return { ok: false, reason: 'unknown-variant' };
    if (!isValidPrice(product.price)) return { ok: false, reason: 'unpriced' };
  }
  return { ok: true, variant };
}

export const isValidPrice = (price) => Number.isSafeInteger(price) && price >= 0;
