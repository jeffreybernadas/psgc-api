import { Router } from 'express';
import {
  getRegions,
  getRegion,
  getProvinces,
  getMunicipalities,
  getCities,
  getSubMunicipalities,
  getBarangays,
  getCitiesMunicipalities,
} from '../controllers/region.controller';
import { rateLimitMiddleware } from '../middlewares/rateLimit.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Apply rate limiting and caching to all routes (25 requests per 10 minutes)
router.get(
  '/',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('region_list'),
  getRegions,
);

router.get(
  '/:regionCode',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('region'),
  getRegion,
);

router.get(
  '/:regionCode/provinces',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('region_provinces'),
  getProvinces,
);

router.get(
  '/:regionCode/municipalities',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('region_municipalities'),
  getMunicipalities,
);

router.get(
  '/:regionCode/cities',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('region_cities'),
  getCities,
);

router.get(
  '/:regionCode/cities-municipalities',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('region_cities_municipalities'),
  getCitiesMunicipalities,
);

router.get(
  '/:regionCode/sub-municipalities',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('region_submunicipalities'),
  getSubMunicipalities,
);

router.get(
  '/:regionCode/barangays',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('region_barangays'),
  getBarangays,
);

export default router;
