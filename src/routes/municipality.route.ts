import { Router } from 'express';

import {
  getMunicipalities,
  getMunicipality,
  getBarangays,
} from '../controllers/municipality.controller';

const municipalityRouter = Router();

municipalityRouter.get('/', getMunicipalities);
municipalityRouter.get('/:municipalityCode', getMunicipality);
municipalityRouter.get('/:municipalityCode/barangays', getBarangays);

export default municipalityRouter;
