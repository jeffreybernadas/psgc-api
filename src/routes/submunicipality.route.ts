import { Router } from 'express';
import {
  getSubMunicipalities,
  getSubMunicipality,
  getBarangays,
} from '../controllers/submunicipality.controller';
import { rateLimitMiddleware } from '../middlewares/rateLimit.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Apply rate limiting and caching to all routes (25 requests per 10 minutes)
router.get(
  '/',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('submunicipality_list'),
  getSubMunicipalities,
);

router.get(
  '/:submunicipalityCode',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('submunicipality'),
  getSubMunicipality,
);

router.get(
  '/:submunicipalityCode/barangays',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('submunicipality_barangays'),
  getBarangays,
);

export default router;
