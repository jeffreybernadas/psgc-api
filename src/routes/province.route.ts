import { Router } from 'express';
import {
  getProvinces,
  getProvince,
  getMunicipalities,
  getCities,
  getSubMunicipalities,
  getBarangays,
  getCitiesMunicipalities,
} from '../controllers/province.controller';
import { rateLimitMiddleware } from '../middlewares/rateLimit.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Apply rate limiting and caching to all routes (25 requests per 10 minutes)
router.get(
  '/',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('province_list'),
  getProvinces,
);

router.get(
  '/:provinceCode',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('province'),
  getProvince,
);

router.get(
  '/:provinceCode/municipalities',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('province_municipalities'),
  getMunicipalities,
);

router.get(
  '/:provinceCode/cities',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('province_cities'),
  getCities,
);

router.get(
  '/:provinceCode/cities-municipalities',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('province_cities_municipalities'),
  getCitiesMunicipalities,
);

router.get(
  '/:provinceCode/sub-municipalities',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('province_submunicipalities'),
  getSubMunicipalities,
);

router.get(
  '/:provinceCode/barangays',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('province_barangays'),
  getBarangays,
);

export default router;
