import { Router } from 'express';
import {
  getCityMunicipalities,
  getCityMunicipality,
  getBarangays,
} from '../controllers/cityMunicipality.controller';

const router = Router();

// Define the GET endpoint for combined city and municipality data
router.get('/', getCityMunicipalities);
router.get('/:code', getCityMunicipality);
router.get('/:code/barangays', getBarangays);

export { router as cityMunicipalityRoute };
