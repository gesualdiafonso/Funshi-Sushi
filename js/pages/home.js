/**
 * Entry module — Home page (index.html).
 */

import { startPage } from '../app.js';
import { initFeatured } from '../ui/featured.js';

startPage(({ catalog, config, isDemoMenu }) => {
  initFeatured(catalog, config, { isDemo: isDemoMenu });
});
