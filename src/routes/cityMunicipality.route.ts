import { Router } from 'express';
import {
  getCityMunicipalities,
  getCityMunicipality,
  getBarangays,
} from '../controllers/cityMunicipality.controller';
import { rateLimitMiddleware } from '../middlewares/rateLimit.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// Define the GET endpoint for combined city and municipality data
router.get(
  '/',
  rateLimitMiddleware('BARANGAY_LIST'),
  cacheMiddleware('city_municipality_list'),
  getCityMunicipalities,
);
router.get(
  '/:code',
  rateLimitMiddleware('BARANGAY_LIST'),
  cacheMiddleware('city_municipality'),
  getCityMunicipality,
);
router.get(
  '/:code/barangays',
  rateLimitMiddleware('BARANGAY_LIST'),
  cacheMiddleware('city_municipality_barangays'),
  getBarangays,
);

export { router as cityMunicipalityRoute };
