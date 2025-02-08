import { Router } from 'express';
import {
  getCities,
  getCity,
  getBarangays,
} from '../controllers/city.controller';
import { rateLimitMiddleware } from '../middlewares/rateLimit.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Apply rate limiting and caching to all routes (25 requests per 10 minutes)
router.get(
  '/',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('city_list'),
  getCities,
);

router.get(
  '/:cityCode',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('city'),
  getCity,
);

router.get(
  '/:cityCode/barangays',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('city_barangays'),
  getBarangays,
);

export default router;
