import { Router } from 'express';
import { getBarangays, getBarangay } from '../controllers/barangay.controller';
import { rateLimitMiddleware } from '../middlewares/rateLimit.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Get all barangays (rate limited to 1 request per 10 minutes)
router.get(
  '/',
  rateLimitMiddleware('BARANGAY_LIST'),
  cacheMiddleware('barangay_list'),
  getBarangays,
);

// Get barangay by code (rate limited to 25 requests per 10 minutes)
router.get(
  '/:barangayCode',
  rateLimitMiddleware('DEFAULT'),
  cacheMiddleware('barangay'),
  getBarangay,
);

export default router;
