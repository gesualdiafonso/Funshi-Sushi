import { initNavigation } from './features/navigation.js';
import { initContactInfo } from './features/contact-info.js';
import { initFeaturedDishes } from './features/featured-dishes.js';
import { initGallery } from './features/gallery.js';
import { initContactForm } from './features/contact-form.js';

/**
 * Each feature starts independently: if one fails, the others still run.
 * Order matters only where noted.
 */
const features = [
  ['navigation', initNavigation],
  ['contact info', initContactInfo],
  ['featured dishes', initFeaturedDishes], // uses the contact form fields, which exist in static HTML
  ['gallery', initGallery],
  ['contact form', initContactForm],
];

for (const [name, init] of features) {
  try {
    init();
  } catch (error) {
    console.error(`[Funshi] ${name} failed to start`, error);
  }
}
