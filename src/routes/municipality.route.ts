import { Router } from 'express';
import {
  getMunicipalities,
  getMunicipality,
  getBarangays,
} from '../controllers/municipality.controller';
import { rateLimitMiddleware } from '../middlewares/rateLimit.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Apply rate limiting and caching to all routes (25 requests per 10 minutes)
router.get(
  '/',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('municipality_list'),
  getMunicipalities,
);

router.get(
  '/:municipalityCode',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('municipality'),
  getMunicipality,
);

router.get(
  '/:municipalityCode/barangays',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('municipality_barangays'),
  getBarangays,
);

export default router;
