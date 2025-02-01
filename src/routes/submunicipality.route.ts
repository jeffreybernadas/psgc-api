import { Router } from 'express';

import {
  getSubMunicipalities,
  getSubMunicipality,
  getBarangays,
} from '../controllers/submunicipality.controller';

const submunicipalityRouter = Router();

submunicipalityRouter.get('/', getSubMunicipalities);
submunicipalityRouter.get('/:submunicipalityCode', getSubMunicipality);
submunicipalityRouter.get('/:submunicipalityCode/barangays', getBarangays);

export default submunicipalityRouter;
