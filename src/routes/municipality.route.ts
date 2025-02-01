import { Router } from 'express';

import {
  getMunicipalities,
  getMunicipality,
  getSubMunicipalities,
  getBarangays,
} from '../controllers/municipality.controller';

const municipalityRouter = Router();

municipalityRouter.get('/', getMunicipalities);
municipalityRouter.get('/:municipalityCode', getMunicipality);
municipalityRouter.get(
  '/:municipalityCode/sub-municipalities',
  getSubMunicipalities,
);
municipalityRouter.get('/:municipalityCode/barangays', getBarangays);

export default municipalityRouter;
